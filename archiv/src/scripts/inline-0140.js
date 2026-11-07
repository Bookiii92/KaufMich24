
(function(){
  if(window.__km24FinalStabilityV1)return;
  window.__km24FinalStabilityV1=true;

  function baseHash(){return ((location.hash||'#/').split('?')[0]||'#/')}
  function onHome(){var b=baseHash();return b==='#/'||b==='#'}
  function area(){
    try{var q=new URLSearchParams((location.hash||'').split('?')[1]||'').get('area');if(q==='jobs'||q==='market')return q}catch(_){}
    if(document.body.classList.contains('km24AreaJobs'))return 'jobs';
    try{return localStorage.getItem('km24HomeAreaV1')==='jobs'?'jobs':'market'}catch(_){return'market'}
  }
  function jobKind(){
    try{var v=sessionStorage.getItem('km24JobKindV1')||'all';return /^(all|offer|wanted)$/.test(v)?v:'all'}catch(_){return'all'}
  }
  function isJob(x){return !!x&&(x.category_slug==='jobs'||x.subcategory_slug==='jobs')}
  function alive(seq,want){return seq===(window.__km24SearchSeq||0)&&onHome()&&area()===want}
  function nextSeq(){var s=(window.__km24SearchSeq||0)+1;window.__km24SearchSeq=s;return s}
  function resultEls(){return {g:document.getElementById('grid'),st:document.getElementById('resultStatus')}}
  function exposeResults(){
    var app=document.getElementById('app'),g=document.getElementById('grid');
    if(!app||!g)return;
    var n=g;
    while(n&&n.parentElement&&n.parentElement!==app)n=n.parentElement;
    if(n&&n.parentElement===app)n.classList.add('km24JobsResultsSection');
  }
  function loading(want){
    exposeResults();
    var x=resultEls();if(!x.g)return x;
    var text=want==='jobs'?'Jobs werden geladen …':'Inserate werden gesucht …';
    if(x.st)x.st.textContent=text;
    x.g.innerHTML='<div class="empty" style="grid-column:1/-1">'+text+'</div>';
    return x;
  }
  async function hydrate(arr,seq,want){
    if(!arr.length)return true;
    var ids=arr.map(function(x){return x.id}),auctionIds=arr.filter(function(x){return x.price_type==='auction'}).map(function(x){return x.id});
    var stats={},meta={};
    var tasks=[
      auctionIds.length?db.from('auction_stats').select('*').in('listing_id',auctionIds):Promise.resolve({data:[]}),
      db.from('listings').select('id,status,previous_price_chf,featured_until,home_boost_until').in('id',ids)
    ];
    var res=await Promise.all(tasks);
    if(!alive(seq,want))return false;
    (res[0].data||[]).forEach(function(x){stats[x.listing_id]=x});
    (res[1].data||[]).forEach(function(x){meta[x.id]=x});
    try{if(typeof km24AttachCardImages==='function')await km24AttachCardImages(arr)}catch(_){}
    if(!alive(seq,want))return false;
    arr.forEach(function(x){
      Object.assign(x,meta[x.id]||{});
      if(!x._img&&x.image_path)x._img={storage_path:x.image_path,focal_x:x.focal_x,focal_y:x.focal_y,fit_mode:x.fit_mode};
      x._p={account_type:x.seller_type,business_name:x.seller_name,display_name:x.seller_name,city:x.city,identity_verified_at:null};
      x._s=stats[x.id]||null;
    });
    return true;
  }
  async function runMarket(){
    if(!onHome())return;
    if(area()==='jobs')return runJobs();
    var seq=nextSeq(),x=loading('market');if(!x.g)return;
    try{
      var f=typeof marketFilters==='function'?marketFilters():{};
      if(f.min_price_chf!=null&&f.max_price_chf!=null&&f.min_price_chf>f.max_price_chf){
        if(x.st)x.st.innerHTML=typeof N==='function'?N('Der Mindestpreis darf nicht höher als der Höchstpreis sein.',1):'Der Mindestpreis darf nicht höher als der Höchstpreis sein.';
        x.g.innerHTML='';return;
      }
      var r=await db.rpc('search_marketplace_v3',{
        p_query:f.query||null,p_category_slug:f.category_slug||null,p_subcategory_slug:f.subcategory_slug||null,
        p_min_price_chf:f.min_price_chf==null?null:f.min_price_chf,p_max_price_chf:f.max_price_chf==null?null:f.max_price_chf,p_condition:f.condition||null,
        p_canton:f.canton||null,p_seller_type:f.seller_type||null,p_price_type:f.price_type||null,p_sort:f.sort||'newest',
        p_limit:100,p_offset:0,p_location:f.location||null,p_verified_only:false,p_listing_intent:'offer'
      });
      if(!alive(seq,'market'))return;
      if(r.error)throw r.error;
      var arr=(r.data||[]).filter(function(v){return !isJob(v)&&v.listing_intent!=='wanted'});
      if(!await hydrate(arr,seq,'market'))return;
      if(!alive(seq,'market'))return;
      listings=arr;query=f.query||'';
      if(x.st)x.st.textContent=arr.length+(arr.length===1?' Treffer':' Treffer')+' angezeigt';
      x.g.innerHTML=arr.length?arr.map(card).join(''):'<div class="empty" style="grid-column:1/-1">Keine passenden Inserate gefunden.</div>';
      exposeResults();
    }catch(e){
      if(!alive(seq,'market'))return;
      console.warn('KM24 market search',e);
      if(x.st)x.st.textContent='Inserate konnten nicht geladen werden.';
      x.g.innerHTML='<div class="empty" style="grid-column:1/-1">Inserate konnten nicht geladen werden. Bitte erneut versuchen.</div>';
    }
  }
  async function runJobs(){
    if(!onHome()||area()!=='jobs')return;
    var seq=nextSeq(),x=loading('jobs');if(!x.g)return;
    try{
      var f=typeof marketFilters==='function'?marketFilters():{},kind=jobKind();
      var r=await db.rpc('search_marketplace_v3',{
        p_query:f.query||null,p_category_slug:'jobs',p_subcategory_slug:null,
        p_min_price_chf:null,p_max_price_chf:null,p_condition:null,
        p_canton:f.canton||null,p_seller_type:null,p_price_type:null,p_sort:f.sort==='popular'?'popular':'newest',
        p_limit:100,p_offset:0,p_location:f.location||null,p_verified_only:false,p_listing_intent:kind==='all'?null:kind
      });
      if(!alive(seq,'jobs'))return;
      if(r.error)throw r.error;
      var arr=(r.data||[]).filter(isJob);
      if(!await hydrate(arr,seq,'jobs'))return;
      if(!alive(seq,'jobs'))return;
      listings=arr;
      var offers=arr.filter(function(v){return v.listing_intent!=='wanted'}).length,wanted=arr.filter(function(v){return v.listing_intent==='wanted'}).length;
      var label=kind==='offer'?'Stellenangebote':kind==='wanted'?'Stellengesuche':'Jobs';
      if(x.st)x.st.textContent=arr.length+' '+label+(kind==='all'?' · '+offers+' Angebote · '+wanted+' Gesuche':'');
      x.g.innerHTML=arr.length?arr.map(card).join(''):'<div class="empty km24JobsEmpty" style="grid-column:1/-1"><b>Noch keine passenden '+label+'</b><span>Ändere deine Suche oder erstelle selbst ein Inserat.</span></div>';
      exposeResults();
    }catch(e){
      if(!alive(seq,'jobs'))return;
      console.warn('KM24 jobs search',e);
      if(x.st)x.st.textContent='Jobs konnten nicht geladen werden.';
      x.g.innerHTML='<div class="empty" style="grid-column:1/-1">Jobs konnten nicht geladen werden. Bitte erneut versuchen.</div>';
    }
  }

  async function heroSubmit(){
    await (area()==='jobs'?runJobs():runMarket());
    var target=document.getElementById('resultStatus')||document.getElementById('grid');
    if(target&&onHome())setTimeout(function(){try{target.scrollIntoView({behavior:'smooth',block:'start'})}catch(_){}},30);
  }
  window.km24HeroSearchSubmit=heroSubmit;

  window.km24RunJobsSearch=runJobs;
  window.km24RunMarketSearch=runMarket;
  window.runMarketplaceSearch=runMarket;
  try{runMarketplaceSearch=runMarket}catch(_){}

  function bind(){
    if(!onHome())return;
    exposeResults();
    var a=document.getElementById('applySearch');if(a)a.onclick=runMarket;
    var qs=document.getElementById('qs');if(qs)qs.onclick=heroSubmit;
    var q=document.getElementById('q');if(q)q.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();heroSubmit()}};
  }
  addEventListener('hashchange',function(){setTimeout(bind,20);setTimeout(bind,160)});
  addEventListener('pageshow',function(){setTimeout(bind,30)});
  try{var app=document.getElementById('app');if(app)new MutationObserver(function(){setTimeout(bind,20)}).observe(app,{childList:true,subtree:true})}catch(_){}
  setTimeout(bind,0);setTimeout(bind,120);setTimeout(bind,500);
})();
