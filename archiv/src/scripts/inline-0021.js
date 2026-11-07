function marketFilters(){
 let num=id=>{let v=document.getElementById(id)?.value;return v===""||v==null?null:Number(v)};
 return{
  query:(document.getElementById("q")?.value||"").trim()||null,
  category_slug:document.getElementById("scat")?.value||null,
  subcategory_slug:document.getElementById("ssub")?.value||null,
  min_price_chf:num("smin"),
  max_price_chf:num("smax"),
  condition:document.getElementById("scond")?.value||null,
  canton:document.getElementById("scanton")?.value||null,
  location:(document.getElementById("slocation")?.value||"").trim()||null,
  seller_type:document.getElementById("sseller")?.value||null,
  price_type:document.getElementById("sprice")?.value||null,
  verified_only:false,
  sort:document.getElementById("ssort")?.value||"newest"
 }
}

function marketApplyPreset(p){
 if(!p)return;
 document.getElementById("q").value=p.query_text||p.query||"";
 document.getElementById("scat").value=p.category_slug||"";
 marketFillSubcategories(p.subcategory_slug||"");
 document.getElementById("ssub").value=p.subcategory_slug||"";
 document.getElementById("smin").value=p.min_price_chf??"";
 document.getElementById("smax").value=p.max_price_chf??"";
 document.getElementById("scond").value=p.condition||"";
 document.getElementById("scanton").value=p.canton||"";
 document.getElementById("slocation").value=p.location_query||p.location||"";
 document.getElementById("sseller").value=p.seller_type||"";
 document.getElementById("sprice").value=p.price_type||"";
 
 document.getElementById("ssort").value=p.sort||"newest"
}

async function runMarketplaceSearch(){
 try{
  var __km24AreaParam=new URLSearchParams(((location.hash||"").split("?")[1]||"")).get("area");
  var __km24JobsActive=document.body.classList.contains("km24AreaJobs")||__km24AreaParam==="jobs"||sessionStorage.getItem("km24HomeAreaV1")==="jobs";
  if(__km24JobsActive){
   if(typeof window.km24RunJobsSearch==="function")return window.km24RunJobsSearch();
   return;
  }
 }catch(_){}
 let g=document.getElementById("grid"),st=document.getElementById("resultStatus");if(!g)return;
 const searchSeq=(window.__km24SearchSeq||0)+1;window.__km24SearchSeq=searchSeq;
 let f=marketFilters();
 if(f.min_price_chf!=null&&f.max_price_chf!=null&&f.min_price_chf>f.max_price_chf){st.innerHTML=N("Der Mindestpreis darf nicht höher als der Höchstpreis sein.",1);return}
 st.textContent="Inserate werden gesucht …";g.innerHTML='<div class="empty" style="grid-column:1/-1">Suche läuft …</div>';
 let r=await db.rpc("search_marketplace_v3",{
  p_query:f.query,p_category_slug:f.category_slug,p_subcategory_slug:f.subcategory_slug,
  p_min_price_chf:f.min_price_chf,p_max_price_chf:f.max_price_chf,p_condition:f.condition,
  p_canton:f.canton,p_seller_type:f.seller_type,p_price_type:f.price_type,p_sort:f.sort,
  p_limit:100,p_offset:0,p_location:f.location,p_verified_only:false,p_listing_intent:"offer"
 });
 if(searchSeq!==window.__km24SearchSeq)return;
 if(r.error){st.innerHTML=N(r.error.message,1);g.innerHTML="";return}
 let arr=r.data||[],stats={};
 if(arr.length){
  let auctionIds=arr.filter(x=>x.price_type==="auction").map(x=>x.id);
  let [sq,promoQ]=await Promise.all([
   auctionIds.length?db.from("auction_stats").select("*").in("listing_id",auctionIds):Promise.resolve({data:[]}),
   db.from("listings").select("id,featured_until,home_boost_until").in("id",arr.map(x=>x.id))
  ]);
  (sq.data||[]).forEach(x=>stats[x.listing_id]=x);
  let promoMap={};(promoQ.data||[]).forEach(x=>promoMap[x.id]=x);
  arr.forEach(x=>Object.assign(x,promoMap[x.id]||{}))
 }
 await km24AttachCardImages(arr);
 if(searchSeq!==window.__km24SearchSeq)return;
 arr.forEach(x=>{if(!x._img)x._img=x.image_path?{storage_path:x.image_path,focal_x:x.focal_x,focal_y:x.focal_y,fit_mode:x.fit_mode}:null;x._p={account_type:x.seller_type,business_name:x.seller_name,display_name:x.seller_name,city:x.city,identity_verified_at:null};x._s=stats[x.id]||null});
 listings=arr;query=f.query||"";
 st.textContent=arr.length+(arr.length===1?" Treffer":" Treffer")+" angezeigt";
 g.innerHTML=arr.length?arr.map(card).join(""):'<div class="empty" style="grid-column:1/-1">Keine passenden Inserate gefunden.</div>'
}

async function saveCurrentSearch(){
 if(!user)return go("#/login");
 let f=marketFilters(),suggest=f.query||marketCategoryName(f.subcategory_slug||f.category_slug)||f.location||"Meine Suche",name=prompt("Name für diesen Suchauftrag:",suggest);
 if(!name)return;
 let r=await db.rpc("create_saved_search",{
  p_name:name.trim(),p_query_text:f.query,p_category_slug:f.category_slug,p_subcategory_slug:f.subcategory_slug,
  p_min_price_chf:f.min_price_chf,p_max_price_chf:f.max_price_chf,p_condition:f.condition,p_canton:f.canton,
  p_seller_type:f.seller_type,p_price_type:f.price_type,p_notify_on_new:true,
  p_location_query:f.location,p_verified_only:false
 });
 let m=document.getElementById("saveSearchMsg");
 if(r.error)m.innerHTML=N(r.error.message,1);else m.innerHTML=N("Suchauftrag gespeichert. Du wirst bei neuen passenden Inseraten benachrichtigt.")
}

