
(function(){
  if(window.__km24SelfExplainCategoryV1)return;
  window.__km24SelfExplainCategoryV1=true;

  try{
    var cs=document.querySelector('meta[name="color-scheme"]');
    if(cs)cs.setAttribute('content','light');
    var sc=document.querySelector('meta[name="supported-color-schemes"]');
    if(sc)sc.setAttribute('content','light');
    var tc=document.querySelector('meta[name="theme-color"]');
    if(tc)tc.setAttribute('content','#146b50');
  }catch(_){}

  var SERVICE_MAP={
    fahrzeuge:['auto_service','transport'],
    haus_garten:['reinigung','garten','handwerk','transport'],
    bauen_renovieren:['handwerk','reinigung'],
    elektronik:['it_technik'],
    jobs_dienstleistungen:['handwerk','reinigung','transport','auto_service','garten','it_technik','unterricht','foto_video','events','beauty','tierbetreuung','sonstige'],
    musik_medien:['foto_video'],
    tickets_events:['events','foto_video'],
    beauty_gesundheit:['beauty'],
    tiere:['tierbetreuung'],
    werkzeuge:['handwerk'],
    immobilien:['handwerk','reinigung','garten','transport'],
    gewerbe_industrie:['transport','it_technik','handwerk'],
    landwirtschaft_forst:['garten','transport'],
    freizeit_sport:['events'],
    baby_kind:['unterricht'],
    mode:['beauty'],
    sonstiges:['sonstige']
  };

  function rootCategory(c){
    var cur=c,guard=0;
    while(cur&&cur.parent_slug&&guard<5){
      var next=cats.find(function(x){return x.slug===cur.parent_slug});
      if(!next)break;
      cur=next;guard++;
    }
    return cur||c;
  }

  function serviceSlugsFor(c){
    var root=rootCategory(c);
    return SERVICE_MAP[root&&root.slug]||[];
  }

  function renderListingEmpty(kind){
    if(kind==='services')return '<div class="empty" style="grid-column:1/-1">Hier gibt es noch keine Dienstleistungen. Du kannst selbst eine anbieten oder Hilfe suchen.</div>';
    if(kind==='listings')return '<div class="empty" style="grid-column:1/-1">Hier gibt es noch keine Inserate.</div>';
    return '<div class="empty" style="grid-column:1/-1">In dieser Kategorie gibt es noch keine Einträge.</div>';
  }

  categoryView=async function(slug){
    var c=cats.find(function(x){return x.slug===slug});
    if(!c){
      app.innerHTML='<div class="wrap section"><div class="empty">Kategorie nicht gefunden.</div></div>';
      return;
    }

    var children=cats.filter(function(x){return x.parent_slug===slug});
    var serviceSlugs=serviceSlugsFor(c);
    var hasServices=serviceSlugs.length>0;
    var introText=hasServices
      ?'Hier findest du passende Inserate und Dienstleistungen gemeinsam. Du musst nicht vorher wissen, in welchen Bereich etwas gehört.'
      :'Hier findest du alle passenden Inserate dieser Kategorie.';

    app.innerHTML=
      '<section class="section"><div class="wrap">'+
        '<a class="btn" style="display:inline-flex;text-decoration:none" href="#/">← Zurück</a>'+
        '<div class="km24UnifiedCategoryIntro">'+
          '<div>'+
            (hasServices?'<span class="km24UnifiedHint">✓ Alles an einem Ort</span>':'')+
            '<h1>'+E(c.icon||'📦')+' '+E(c.name_de)+'</h1>'+
            '<p>'+E(introText)+'</p>'+
            (hasServices?'<div class="km24CategoryServiceNote"><span>💡</span><span><b>Einfach auswählen:</b> Stöbere durch alles oder filtere mit einem Klick nur nach Inseraten oder Dienstleistungen.</span></div>':'')+
          '</div>'+
          '<div class="km24CategoryActions">'+
            '<a class="btn primary" href="#/create">＋ Inserat erstellen</a>'+
            (hasServices?'<a class="btn" href="#/services/offer/new">🛠️ Dienstleistung anbieten</a><a class="btn" href="#/services/request/new">🔎 Hilfe suchen</a>':'')+
          '</div>'+
        '</div>'+
        (children.length?'<div class="head"><div><h2 style="margin:0">Was interessiert dich?</h2><p class="mut" style="margin:4px 0 0">Wähle eine Unterkategorie oder scrolle direkt zu allen Angeboten.</p></div></div><div class="cats" id="subcats"></div>':'')+
        '<div class="head" style="margin-top:24px"><div><h2 style="margin:0">Alles in '+E(c.name_de)+'</h2><p class="mut" id="km24CatResultText" style="margin:4px 0 0">Wird geladen …</p></div></div>'+
        (hasServices?'<div class="km24CategoryTabs" id="km24CategoryTabs"></div><div class="km24CategoryLegend"><span><i class="km24CategoryDot"></i>Inserat</span><span><i class="km24CategoryDot service"></i>Dienstleistung / Auftrag</span></div>':'')+
        '<div id="catgrid" class="grid km24UnifiedGrid"></div>'+
      '</div></section>';

    if(children.length){
      var sub=document.getElementById('subcats');
      sub.innerHTML=children.map(function(x){
        return '<button type="button" class="cat" data-category-slug="'+E(x.slug)+'" style="display:block;width:100%;text-decoration:none;color:inherit"><i>'+E(x.icon||'📦')+'</i><b>'+E(x.name_de)+'</b></button>';
      }).join('');
      sub.querySelectorAll('[data-category-slug]').forEach(function(b){b.onclick=function(){go('#/category/'+encodeURIComponent(b.dataset.categorySlug))}});
    }

    var listingSlugs=[slug].concat(children.map(function(x){return x.slug}));
    var listingPromise=db.from('listings').select('*').eq('status','active').in('category_slug',listingSlugs).order('created_at',{ascending:false}).limit(80);
    var servicePromise=hasServices
      ?db.from('service_posts').select('*').eq('status','active').in('category_slug',serviceSlugs).order('created_at',{ascending:false}).limit(80)
      :Promise.resolve({data:[],error:null});

    var results=await Promise.all([listingPromise,servicePromise]);
    var lr=results[0],sr=results[1];
    var listings=lr.data||[],services=sr.data||[];

    if(listings.length){
      var ids=listings.map(function(x){return x.id});
      var sids=[...new Set(listings.map(function(x){return x.seller_id}))];
      var enrich=await Promise.all([
        db.from('listing_images').select('listing_id,storage_path,sort_order,focal_x,focal_y,fit_mode').in('listing_id',ids).order('sort_order'),
        db.rpc('seller_cards_public',{p_seller_ids:sids}),
        db.from('auction_stats').select('*').in('listing_id',ids)
      ]);
      var a={},b={},s={};
      (enrich[0].data||[]).forEach(function(x){if(!a[x.listing_id])a[x.listing_id]=x});
      (enrich[1].data||[]).forEach(function(x){b[x.seller_id]=x});
      (enrich[2].data||[]).forEach(function(x){s[x.listing_id]=x});
      listings.forEach(function(x){x._img=a[x.id];x._p=b[x.seller_id];x._s=s[x.id]});
    }

    var svcImageMap={},svcPeople={},svcCatMap={};
    if(services.length&&typeof svcImages==='function'&&typeof svcCards==='function'&&typeof svcCategories==='function'){
      var svcEnrich=await Promise.all([
        svcImages(services.map(function(x){return x.id})),
        svcCards(services.map(function(x){return x.user_id})),
        svcCategories()
      ]);
      svcImageMap=svcEnrich[0]||{};
      svcPeople=svcEnrich[1]||{};
      (svcEnrich[2]||[]).forEach(function(x){svcCatMap[x.slug]=x});
    }

    var grid=document.getElementById('catgrid');
    // KM24_CATEGORY_NAV_RACE_GUARD_V1: ignore requests for a page that is no longer mounted.
    if(!grid || !grid.isConnected || (location.hash||'').split('?')[0] !== '#/category/'+slug) return;
    var resultText=document.getElementById('km24CatResultText');
    var tabs=document.getElementById('km24CategoryTabs');
    var current='all';

    function listingMarkup(x){return card(x)}
    function serviceMarkup(x){
      if(typeof svcCardHtml==='function')return svcCardHtml(x,svcImageMap[x.id],svcPeople[x.user_id],svcCatMap[x.category_slug]);
      return '<article class="km24SvcCard"><div class="km24SvcBody"><span class="badge">Dienstleistung</span><h3>'+E(x.title||'Dienstleistung')+'</h3></div></article>';
    }

    function draw(kind){
      current=kind||'all';
      var rows=[];
      if(current!=='services')listings.forEach(function(x){rows.push({kind:'listing',at:x.created_at||x.published_at||'',data:x})});
      if(current!=='listings')services.forEach(function(x){rows.push({kind:'service',at:x.created_at||'',data:x})});
      rows.sort(function(a,b){return String(b.at).localeCompare(String(a.at))});
      grid.innerHTML=rows.length?rows.map(function(r){return r.kind==='listing'?listingMarkup(r.data):serviceMarkup(r.data)}).join(''):renderListingEmpty(current);
      if(resultText){
        if(current==='listings')resultText.textContent=listings.length+(listings.length===1?' Inserat':' Inserate');
        else if(current==='services')resultText.textContent=services.length+(services.length===1?' Dienstleistung / Auftrag':' Dienstleistungen / Aufträge');
        else resultText.textContent=rows.length+(rows.length===1?' Eintrag':' Einträge')+' · Inserate und Dienstleistungen gemeinsam';
      }
      if(tabs){
        tabs.querySelectorAll('[data-kind]').forEach(function(btn){btn.classList.toggle('on',btn.dataset.kind===current)});
      }
    }

    if(tabs){
      tabs.innerHTML=
        '<button class="km24CategoryTab on" data-kind="all">Alle '+(listings.length+services.length)+'</button>'+
        '<button class="km24CategoryTab" data-kind="listings">Inserate '+listings.length+'</button>'+
        '<button class="km24CategoryTab" data-kind="services">Dienstleistungen '+services.length+'</button>';
      tabs.querySelectorAll('[data-kind]').forEach(function(btn){
        btn.onclick=function(){draw(btn.dataset.kind)};
      });
    }
    draw('all');
  };

  setTimeout(function(){
    try{
      var h=location.hash||'';
      if(h.indexOf('#/category/')===0){
        var slug=decodeURIComponent((h.split('/')[2]||'').split('?')[0]);
        if(slug)categoryView(slug);
      }
    }catch(_){}
  },80);
})();
