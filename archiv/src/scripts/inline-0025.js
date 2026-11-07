
(function(){
if(window.__km24WantedV1)return;window.__km24WantedV1=true;

const oldPtxt=ptxt;
ptxt=function(l,s){
 if(l&&l.listing_intent==="wanted")return Number(l.price_chf||0)>0?"Budget bis CHF "+F(l.price_chf):"Budget offen";
 return oldPtxt(l,s)
};

card=function(l){
 let p=l._p||{},wanted=l.listing_intent==="wanted",images=typeof km24CardImages==="function"?km24CardImages(l):[],ii=images[0]||l._img,
 path=typeof ii==="string"?ii:ii?.storage_path,fit="cover",
 fx=Number(ii?.focal_x??50),fy=Number(ii?.focal_y??50),
 im=path?'<img class="km24CardMainImg" data-km24-fx="'+fx+'" data-km24-fy="'+fy+'" src="'+E(IMG(path))+'" style="object-fit:'+fit+';object-position:'+fx+'% '+fy+'%" onload="window.km24ApplyCardFocal&&window.km24ApplyCardFocal(this)">':'<span class="km24NoImage">'+(wanted?"🔎":"📷")+"</span>",
 auction=!wanted&&l.price_type==="auction",
 timer=auction&&l.auction_end_at?'<span class="km24CardTimer">⏱ '+E(typeof homeAuctionRemaining==="function"?homeAuctionRemaining(l.auction_end_at):"Auktion")+"</span>":"",
 views=Number(l.view_count||0),favs=Number(l.favorite_count||0),
 typeText=wanted?"🔎 GESUCHT":L(l.price_type),typeClass=wanted?"wanted":auction?"auction":l.price_type==="free"?"free":"",
 verified=false,
 business=p.account_type==="dealer"||p.account_type==="business",
 thumbs=(!wanted&&typeof km24ThumbStripHtml==="function")?km24ThumbStripHtml(images):"";
 return '<article class="card km24ListingCard '+(wanted?"km24WantedCard":"")+'" data-listing-id="'+E(l.id)+'" onclick="go(\'#/listing/'+l.id+'\')"><div class="pic km24CardPic">'+im+'<div class="km24CardOverlay"><span class="km24TypePill '+typeClass+'">'+E(typeText)+"</span>"+timer+'</div></div>'+thumbs+'<div class="cb km24CardBody"><div class="km24CardTitleRow"><div class="title">'+E(l.title)+'</div></div><div class="price">'+E(ptxt(l,l._s))+'</div><div class="km24CardSellerTrust">'+(business?'<span class="km24SellerTypeTag">🏪 Händler</span>':'<span class="km24SellerTypeTag private">👤 Privat</span>')+'</div><div class="km24CardSeller"><span>'+(wanted?"Sucht: ":"")+E(p.display_name||((p.account_type==='dealer'||p.account_type==='business')?'Händler':'Privatperson'))+'</span></div><div class="km24CardMeta"><span>📍 '+E(((l.postal_code||"")+" "+(l.city||"")).trim()||"Schweiz")+'</span></div></div></article>'
}

function km24WantedStyle(){
 if(document.getElementById("km24-wanted-style"))return;
 let s=document.createElement("style");s.id="km24-wanted-style";
 s.textContent=".km24TypePill.wanted,.badge.wanted{background:#e8efff!important;color:#2755a5!important;border-color:#b9c9ef!important}.km24WantedCard{border-color:#cbd8f2!important}.km24WantedAction{border-color:#a9bfe8!important}.km24CreateChoice{text-decoration:none;color:inherit;display:block}.km24CreateChoice:hover{transform:translateY(-2px)}@media(max-width:700px){.km24CreateChoice{min-height:auto}}";
 document.head.appendChild(s)
}
km24WantedStyle();

window.createChoicePage=async function(){
 if(!user)return go("#/login?next=create");
 await loadProfile();
 let sellHref=sellerReady()?"#/sell":"#/verification?next=sell",
 wantedHref=!contactReady()?"#/verification?next=wanted/new":!buyerReady()?"#/buyer-activation":"#/wanted/new";
 app.innerHTML="<div class='wrap formPage'><div class='head'><div><span class='km24SectionKicker'>INSERAT ERSTELLEN</span><h1 style='margin:5px 0 0'>Was möchtest du machen?</h1><p class='mut'>Verkaufe etwas oder veröffentliche ein Gesuch.</p></div></div><div class='planGrid'><a class='plan km24CreateChoice' href='"+sellHref+"'><div style='font-size:42px'>📦</div><h2>Ich verkaufe</h2><p>Fixpreis, Verhandlungsbasis, Auktion oder verschenken.</p><span class='btn primary'>Verkaufsinserat erstellen</span></a><a class='plan km24CreateChoice' href='"+wantedHref+"'><div style='font-size:42px'>🔎</div><h2>Ich suche</h2><p>Beschreibe, was du suchst, nenne optional dein Budget und lass dich von passenden Verkäufern kontaktieren.</p><span class='btn primary'>Gesuch erstellen</span></a></div><div class='panel' style='margin-top:16px'><b>💡 So funktionieren Gesuche</b><p class='mut' style='margin-bottom:0'>Dein Gesuch bleibt in der passenden normalen Kategorie. Wer den gesuchten Artikel hat, kann über <b>„Ich habe das“</b> direkt einen Chat mit dir starten.</p></div></div>"
};

// KM24 photo mass listing: business/dealer accounts only, no private account entry.
window.createChoicePage=(function(km24OriginalCreateChoice){
 if(typeof km24OriginalCreateChoice!=='function')return km24OriginalCreateChoice;
 return async function(...args){
   const result=await km24OriginalCreateChoice.apply(this,args);
   if(!user||!profile||!['business','dealer'].includes(profile.account_type))return result;
   const grid=app.querySelector('.planGrid');
   if(!grid||grid.querySelector('[data-km24-photo-bulk="1"]'))return result;
   const link=document.createElement('a');
   link.className='plan km24CreateChoice';
   link.href=sellerReady()?'#/foto-massenimport':'#/verification';
   link.setAttribute('data-km24-photo-bulk','1');
   const camera=document.createElement('div');camera.style.fontSize='42px';camera.textContent='📸';
   const title=document.createElement('h2');title.textContent='Mehrere Artikel mit Fotos';
   const info=document.createElement('p');info.textContent='Viele Fotos auf einmal hochladen. Standort aus dem Firmenprofil übernehmen und Inserate gemeinsam veröffentlichen.';
   const button=document.createElement('span');button.className='btn primary';button.textContent=sellerReady()?'Foto-Massenimport öffnen':'Firmenkonto bestätigen';
   link.append(camera,title,info,button);
   const single=grid.querySelector('a.plan');
   if(single?.querySelector('h2')?.textContent==='Ich verkaufe'){
     single.querySelector('h2').textContent='Einzelnes Inserat';
     const caption=single.querySelector('p');if(caption)caption.textContent='Einen Artikel mit Fotos und Preis einzeln erstellen.';
   }
   grid.prepend(link);
   return result;
 };
})(window.createChoicePage);

window.wantedPage=async function(){
 let roots=marketCategoryRoots(),opts=roots.map(c=>'<option value="'+E(c.slug)+'">'+E(c.name_de)+"</option>").join("");
 app.innerHTML="<div class='wrap formPage'><div class='head'><div><span class='km24SectionKicker'>🔎 GESUCHE</span><h1 style='margin:5px 0 0'>Was suchen andere?</h1><p class='mut'>Vielleicht hast du genau das, wonach jemand gerade sucht.</p></div><button class='btn primary' id='wantedCreateTop'>＋ Gesuch erstellen</button></div><div class='panel'><div class='marketSearchGrid'><label>Suche<input id='wantedQ' placeholder='z. B. BMW 530d, iPhone 15, Esstisch'></label><label>Kategorie<select id='wantedCat'><option value=''>Alle Kategorien</option>"+opts+"</select></label></div><div class='actions' style='margin-top:10px'><button class='btn primary' id='wantedSearchBtn'>Gesuche suchen</button><button class='btn' id='wantedResetBtn'>Zurücksetzen</button></div></div><div id='wantedStatus' class='mut' style='margin:14px 0'></div><div id='wantedGrid' class='grid'></div></div>";
 document.getElementById("wantedCreateTop").onclick=()=>go(user?"#/wanted/new":"#/login?next=wanted");
 async function loadWanted(){
  let g=document.getElementById("wantedGrid"),st=document.getElementById("wantedStatus"),q=(document.getElementById("wantedQ").value||"").trim()||null,cat=document.getElementById("wantedCat").value||null;
  st.textContent="Gesuche werden geladen …";g.innerHTML="<div class='empty' style='grid-column:1/-1'>Laden …</div>";
  let r=await db.rpc("search_marketplace_v3",{p_query:q,p_category_slug:cat,p_subcategory_slug:null,p_min_price_chf:null,p_max_price_chf:null,p_condition:null,p_canton:null,p_seller_type:null,p_price_type:null,p_sort:"newest",p_limit:100,p_offset:0,p_listing_intent:"wanted"});
  if(r.error){st.innerHTML=N(r.error.message,1);g.innerHTML="";return}
  let arr=r.data||[];await km24AttachCardImages(arr);arr.forEach(x=>{x.listing_intent="wanted";if(!x._img)x._img=x.image_path?{storage_path:x.image_path,focal_x:x.focal_x,focal_y:x.focal_y,fit_mode:x.fit_mode}:null;x._p={account_type:x.seller_type,business_name:x.seller_name,display_name:x.seller_name,identity_verified_at:null}});
  st.textContent=arr.length+(arr.length===1?" aktives Gesuch":" aktive Gesuche");
  g.innerHTML=arr.length?arr.map(card).join(""):"<div class='empty' style='grid-column:1/-1'>Keine passenden Gesuche gefunden.</div>"
 }
 document.getElementById("wantedSearchBtn").onclick=loadWanted;
 document.getElementById("wantedQ").onkeydown=e=>{if(e.key==="Enter")loadWanted()};
 document.getElementById("wantedResetBtn").onclick=()=>{document.getElementById("wantedQ").value="";document.getElementById("wantedCat").value="";loadWanted()};
 loadWanted()
};

window.wantedForm=async function(editId){
 if(!user)return go("#/login?next=wanted");
 await loadProfile();
 if(!contactReady())return go("#/verification?next=wanted/new");
 if(!buyerReady())return go("#/buyer-activation");
 let existing=null,existingImages=[];
 if(editId){
  let [lr,ir]=await Promise.all([
   db.from("listings").select("*").eq("id",editId).eq("seller_id",user.id).eq("listing_intent","wanted").maybeSingle(),
   db.from("listing_images").select("*").eq("listing_id",editId).order("sort_order")
  ]);
  if(!lr.data){app.innerHTML="<div class='wrap formPage'><div class='empty'>Gesuch nicht gefunden.</div></div>";return}
  existing=lr.data;existingImages=ir.data||[]
 }
 let roots=marketCategoryRoots(),root=existing?rootCategoryOf(existing.category_slug):"",
 opts=roots.map(c=>'<option value="'+E(c.slug)+'" '+(root===c.slug?"selected":"")+'>'+E(c.name_de)+"</option>").join(""),photos=[];
 app.innerHTML="<div class='wrap formPage'><a class='btn' href='"+(editId?"#/me":"#/create")+"'>← Zurück</a><div class='head' style='margin-top:16px'><div><span class='km24SectionKicker'>🔎 GESUCH</span><h1 style='margin:5px 0 0'>"+(editId?"Gesuch bearbeiten":"Ich suche …")+"</h1><p class='mut'>Beschreibe möglichst genau, was du suchst. Ein Bild ist optional.</p></div></div><form id='wantedForm' class='formgrid'><div class='main'><section class='panel stack'><label>Titel<input id='wtitle' required maxlength='120' value='"+E(existing?.title||"")+"' placeholder='z. B. BMW 530d Touring ab 2018'></label><div class='two'><label>Hauptkategorie<select id='wroot' required><option value=''>Hauptkategorie wählen</option>"+opts+"</select></label><label>Unterkategorie<select id='wcat' required></select></label></div><label>Gewünschter Zustand<select id='wcond'><option value='used'>Gebraucht</option><option value='like_new'>Wie neu</option><option value='new'>Neu</option><option value='defective'>Auch defekt</option></select></label><label>Beschreibung<textarea id='wdesc' rows='8' maxlength='5000' placeholder='Modell, Jahrgang, Farbe, gewünschte Ausstattung, was für dich wichtig ist …'>"+E(existing?.description||"")+"</textarea></label></section><section class='panel'><h3>Budget</h3><label>Maximales Budget CHF <small class='mut'>(optional)</small><input class='field' id='wbudget' type='number' min='0' step='.05' value='"+E(existing&&Number(existing.price_chf)>0?existing.price_chf:"")+"' placeholder='z. B. 2500'></label><small class='mut'>Ohne Angabe wird „Budget offen“ angezeigt.</small></section><section class='panel'><h3>Fotos <small class='mut'>(optional)</small></h3>"+(existingImages.length?"<div class='thumbs' style='margin-bottom:10px'>"+existingImages.map(x=>'<img class="thumb" src="'+E(IMG(x.storage_path))+'">').join("")+"</div>":"")+"<label class='photoAdd'>＋ "+(editId?"Weitere Fotos hinzufügen":"Fotos hinzufügen")+"<input id='wphotos' type='file' accept='image/*' multiple></label><div class='formHelp'>Bis zu 8 Bilder insgesamt, jeweils max. 10 MB.</div><div id='wantedPhotoManager' class='photoManager'></div></section></div><aside class='side'><section class='panel stack'><h3>Standort</h3><div class='two'><label>PLZ<input id='wzip' inputmode='text' maxlength='12' required value='"+E(existing?.postal_code||profile?.postal_code||"")+"'></label><label>Ort<input id='wcity' required value='"+E(existing?.city||profile?.city||"")+"'></label></div></section><section class='panel'><div class='notice'><b>🔎 Gesucht, nicht zu verkaufen</b><br>Andere Nutzer sehen dein Budget nur als Obergrenze. Mit „Ich habe das“ können Verkäufer dich kontaktieren.</div><button class='btn primary' style='width:100%;margin-top:16px'>"+(editId?"Änderungen speichern":"Gesuch veröffentlichen")+"</button><div id='wantedMsg'></div></section></aside></form></div>";
 document.getElementById("wcond").value=existing?.condition||"used";
 let sub=document.getElementById("wcat");
 function fill(selected){
  let r=document.getElementById("wroot").value,ch=cats.filter(c=>c.parent_slug===r).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
  if(!r){sub.innerHTML="<option value=''>Zuerst Hauptkategorie wählen</option>";sub.disabled=true}
  else if(ch.length){sub.innerHTML="<option value=''>Unterkategorie wählen</option>"+ch.map(c=>'<option value="'+E(c.slug)+'">'+E(c.name_de)+"</option>").join("");sub.disabled=false;if(selected&&ch.some(c=>c.slug===selected))sub.value=selected}
  else{sub.innerHTML='<option value="'+E(r)+'">'+E(marketCategoryName(r))+"</option>";sub.disabled=false;sub.value=r}
 }
 fill(existing?.category_slug||"");document.getElementById("wroot").onchange=()=>fill("");
 let pm=document.getElementById("wantedPhotoManager");function redraw(){photoManager(pm,photos,redraw)}
 document.getElementById("wphotos").onchange=e=>{let room=Math.max(0,8-existingImages.length-photos.length),add=[...e.target.files].filter(f=>f.type.startsWith("image/")).slice(0,room);add.forEach(f=>photos.push({kind:"new",file:f,url:URL.createObjectURL(f),focal_x:50,focal_y:50,fit_mode:"contain"}));e.target.value="";redraw()};redraw();
 document.getElementById("wantedForm").onsubmit=async e=>{
  e.preventDefault();let msg=document.getElementById("wantedMsg"),category=sub.value,zip=document.getElementById("wzip").value.trim(),city=document.getElementById("wcity").value.trim();if(!category)return msg.innerHTML=N("Bitte eine Kategorie auswählen.",1);if(!zip)return msg.innerHTML=N("Bitte PLZ eingeben.",1);if(!city)return msg.innerHTML=N("Bitte Ort eingeben.",1);if(profile?.residency_scope!=="FOREIGN"&&!/^\d{4}$/.test(zip))return msg.innerHTML=N("Bitte eine gültige 4-stellige Schweizer PLZ eingeben.",1);
  let budget=Number(document.getElementById("wbudget").value||0),
  payload={seller_id:user.id,listing_intent:"wanted",category_slug:category,title:document.getElementById("wtitle").value.trim(),description:document.getElementById("wdesc").value.trim(),price_chf:budget,price_type:"on_request",condition:document.getElementById("wcond").value,postal_code:document.getElementById("wzip").value.trim()||null,city:document.getElementById("wcity").value.trim()||null,pickup_available:false,shipping_available:false,auction_start_price_chf:null,auction_end_at:null,auction_min_increment_chf:1,extra_fields:{},updated_at:new Date().toISOString()};
  msg.innerHTML=N(editId?"Änderungen werden gespeichert …":"Gesuch wird veröffentlicht …");let id=editId;
  if(editId){let r=await db.from("listings").update(payload).eq("id",editId).eq("seller_id",user.id);if(r.error)return msg.innerHTML=N(r.error.message,1)}
  else{payload.status="active";payload.published_at=new Date().toISOString();let r=await db.from("listings").insert(payload).select("id").single();if(r.error)return msg.innerHTML=N(r.error.message,1);id=r.data.id}
  let base=existingImages.length,photoErrors=[];
  for(let i=0;i<photos.length;i++){
    let x=photos[i];
    try{
      msg.innerHTML=N("Foto "+(i+1)+" von "+photos.length+" wird hochgeladen …");
      let f=await window.km24CompressUploadImage(x.file);
      if(!f||f.size>10*1024*1024){photoErrors.push("Foto "+(i+1)+": Die Datei ist grösser als 10 MB.");continue;}
      let ext=(f.name.split(".").pop()||"jpg").replace(/[^a-z0-9]/gi,"");
      let path=user.id+"/"+id+"/"+(window.crypto&&typeof crypto.randomUUID==='function'?crypto.randomUUID():('km24_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)))+"."+ext;
      let up=await db.storage.from("listing-images").upload(path,f,{contentType:f.type});
      if(up.error){photoErrors.push("Foto "+(i+1)+": "+up.error.message);continue;}
      let saved=await db.from("listing_images").insert({listing_id:id,storage_path:path,sort_order:base+i,focal_x:50,focal_y:50,fit_mode:"contain"});
      if(saved.error){await db.storage.from("listing-images").remove([path]);photoErrors.push("Foto "+(i+1)+": "+saved.error.message);}
    }catch(err){photoErrors.push("Foto "+(i+1)+": "+String(err?.message||"Upload fehlgeschlagen"));}
  }
  if(photoErrors.length){
    alert("Dein Gesuch wurde gespeichert, aber "+photoErrors.length+" Foto(s) konnten nicht hochgeladen werden.\n"+photoErrors.join("\n").slice(0,600)+"\nBitte füge die fehlenden Fotos erneut hinzu.");
    go("#/wanted/edit/"+id);return;
  }
  go("#/listing/"+id)
 }
};

async function loadHomeWanted(){
 let el=document.getElementById("homeWanted");if(!el)return;
 let r=await db.rpc("search_marketplace_v3",{p_query:null,p_category_slug:null,p_subcategory_slug:null,p_min_price_chf:null,p_max_price_chf:null,p_condition:null,p_canton:null,p_seller_type:null,p_price_type:null,p_sort:"newest",p_limit:4,p_offset:0,p_listing_intent:"wanted"});
 if(r.error){el.innerHTML="<div class='empty' style='grid-column:1/-1'>Gesuche konnten nicht geladen werden.</div>";return}
 let arr=r.data||[];
 arr.forEach(x=>{x._img=x.image_path?{storage_path:x.image_path,focal_x:x.focal_x,focal_y:x.focal_y,fit_mode:x.fit_mode}:null;x._p={account_type:x.seller_type,business_name:x.seller_name,display_name:x.seller_name,identity_verified_at:null}});
 el.innerHTML=arr.length?arr.map(x=>card({...x,listing_intent:"wanted"})).join(""):"<div class='empty' style='grid-column:1/-1'>Noch keine aktiven Gesuche. Sei der Erste.</div>"
}

function enhanceWantedHome(){
 if(!document.querySelector(".km24LatestSection")||document.getElementById("wantedSection"))return;
 let s=document.createElement("section");s.className="section km24WantedSection";s.id="wantedSection";
 s.innerHTML='<div class="wrap"><div class="km24HomeSectionHead"><div><span class="km24SectionKicker">🔎 ICH SUCHE</span><h2>Aktuelle Gesuche</h2><p>Nutzer suchen diese Artikel – vielleicht hast du genau das Passende. Passende neue Angebote werden automatisch gemeldet.</p></div><button class="btn" id="allWantedBtn">Alle Gesuche</button></div><div id="homeWanted" class="grid"><div class="km24AuctionSkeleton"></div><div class="km24AuctionSkeleton"></div><div class="km24AuctionSkeleton"></div><div class="km24AuctionSkeleton"></div></div></div>';
 document.querySelector(".km24LatestSection").before(s);
 document.getElementById("allWantedBtn").onclick=()=>go("#/wanted");loadHomeWanted()
}
window.__km24HomeHooks=window.__km24HomeHooks||[];
window.__km24HomeHooks.push(async function(){await enhanceWantedHome()});

const oldDetail=detail;
detail=async function(id){
 await oldDetail(id);
 let r=await db.from("listings").select("id,seller_id,title,listing_intent,price_chf,status,wanted_found_at").eq("id",id).maybeSingle(),l=r.data;
 if(!l||l.listing_intent!=="wanted")return;
 let own=!!user&&user.id===l.seller_id,titlePanel=document.querySelector(".detail h1")?.closest(".panel"),badge=titlePanel?.querySelector(".badge"),price=titlePanel?.querySelector(".detailprice");
 if(badge){badge.classList.add("wanted");badge.textContent="🔎 GESUCHT"}if(price)price.textContent=ptxt(l,null);
 let side=document.querySelector(".detail .side");if(!side)return;
 document.getElementById("chatBtn")?.remove();
 let sellerPanel=document.querySelector(".detail .seller")?.closest(".panel"),role=sellerPanel?.querySelector("small.mut");if(role)role.textContent="Suchender";
 let action=document.createElement("div");action.className="panel km24WantedAction";
 action.innerHTML='<span class="badge wanted">🔎 GESUCHT</span><h3>Ich suche</h3><div class="big">'+E(ptxt(l,null))+'</div><p class="mut">Wenn du den gesuchten Artikel hast, kannst du direkt Kontakt aufnehmen.</p>'+(own?(l.status==="active"?'<button id="wantedFoundBtn" class="btn primary" style="width:100%">✓ Gefunden / Gesuch beenden</button>':'<div class="notice">Dieses Gesuch ist beendet.</div><button id="wantedReopenBtn" class="btn" style="width:100%;margin-top:8px">↻ Gesuch reaktivieren</button>'):!user?'<button id="wantedLoginBtn" class="btn primary" style="width:100%">Anmelden & antworten</button>':'<button id="wantedReplyBtn" class="btn primary" style="width:100%">🙋 Ich habe das</button>');
 side.prepend(action);
 document.getElementById("wantedLoginBtn")?.addEventListener("click",()=>go("#/login"));
 document.getElementById("wantedReplyBtn")?.addEventListener("click",async e=>{let b=e.currentTarget;b.disabled=true;let q=await db.rpc("respond_to_wanted",{p_listing_id:id});if(q.error){b.disabled=false;return alert(q.error.message)}go("#/messages/"+q.data)});
 document.getElementById("wantedFoundBtn")?.addEventListener("click",async()=>{if(!confirm("Gesuch wirklich als gefunden beenden?"))return;let q=await db.rpc("mark_wanted_found",{p_listing_id:id});if(q.error)return alert(q.error.message);detail(id)});
 document.getElementById("wantedReopenBtn")?.addEventListener("click",async()=>{let q=await db.rpc("reopen_wanted",{p_listing_id:id});if(q.error)return alert(q.error.message);detail(id)})
};

const oldMe=me;
me=async function(){
 await oldMe();
 if(!user)return;
 let r=await db.from("listings").select("id,status,wanted_found_at").eq("seller_id",user.id).eq("listing_intent","wanted").neq("status","deleted");
 (r.data||[]).forEach(l=>{
  let id=l.id,edit=document.querySelector('a[href="#/edit/'+id+'"]'),cardEl=edit?.closest(".km24MyListingCard");
  if(edit)edit.href="#/wanted/edit/"+id;
  cardEl?.querySelector('[data-sold="'+id+'"]')?.remove();
  cardEl?.querySelectorAll('[data-promo][data-id="'+id+'"]').forEach(x=>x.remove());
  let st=cardEl?.querySelector(".km24ListingState");if(st&&l.wanted_found_at)st.textContent="Gefunden";
  let titleRow=cardEl?.querySelector(".km24MyListingTitleRow");if(titleRow&&!titleRow.querySelector(".badge.wanted"))titleRow.insertAdjacentHTML("beforeend",'<span class="badge wanted">🔎 Gesuch</span>');
  let toggle=cardEl?.querySelector('[data-status][data-id="'+id+'"]');
  if(toggle){
   toggle.removeAttribute("data-status");
   if(l.status==="active"){toggle.textContent="✓ Gefunden";toggle.onclick=async()=>{if(!confirm("Gesuch wirklich als gefunden beenden?"))return;let q=await db.rpc("mark_wanted_found",{p_listing_id:id});if(q.error)alert(q.error.message);else me()}}
   else{toggle.textContent="↻ Gesuch reaktivieren";toggle.onclick=async()=>{let q=await db.rpc("reopen_wanted",{p_listing_id:id});if(q.error)alert(q.error.message);else me()}}
  }
 })
};

setTimeout(()=>{let h=location.hash||"#/";if(h==="#/"&&document.querySelector(".km24LatestSection"))enhanceWantedHome()},500);
})();
