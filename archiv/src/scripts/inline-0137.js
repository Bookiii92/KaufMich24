
(function(){
  if(window.__km24MarketJobsSplitV1)return;
  window.__km24MarketJobsSplitV1=true;

  var AREA_KEY='km24HomeAreaV1', JOB_KIND_KEY='km24JobKindV1';
  var originalCard=typeof card==='function'?card:null;
  var originalRunSearch=typeof runMarketplaceSearch==='function'?runMarketplaceSearch:null;
  var refreshTimer=0;

  function baseHash(){return ((location.hash||'#/').split('?')[0]||'#/')}
  function onHome(){return baseHash()==='#/' || baseHash()==='#'}
  function getArea(){try{var q=(location.hash||'').split('?')[1]||'';var a=new URLSearchParams(q).get('area');if(a==='jobs'||a==='market')return a;if(sessionStorage.getItem(AREA_KEY)==='jobs'||localStorage.getItem(AREA_KEY)==='jobs')return 'jobs';return 'market'}catch(_){try{return localStorage.getItem(AREA_KEY)==='jobs'?'jobs':'market'}catch(__){return 'market'}}}
  function setArea(v){v=v==='jobs'?'jobs':'market';try{sessionStorage.setItem(AREA_KEY,v);localStorage.setItem(AREA_KEY,v);if(onHome()){var base=((location.hash||'#/').split('?')[0]||'#/');var p=new URLSearchParams((location.hash||'').split('?')[1]||'');p.set('area',v);history.replaceState(null,'',location.pathname+location.search+base+'?'+p.toString())}}catch(_){} window.__km24SearchSeq=(window.__km24SearchSeq||0)+1;}
  function getJobKind(){try{var v=sessionStorage.getItem(JOB_KIND_KEY)||'all';return /^(all|offer|wanted)$/.test(v)?v:'all'}catch(_){return'all'}}
  function setJobKind(v){try{sessionStorage.setItem(JOB_KIND_KEY,/^(offer|wanted)$/.test(v)?v:'all')}catch(_){} }
  function isJob(l){return !!l&&(l.category_slug==='jobs'||l.subcategory_slug==='jobs')}
  function esc(s){try{return typeof E==='function'?E(s):String(s==null?'':s).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]})}catch(_){return String(s||'')}}

  function jobCard(l){
    if(!originalCard)return '';
    var html=originalCard(l), wanted=l&&l.listing_intent==='wanted';
    var label=wanted?'👤 Stellengesuch':'💼 Stellenangebot';
    html=html.replace('km24ListingCard','km24ListingCard km24JobCard');
    html=html.replace('<article ','<article data-km24-job-card="1" data-km24-job-kind="'+(wanted?'wanted':'offer')+'" ');
    html=html.replace('<div class="km24CardOverlay">','<div class="km24CardOverlay"><span class="km24JobBadge">'+label+'</span>');
    return html;
  }

  if(originalCard){
    card=function(l){return isJob(l)?jobCard(l):originalCard(l)};
  }

  function cleanMarketplaceAfterSearch(){
    try{
      if(!onHome()||getArea()!=='market'||!Array.isArray(listings))return;
      var before=listings.length, clean=listings.filter(function(x){return !isJob(x)});
      if(clean.length!==before){
        listings=clean;
        var g=document.getElementById('grid');
        if(g)g.innerHTML=clean.length?clean.map(card).join(''):'<div class="empty" style="grid-column:1/-1">Keine passenden Marktplatz-Inserate gefunden. Jobs findest du im Bereich „Jobs“.</div>';
      }
      var st=document.getElementById('resultStatus');
      if(st)st.textContent=clean.length+(clean.length===1?' Marktplatz-Inserat':' Marktplatz-Inserate')+' angezeigt';
      syncUi();
    }catch(e){console.warn('KM24 market cleanup',e)}
  }

  async function runJobsSearch(){
    if(!onHome()||getArea()!=="jobs")return;
    var searchSeq=(window.__km24SearchSeq||0)+1;window.__km24SearchSeq=searchSeq;
    var g=document.getElementById('grid'),st=document.getElementById('resultStatus');
    if(!g)return;
    try{
      var f=typeof marketFilters==='function'?marketFilters():{};
      var kind=getJobKind();
      if(st)st.textContent='Jobs werden gesucht …';
      g.innerHTML='<div class="empty" style="grid-column:1/-1">Jobs werden geladen …</div>';
      var sort=f&&f.sort==='popular'?'popular':'newest';
      var r=await db.rpc('search_marketplace_v3',{
        p_query:f&&f.query||null,
        p_category_slug:'jobs',p_subcategory_slug:null,
        p_min_price_chf:null,p_max_price_chf:null,p_condition:null,
        p_canton:f&&f.canton||null,p_seller_type:null,p_price_type:null,
        p_sort:sort,p_limit:100,p_offset:0,
        p_location:f&&f.location||null,p_verified_only:false,
        p_listing_intent:kind==='all'?null:kind
      });
      if(r.error)throw r.error;
      if(searchSeq!==window.__km24SearchSeq||getArea()!=='jobs'||!onHome())return;
      var arr=(r.data||[]).filter(isJob);
      try{if(typeof km24AttachCardImages==='function')await km24AttachCardImages(arr)}catch(_){}
      if(searchSeq!==window.__km24SearchSeq||getArea()!=='jobs'||!onHome())return;
      arr.forEach(function(x){
        if(!x._img&&x.image_path)x._img={storage_path:x.image_path,focal_x:x.focal_x,focal_y:x.focal_y,fit_mode:x.fit_mode};
        x._p={account_type:x.seller_type,business_name:x.seller_name,display_name:x.seller_name,city:x.city,identity_verified_at:null};
        x._s=null;
      });
      listings=arr;
      var offers=arr.filter(function(x){return x.listing_intent!=='wanted'}).length;
      var wanted=arr.filter(function(x){return x.listing_intent==='wanted'}).length;
      var label=kind==='offer'?'Stellenangebote':kind==='wanted'?'Stellengesuche':'Jobs';
      if(st)st.textContent=arr.length+' '+label+(kind==='all'?' · '+offers+' Angebote · '+wanted+' Gesuche':'');
      g.innerHTML=arr.length?arr.map(jobCard).join(''):'<div class="empty km24JobsEmpty" style="grid-column:1/-1"><b>Noch keine passende '+esc(label)+'</b><span>Ändere deine Suche oder erstelle selbst ein Inserat.</span></div>';
      syncUi();
    }catch(e){
      if(searchSeq!==window.__km24SearchSeq||getArea()!=='jobs'||!onHome())return;
      console.warn('KM24 jobs search',e);
      if(st)st.textContent='Jobs konnten nicht geladen werden.';
      g.innerHTML='<div class="empty" style="grid-column:1/-1">Jobs konnten nicht geladen werden. Bitte erneut versuchen.</div>';
    }
  }
  window.km24RunJobsSearch=runJobsSearch;

  if(originalRunSearch){
    runMarketplaceSearch=async function(){
      if(getArea()==='jobs')return runJobsSearch();
      await originalRunSearch();
      if(getArea()==='jobs')return runJobsSearch();
      cleanMarketplaceAfterSearch();
    };
  }

  function ensureAreaBar(){
    var pre=document.getElementById('km24AreaBarSection');
    if(pre&&!pre.dataset.km24AreaBound){pre.dataset.km24AreaBound='1';pre.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('[data-km24-area]');if(a){setArea(a.getAttribute('data-km24-area'));applyArea(true);return}var k=e.target&&e.target.closest&&e.target.closest('[data-km24-job-kind]');if(k){setJobKind(k.getAttribute('data-km24-job-kind'));syncUi();runJobsSearch()}})}

    if(!onHome())return;
    var appEl=document.getElementById('app');if(!appEl)return;
    var sec=document.getElementById('km24AreaBarSection');
    if(!sec){
      sec=document.createElement('section');sec.id='km24AreaBarSection';sec.className='km24AreaBarSection';
      sec.innerHTML='<div class="wrap"><div class="km24AreaSwitch" role="tablist" aria-label="Bereich wählen"><button type="button" data-km24-area="market">🛍️ <span>Marktplatz</span></button><button type="button" data-km24-area="jobs">💼 <span>Jobs</span></button></div><div id="km24JobsHub" class="km24JobsHub"><div class="km24JobsHubTop"><div><small>KAUFMICH24 JOBS</small><h1>Jobs & Personal</h1><p>Stellenangebote und Stellengesuche – getrennt vom Marktplatz.</p></div><span class="km24JobsHubIcon">💼</span></div><div class="km24JobKindTabs" role="tablist"><button type="button" data-km24-job-kind="all">Alle</button><button type="button" data-km24-job-kind="offer">Stellenangebote</button><button type="button" data-km24-job-kind="wanted">Stellengesuche</button></div><div class="km24JobsHubActions"><a class="btn primary" href="#/sell?job=employer">🏢 Job anbieten</a><a class="btn" href="#/wanted/new?job=seeker">👤 Stellengesuch erstellen</a></div></div></div>';
      appEl.insertBefore(sec,appEl.firstChild);
      sec.addEventListener('click',function(e){
        var a=e.target&&e.target.closest&&e.target.closest('[data-km24-area]');
        if(a){setArea(a.getAttribute('data-km24-area'));applyArea(true);return}
        var k=e.target&&e.target.closest&&e.target.closest('[data-km24-job-kind]');
        if(k){setJobKind(k.getAttribute('data-km24-job-kind'));syncUi();runJobsSearch()}
      });
    }
  }

  function setText(el,text){if(el&&el.textContent!==text)el.textContent=text}
  function markFilterLabel(id,hide){var el=document.getElementById(id),lab=el&&el.closest('label');if(lab)lab.classList.toggle('km24JobFilterHidden',!!hide)}
  function syncFilterGroups(){
    var details=document.querySelectorAll('.marketSearchPanel details.filterGroup');
    details.forEach(function(d){var any=[].slice.call(d.querySelectorAll('label')).some(function(l){return !l.classList.contains('km24JobFilterHidden')});d.classList.toggle('km24JobFilterGroupEmpty',!any)})
  }

  function syncUi(){
    var home=onHome(),area=getArea();
    document.body.classList.toggle('km24AreaMarket',home&&area==='market');
    document.body.classList.toggle('km24AreaJobs',home&&area==='jobs');
    if(!home){document.getElementById('km24AreaBarSection')?.remove();return}
    ensureAreaBar();
    document.querySelectorAll('[data-km24-area]').forEach(function(b){var on=b.getAttribute('data-km24-area')===area;b.classList.toggle('active',on);b.setAttribute('aria-selected',on?'true':'false')});
    document.querySelectorAll('[data-km24-job-kind]').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-km24-job-kind')===getJobKind())});
    var hub=document.getElementById('km24JobsHub');if(hub)hub.hidden=area!=='jobs';
    var q=document.getElementById('q');if(q)q.placeholder=area==='jobs'?'Welchen Job suchst du?':'Was suchst du?';
    var section=document.getElementById('grid')&&document.getElementById('grid').closest('section');
    if(section){
      var qNow=document.getElementById('q'),termNow=(qNow&&qNow.value||'').trim();var h2=section.querySelector('.head h2');setText(h2,area==='jobs'?'Jobs durchsuchen':(termNow?'Suchergebnisse':'Verkaufsinserate'));
      var p=section.querySelector('.head p.mut');setText(p,area==='jobs'?'Nach Beruf, Ort oder Stichwort suchen.':(termNow?('Passende Inserate für „'+termNow+'“.'):'Aktuelle Verkaufsangebote aus der ganzen Schweiz.'));
    }
    ['scat','ssub','smin','smax','scond','sseller','sprice'].forEach(function(id){markFilterLabel(id,area==='jobs')});
    syncFilterGroups();
    var catOpt=document.querySelector('#scat option[value="jobs_dienstleistungen"]');setText(catOpt,'Dienstleistungen');
    if(area==='market'){
      var sub=document.getElementById('ssub');if(sub){[].slice.call(sub.options||[]).forEach(function(o){if(o.value==='jobs')o.hidden=true})}
    }
    var cats=document.getElementById('cats');if(cats){
      var jobRoot=cats.querySelector('[data-category-slug="jobs_dienstleistungen"]');
      if(jobRoot){var b=jobRoot.querySelector('b');setText(b,'Dienstleistungen')}
    }
    var apply=document.getElementById('applySearch');if(apply&&typeof runMarketplaceSearch==='function')apply.onclick=runMarketplaceSearch;
    syncCreateLabels();
  }

  function syncCreateLabels(){
    if(baseHash()!=='#/create')return;
    var grid=document.querySelector('.planGrid');if(!grid)return;
    [].slice.call(grid.querySelectorAll('.plan')).forEach(function(x){
      var h=x.querySelector('h2,h3'),t=(h&&h.textContent||'').trim();
      if(t==='Ich verkaufe')setText(h,'Artikel verkaufen');
      if(/Ich suche Mitarbeiter/i.test(t))setText(h,'Job anbieten');
      if(/Ich suche einen Job/i.test(t))setText(h,'Stellengesuch erstellen');
    });
  }

  async function applyArea(run){
    syncUi();
    if(!onHome())return;
    if(run){
      clearTimeout(refreshTimer);
      refreshTimer=setTimeout(function(){
        if(getArea()==='jobs'){
          runJobsSearch();
          setTimeout(function(){
            if(getArea()!=='jobs'||typeof window.km24RunJobsSearch!=='function')return;
            var st=document.getElementById('resultStatus'),g=document.getElementById('grid');
            var stale=(st&&/Marktplatz-Inserat/i.test(st.textContent||''))||(g&&g.querySelector('.km24ListingCard:not([data-km24-job-card="1"]), .card:not(.km24JobCard)'));
            if(stale)window.km24RunJobsSearch();
          },350);
        }
        else if(typeof runMarketplaceSearch==='function'){
          var stM=document.getElementById('resultStatus'),gM=document.getElementById('grid');
          if(stM&&/(^|\\b)Jobs\\b|Angebote.*Gesuche/i.test(stM.textContent||''))stM.textContent='Marktplatz wird geladen …';
          if(gM&&gM.querySelector('[data-km24-job-card="1"], .km24JobCard'))gM.innerHTML='<div class="empty" style="grid-column:1/-1">Marktplatz wird geladen …</div>';
          runMarketplaceSearch();
          setTimeout(function(){
            if(getArea()!=='market'||typeof runMarketplaceSearch!=='function')return;
            var st=document.getElementById('resultStatus'),g=document.getElementById('grid');
            var stale=(st&&/(^|\\b)Jobs\\b|Angebote.*Gesuche/i.test(st.textContent||''))||(g&&g.querySelector('[data-km24-job-card="1"], .km24JobCard'));
            if(stale)runMarketplaceSearch();
          },350);
        }
      },20);
    }
  }

  document.addEventListener('click',function(e){
    var a=e.target&&e.target.closest&&e.target.closest('a[href*="#/category/jobs"],button[data-category-slug="jobs"]');
    if(a){e.preventDefault();e.stopImmediatePropagation();setArea('jobs');if(typeof go==='function')go('#/?area=jobs');else location.hash='#/?area=jobs';setTimeout(function(){applyArea(true)},40);return}
    if(onHome()&&getArea()==='jobs'){
      var search=e.target&&e.target.closest&&e.target.closest('#qs');
      if(search){e.preventDefault();e.stopImmediatePropagation();runJobsSearch()}
    }
  },true);

  document.addEventListener('keydown',function(e){
    if(onHome()&&getArea()==='jobs'&&e.key==='Enter'&&e.target&&e.target.id==='q'){
      e.preventDefault();e.stopImmediatePropagation();runJobsSearch();
    }
  },true);

  addEventListener('hashchange',function(){
    if(baseHash()==='#/category/jobs'){setArea('jobs');if(typeof go==='function')go('#/?area=jobs');else location.hash='#/?area=jobs';return}
    setTimeout(function(){syncUi();if(onHome())applyArea(true)},40);
    setTimeout(syncCreateLabels,180);
  });
  addEventListener('pageshow',function(){setTimeout(function(){syncUi();if(onHome())applyArea(true)},80)});
  try{new MutationObserver(function(){clearTimeout(refreshTimer);refreshTimer=setTimeout(syncUi,70)}).observe(document.getElementById('app')||document.body,{childList:true,subtree:true})}catch(_){}
  setTimeout(function(){syncUi();if(onHome())applyArea(true)},120);
  setTimeout(syncUi,500);
})();