async function home(){
 let roots=marketCategoryRoots(),catOptions=roots.map(c=>'<option value="'+E(c.slug)+'">'+E(c.name_de)+'</option>').join(""),cantons=["AG","AI","AR","BE","BL","BS","FR","GE","GL","GR","JU","LU","NE","NW","OW","SG","SH","SO","SZ","TG","TI","UR","VD","VS","ZG","ZH"];
 let __km24BootArea='market';try{var __km24HashQ=(location.hash||'').split('?')[1]||'';var __km24HashArea=new URLSearchParams(__km24HashQ).get('area');if(__km24HashArea==='jobs'||__km24HashArea==='market')__km24BootArea=__km24HashArea;else if(sessionStorage.getItem('km24HomeAreaV1')==='jobs'||localStorage.getItem('km24HomeAreaV1')==='jobs')__km24BootArea='jobs'}catch(_){}
 document.body.classList.toggle('km24AreaMarket',__km24BootArea==='market');document.body.classList.toggle('km24AreaJobs',__km24BootArea==='jobs');
 app.innerHTML='<section id="km24AreaBarSection" class="km24AreaBarSection"><div class="wrap"><div class="km24AreaSwitch" role="tablist" aria-label="Bereich wählen"><button type="button" data-km24-area="market">🛍️ <span>Marktplatz</span></button><button type="button" data-km24-area="jobs">💼 <span>Jobs</span></button></div><div id="km24JobsHub" class="km24JobsHub" hidden><div class="km24JobsHubTop"><div><small>KAUFMICH24 JOBS</small><h1>Jobs & Personal</h1><p>Stellenangebote und Stellengesuche – getrennt vom Marktplatz.</p></div><span class="km24JobsHubIcon">💼</span></div><div class="km24JobKindTabs" role="tablist"><button type="button" data-km24-job-kind="all">Alle</button><button type="button" data-km24-job-kind="offer">Stellenangebote</button><button type="button" data-km24-job-kind="wanted">Stellengesuche</button></div><div class="km24JobsHubActions"><a class="btn primary" href="#/sell?job=employer">🏢 Job anbieten</a><a class="btn" href="#/wanted/new?job=seeker">👤 Stellengesuch erstellen</a></div></div></div></section><section class="hero km24WowHero"><div class="season-decor" aria-hidden="true"><span class="d1">🍂</span><span class="d2">🍁</span><span class="d3">🍂</span><span class="d4">🌰</span><span class="pumpkin">🎃</span></div><div class="wrap"><div class="season-ribbon">🍁 Herbst auf KaufMich24</div><div class="km24HeroEyebrow">🇨🇭 Die Schweizer Plattform</div><h1><span class=km24HeroFirstLine>Dein Leben.</span><br><span>Deine Deals.</span></h1><p class="season-note km24HeroText">Kaufen, verkaufen, Jobs entdecken und Dienstleistungen finden. Alles an einem Ort.</p><div class="search"><input id="q" placeholder="Was suchst du?"><button id="qs">Suchen</button></div><div class="quickDiscover"><button data-quick-sort="newest">✨ Neu eingestellt</button><button data-quick-sort="popular">🔥 Beliebt</button><button data-quick-sort="ending_soon" data-quick-price="auction">⏱ Endet bald</button><button data-quick-price="free">🎁 Gratis</button></div><div class="km24HeroActions"><button class="btn primary km24CtaPrimary" onclick="document.getElementById(&quot;grid&quot;).scrollIntoView({behavior:&quot;smooth&quot;,block:&quot;start&quot;})">🔎 Alle Inserate entdecken</button></div><div class="km24TrustPills"><span>✓ Schnell inserieren</span><span>✓ Direkt chatten</span><span>✓ Schweizweit handeln</span></div></div></section><section class="km24ServicesSpotlightV2" id="km24SrvSpotlightV2"><div class="wrap"><div class="km24SrvSpotHead"><div><span class="km24SrvEyebrow">DIENSTLEISTUNGEN</span><h2>Hilfe finden. Kunden gewinnen.</h2><p>Reinigung, Handwerk und weitere Services aus deiner Region – direkt und unkompliziert.</p></div><a class="km24SrvAll" href="#/services">Alle Dienstleistungen ansehen ›</a></div><div class="km24SrvSpotGrid"><a href="#/services?category=reinigung"><span>🧹</span><b>Reinigung & Haushalt</b><small>Putzen, Fenster, Haushaltshilfe</small></a><a href="#/services?category=handwerk"><span>🔧</span><b>Handwerk</b><small>Reparatur und Renovation</small></a><a href="#/services?category=transport"><span>🚚</span><b>Umzug & Transport</b><small>Helfer und Transporte</small></a><a href="#/services?category=garten"><span>🌿</span><b>Garten & Umgebung</b><small>Pflege und Gartenarbeiten</small></a></div><div class="km24SrvSpotFooter"><span>Du suchst Unterstützung oder möchtest neue Kunden erreichen?</span><div><a class="btn" href="#/services/request/new">🔎 Auftrag ausschreiben</a><a class="btn primary" href="#/services/offer/new">＋ Kostenlos anbieten</a></div></div></div></section><section class="section"><div class="wrap"><div class="head"><div><span class="km24SectionKicker">ENTDECKEN</span><h2>Kategorien</h2></div></div><div id="cats" class="cats"></div></div></section><section class="km24FounderSpotlight"><div class="wrap"><a class="km24FounderHome" href="#/founder"><span class="km24FounderCoin">🚀</span><span class="km24FounderHomeCopy"><small>KAUFMICH24 GRÜNDER-AKTION</small><b>Die ersten 1’000 echten Verkäufer</b><strong>CHF 30 Guthaben + 0 % Verkaufsgebühr bis 31.12.2027</strong><em id="km24FounderProgress">Gründerplätze verfügbar · echtes Inserat erforderlich</em></span><span class="km24FounderHomeCta">Gründer werden →</span></a></div></section><section class="section km24JobsResultsSection"><div class="wrap"><div class="head"><div><h2>Verkaufsinserate</h2><p class="mut" style="margin:4px 0 0">Aktuelle Verkaufsangebote aus der ganzen Schweiz.</p></div>'+(user?'':'')+'</div><div class="marketSearchPanel"><div class="marketSearchGrid"><label>Hauptkategorie<select id="scat"><option value="">Alle Kategorien</option>'+catOptions+'</select></label><label>Unterkategorie<select id="ssub" disabled><option value="">Alle Unterkategorien</option></select></label><label>Ort / PLZ<input id="slocation" placeholder="z. B. Triengen oder 6234"></label><label>Kanton<select id="scanton"><option value="">Ganze Schweiz</option>'+cantons.map(x=>'<option value="'+x+'">'+x+'</option>').join("")+'</select></label><label>Preis von CHF<input id="smin" type="number" min="0" step=".05" placeholder="0"></label><label>Preis bis CHF<input id="smax" type="number" min="0" step=".05" placeholder="beliebig"></label><label>Zustand<select id="scond"><option value="">Alle Zustände</option><option value="new">Neu</option><option value="like_new">Wie neu</option><option value="used">Gebraucht</option><option value="defective">Defekt</option></select></label><label>Verkäufer<select id="sseller"><option value="">Privat & Händler</option><option value="private">Privat</option><option value="dealer">Händler</option><option value="business">Unternehmen</option></select></label><label>Verkaufsart<select id="sprice"><option value="">Alle</option><option value="fixed">Fixpreis</option><option value="negotiable">Verhandelbar</option><option value="auction">Auktion</option><option value="free">Verschenken</option></select></label><label>Sortierung<select id="ssort"><option value="newest">Neueste zuerst</option><option value="popular">Beliebt</option><option value="price_asc">Preis aufsteigend</option><option value="price_desc">Preis absteigend</option><option value="ending_soon">Auktionen enden bald</option></select></label></div><div class="marketSearchActions"><button class="btn primary" id="applySearch">🔎 Filter anwenden</button><button class="btn" id="resetSearch">Zurücksetzen</button><button class="btn" id="saveSearch">🔔 Suche speichern</button></div><div id="saveSearchMsg"></div></div><div class="searchResultHead"><b id="resultStatus"></b></div><div id="grid" class="grid"></div></div></section><section class="section km24WhySection"><div class="wrap"><div class="km24SectionIntro"><div><span class="km24SectionKicker">WARUM KAUFMICH24?</span><h2>Einfach handeln. Ohne Umwege.</h2></div></div><div class="km24WhyGrid"><div class="km24WhyCard"><span>⚡</span><b>Schnell inserieren</b><p>In wenigen Schritten ist dein Angebot online.</p></div><div class="km24WhyCard"><span>💬</span><b>Direkt kommunizieren</b><p>Käufer und Verkäufer bleiben unkompliziert in Kontakt.</p></div><div class="km24WhyCard"><span>🛡️</span><b>Übersichtlich handeln</b><p>Käufe, Verkäufe und Nachrichten an einem Ort.</p></div><div class="km24WhyCard"><span>🇨🇭</span><b>Für die ganze Schweiz</b><p>Lokal suchen oder schweizweit verkaufen.</p></div></div></div></section>';
 var __km24AreaBtns=document.querySelectorAll('[data-km24-area]');__km24AreaBtns.forEach(function(b){var on=b.getAttribute('data-km24-area')===__km24BootArea;b.classList.toggle('active',on);b.setAttribute('aria-selected',on?'true':'false')});var __km24Hub=document.getElementById('km24JobsHub');if(__km24Hub)__km24Hub.hidden=__km24BootArea!=='jobs';var __km24Q=document.getElementById('q');if(__km24Q)__km24Q.placeholder=__km24BootArea==='jobs'?'Welchen Job suchst du?':'Was suchst du?';
 drawCats();
 document.getElementById("scat").onchange=()=>marketFillSubcategories();
 document.getElementById("applySearch").onclick=runMarketplaceSearch;
 window.km24HeroSearchSubmit=async function(){
  const input=document.getElementById("q"),b=document.getElementById("qs"),st=document.getElementById("resultStatus"),g=document.getElementById("grid");
  if(!input||!g)return;
  const term=input.value.trim(),seq=(window.__km24SearchSeq||0)+1;
  window.__km24SearchSeq=seq;window.__km24HeroSearchSeq=seq;

  let heroStatus=document.getElementById("heroSearchStatus");
  if(!heroStatus){
    heroStatus=document.createElement("div");
    heroStatus.id="heroSearchStatus";
    heroStatus.style.cssText="margin-top:10px;min-height:22px;font-weight:850;font-size:14px";
    input.closest(".search")?.insertAdjacentElement("afterend",heroStatus);
  }

  if(!term){
    input.focus();
    heroStatus.innerHTML=N("Bitte einen Suchbegriff eingeben.",1);
    return;
  }

  if(b){b.dataset.searchBusy="1";b.disabled=true;b.textContent="Suche …"}
  heroStatus.textContent='Suche nach „'+term+'“ …';
  if(st)st.textContent='Suche nach „'+term+'“ …';
  g.innerHTML='<div class="empty" style="grid-column:1/-1">Suche läuft …</div>';

  try{
    const r=await db.rpc("search_marketplace_v3",{
      p_query:term,p_category_slug:null,p_subcategory_slug:null,
      p_min_price_chf:null,p_max_price_chf:null,p_condition:null,
      p_canton:null,p_seller_type:null,p_price_type:null,p_sort:"newest",
      p_limit:100,p_offset:0,p_location:null,p_verified_only:false,p_listing_intent:"offer"
    });
    if(seq!==window.__km24SearchSeq)return;
    if(r.error)throw r.error;

    let arr=r.data||[],stats={};
    if(arr.length){
      const auctionIds=arr.filter(x=>x.price_type==="auction").map(x=>x.id);
      const sq=auctionIds.length?await db.from("auction_stats").select("*").in("listing_id",auctionIds):{data:[]};
      if(seq!==window.__km24SearchSeq)return;
      (sq.data||[]).forEach(x=>stats[x.listing_id]=x);
      try{
        const pq=await db.from("listings").select("id,featured_until,home_boost_until").in("id",arr.map(x=>x.id)),pm={};
        (pq.data||[]).forEach(x=>pm[x.id]=x);
        arr.forEach(x=>Object.assign(x,pm[x.id]||{}))
      }catch(_){}
    }

    await km24AttachCardImages(arr);
    if(seq!==window.__km24SearchSeq)return;
    arr.forEach(x=>{
      if(!x._img)x._img=x.image_path?{storage_path:x.image_path,focal_x:x.focal_x,focal_y:x.focal_y,fit_mode:x.fit_mode}:null;
      x._p={account_type:x.seller_type,business_name:x.seller_name,display_name:x.seller_name,city:x.city,identity_verified_at:null};
      x._s=stats[x.id]||null
    });

    listings=arr;query=term;

    if(!arr.length){
      const msg='Keine Inserate für „'+term+'“ gefunden.';
      heroStatus.innerHTML='<span style="color:#f2c27f">🔎 '+E(msg)+'</span>';
      if(st)st.textContent=msg;
      g.innerHTML='<div class="empty" style="grid-column:1/-1">'+E(msg)+'</div>';
      input.focus();
      return;
    }

    const msg=arr.length+" "+(arr.length===1?"Treffer":"Treffer")+' für „'+term+'“';
    heroStatus.innerHTML='<span style="color:#8ee6a6">✓ '+E(msg)+'</span>';
    if(st)st.textContent=msg;
    g.innerHTML=arr.map(card).join("");
    const target=document.getElementById("resultStatus")||g;
    if(target)setTimeout(()=>target.scrollIntoView({behavior:"smooth",block:"start"}),50)
  }catch(e){
    if(seq===window.__km24SearchSeq){
      heroStatus.innerHTML=N("Suche konnte nicht ausgeführt werden. Bitte erneut versuchen.",1);
      if(st)st.innerHTML=N("Suche konnte nicht ausgeführt werden. Bitte erneut versuchen.",1);
      g.innerHTML=""
    }
  }finally{
    if(seq===window.__km24SearchSeq&&b){
      b.dataset.searchBusy="0";b.disabled=false;b.textContent="Suchen"
    }
  }
};
 document.getElementById("qs").onclick=window.km24HeroSearchSubmit;
 document.getElementById("q").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();window.km24HeroSearchSubmit()}};
 document.getElementById("slocation").onkeydown=e=>{if(e.key==="Enter")runMarketplaceSearch()};
 document.getElementById("saveSearch").onclick=saveCurrentSearch;
 document.getElementById("resetSearch").onclick=()=>{["q","slocation","smin","smax"].forEach(id=>document.getElementById(id).value="");["scat","scond","scanton","sseller","sprice"].forEach(id=>document.getElementById(id).value="");document.getElementById("ssort").value="newest";marketFillSubcategories();runMarketplaceSearch()};
 document.querySelectorAll("[data-quick-sort],[data-quick-price]").forEach(b=>b.onclick=()=>{document.getElementById("ssort").value=b.dataset.quickSort||"newest";document.getElementById("sprice").value=b.dataset.quickPrice||"";document.getElementById("grid").scrollIntoView({behavior:"smooth",block:"start"});runMarketplaceSearch()});
 if(marketSearchPreset){marketApplyPreset(marketSearchPreset);marketSearchPreset=null}else if(query)document.getElementById("q").value=query;
 await runMarketplaceSearch()
}

async function savedSearchesPage(){
 if(!user)return go("#/login");
 let r=await db.from("saved_searches").select("*").eq("user_id",user.id).order("created_at",{ascending:false}),rows=r.data||[];
 let summary=x=>{let a=[];if(x.query_text)a.push("„"+x.query_text+"“");if(x.category_slug)a.push(marketCategoryName(x.category_slug));if(x.subcategory_slug)a.push(marketCategoryName(x.subcategory_slug));if(x.location_query)a.push("📍 "+x.location_query);if(x.min_price_chf!=null)a.push("ab CHF "+F(x.min_price_chf));if(x.max_price_chf!=null)a.push("bis CHF "+F(x.max_price_chf));if(x.condition)a.push(({new:"Neu",like_new:"Wie neu",used:"Gebraucht",defective:"Defekt"}[x.condition]||x.condition));if(x.canton)a.push(x.canton);if(x.seller_type)a.push(x.seller_type==="private"?"Privat":"Händler");if(x.price_type)a.push(L(x.price_type));return a};
 let html=rows.length?rows.map(x=>{let a=summary(x);return'<div class="adminCard savedSearchRow"><div><div class="head" style="margin:0"><b>'+E(x.name)+'</b><span class="badge '+(x.notify_on_new?"":"auction")+'">'+(x.notify_on_new?"🔔 Benachrichtigungen an":"🔕 Benachrichtigungen aus")+'</span></div><div class="savedSearchMeta">'+(a.length?a.map(v=>'<span class="badge">'+E(v)+'</span>').join(""):'<span class="mut">Keine Filter – alle neuen Inserate</span>')+'</div><small class="mut">Erstellt '+E(D(x.created_at))+'</small></div><div class="actions"><button class="btn primary" data-run-search="'+x.id+'">Suchen</button><button class="btn" data-toggle-search="'+x.id+'" data-state="'+(x.notify_on_new?"1":"0")+'">'+(x.notify_on_new?"Benachrichtigungen aus":"Benachrichtigungen an")+'</button><button class="btn" data-delete-search="'+x.id+'">Löschen</button></div></div>'}).join(""):'<div class="empty">Du hast noch keinen Suchauftrag gespeichert.</div>';
 app.innerHTML='<div class="wrap formPage"><div class="head"><div><h1 style="margin:0">Meine Suchaufträge</h1><p class="mut" style="margin:5px 0 0">KaufMich24 benachrichtigt dich, wenn ein neues Inserat zu einem aktiven Suchauftrag passt.</p></div><a class="btn primary" href="#/">Neue Suche</a></div><div class="manage">'+html+'</div></div>';
 document.querySelectorAll("[data-run-search]").forEach(b=>b.onclick=()=>{let x=rows.find(r=>r.id===b.dataset.runSearch);if(!x)return;marketSearchPreset={...x,sort:"newest"};go("#/")});
 document.querySelectorAll("[data-toggle-search]").forEach(b=>b.onclick=async()=>{let on=b.dataset.state==="1",q=await db.from("saved_searches").update({notify_on_new:!on,updated_at:new Date().toISOString()}).eq("id",b.dataset.toggleSearch).eq("user_id",user.id);if(q.error)alert(q.error.message);else savedSearchesPage()});
 document.querySelectorAll("[data-delete-search]").forEach(b=>b.onclick=async()=>{if(!confirm("Suchauftrag wirklich löschen?"))return;let q=await db.from("saved_searches").delete().eq("id",b.dataset.deleteSearch).eq("user_id",user.id);if(q.error)alert(q.error.message);else savedSearchesPage()})
}

async function publicProfile(id){
 let [pr,lr,rr]=await Promise.all([
  db.rpc("seller_profile_public",{p_seller_id:id}),
  db.from("listings").select("*").eq("seller_id",id).eq("status","active").order("created_at",{ascending:false}),
  db.rpc("seller_reviews_public",{p_seller_id:id,p_limit:30,p_offset:0})
 ]);
 let p=(pr.data||[])[0];
 if(!p){app.innerHTML="<div class='wrap formPage'><div class='empty'>Profil nicht gefunden.</div></div>";return}
 let ls=lr.data||[],reviews=rr.data||[],imgs={},blocked=false;
 if(ls.length){
  let q=await db.from("listing_images").select("listing_id,storage_path,sort_order,focal_x,focal_y,fit_mode").in("listing_id",ls.map(x=>x.id)).order("sort_order");
  (q.data||[]).forEach(x=>{if(!imgs[x.listing_id])imgs[x.listing_id]=x})
 }
 let cardProfile={display_name:p.display_name,business_name:p.business_name,account_type:p.account_type,city:p.city,identity_verified_at:null};
 ls.forEach(x=>{x._img=imgs[x.id];x._p=cardProfile});
 let reviewable=null;
 if(user&&user.id!==id){
  let [q,bq]=await Promise.all([db.rpc("my_reviewable_transactions"),db.rpc("my_blocked_users")]);
  reviewable=(q.data||[]).find(x=>x.counterpart_id===id&&!x.already_reviewed)||null;
  blocked=(bq.data||[]).some(x=>x.user_id===id)
 }
 let member=p.member_since?new Intl.DateTimeFormat("de-CH",{year:"numeric",month:"long"}).format(new Date(p.member_since)):"–";
 let accountLabel=p.account_type==="dealer"||p.account_type==="business"?"🏪 Händler / Unternehmen":"👤 Privatperson";
 let web=p.website?"<div style='margin-top:8px'><a class='btn' href='"+E(p.website)+"' target='_blank' rel='noopener'>🌐 Webseite</a></div>":"";
 let reviewButton=reviewable?"<button class='btn primary' id='reviewUser' data-listing='"+reviewable.listing_id+"'>★ Verkäufer bewerten</button>":"";
 let safetyActions=user&&user.id!==id?"<div class='actions' style='margin-top:12px'><button class='btn' id='reportUser'>⚑ Nutzer melden</button><button class='btn "+(blocked?"primary":"")+"' id='blockUser'>"+(blocked?"Entblockieren":"🚫 Blockieren")+"</button></div>":"";
 let trust="<div class='trustStrip'>"+(p.email_verified?"<span>✓ E-Mail bestätigt</span>":"")+(p.phone_verified?"<span>✓ Mobilnummer bestätigt</span>":"")+"</div>";
 app.innerHTML="<div class='wrap formPage'><div class='panel'><div class='head' style='align-items:flex-start'><div><span class='badge "+((p.account_type==="dealer"||p.account_type==="business")?"dealer":"")+"'>"+accountLabel+"</span> "+""+"<h1 style='margin-bottom:8px'>"+E(p.business_name||p.display_name||"Profil")+"</h1><div class='ratingStars'>"+(p.rating_count?"★ "+E(p.rating)+" / 5 · "+E(p.rating_count)+" Bewertung(en)":"Noch keine Bewertungen")+"</div>"+trust+"</div>"+reviewButton+"</div><div class='specs' style='margin-top:14px'><div class='spec'><small>Mitglied seit</small><b>"+E(member)+"</b></div><div class='spec'><small>Aktive Inserate</small><b>"+E(p.active_listing_count||0)+"</b></div><div class='spec'><small>Verkauft</small><b>"+E(p.sold_listing_count||0)+"</b></div><div class='spec'><small>Standort</small><b>"+E([p.postal_code,p.city,p.canton].filter(Boolean).join(" ")||"Schweiz")+"</b></div></div>"+(p.bio?"<p style='margin-top:16px'>"+E(p.bio)+"</p>":"")+web+safetyActions+(blocked?"<div class='notice' style='margin-top:12px'>Dieser Nutzer ist blockiert. Neue Nachrichten und neue Käufe zwischen euch sind gesperrt.</div>":"")+"</div><section class='section'><h2>Aktive Inserate</h2><div class='grid'>"+(ls.length?ls.map(card).join(""):"<div class='empty' style='grid-column:1/-1'>Keine aktiven Inserate.</div>")+"</div></section><section class='section'><h2>Bewertungen</h2><div class='manage'>"+(reviews.length?reviews.map(r=>"<div class='adminCard'><div class='head' style='margin:0'><b>★ "+E(r.rating)+"/5</b><small class='mut'>"+E(D(r.created_at))+"</small></div>"+(r.comment?"<div style='margin-top:6px'>"+E(r.comment)+"</div>":"")+"<div class='mut' style='margin-top:6px'>"+E(r.reviewer_name||"Nutzer")+(r.listing_title?" · "+E(r.listing_title):"")+"</div></div>").join(""):"<div class='empty'>Noch keine Bewertungen.</div>")+"</div></section></div>";
 let rb=document.getElementById("reviewUser");
 if(rb)rb.onclick=async()=>{let rating=Number(prompt("Bewertung 1–5:","5"));if(!Number.isInteger(rating)||rating<1||rating>5)return;let comment=prompt("Kommentar (optional, max. 1000 Zeichen):","")||null;if(comment&&comment.length>1000)return alert("Der Kommentar darf höchstens 1000 Zeichen lang sein.");let r=await db.rpc("submit_transaction_review",{p_listing_id:rb.dataset.listing,p_rating:rating,p_comment:comment});if(r.error)alert(r.error.message);else publicProfile(id)};
 let ru=document.getElementById("reportUser");if(ru)ru.onclick=()=>reportUser(id);
 let bu=document.getElementById("blockUser");if(bu)bu.onclick=async()=>{let msg=blocked?"Nutzer wirklich entblockieren?":"Nutzer wirklich blockieren? Danach sind neue Nachrichten und neue Käufe zwischen euch gesperrt.";if(!confirm(msg))return;let r=await db.rpc(blocked?"unblock_user":"block_user",{p_user_id:id});if(r.error)alert(r.error.message);else publicProfile(id)}
}

async function buyerCenter(){
 if(!user)return go("#/login");
 let [fr,or,br,pr]=await Promise.all([
  db.from("favorites").select("listing_id").eq("user_id",user.id),
  db.from("offers").select("*").eq("buyer_id",user.id).order("created_at",{ascending:false}),
  db.from("bids").select("*").eq("bidder_id",user.id).order("created_at",{ascending:false}),
  db.rpc("my_purchases")
 ]);
 let favIds=(fr.data||[]).map(x=>x.listing_id),offers=or.data||[],bids=br.data||[],purchases=pr.data||[];
 let allIds=[...new Set([...favIds,...offers.map(x=>x.listing_id),...bids.map(x=>x.listing_id),...purchases.map(x=>x.listing_id)])],listMap={},stats={},imgs={};
 if(allIds.length){let [lq,iq,sq]=await Promise.all([db.from("listings").select("*").in("id",allIds),loadActivityImages(allIds),db.from("auction_stats").select("*").in("listing_id",allIds)]);(lq.data||[]).forEach(x=>listMap[x.id]=x);(sq.data||[]).forEach(x=>stats[x.listing_id]=x);imgs=iq}
 let latestBid={};bids.forEach(b=>{if(!latestBid[b.listing_id]||Number(b.amount_chf)>Number(latestBid[b.listing_id].amount_chf))latestBid[b.listing_id]=b});
 let favHtml=favIds.length?favIds.map(id=>{let l=listMap[id];if(!l)return"";return"<div class='activityCard'><div class='activityPic'>"+activityImage(imgs[id])+"</div><div><b>"+E(l.title)+"</b><div class='mut'>"+E(ptxt(l,stats[id]))+"</div></div><div class='actions'><a class='btn' href='#/listing/"+id+"'>Ansehen</a></div></div>"}).join(""):"<div class='empty'>Deine Merkliste ist leer.</div>";
 let offerHtml=offers.length?offers.map(o=>{let l=listMap[o.listing_id]||{},cls=o.status==="accepted"?"statusGood":o.status==="rejected"?"statusBad":"statusWarn";return"<div class='activityCard'><div class='activityPic'>"+activityImage(imgs[o.listing_id])+"</div><div><b>"+E(l.title||"Inserat")+"</b><div>Dein Angebot: <b>CHF "+F(o.amount_chf)+"</b></div><div class='activityStatus "+cls+"'>"+E(offerStatusLabel(o.status))+"</div></div><div class='actions'><a class='btn' href='#/listing/"+o.listing_id+"'>Ansehen</a></div></div>"}).join(""):"<div class='empty'>Noch keine Preisvorschläge gesendet.</div>";
 let purchaseListingIds=new Set(purchases.map(x=>String(x.listing_id)));let bidIds=Object.keys(latestBid).filter(id=>!purchaseListingIds.has(String(id))),bidHtml=bidIds.length?bidIds.map(id=>{let b=latestBid[id],l=listMap[id]||{},s=stats[id]||{},ended=l.auction_end_at&&new Date(l.auction_end_at)<=new Date(),leading=Number(s.highest_bid_chf)===Number(b.amount_chf),txt=l.status==="sold"&&l.sold_to===user.id?"🏆 Gewonnen":ended&&!leading?"Beendet":leading?"✓ Du führst":"⚠ Überboten",cls=leading?"statusGood":ended?"":"statusWarn";return"<div class='activityCard'><div class='activityPic'>"+activityImage(imgs[id])+"</div><div><b>"+E(l.title||"Auktion")+"</b><div>Dein höchstes Gebot: <b>CHF "+F(b.amount_chf)+"</b></div><div class='activityStatus "+cls+"'>"+txt+"</div></div><div class='actions'><a class='btn' href='#/listing/"+id+"'>Auktion</a></div></div>"}).join(""):"<div class='empty'>Du hast noch auf keine Auktion geboten.</div>";
 let payLabel=s=>({open:"Direktzahlung offen",paid:"Zahlung erhalten",refunded:"Rückerstattet",not_applicable:"Keine Zahlung nötig"}[s]||s||"");
 let fulfillLabel=s=>({pending:"Abwicklung offen",shipping:"Versand wird vorbereitet",shipped:"Versendet",ready_for_pickup:"Abholbereit",picked_up:"Abgeholt",completed:"Abgeschlossen"}[s]||s||"");
 let steps=x=>"<div class='txSteps'><span class='done'>✓ Kauf bestätigt</span><span class='"+(x.payment_status==="paid"||x.payment_status==="not_applicable"?"done":"")+"'>"+(x.payment_status==="paid"?"✓ Zahlung bestätigt":"2 Zahlung")+"</span><span class='"+(["shipped","picked_up","completed"].includes(x.fulfillment_status)?"done":"")+"'>"+(x.fulfillment_status==="shipped"?"✓ Versendet":x.fulfillment_status==="picked_up"?"✓ Abgeholt":x.fulfillment_status==="completed"?"✓ Übergeben":"3 Übergabe")+"</span><span class='"+(x.fulfillment_status==="completed"?"done":"")+"'>"+(x.fulfillment_status==="completed"?"✓ Abgeschlossen":"4 Abschluss")+"</span></div>";
 let purchaseHtml;
 if(purchases.length){
   purchaseHtml=purchases.map(x=>{
     const completed=x.fulfillment_status==="completed";
     const canConfirm=["shipped","picked_up"].includes(x.fulfillment_status)&&x.transaction_id;
     const action=completed
       ? "<div class='notice' style='margin-top:8px'>✓ Dieser Kauf ist abgeschlossen. Du kannst den Verkäufer jetzt bewerten.</div>"
       : canConfirm
         ? "<button class='btn primary' style='margin-top:9px' data-confirm-received='"+x.transaction_id+"'>✓ Erhalt bestätigen</button>"
         : "";
     return "<div class='activityCard'><div class='activityPic'>"+activityImage(imgs[x.listing_id])+"</div><div><b>"+E(x.title)+"</b><div class='activityStatus statusGood'>✓ Gekauft für CHF "+F(x.price_chf)+"</div>"+steps(x)+"<div style='margin-top:7px'><span class='badge'>"+E(payLabel(x.payment_status))+"</span> <span class='badge "+(completed?"":"auction")+"'>"+E(fulfillLabel(x.fulfillment_status))+"</span></div><small class='mut' style='display:block;margin-top:6px'>"+E(D(x.sold_at))+" · Verkäufer: "+E(x.seller_name||"Verkäufer")+"</small>"+action+"</div><div class='actions'><a class='btn' href='#/listing/"+x.listing_id+"'>Details</a><button class='btn' data-purchase-chat='"+x.listing_id+"'>Verkäufer kontaktieren</button></div></div>";
   }).join("");
 }else{
   purchaseHtml="<div class='empty'>Noch keine Käufe.</div>";
 }
 app.innerHTML="<div class='wrap formPage'><div class='head'><div><h1 style='margin:0'>Kaufen</h1><p class='mut' style='margin:5px 0 0'>Merkliste, Angebote, Gebote und Käufe an einem Ort.<br>💳 Zahlung erfolgt direkt an den Verkäufer. KaufMich24 verwahrt kein Geld.</p></div><a class='btn' href='#/me'>Mein Konto</a></div><div class='marketSummary'><div class='marketStat'><span class='mut'>Gemerkt</span><b>"+favIds.length+"</b></div><div class='marketStat'><span class='mut'>Angebote offen</span><b>"+offers.filter(x=>x.status==="pending").length+"</b></div><div class='marketStat'><span class='mut'>Auktionen</span><b>"+bidIds.length+"</b></div><div class='marketStat'><span class='mut'>Gekauft</span><b>"+purchases.length+"</b></div></div><div class='marketTabs'><a class='btn' href='#/messages'>💬 Nachrichten</a><a class='btn primary' href='#/'>Inserate entdecken</a></div><section class='section'><h2>❤ Merkliste</h2><div class='manage'>"+favHtml+"</div></section><section class='section'><h2>🤝 Meine Preisvorschläge</h2><div class='manage'>"+offerHtml+"</div></section><section class='section'><h2>🔨 Meine Auktionen</h2><div class='manage'>"+bidHtml+"</div></section><section class='section'><h2>🛍 Meine Käufe</h2><div class='manage'>"+purchaseHtml+"</div></section></div>";
 document.querySelectorAll("[data-purchase-chat]").forEach(b=>b.onclick=()=>startChat(b.dataset.purchaseChat));
 document.querySelectorAll("[data-confirm-received]").forEach(b=>b.onclick=async()=>{if(!confirm("Bestätigen, dass du den Artikel erhalten hast? Der Kauf wird danach abgeschlossen."))return;b.disabled=true;let r=await db.rpc("buyer_confirm_transaction",{p_transaction_id:b.dataset.confirmReceived});if(r.error){b.disabled=false;return alert(r.error.message)}buyerCenter()})
}

async function salesCenter(){
 if(!user)return go("#/login");
 let [lr,or,sr]=await Promise.all([
  db.from("listings").select("*").eq("seller_id",user.id).order("created_at",{ascending:false}),
  db.from("offers").select("*").eq("seller_id",user.id).order("created_at",{ascending:false}),
  db.rpc("my_sales")
 ]);
 let ls=lr.data||[],offers=or.data||[],sales=sr.data||[],ids=ls.map(x=>x.id),imgs=await loadActivityImages(ids),title={};ls.forEach(x=>title[x.id]=x.title);
 let active=ls.filter(x=>x.status==="active");
 let offerHtml=offers.length?offers.map(o=>{let cls=o.status==="accepted"?"statusGood":o.status==="rejected"?"statusBad":"statusWarn";return"<div class='adminCard'><b>"+E(title[o.listing_id]||"Inserat")+"</b><div>CHF "+F(o.amount_chf)+"</div><div class='activityStatus "+cls+"'>"+E(offerStatusLabel(o.status))+"</div>"+(o.status==="pending"?"<div class='actions' style='margin-top:8px'><button class='btn primary' data-sale-offer='"+o.id+"' data-accept='1'>Annehmen</button><button class='btn' data-sale-offer='"+o.id+"' data-accept='0'>Ablehnen</button></div>":"")+"</div>"}).join(""):"<div class='empty'>Keine Preisvorschläge.</div>";
 let payLabel=s=>({open:"Direktzahlung offen",paid:"Zahlung erhalten",refunded:"Rückerstattet",not_applicable:"Keine Zahlung nötig"}[s]||s||"");
 let fulfillLabel=s=>({pending:"Abwicklung offen",shipping:"Versand wird vorbereitet",shipped:"Versendet",ready_for_pickup:"Abholbereit",picked_up:"Abgeholt",completed:"Abgeschlossen"}[s]||s||"");
 let steps=x=>"<div class='txSteps'><span class='done'>✓ Kauf bestätigt</span><span class='"+(x.payment_status==="paid"||x.payment_status==="not_applicable"?"done":"")+"'>"+(x.payment_status==="paid"?"✓ Zahlung":"2 Zahlung")+"</span><span class='"+(["shipped","picked_up","completed"].includes(x.fulfillment_status)?"done":"")+"'>"+(x.fulfillment_status==="shipped"?"✓ Versendet":x.fulfillment_status==="picked_up"?"✓ Abgeholt":x.fulfillment_status==="completed"?"✓ Übergeben":"3 Übergabe")+"</span><span class='"+(x.fulfillment_status==="completed"?"done":"")+"'>"+(x.fulfillment_status==="completed"?"✓ Abgeschlossen":"4 Käufer bestätigt")+"</span></div>";
 function flowButtons(x){
  if(!x.transaction_id)return "";
  let a=[];
  if(x.payment_status==="open")a.push("<button class='btn primary' data-tx='"+x.transaction_id+"' data-pay='paid'>💰 Zahlung erhalten</button>");
  if(x.payment_status==="paid")a.push("<button class='btn' data-tx='"+x.transaction_id+"' data-pay='refunded'>↩ Rückerstattet</button>");
  if(x.fulfillment_status==="pending"){
    if(x.shipping_available)a.push("<button class='btn' data-tx='"+x.transaction_id+"' data-fulfill='shipping'>📦 Versand vorbereiten</button>");
    if(x.pickup_available)a.push("<button class='btn' data-tx='"+x.transaction_id+"' data-fulfill='ready_for_pickup'>📍 Abholbereit</button>");
  }else if(x.fulfillment_status==="shipping"){
    a.push("<button class='btn primary' data-tx='"+x.transaction_id+"' data-fulfill='shipped'>🚚 Als versendet markieren</button>");
  }else if(x.fulfillment_status==="ready_for_pickup"){
    a.push("<button class='btn primary' data-tx='"+x.transaction_id+"' data-fulfill='picked_up'>✓ Übergabe erfolgt</button>");
  }
  if(x.fulfillment_status==="shipped"||x.fulfillment_status==="picked_up")a.push("<span class='mut' style='align-self:center'>Warte auf Bestätigung des Käufers.</span>");
  return a.length?"<div class='actions' style='margin-top:10px;flex-wrap:wrap'>"+a.join("")+"</div>":"";
 }
 let soldHtml=sales.length?sales.map(x=>"<div class='activityCard'><div class='activityPic'>"+activityImage(imgs[x.listing_id])+"</div><div><b>"+E(x.title)+"</b><div class='activityStatus statusGood'>Verkauft · CHF "+F(x.price_chf)+"</div>"+steps(x)+"<div class='mut'><b>"+E(payLabel(x.payment_status))+"</b> · <b>"+E(fulfillLabel(x.fulfillment_status))+"</b></div><small class='mut'>"+E(D(x.sold_at))+" · Käufer: "+E(x.buyer_name||"Käufer")+"</small>"+flowButtons(x)+"</div><div class='actions'><a class='btn' href='#/listing/"+x.listing_id+"'>Details</a><button class='btn' data-sale-chat='"+x.listing_id+"'>Käufer kontaktieren</button></div></div>").join(""):"<div class='empty'>Noch keine Verkäufe.</div>";
 app.innerHTML="<div class='wrap formPage'><div class='head'><div><h1 style='margin:0'>Verkäufe</h1><p class='mut' style='margin:5px 0 0'>Verkauf, direkte Zahlung, Versand und Abholung an einem Ort.<br>💳 Zahlung erfolgt direkt zwischen Käufer und Verkäufer. KaufMich24 verwahrt kein Geld.</p></div><a class='btn' href='#/me'>Mein Konto</a></div><div class='marketSummary'><div class='marketStat'><span class='mut'>Aktive Inserate</span><b>"+active.length+"</b></div><div class='marketStat'><span class='mut'>Offene Angebote</span><b>"+offers.filter(x=>x.status==="pending").length+"</b></div><div class='marketStat'><span class='mut'>Verkauft</span><b>"+sales.length+"</b></div><div class='marketStat'><span class='mut'>Abgeschlossen</span><b>"+sales.filter(x=>x.fulfillment_status==="completed").length+"</b></div></div><section class='section'><h2>🤝 Preisvorschläge</h2><div class='manage'>"+offerHtml+"</div></section><section class='section'><h2>✓ Verkäufe & Abwicklung</h2><div class='manage'>"+soldHtml+"</div></section></div>";
 document.querySelectorAll("[data-sale-offer]").forEach(b=>b.onclick=async()=>{let r=await db.rpc("respond_offer",{p_offer_id:b.dataset.saleOffer,p_accept:b.dataset.accept==="1"});if(r.error)return alert(r.error.message);salesCenter()});
 document.querySelectorAll("[data-sale-chat]").forEach(b=>b.onclick=()=>startChat(b.dataset.saleChat));
 document.querySelectorAll("[data-tx]").forEach(b=>b.onclick=async()=>{
  let payment=b.dataset.pay||null,fulfillment=b.dataset.fulfill||null;
  let question=payment==="paid"?"Zahlung wirklich als erhalten markieren?":payment==="refunded"?"Zahlung wirklich als zurückerstattet markieren?":fulfillment==="shipping"?"Versand als in Vorbereitung markieren?":fulfillment==="shipped"?"Artikel wirklich als versendet markieren?":fulfillment==="ready_for_pickup"?"Artikel als abholbereit markieren?":"Übergabe wirklich als erfolgt markieren?";
  if(!confirm(question))return;
  b.disabled=true;
  let r=await db.rpc("update_sale_transaction",{p_transaction_id:b.dataset.tx,p_payment_status:payment,p_fulfillment_status:fulfillment});
  if(r.error){b.disabled=false;return alert(r.error.message)}
  salesCenter()
 });
}

async function detail(id){app.innerHTML='<div class="wrap detail"><div class="empty">Inserat wird geladen ...</div></div>';let lr=await db.from('listings').select('*').eq('id',id).maybeSingle();if(!lr.data){app.innerHTML='<div class="wrap detail"><div class="empty">Inserat nicht gefunden.</div></div>';return}let l=lr.data;if(l.price_type==='auction'&&l.status==='active'&&l.auction_end_at&&new Date(l.auction_end_at)<=new Date()&&user){await db.rpc('finalize_auction',{p_listing_id:id});let rr=await db.from('listings').select('*').eq('id',id).maybeSingle();if(rr.data)l=rr.data}let [pr,ir,cr,sr,hr,mr]=await Promise.all([db.rpc('seller_profile_public',{p_seller_id:l.seller_id}),db.from('listing_images').select('*').eq('listing_id',id).order('sort_order'),db.from('categories').select('name_de').eq('slug',l.category_slug).maybeSingle(),user&&l.price_type==='auction'?db.from('auction_stats').select('*').eq('listing_id',id).maybeSingle():Promise.resolve({data:null}),user&&l.price_type==='auction'?db.rpc('auction_bid_history_v2',{p_listing_id:id}):Promise.resolve({data:[]})]),p=(pr.data||[])[0]||{},imgs=ir.data||[],st=sr.data,bidHistory=hr.data||[],own=user&&user.id===l.seller_id,ended=l.price_type==='auction'&&l.auction_end_at&&new Date(l.auction_end_at)<=new Date(),fav=false,vf=l.extra_fields||{},vehicleHtml='';let vehicleLabels={brand:'Marke',model:'Modell',year:'Jahrgang',mileage_km:'Kilometer',fuel:'Treibstoff',gearbox:'Getriebe',power_ps:'Leistung',engine_cc:'Hubraum',drive:'Antrieb',body:'Karosserie',color:'Farbe',mfk:'MFK',storage:'Speicher / Kapazität',warranty:'Garantie',accessories:'Zubehör',property_type:'Objektart',rooms:'Zimmer',area_m2:'Wohnfläche',floor:'Etage',available_from:'Verfügbar ab',charges_chf:'Nebenkosten',size:'Grösse',material:'Material',power_source:'Betriebsart',specification:'Technische Daten'};let vehicleUnits={mileage_km:' km',power_ps:' PS',engine_cc:' cm³',area_m2:' m²',charges_chf:' CHF'};let vehicleRows=Object.keys(vehicleLabels).filter(k=>vf[k]!==undefined&&vf[k]!==null&&vf[k]!=='').map(k=>'<div class="spec km24DetailSpec"><small>'+E(vehicleLabels[k])+'</small><b>'+E(vf[k])+E(vehicleUnits[k]||'')+'</b></div>').join('');if(vehicleRows)vehicleHtml='<h3 class="km24DetailSectionTitle">Details</h3><div class="specs km24DetailSpecs km24DetailSpecsExtra">'+vehicleRows+'</div>';let quickSpecs=[['📅',vf.year,''],['🛣️',vf.mileage_km,' km'],['⛽',vf.fuel,''],['⚙️',vf.gearbox,''],['⚡',vf.power_ps,' PS'],['🏠',vf.rooms,' Zimmer'],['📐',vf.area_m2,' m²'],['💾',vf.storage,'']].filter(x=>x[1]!==undefined&&x[1]!==null&&x[1]!=='').slice(0,5),quickHtml=quickSpecs.length?'<div class="km24DetailQuick">'+quickSpecs.map(x=>'<span class="km24DetailQuickChip"><i>'+x[0]+'</i>'+E(x[1])+E(x[2])+'</span>').join('')+'</div>':'';if(user){let f=await db.from('favorites').select('listing_id').eq('user_id',user.id).eq('listing_id',id).maybeSingle();fav=!!f.data}let first=imgs[0]?IMG(imgs[0].storage_path):'',gallery='<div class="gallery"><div class="mainpic" id="mp" '+(first?'onclick="openImageLightbox(this.querySelector(\'img\').src)"':'')+'>'+(first?'<img src="'+E(first)+'" style="object-fit:'+(imgs[0]?.fit_mode==="contain"?"contain":"cover")+'!important;object-position:'+Number(imgs[0]?.focal_x??50)+'% '+Number(imgs[0]?.focal_y??50)+'%!important">':'📷')+'</div>'+(imgs.length>1?'<div class="thumbs">'+imgs.map(x=>'<img class="thumb" src="'+E(IMG(x.storage_path))+'" style="object-fit:'+(x.fit_mode==="contain"?"contain":"cover")+';object-position:'+Number(x.focal_x??50)+'% '+Number(x.focal_y??50)+'%" onclick="setDetailImage(\''+E(IMG(x.storage_path))+'\',\''+(x.fit_mode==="contain"?"contain":"cover")+'\','+Number(x.focal_x??50)+','+Number(x.focal_y??50)+')">').join('')+'</div>':'')+'</div>',box='';if(l.price_type==='auction'){box='<div class="auctionbox"><small class="mut">Aktuelles Gebot</small><div class="big">'+(st&&st.highest_bid_chf!=null?'CHF '+F(st.highest_bid_chf):'Noch kein Gebot')+'</div><small>Startpreis CHF '+F(l.auction_start_price_chf||l.price_chf)+' · '+(st?st.bid_count:0)+' Gebot(e)</small><div style="margin-top:5px"><small>Ende: <b>'+E(D(l.auction_end_at))+'</b></small></div><div id="countdown" class="countdown" style="margin-top:6px"></div><div style="margin-top:5px"><small class="mut">⏱ Gebote in der letzten Minute verlängern die Auktion automatisch um 2 Minuten.</small></div>'+(st&&st.has_reserve?'<div><small>'+(st.reserve_met?'✅ Mindestpreis erreicht':'⏳ Mindestpreis noch nicht erreicht')+'</small></div>':'')+(ended?N('Diese Auktion ist beendet.'):own?N('Das ist deine Auktion.'):!user?'<button class="btn primary" style="width:100%;margin-top:10px" onclick="go(\'#/login\')">Anmelden und bieten</button>':'<form id="bidf" class="rowform"><input id="bid" type="number" step=".05" min="'+E(st?st.next_min_bid_chf:(l.auction_start_price_chf||l.price_chf))+'" value="'+E(st?st.next_min_bid_chf:(l.auction_start_price_chf||l.price_chf))+'" required><button class="btn primary">Bieten</button></form><div id="bm"></div>')+'</div>'}if(l.price_type==='auction'&&bidHistory.length){let lead=!!bidHistory[0]?.is_mine,bh=bidHistory.slice(0,10).map((b,i)=>'<div class="bidRow"><span>'+(b.is_mine?'Dein Gebot':(b.bidder_name_masked||('Gebot '+(i+1))))+'</span><b>CHF '+F(b.amount_chf)+'</b></div>').join('');box=box.slice(0,-6)+(lead?'<div class="notice" style="margin-top:10px"><b>✓ Du führst aktuell.</b></div>':'')+'<div class="bidHistory"><small class="mut">Gebotsverlauf</small>'+bh+'</div></div>'}else if(l.price_type==='negotiable'&&!own){box='<div class="panel"><h3>Preis vorschlagen</h3>'+(!user?'<button class="btn primary" onclick="go(\'#/login\')">Anmelden</button>':'<form id="offf" class="rowform"><input id="off" type="number" min="'+E(Math.ceil(Number(l.price_chf||0)*14)/20)+'" step=".05" required placeholder="CHF"><button class="btn primary">Senden</button></form><small class="mut" style="display:block;margin-top:7px">Mindestens CHF '+F(Math.ceil(Number(l.price_chf||0)*14)/20)+' · maximal 30% unter Inseratpreis</small><div id="om"></div>')+'</div>'}else if(l.price_type==='fixed'){box='<div class="panel"><h3>Sofortkauf</h3><div class="big">CHF '+F(l.price_chf)+'</div>'+(l.status!=='active'?N('Dieser Artikel ist nicht mehr verfügbar.'):own?N('Das ist dein Inserat.'):!user?'<button class="btn primary" style="width:100%;margin-top:10px" onclick="go(\'#/login\')">Anmelden und kaufen</button>':'<button id="buyNowBtn" class="btn primary" style="width:100%;margin-top:10px">Jetzt kaufen</button><small class="mut" style="display:block;margin-top:8px">Der Kauf ist verbindlich.</small>')+'</div>'}app.innerHTML='<div class="detail"><div class="wrap"><div class="detailgrid"><div>'+gallery+'<div class="panel km24DetailMainPanel" style="margin-top:14px"><div class="km24DetailBadges"><span class="badge '+(l.price_type==='auction'?'auction':l.price_type==='free'?'free':'')+'">'+E(L(l.price_type))+'</span>'+(p.account_type==='dealer'?'<span class="badge dealer">Händler</span>':'<span class="badge">Privat</span>')+'</div><h1>'+E(l.title)+'</h1><div class="detailprice">'+E(ptxt(l,st))+'</div>'+quickHtml+'<div class="specs km24DetailSpecs km24DetailOverview"><div class="spec km24DetailSpec"><small>Kategorie</small><b>'+E(cr.data?cr.data.name_de:l.category_slug)+'</b></div><div class="spec km24DetailSpec"><small>Zustand</small><b>'+E({new:'Neu',like_new:'Wie neu',used:'Gebraucht',defective:'Defekt'}[l.condition]||l.condition)+'</b></div><div class="spec km24DetailSpec"><small>Ort</small><b>'+E([l.postal_code,l.city].filter(Boolean).join(' ')||'–')+'</b></div><div class="spec km24DetailSpec"><small>Übergabe</small><b>'+E([l.pickup_available?'Abholung':'',l.shipping_available?'Versand':''].filter(Boolean).join(' / ')||'–')+'</b></div></div>'+vehicleHtml+'<h3 class="km24DetailSectionTitle">Beschreibung</h3><div class="desc km24DetailDescription">'+E(l.description||'Keine Beschreibung.')+'</div></div></div><aside class="side">'+box+'<div class="panel km24SellerTrustPanel"><div class="km24SellerTrustTop"><div><small class="mut">Verkäufer</small><div class="seller">'+E(p.display_name||((p.account_type==='dealer'||p.account_type==='business')?'Händler / Unternehmen':'Privatperson'))+'</div></div>'+'</div><div class="km24SellerTrustBadges">'+((p.account_type==='dealer'||p.account_type==='business')?'<span>🏪 Händler / Unternehmen</span>':'<span>👤 Privatperson</span>')+(p.email_verified?'<span>✓ E-Mail bestätigt</span>':'')+(p.phone_verified?'<span>✓ Mobil bestätigt</span>':'')+'</div><div class="km24SellerTrustStats"><div><small>Bewertungen</small><b>'+(p.rating_count?('★ '+E(p.rating)+' / 5'):'Noch keine')+'</b><span>'+(p.rating_count?E(p.rating_count)+' Bewertung'+(Number(p.rating_count)===1?'':'en'):'Noch keine Bewertungen')+'</span></div><div><small>Mitglied seit</small><b>'+E(p.member_since?new Date(p.member_since).toLocaleDateString((window.km24Locale?window.km24Locale():'de-CH'),{month:'short',year:'numeric'}):'–')+'</b><span>KaufMich24</span></div></div><div class="km24SellerTrustActivity"><span>📦 '+E(p.active_listing_count||0)+' aktive Inserate</span><span>✓ '+E(p.sold_listing_count||0)+' verkauft</span></div><button class="btn" style="width:100%;margin-top:10px" onclick="go(\'#/profile/'+l.seller_id+'\')">Profil ansehen</button>'+(!own?'<button id="chatBtn" class="btn primary" style="width:100%;margin-top:8px">💬 Verkäufer kontaktieren</button><button id="fav" class="btn" style="width:100%;margin-top:8px">'+(fav?'♥ Gemerkt':'♡ Merken')+'</button><button id="reportBtn" class="btn" style="width:100%;margin-top:8px">⚑ Inserat melden</button>':N('Das ist dein Inserat.'))+'</div></div></aside></div></div></div>';if(document.getElementById('fav'))document.getElementById('fav').onclick=async function(){if(!user)return go('#/login');if(fav){await db.from('favorites').delete().eq('user_id',user.id).eq('listing_id',id);fav=false}else{await db.from('favorites').insert({user_id:user.id,listing_id:id});fav=true}this.textContent=fav?'♥ Gemerkt':'♡ Merken'};if(document.getElementById('bidf'))document.getElementById('bidf').onsubmit=async e=>{e.preventDefault();if(!contactReady())return go('#/verification?next=listing%2F'+id);if(!buyerReady())return go('#/buyer-activation');let r=await db.rpc('place_bid',{p_listing_id:id,p_amount_chf:+document.getElementById('bid').value}),m=document.getElementById('bm');if(r.error)m.innerHTML=N(r.error.message,1);else{m.innerHTML=N('Maximalgebot gespeichert. KaufMich24 bietet automatisch nur so viel wie nötig.');setTimeout(()=>detail(id),500)}};if(document.getElementById('offf'))document.getElementById('offf').onsubmit=async e=>{e.preventDefault();if(!contactReady())return go('#/verification?next=listing%2F'+id);if(!buyerReady())return go('#/buyer-activation');let offerAmount=+document.getElementById('off').value,offerMin=Math.ceil(Number(l.price_chf||0)*14)/20,m=document.getElementById('om');if(offerAmount<offerMin){m.innerHTML=N('Preisvorschlag zu tief. Mindestens CHF '+F(offerMin)+' (70% des Inseratpreises).',1);return}let r=await db.from('offers').insert({listing_id:id,buyer_id:user.id,seller_id:l.seller_id,amount_chf:offerAmount});m.innerHTML=r.error?N(r.error.message,1):N('Angebot wurde gesendet.')};if(document.getElementById('buyNowBtn'))document.getElementById('buyNowBtn').onclick=()=>openBuyNow(id,l.title,l.price_chf);if(document.getElementById('chatBtn'))document.getElementById('chatBtn').onclick=()=>startChat(id);if(document.getElementById('reportBtn'))document.getElementById('reportBtn').onclick=()=>reportListing(id,l.seller_id);let cd=document.getElementById('countdown');if(cd&&l.auction_end_at){let tick=()=>{let ms=new Date(l.auction_end_at)-new Date();if(ms<=0){cd.textContent='Auktion beendet';return}let d=Math.floor(ms/86400000),h=Math.floor(ms%86400000/3600000),m=Math.floor(ms%3600000/60000),s=Math.floor(ms%60000/1000);cd.textContent='Restzeit: '+d+'T '+h+'Std '+m+'Min '+s+'Sek'};tick();setInterval(tick,1000)}}
setTimeout(()=>{try{if(typeof route==="function")route()}catch(e){console.warn("KM feature refresh",e)}},250);
(function(){
 if(window.__kmEnhancementsV14)return;window.__kmEnhancementsV14=true;

 async function kmCompressImage(file){
   try{
     if(!(file instanceof File)||!file.type.startsWith("image/")||/heic|heif|gif/i.test(file.type))return file;
     if(file.size<1400000)return file;
     const url=URL.createObjectURL(file),img=new Image();
     const loaded=new Promise((res,rej)=>{img.onload=res;img.onerror=rej});img.src=url;await loaded;
     const max=2200,scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
     if(scale>=1&&file.size<2500000){URL.revokeObjectURL(url);return file}
     const c=document.createElement("canvas");c.width=Math.max(1,Math.round(img.naturalWidth*scale));c.height=Math.max(1,Math.round(img.naturalHeight*scale));
     c.getContext("2d").drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);
     const type=/jpeg|jpg/i.test(file.type)?"image/jpeg":/webp/i.test(file.type)?"image/webp":"image/png";
     const blob=await new Promise(r=>c.toBlob(r,type,type==="image/png"?undefined:.86));
     if(!blob||blob.size>=file.size)return file;
     return new File([blob],file.name,{type,lastModified:file.lastModified});
   }catch(e){return file}
 }

 function patchImageUploads(){
   if(window.__kmStoragePatched||!window.db?.storage?.from)return;
   window.__kmStoragePatched=true;
   const original=db.storage.from.bind(db.storage);
   db.storage.from=function(bucket){
     const client=original(bucket);
     if(bucket==="listing-images"&&client?.upload){
       const up=client.upload.bind(client);
       client.upload=async(path,file,opts)=>{
         const f=await kmCompressImage(file);
         return up(path,f,{...(opts||{}),contentType:f?.type||opts?.contentType});
       };
     }
     return client;
   };
 }

 function enhanceListingForm(){}


 
(function(){
 if(window.__km24SellComposerV2)return;window.__km24SellComposerV2=true;

 function ensureStyle(){
  if(document.getElementById("km24-sell-composer-v2-style"))return;
  const st=document.createElement("style");st.id="km24-sell-composer-v2-style";st.textContent=`
  .km24SellIntro{margin:0 0 18px;padding:18px 20px;border:1px solid rgba(224,148,76,.18);border-radius:22px;background:radial-gradient(circle at 92% 0,rgba(221,125,48,.12),transparent 28%),linear-gradient(145deg,rgba(31,31,27,.96),rgba(19,23,20,.98));box-shadow:0 16px 40px rgba(0,0,0,.13)}
  .km24SellIntroTop{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
  .km24SellIntroTop h1{margin:0!important;font-size:clamp(30px,4vw,43px)!important;letter-spacing:-.035em}
  .km24SellIntroTop p{margin:5px 0 0;color:var(--mut);max-width:660px;line-height:1.5}
  .km24SellIntroBadge{display:inline-flex;align-items:center;gap:6px;padding:7px 10px;border:1px solid rgba(77,205,118,.22);border-radius:999px;background:rgba(45,153,78,.11);color:#8de7a6;font-size:10px;font-weight:950;white-space:nowrap}
  .km24SellSteps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:16px}
  .km24SellStep{border:1px solid rgba(255,255,255,.08);border-radius:14px;background:rgba(255,255,255,.025);color:inherit;padding:10px 11px;text-align:left;cursor:pointer;display:grid;grid-template-columns:30px minmax(0,1fr);gap:9px;align-items:center}
  .km24SellStep:hover{border-color:rgba(222,146,73,.28);background:rgba(225,142,62,.06)}
  .km24SellStepNum{width:30px;height:30px;border-radius:10px;display:grid;place-items:center;background:rgba(222,137,62,.13);border:1px solid rgba(226,147,72,.18);font-size:11px;font-weight:950;color:#e9a96f}
  .km24SellStep b{font-size:11px;display:block}.km24SellStep small{display:block;color:var(--mut);font-size:9px;margin-top:2px}
  .km24SellFormModern{grid-template-columns:minmax(0,1.68fr) minmax(285px,.72fr)!important;gap:20px!important}
  .km24SellFormModern>.main{gap:13px!important}.km24SellFormModern>.side{gap:13px!important}
  .km24SellFormModern .panel,.km24SellFormModern details.panel{border-radius:19px!important;border-color:rgba(255,255,255,.075)!important;box-shadow:0 12px 34px rgba(0,0,0,.10)!important}
  .km24SellFormModern .panel h3,.km24SellFormModern details.panel summary{letter-spacing:-.015em}
  .km24ComposerTag{display:inline-flex;align-items:center;gap:6px;margin:0 0 8px;padding:5px 8px;border-radius:999px;background:rgba(224,137,62,.10);border:1px solid rgba(224,137,62,.16);color:#e6a26c;font-size:9px;font-weight:950;letter-spacing:.07em;text-transform:uppercase}
  .km24ComposerTag.optional{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.07);color:var(--mut)}
  .km24SellPanelHint{margin:-3px 0 13px;color:var(--mut);font-size:12px;line-height:1.45}
  .km24SellPhotoPanel{border-color:rgba(73,205,111,.22)!important;background:radial-gradient(circle at 95% 2%,rgba(70,197,104,.10),transparent 31%),linear-gradient(145deg,rgba(26,34,28,.97),rgba(20,23,21,.98))!important}
  .km24SellPhotoPanel .photoAdd{min-height:108px;display:grid!important;place-items:center;align-content:center;gap:5px;border-radius:17px!important;border-color:rgba(92,214,130,.32)!important;background:rgba(34,91,51,.10)!important;font-size:15px;font-weight:900;transition:.16s ease}
  .km24SellPhotoPanel .photoAdd:before{content:"📸";display:block;font-size:27px}
  .km24SellPhotoPanel .photoAdd:hover{background:rgba(43,123,67,.15)!important;border-color:rgba(94,224,136,.48)!important}
  .km24SellPhotoPanel .formHelp{margin-top:9px!important;line-height:1.45}
  .km24SellPhotoPanel .kmListingAi{margin:14px 0 0!important;border-radius:16px!important;border-color:rgba(79,208,117,.23)!important;background:linear-gradient(145deg,rgba(29,83,46,.18),rgba(20,35,25,.42))!important;padding:14px!important}
  .km24SellPhotoPanel .kmListingAi>b{font-size:14px}.km24SellPhotoPanel .kmListingAi .btn{width:100%;justify-content:center;min-height:44px}
  .km24SellArticlePanel input,.km24SellArticlePanel select,.km24SellArticlePanel textarea,.km24SellPricePanel input,.km24SellPricePanel select,.km24SellLocationPanel input{border-radius:12px!important}
  .km24SellArticlePanel textarea{min-height:150px;resize:vertical}
  .km24SellSalePanel .choices{gap:8px}.km24SellSalePanel .choice{min-height:94px;border-radius:15px!important;transition:.16s ease}.km24SellSalePanel .choice.on{box-shadow:0 0 0 2px rgba(37,157,89,.08) inset}
  .km24SellLocationPanel label:has(input[type="checkbox"]){display:flex;align-items:center;gap:10px;padding:11px 12px;border:1px solid rgba(255,255,255,.075);border-radius:13px;background:rgba(255,255,255,.025);font-weight:850}
  .km24SellLocationPanel label:has(input[type="checkbox"]) input{width:auto!important;margin:0!important;accent-color:var(--g)}
  .km24SellOptional{opacity:.94}.km24SellOptional:hover{opacity:1}
  .km24SellPreviewPanel{position:sticky!important;top:82px!important;border-color:rgba(222,139,65,.18)!important;background:radial-gradient(circle at 100% 0,rgba(222,139,65,.09),transparent 30%),rgba(25,27,24,.98)!important}
  .km24SellPreviewPanel>h3{margin-bottom:4px}.km24SellPreviewText{margin:0 0 13px;color:var(--mut);font-size:11px;line-height:1.45}
  .km24SellRequiredState{display:flex;align-items:center;gap:8px;padding:9px 10px;border-radius:12px;margin:0 0 12px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.025);font-size:11px;font-weight:850}
  .km24SellRequiredState.good{border-color:rgba(66,202,105,.22);background:rgba(40,151,72,.10);color:#8ce3a4}
  .km24SellRequiredState.warn{border-color:rgba(225,160,75,.20);background:rgba(164,102,35,.10);color:#e7bd83}
  .km24SellMobileBar{display:none}
  .km24SellFormModern .main>.panel,.km24SellFormModern .main>details{scroll-margin-top:94px}
  @media(max-width:900px){
    .km24SellFormModern{grid-template-columns:1fr!important}
    .km24SellFormModern>.side{order:2}.km24SellPreviewPanel{position:static!important}
  }
  @media(max-width:700px){
    .formPage:has(#sf.km24SellFormModern){padding-top:14px!important;padding-bottom:142px!important}
    .formPage:has(#sf.km24SellFormModern)>.wrap{padding-left:13px!important;padding-right:13px!important}
    .km24SellIntro{padding:15px;border-radius:19px;margin-bottom:13px}
    .km24SellIntroTop{display:block}.km24SellIntroBadge{margin-top:10px}
    .km24SellSteps{display:flex;overflow-x:auto;gap:7px;padding-bottom:2px;scrollbar-width:none}.km24SellSteps::-webkit-scrollbar{display:none}
    .km24SellStep{flex:0 0 145px;padding:9px;grid-template-columns:27px minmax(0,1fr)}.km24SellStepNum{width:27px;height:27px}
    .km24SellFormModern .panel,.km24SellFormModern details.panel{padding:15px!important;border-radius:17px!important}
    .km24SellFormModern .two{grid-template-columns:1fr!important}
    .km24SellSalePanel .choices{grid-template-columns:1fr 1fr!important}
    .km24SellPhotoPanel .photoAdd{min-height:96px}
    .km24SellPreviewPanel button[type="submit"],.km24SellPreviewPanel>.btn.primary{display:none!important}
    .km24SellMobileBar{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;position:fixed;left:10px;right:10px;bottom:78px;z-index:60;padding:10px;border:1px solid rgba(255,255,255,.10);border-radius:17px;background:rgba(18,21,18,.94);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 16px 40px rgba(0,0,0,.38)}
    .km24SellMobileBar b{display:block;font-size:11px}.km24SellMobileBar small{display:block;color:var(--mut);font-size:9px;margin-top:2px}
    .km24SellMobileBar .btn{min-height:43px;padding:0 15px!important}
  }
  @media(max-width:390px){.km24SellSalePanel .choices{grid-template-columns:1fr!important}.km24SellStep{flex-basis:135px}}
  `;document.head.appendChild(st)
 }

 function byHeading(root,text){
  return [...root.children].find(el=>(el.querySelector(":scope > h3")?.textContent||"").trim()===text)||null;
 }
 function tag(panel,label,optional){
  if(!panel||panel.querySelector(":scope > .km24ComposerTag"))return;
  const t=document.createElement("div");t.className="km24ComposerTag"+(optional?" optional":"");t.textContent=label;panel.insertBefore(t,panel.firstChild)
 }
 function hint(panel,text){
  if(!panel||panel.querySelector(":scope > .km24SellPanelHint"))return;
  const h=panel.querySelector(":scope > h3");if(!h)return;
  const p=document.createElement("p");p.className="km24SellPanelHint";p.textContent=text;h.insertAdjacentElement("afterend",p)
 }
 function updateState(form){
  const box=document.getElementById("km24SellRequiredState"),bar=document.getElementById("km24SellMobileState");if(!form)return;
  const req=[...form.querySelectorAll("input[required],select[required],textarea[required]")].filter(x=>!x.disabled&&x.offsetParent!==null);
  const missing=req.filter(x=>{
    if(x.type==="checkbox"||x.type==="radio")return !x.checked;
    return !String(x.value||"").trim();
  });
  const text=missing.length?("Noch "+missing.length+" Pflichtfeld"+(missing.length===1?"":"er")+" ausfüllen"):"Bereit zum Prüfen";
  if(box){box.classList.toggle("good",!missing.length);box.classList.toggle("warn",!!missing.length);box.innerHTML=(missing.length?"◷ ":"✓ ")+text}
  /* km24 publish status: legacy writer disabled; simple status() is authoritative */
 }
 function sync(){
  const route=(location.hash||"").split("?")[0];
  if(route!=="#/sell"){
    document.getElementById("km24SellMobileBar")?.remove();
    return;
  }
  ensureStyle();
  const form=document.getElementById("sf");if(!form)return;
  try{if(typeof enhanceListingForm==="function")enhanceListingForm()}catch(_){}
  const main=form.querySelector(":scope > .main"),side=form.querySelector(":scope > .side");if(!main||!side)return;

  if(form.dataset.km24Composer!=="2"){
    form.dataset.km24Composer="2";form.classList.add("km24SellFormModern");

    const wrap=form.closest(".wrap"),oldH1=wrap?.querySelector(":scope > h1"),oldP=oldH1?.nextElementSibling;
    if(wrap&&!wrap.querySelector(":scope > .km24SellIntro")){
      const intro=document.createElement("section");intro.className="km24SellIntro";
      intro.innerHTML='<div class="km24SellIntroTop"><div><h1>Inserat erstellen</h1><p>Starte mit den Fotos. Danach gehst du Schritt für Schritt durch Artikel, Preis und Übergabe.</p></div><span class="km24SellIntroBadge">✓ Einfach geführt</span></div><div class="km24SellSteps"><button type="button" class="km24SellStep" data-to="km24SellPhotoPanel"><span class="km24SellStepNum">1</span><span><b>Fotos</b><small>Bilder hochladen</small></span></button><button type="button" class="km24SellStep" data-to="km24SellArticlePanel"><span class="km24SellStepNum">2</span><span><b>Artikel</b><small>Angaben prüfen</small></span></button><button type="button" class="km24SellStep" data-to="km24SellSalePanel"><span class="km24SellStepNum">3</span><span><b>Verkauf & Preis</b><small>Art und Betrag</small></span></button><button type="button" class="km24SellStep" data-to="km24SellLocationPanel"><span class="km24SellStepNum">4</span><span><b>Übergabe</b><small>Prüfen & online</small></span></button></div>';
      if(oldH1)oldH1.replaceWith(intro);else wrap.prepend(intro);
      if(oldP&&oldP.classList.contains("mut"))oldP.remove();
      intro.querySelectorAll("[data-to]").forEach(b=>b.onclick=()=>document.querySelector("."+b.dataset.to)?.scrollIntoView({behavior:"smooth",block:"start"}));
    }

    const photo=byHeading(main,"Fotos"),article=byHeading(main,"Artikel"),sale=byHeading(main,"Verkaufsart"),price=byHeading(main,"Preis"),attach=byHeading(main,"📎 Videos & Dokumente")||byHeading(main,"Videos & Dokumente");
    const pro=main.querySelector(":scope > .km24ProOptions");
    const location=byHeading(side,"Standort & Übergabe");
    const known=new Set([photo,article,sale,price,attach,pro].filter(Boolean));
    const details=[...main.children].filter(x=>!known.has(x));
    [photo,article,...details,sale,price,location,pro,attach].filter(Boolean).forEach(x=>main.appendChild(x));

    if(photo){photo.classList.add("km24SellPhotoPanel");tag(photo,"Schritt 1 · Fotos");hint(photo,"Gute Fotos zuerst: Die kostenlose Bilder-KI kann daraus Titel und Beschreibung vorbereiten.")}
    if(article){article.classList.add("km24SellArticlePanel");tag(article,"Schritt 2 · Artikel");hint(article,"Prüfe die erkannten Angaben und ergänze nur, was auf den Fotos nicht eindeutig sichtbar ist.")}
    details.forEach(x=>{if(x instanceof HTMLElement)x.classList.add("km24SellDetailPanel")});
    if(sale){sale.classList.add("km24SellSalePanel");tag(sale,"Schritt 3 · Verkaufsart");hint(sale,"Wähle, wie du verkaufen möchtest. Die passenden Preisfelder erscheinen automatisch.")}
    if(price){price.classList.add("km24SellPricePanel");tag(price,"Schritt 3 · Preis")}
    if(location){location.classList.add("km24SellLocationPanel");tag(location,"Schritt 4 · Übergabe");hint(location,"Lege fest, wo sich der Artikel befindet und ob Abholung oder Versand möglich ist.")}
    if(pro){pro.classList.add("km24SellOptional");pro.querySelector("summary small")&&(pro.querySelector("summary small").textContent="optional")}
    if(attach){attach.classList.add("km24SellOptional");tag(attach,"Optional",true)}

    const preview=side.querySelector(".livePreview");
    if(preview){
      preview.classList.add("km24SellPreviewPanel");
      const h=preview.querySelector("h3");if(h)h.textContent="Prüfen & veröffentlichen";
      if(!preview.querySelector(".km24SellPreviewText")){const p=document.createElement("p");p.className="km24SellPreviewText";p.textContent="Kontrolliere hier dein Inserat. Du kannst alle Angaben bis zum Veröffentlichen noch ändern.";h?.insertAdjacentElement("afterend",p)}
      if(!preview.querySelector("#km24SellRequiredState")){const st=document.createElement("div");st.id="km24SellRequiredState";st.className="km24SellRequiredState warn";(preview.querySelector(".km24SellPreviewText")||h)?.insertAdjacentElement("afterend",st)}
    }

    form.addEventListener("input",()=>updateState(form));form.addEventListener("change",()=>setTimeout(()=>updateState(form),0));
  }

  const photoPanel=main.querySelector(".km24SellPhotoPanel"),ai=document.getElementById("kmListingAi");
  if(photoPanel&&ai&&!photoPanel.contains(ai)){
    const pm=photoPanel.querySelector("#photoManager");
    (pm||photoPanel.lastElementChild)?.insertAdjacentElement("afterend",ai);
  }

  if(!(form&&form.dataset.km24Wizard==="1")&&!document.getElementById("km24SellMobileBar")){
    const bar=document.createElement("div");bar.id="km24SellMobileBar";bar.className="km24SellMobileBar";
    bar.innerHTML='<span><b>Inserat erstellen</b><small id="km24SellMobileState">Pflichtfelder prüfen</small></span><button type="button" class="btn primary">Weiter / Veröffentlichen</button>';
    bar.querySelector("button").onclick=()=>{updateState(form);const first=[...form.querySelectorAll("input[required],select[required],textarea[required]")].find(x=>!x.disabled&&x.offsetParent!==null&&!String(x.value||"").trim());if(first){first.focus();first.scrollIntoView({behavior:"smooth",block:"center"});return}window.km24RequestSubmit(form)};
    document.body.appendChild(bar)
  }
  updateState(form)
 }

 let timer=0;const schedule=()=>{clearTimeout(timer);timer=setTimeout(sync,70)};
 window.addEventListener("hashchange",schedule);
 const appEl=document.getElementById("app");if(appEl)new MutationObserver(schedule).observe(appEl,{childList:true,subtree:true});
 setTimeout(sync,120);
})();
(function(){if(!document.getElementById("km24-auto-photo-focus-v1")){const st=document.createElement("style");st.id="km24-auto-photo-focus-v1";st.textContent=".photoAutoState{position:absolute;left:8px;top:39px;z-index:4;padding:4px 7px;border-radius:999px;background:rgba(13,92,49,.88);border:1px solid rgba(122,235,159,.28);color:#caffd9;font-size:9px;font-weight:900;pointer-events:none}\n.imageAdjust{margin-top:7px!important;padding:0!important;overflow:hidden}\n.imageAdjust>summary{cursor:pointer;list-style:none;padding:8px 9px;font-size:10px;font-weight:850;color:var(--mut)}\n.imageAdjust>summary::-webkit-details-marker{display:none}.imageAdjust[open]>summary{border-bottom:1px solid var(--line)}\n.imageAdjust[open] .imageAdjustRow{padding:8px 9px 4px;margin:0}.imageAdjust[open]>small{display:block;padding:0 9px 9px}\n.imageAdjust .btn{min-height:36px;padding:0 10px!important;font-size:10px}";document.head.appendChild(st)}})();
 const prefRows=[
  ["messages","Nachrichten","Neue Nachrichten sowie Besichtigungsanfragen und Termin-Updates"],
  ["offers","Preisvorschläge","Neue Preisvorschläge sowie angenommene oder abgelehnte Angebote"],
  ["auctions","Auktionen & Gebote","Neue Gebote, Überbietungen, Auktionsende und Gewinner-Updates"],
  ["sales","Käufe & Verkäufe","Kauf, Verkauf, Abwicklung und Zweitchance-Angebote nach Auktionen"],
  ["search","Suchaufträge","Treffer zu Suchaufträgen und Gesuchen, Preisreduzierungen sowie neue Inserate beobachteter Verkäufer"],
  ["services","Dienstleistungen & Aufträge","Neue Anfragen, Angebote, Zu- oder Absagen, Nachrichten und Abschluss-Updates"],
  ["reviews","Bewertungen","Neue Bewertungen und Hinweise, wenn du eine Bewertung abgeben kannst"],
  ["account","Konto & Sicherheit","Kontosicherheit, Support, Gebühren, Systemhinweise und sonstige wichtige Konto-Updates"]
 ];
 function km24CleanupMisplacedPanels(){
   document.querySelectorAll("body>header #kmNotifyPrefs,body>header #kmAdminOverview").forEach(x=>x.remove());
 }
 addEventListener("hashchange",()=>setTimeout(km24CleanupMisplacedPanels,0));
 addEventListener("pageshow",km24CleanupMisplacedPanels);
 setTimeout(km24CleanupMisplacedPanels,0);

 async function enhanceNotificationPrefs(){
   if(location.hash!=="#/me"||!user||document.getElementById("kmNotifyPrefs")||window.__kmNotifyPrefsLoading)return;
   const wrap=document.querySelector("#app .km24AccountPage")||document.querySelector("#app .formPage");if(!wrap)return;
   window.__kmNotifyPrefsLoading=true;
   let q=await db.from("notification_preferences").select("*").eq("user_id",user.id).maybeSingle(),p=q.data||{};
   const panel=document.createElement("section");panel.id="kmNotifyPrefs";panel.className="panel kmPrefs";
   panel.innerHTML='<div class="head"><div><h2 style="margin:0">Benachrichtigungen</h2><p class="mut">Wähle für jedes Ereignis, ob du per E-Mail, Push oder über beide Kanäle informiert werden möchtest.</p></div></div><div class="kmPrefGrid"><b>Thema</b><b>E-Mail</b><b>Push</b>'+prefRows.map(([k,n,d])=>'<span class="kmPrefTopic"><b>'+n+'</b><small>'+d+'</small></span><label><input type="checkbox" data-pref="email_'+k+'" '+(p["email_"+k]!==false?"checked":"")+'> an</label><label><input type="checkbox" data-pref="push_'+k+'" '+(p["push_"+k]!==false?"checked":"")+'> an</label>').join("")+'</div><div class="actions" style="margin-top:12px"><button class="btn primary" id="kmSavePrefs">Einstellungen speichern</button></div><div id="kmPrefMsg"></div>';
   wrap.appendChild(panel);window.__kmNotifyPrefsLoading=false;
   panel.querySelector("#kmSavePrefs").onclick=async()=>{
     const payload={user_id:user.id,updated_at:new Date().toISOString()};
     panel.querySelectorAll("[data-pref]").forEach(x=>payload[x.dataset.pref]=x.checked);
     const r=await db.from("notification_preferences").upsert(payload,{onConflict:"user_id"});
     panel.querySelector("#kmPrefMsg").innerHTML=r.error?N(r.error.message,1):N("Benachrichtigungseinstellungen gespeichert.");
   };
 }

 function enhanceAdmin(){}

 function enhanceSupport(){
   if(location.hash!=="#/support")return;
   const legal=document.querySelector(".legal"),form=document.getElementById("supportForm");if(!legal||!form)return;
   if(!document.getElementById("kmSupportAiBox")){
     const b=document.createElement("div");b.id="kmSupportAiBox";b.className="kmSupportAiBox";
     b.innerHTML='<b>🤖 Zuerst eine allgemeine Frage?</b><span>Der KaufMich24 Assistent beantwortet viele Fragen sofort. Für persönliche Fälle bleibt dieses Supportformular zuständig.</span><button type="button" class="btn" id="kmOpenAiFromSupport">KI-Assistent öffnen</button>';
     form.before(b);b.querySelector("button").onclick=()=>window.openKaufMichAiSupport?.();
   }
   const last=sessionStorage.getItem("km_ai_last_question");
   if(last&&!document.getElementById("smessage").value){
     document.getElementById("ssubject").value="Supportanfrage nach KI-Hilfe";
     document.getElementById("smessage").value="Meine Frage:\n"+last+"\n\nBitte prüfen Sie meinen konkreten Fall.";
   }
 }

 function directListingUrl(){
   const pm=(location.pathname||"").match(/^\/listing\/([0-9a-f-]{36})/i);
   const hm=(location.hash||"").match(/^#\/listing\/([0-9a-f-]{36})/i);
   const id=(pm&&pm[1])||(hm&&hm[1]);
   return id?location.origin+"/listing/"+id:location.href;
 }
 function enhanceShare(){
   if(!((location.pathname||"").startsWith("/listing/")||location.hash.startsWith("#/listing/"))||document.getElementById("kmShareListing"))return;
   const side=document.querySelector(".detail .side .panel:last-child");if(!side)return;
   const b=document.createElement("button");b.id="kmShareListing";b.className="btn";b.style.cssText="width:100%;margin-top:8px";b.textContent="↗ Inserat teilen";
   b.onclick=async()=>{const url=directListingUrl();try{if(navigator.share)await navigator.share({title:document.querySelector(".detail h1")?.textContent||"KaufMich24",url});else{await navigator.clipboard.writeText(url);alert("Link kopiert.")}}catch(e){}};
   side.appendChild(b);
 }

 function run(){
   patchImageUploads();enhanceListingForm();enhanceNotificationPrefs();enhanceAdmin();enhanceSupport();enhanceShare();
 }
 const mo=new MutationObserver(()=>setTimeout(run,40));mo.observe(document.documentElement,{childList:true,subtree:true});
 addEventListener("hashchange",()=>setTimeout(run,80));setTimeout(run,300);
})();
(function(){
 if(window.__kmFinalEnhanceV15)return;window.__kmFinalEnhanceV15=true;

 async function compressListingImage(file){
   try{
     if(!(file instanceof File)||!file.type.startsWith("image/")||/heic|heif|gif/i.test(file.type))return file;
     if(file.size<1400000)return file;
     const url=URL.createObjectURL(file),img=new Image();
     await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=url});
     const max=2200,scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
     const canvas=document.createElement("canvas");
     canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
     canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);URL.revokeObjectURL(url);
     let type=/jpeg|jpg/i.test(file.type)?"image/jpeg":/webp/i.test(file.type)?"image/webp":"image/png";
     const blob=await new Promise(r=>canvas.toBlob(r,type,type==="image/png"?undefined:.86));
     if(!blob||blob.size>=file.size)return file;
     return new File([blob],file.name,{type,lastModified:file.lastModified});
   }catch(e){return file}
 }

 function patchUploads(){
   try{
     if(window.__kmStoragePatchedV15||typeof db==="undefined"||!db.storage?.from)return;
     window.__kmStoragePatchedV15=true;
     const original=db.storage.from.bind(db.storage);
     db.storage.from=function(bucket){
       const client=original(bucket);
       if(bucket==="listing-images"&&client?.upload&&!client.__kmCompressed){
         const up=client.upload.bind(client);
         client.upload=async(path,file,opts)=>{
           const f=await compressListingImage(file);
           return up(path,f,{...(opts||{}),contentType:f?.type||opts?.contentType});
         };
         client.__kmCompressed=true;
       }
       return client;
     };
   }catch(e){}
 }

 function legal(){
   const h=location.hash||"",legal=document.querySelector(".legal");if(!legal)return;
   if(h==="#/privacy"&&!document.getElementById("kmAiPrivacy")){
     const s=document.createElement("section");s.id="kmAiPrivacy";
     s.innerHTML='<h2>14. Automatischer Hilfe-Assistent</h2><p>KaufMich24 bietet einen automatischen Hilfe-Assistenten für allgemeine Fragen zur Plattform. Der Assistent arbeitet mit hinterlegten KaufMich24-Informationen und erhält keine automatische Einsicht in private Kontodaten, Käufe, Nachrichten oder Identitätsunterlagen.</p><p>Fragen an den Hilfe-Assistenten werden von KaufMich24 nicht dauerhaft als Gesprächsinhalt in der eigenen Datenbank gespeichert. Für Missbrauchs- und Mengenbegrenzung werden pseudonymisierte Nutzungszähler gespeichert.</p>';
     legal.appendChild(s);
   }
   if(h==="#/terms"&&!document.getElementById("kmAiTerms")){
     const s=document.createElement("section");s.id="kmAiTerms";
     s.innerHTML='<h2>16. KI-Unterstützung</h2><p>Der KaufMich24 Hilfe-Assistent dient der allgemeinen Orientierung zu Plattformfunktionen. Automatische Antworten können unvollständig oder fehlerhaft sein. Für Regeln und Vertragsbedingungen sind die offiziellen Plattformangaben und diese AGB massgebend. Der Hilfe-Assistent hat keine Kontoeinsicht und kann keine Transaktionen verändern.</p>';
     legal.appendChild(s);
   }
 }

 function run(){patchUploads();legal()}
 const mo=new MutationObserver(()=>setTimeout(run,40));mo.observe(document.documentElement,{subtree:true,childList:true});
 addEventListener("hashchange",()=>setTimeout(run,60));setTimeout(run,300);
})();