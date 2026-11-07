
(function(){
if(window.__km24MarketplaceDiscoveryV1)return;window.__km24MarketplaceDiscoveryV1=true;

const css=document.createElement("style");
css.textContent=
".km24DiscoverySection{padding:28px 0}.km24DiscoveryHead{display:flex;align-items:end;justify-content:space-between;gap:12px;margin-bottom:14px}.km24DiscoveryHead h2{margin:0;font-size:27px}.km24DiscoveryHead p{margin:4px 0 0}.km24DiscoveryGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.km24NearControls{display:flex;gap:8px;flex-wrap:wrap;align-items:end;margin:10px 0 14px}.km24NearControls label{display:grid;gap:5px;font-size:12px;color:var(--mut)}.km24NearControls input,.km24NearControls select{min-width:120px}.km24NearInfo{font-size:12px;color:var(--mut);margin-top:8px}.km24ReservedPill{background:#6b5221!important;color:#fff!important}.km24PriceDrop{display:inline-flex;align-items:center;gap:7px;padding:7px 10px;border-radius:999px;background:#153c2b;border:1px solid #2c7555;margin:7px 0;font-size:13px}.km24OldPrice{text-decoration:line-through;color:var(--mut);font-size:.78em;margin-right:7px}.km24Distance{font-weight:700}.km24ShareBtn{width:100%;margin-top:8px}.km24SimilarWrap{margin-top:22px}.km24ReserveBtn{white-space:nowrap}.km24HomeEmpty{padding:18px;border:1px dashed var(--line);border-radius:14px;color:var(--mut)}@media(max-width:900px){.km24DiscoveryGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.km24DiscoveryGrid{grid-template-columns:1fr 1fr;gap:9px}.km24DiscoveryHead h2{font-size:22px}.km24NearControls>*{flex:1 1 120px}.km24NearControls button{width:100%}}";
document.head.appendChild(css);

function kmRecent(){
 try{return JSON.parse(localStorage.getItem("km24_recent_listings")||"[]").filter(x=>x&&x.id)}catch{return[]}
}
function kmRecordRecent(id){
 try{
  let a=kmRecent().filter(x=>x.id!==id);
  a.unshift({id:id,t:Date.now()});
  localStorage.setItem("km24_recent_listings",JSON.stringify(a.slice(0,20)))
 }catch{}
}
function kmHaversine(a,b){
 const R=6371,toRad=x=>x*Math.PI/180,dLat=toRad(b.lat-a.lat),dLon=toRad(b.lng-a.lng);
 const x=Math.sin(dLat/2)**2+Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLon/2)**2;
 return 2*R*Math.asin(Math.sqrt(x))
}
async function kmZip(zip){
 zip=String(zip||"").trim();
 if(!/^\d{4}$/.test(zip))return null;
 let cache={};
 try{cache=JSON.parse(localStorage.getItem("km24_zip_geo")||"{}")}catch{}
 if(cache[zip]&&Date.now()-Number(cache[zip].t||0)<90*86400000)return cache[zip];
 try{
  let r=await fetch("https://api.zippopotam.us/ch/"+encodeURIComponent(zip));
  if(!r.ok)return null;
  let d=await r.json(),p=(d.places||[])[0];
  if(!p)return null;
  let v={lat:Number(p.latitude),lng:Number(p.longitude),place:p["place name"]||"",t:Date.now()};
  if(!Number.isFinite(v.lat)||!Number.isFinite(v.lng))return null;
  cache[zip]=v;
  let keys=Object.keys(cache);if(keys.length>500)keys.sort((a,b)=>(cache[b].t||0)-(cache[a].t||0)).slice(500).forEach(k=>delete cache[k]);
  localStorage.setItem("km24_zip_geo",JSON.stringify(cache));
  return v
 }catch{return null}
}
async function kmMapLimit(items,limit,fn){
 let out=new Array(items.length),idx=0;
 async function worker(){while(true){let i=idx++;if(i>=items.length)return;out[i]=await fn(items[i],i)}}
 await Promise.all(Array.from({length:Math.min(limit,items.length)},worker));
 return out
}
async function kmHydrate(arr){
 arr=arr||[];if(!arr.length)return arr;
 await km24AttachCardImages(arr);
 let sellerIds=[...new Set(arr.map(x=>x.seller_id).filter(Boolean))],auctionIds=arr.filter(x=>x.price_type==="auction").map(x=>x.id);
 let [pq,sq]=await Promise.all([
  sellerIds.length?db.rpc("seller_cards_public",{p_seller_ids:sellerIds}):Promise.resolve({data:[]}),
  auctionIds.length&&user?db.from("auction_stats").select("*").in("listing_id",auctionIds):Promise.resolve({data:[]})
 ]);
 let pm={},sm={};(pq.data||[]).forEach(x=>pm[x.seller_id]=x);(sq.data||[]).forEach(x=>sm[x.listing_id]=x);
 arr.forEach(x=>{
  let p=pm[x.seller_id]||{};
  x._p={account_type:p.account_type,business_name:p.business_name,display_name:p.display_name||p.seller_name,city:p.city,identity_verified_at:null};
  x._s=sm[x.id]||null
 });
 return arr
}
let kmBasePromise=null;
async function kmBaseListings(){
 if(!user)return [];
 if(kmBasePromise)return kmBasePromise;
 kmBasePromise=(async()=>{
  let q=await db.from("listings").select("*").in("status",["active","reserved"]).eq("listing_intent","offer").order("published_at",{ascending:false}).limit(140);
  return kmHydrate(q.data||[])
 })();
 try{return await kmBasePromise}catch(e){kmBasePromise=null;throw e}
}

const kmOldCard=card;
card=function(l){
 let p=l._p||{},images=km24CardImages(l),ii=images[0]||l._img,path=typeof ii==="string"?ii:ii?.storage_path,fit="cover",fx=Number(ii?.focal_x??50),fy=Number(ii?.focal_y??50);
 let im=path?'<img class="km24CardMainImg" data-km24-fx="'+fx+'" data-km24-fy="'+fy+'" src="'+E(IMG(path))+'" style="object-fit:'+fit+';object-position:'+fx+'% '+fy+'%" onload="window.km24ApplyCardFocal&&window.km24ApplyCardFocal(this)">':'<span class="km24NoImage">📷</span>';
 let auction=l.price_type==="auction",timer=auction&&l.auction_end_at?'<span class="km24CardTimer">⏱ '+E(typeof homeAuctionRemaining==="function"?homeAuctionRemaining(l.auction_end_at):"Auktion")+'</span>':"";
 let reserved=l.status==="reserved",views=Number(l.view_count||0),favs=Number(l.favorite_count||0),thumbs=km24ThumbStripHtml(images);
 let drop=Number(l.previous_price_chf||0)>Number(l.price_chf||0)&&!auction;
 let publishedTs=new Date(l.published_at||0).getTime(),isNew=Number.isFinite(publishedTs)&&publishedTs>0&&(Date.now()-publishedTs)<=48*60*60*1000;
 let newLang='de';try{newLang=window.km24Language?window.km24Language():'de'}catch(_){}
 let newLabel=({de:'Neu',fr:'Nouveau',it:'Nuovo',en:'New'}[newLang]||'Neu'),newBadge=isNew?'<span class="km24NewPill">'+newLabel+'</span>':'';
 let price='<div class="price">'+(drop?'<span class="km24OldPrice">CHF '+E(F(l.previous_price_chf))+'</span>':'')+E(ptxt(l,l._s))+'</div>';
 let dist=l._distanceKm!=null?'<span class="km24Distance">· '+E(Number(l._distanceKm).toFixed(Number(l._distanceKm)<10?1:0))+' km</span>':"";
 return '<article class="card km24ListingCard" data-listing-id="'+E(l.id)+'" onclick="go(\'#/listing/'+l.id+'\')"><div class="pic km24CardPic">'+im+'<div class="km24CardOverlay"><span class="km24TypePill '+(auction?"auction":l.price_type==="free"?"free":"")+'">'+E(L(l.price_type))+'</span>'+(reserved?'<span class="km24TypePill km24ReservedPill">Reserviert</span>':'')+timer+'</div></div>'+thumbs+'<div class="cb km24CardBody"><div class="km24CardTitleRow"><div class="title">'+E(l.title)+'</div>'+newBadge+'</div>'+price+(drop?'<div class="km24PriceDrop">📉 Preis gesenkt</div>':'')+'<div class="km24CardSeller">'+(p.account_type==="dealer"||p.account_type==="business"?'<span class="km24DealerTag">Händler</span>':"")+'<span>'+E(p.display_name||((p.account_type==='dealer'||p.account_type==='business')?'Händler':'Privatperson'))+'</span></div><div class="km24CardMeta"><span>📍 '+E(((l.postal_code||"")+" "+(l.city||"")).trim()||"Schweiz")+' '+dist+'</span></div></div></article>'
};

async function kmRefreshSearchMeta(expectedSeq){
 const seq=expectedSeq==null?(window.__km24SearchSeq||0):expectedSeq;
 let arr=Array.isArray(window.listings)?window.listings:(typeof listings!=="undefined"?listings:[]);
 if(!arr.length)return;
 const signature=arr.map(x=>x.id).join("|");
 let ids=arr.map(x=>x.id),q=await db.from("listings").select("id,status,previous_price_chf").in("id",ids),m={};
 if(seq!==(window.__km24SearchSeq||0))return;
 let current=Array.isArray(window.listings)?window.listings:(typeof listings!=="undefined"?listings:[]);
 if(current.map(x=>x.id).join("|")!==signature)return;
 (q.data||[]).forEach(x=>m[x.id]=x);
 arr.forEach(x=>Object.assign(x,m[x.id]||{}));
 let g=document.getElementById("grid");if(g&&seq===(window.__km24SearchSeq||0))g.innerHTML=arr.map(card).join("")
}
const kmOldSearch=runMarketplaceSearch;
runMarketplaceSearch=async function(){await kmOldSearch();const seq=window.__km24SearchSeq||0;await kmRefreshSearchMeta(seq)};

function kmEnsureHomeSections(){
 if(document.getElementById("kmNearbySection"))return;
 let why=document.querySelector(".km24WhySection")||document.querySelector("#grid")?.closest(".section");
 if(!why)return;
 let wrap=document.createElement("div");
 wrap.innerHTML=
 '<section class="section km24DiscoverySection" id="kmNearbySection"><div class="wrap"><div class="km24DiscoveryHead"><div><span class="km24SectionKicker">LOKAL ENTDECKEN</span><h2>📍 In deiner Nähe</h2><p class="mut">Angebote rund um deine PLZ.</p></div></div><div class="km24NearControls"><label>PLZ<input id="kmNearZip" inputmode="numeric" maxlength="4" placeholder="z. B. 6234"></label><label>Umkreis<select id="kmNearRadius"><option value="5">5 km</option><option value="10">10 km</option><option value="25" selected>25 km</option><option value="50">50 km</option><option value="100">100 km</option></select></label><button class="btn primary" id="kmNearGo">Anzeigen</button></div><div id="kmNearStatus" class="km24NearInfo"></div><div id="kmNearGrid" class="km24DiscoveryGrid"></div></div></section>'+
 '<section class="section km24DiscoverySection" id="kmRecentSection"><div class="wrap"><div class="km24DiscoveryHead"><div><span class="km24SectionKicker">WEITERSCHAUEN</span><h2>🕘 Zuletzt angesehen</h2><p class="mut">Deine zuletzt geöffneten Inserate.</p></div></div><div id="kmRecentGrid" class="km24DiscoveryGrid"></div></div></section>'+
 '<section class="section km24DiscoverySection" id="kmForYouSection"><div class="wrap"><div class="km24DiscoveryHead"><div><span class="km24SectionKicker">FÜR DICH</span><h2>✨ Empfehlungen</h2><p class="mut" id="kmForYouHint">Passend zu deinen Interessen.</p></div></div><div id="kmForYouGrid" class="km24DiscoveryGrid"></div></div></section>';
 while(wrap.firstChild)why.parentNode.insertBefore(wrap.firstChild,why)
}
async function kmRenderNearby(){
 let grid=document.getElementById("kmNearGrid"),st=document.getElementById("kmNearStatus"),zipEl=document.getElementById("kmNearZip"),radEl=document.getElementById("kmNearRadius");
 if(!grid||!zipEl)return;
 let zip=zipEl.value.trim(),radius=Number(radEl.value||25);
 if(!/^\d{4}$/.test(zip)){grid.innerHTML='<div class="km24HomeEmpty">Bitte eine 4-stellige Schweizer PLZ eingeben.</div>';return}
 localStorage.setItem("km24_near_zip",zip);localStorage.setItem("km24_near_radius",String(radius));
 st.textContent="Angebote im Umkreis werden gesucht …";grid.innerHTML="";
 let origin=await kmZip(zip);if(!origin){st.textContent="Diese PLZ konnte nicht gefunden werden.";return}
 let base=(await kmBaseListings()).filter(x=>x.postal_code&&/^\d{4}$/.test(String(x.postal_code))).slice(0,120);
 let zips=[...new Set(base.map(x=>String(x.postal_code)))],coords={};
 let vals=await kmMapLimit(zips,7,z=>kmZip(z));zips.forEach((z,i)=>coords[z]=vals[i]);
 base.forEach(x=>{let c=coords[String(x.postal_code)];x._distanceKm=c?kmHaversine(origin,c):null});
 let near=base.filter(x=>x._distanceKm!=null&&x._distanceKm<=radius).sort((a,b)=>a._distanceKm-b._distanceKm).slice(0,12);
 st.textContent=near.length?(near.length+" Angebot"+(near.length===1?"":"e")+" im Umkreis von "+radius+" km"):"Keine passenden Angebote im gewählten Umkreis.";
 grid.innerHTML=near.length?near.map(card).join(""):'<div class="km24HomeEmpty">Versuche einen grösseren Umkreis.</div>'
}
async function kmRenderRecent(){
 let grid=document.getElementById("kmRecentGrid");if(!grid)return;
 let ids=kmRecent().map(x=>x.id).slice(0,8);
 if(!ids.length){grid.innerHTML='<div class="km24HomeEmpty">Noch keine angesehenen Inserate.</div>';return}
 let q=await db.from("listings").select("*").in("id",ids).neq("status","deleted"),arr=q.data||[],order={};ids.forEach((id,i)=>order[id]=i);
 arr.sort((a,b)=>(order[a.id]??99)-(order[b.id]??99));await kmHydrate(arr);
 grid.innerHTML=arr.length?arr.map(card).join(""):'<div class="km24HomeEmpty">Noch keine verfügbaren Inserate in deiner Liste.</div>'
}
async function kmRenderForYou(){
 let grid=document.getElementById("kmForYouGrid"),hint=document.getElementById("kmForYouHint");if(!grid)return;
 let recentIds=kmRecent().map(x=>x.id).slice(0,20),signals={},seen=new Set(recentIds);
 function add(k,w){if(k)signals[k]=(signals[k]||0)+w}
 if(recentIds.length){
  let q=await db.from("listings").select("id,category_slug,subcategory_slug").in("id",recentIds);
  (q.data||[]).forEach(x=>{add("c:"+x.category_slug,1);add("s:"+x.subcategory_slug,2)})
 }
 if(user){
  let fq=await db.from("favorites").select("listing_id").eq("user_id",user.id).order("created_at",{ascending:false}).limit(30),fids=(fq.data||[]).map(x=>x.listing_id);
  if(fids.length){let q=await db.from("listings").select("id,category_slug,subcategory_slug").in("id",fids);(q.data||[]).forEach(x=>{add("c:"+x.category_slug,3);add("s:"+x.subcategory_slug,5)})}
 }
 let base=(await kmBaseListings()).filter(x=>(!user||x.seller_id!==user.id)&&!seen.has(x.id));
 let has=Object.keys(signals).length>0;
 base.forEach(x=>x._kmScore=(signals["s:"+x.subcategory_slug]||0)*3+(signals["c:"+x.category_slug]||0)+(Number(x.favorite_count||0)*.04)+(Number(x.view_count||0)*.002));
 base.sort((a,b)=>has?(b._kmScore-a._kmScore):(Number(b.favorite_count||0)*5+Number(b.view_count||0))-(Number(a.favorite_count||0)*5+Number(a.view_count||0)));
 let arr=base.slice(0,8);
 hint.textContent=window.km24T?window.km24T(has?"Basierend auf gemerkten und angesehenen Inseraten.":"Noch wenig Verlauf – deshalb zeigen wir dir aktuell beliebte Angebote."):(has?"Basierend auf gemerkten und angesehenen Inseraten.":"Noch wenig Verlauf – deshalb zeigen wir dir aktuell beliebte Angebote.");
 grid.innerHTML=arr.length?arr.map(card).join(""):'<div class="km24HomeEmpty">Noch keine Empfehlungen verfügbar.</div>'
}
async function kmEnhanceHome(){
 if((location.hash||"#/")!=="#/")return;
 if(user){try{await loadProfile()}catch{}}
 /* KM24: alte Startseiten-Bloecke (Nähe/Zuletzt/Empfehlungen) nicht mehr erzeugen */
 let zip=document.getElementById("kmNearZip"),rad=document.getElementById("kmNearRadius");
 if(zip&&!zip.value)zip.value=(profile?.postal_code||localStorage.getItem("km24_near_zip")||"");
 if(rad)rad.value=localStorage.getItem("km24_near_radius")||"25";
 let goBtn=document.getElementById("kmNearGo");if(goBtn)goBtn.onclick=kmRenderNearby;
 if(zip)zip.onkeydown=e=>{if(e.key==="Enter")kmRenderNearby()};
 let a=document.getElementById("applySearch"),qs=document.getElementById("qs");if(a)a.onclick=runMarketplaceSearch;if(qs)qs.onclick=()=>{if(typeof window.km24HeroSearchSubmit==="function")return window.km24HeroSearchSubmit();return runMarketplaceSearch()};
 await kmRefreshSearchMeta();
 await Promise.all([kmRenderRecent(),kmRenderForYou()]);
 /* KM24: Naehe-Block entfernt */
}

async function kmEnhanceDetail(id){
 kmRecordRecent(id);
 let q=await db.from("listings").select("*").eq("id",id).maybeSingle(),l=q.data;if(!l)return;
 let titlePanel=document.querySelector(".detailgrid .panel");
 if(titlePanel){
  if(l.status==="reserved"&&!titlePanel.querySelector(".km24ReservedDetail"))titlePanel.querySelector("h1")?.insertAdjacentHTML("beforebegin",'<div class="km24PriceDrop km24ReservedDetail">🔒 Reserviert</div>');
  if(Number(l.previous_price_chf||0)>Number(l.price_chf||0)&&!titlePanel.querySelector(".km24PriceDropDetail")){
   let p=titlePanel.querySelector(".detailprice");
   p?.insertAdjacentHTML("afterend",'<div class="km24PriceDrop km24PriceDropDetail">📉 Preis gesenkt von CHF '+E(F(l.previous_price_chf))+' auf CHF '+E(F(l.price_chf))+'</div>')
  }
 }
 if(l.status==="reserved"){
  let offer=document.getElementById("offf");if(offer){offer.querySelectorAll("input,button").forEach(x=>x.disabled=true);offer.insertAdjacentHTML("beforebegin",'<div class="notice">🔒 Dieses Inserat ist reserviert. Preisvorschläge sind vorübergehend deaktiviert.</div>')}
 }
 let seller=document.querySelector(".km24SellerTrustPanel");
 if(seller&&!document.getElementById("kmShareListing")){
  let b=document.createElement("button");b.id="kmShareListing";b.className="btn km24ShareBtn";b.textContent="↗ Inserat teilen";
  let report=document.getElementById("reportBtn");if(report)report.before(b);else seller.appendChild(b);
  b.onclick=async()=>{
   let url=location.origin+"/#/listing/"+id,share={title:l.title,text:l.title+" auf KaufMich24",url};
   try{if(navigator.share)await navigator.share(share);else{await navigator.clipboard.writeText(url);b.textContent="✓ Link kopiert";setTimeout(()=>b.textContent="↗ Inserat teilen",1600)}}catch(e){if(e?.name!=="AbortError")alert("Teilen war nicht möglich.")}
  }
 }
 let host=document.querySelector(".detail .wrap");if(!host||document.getElementById("kmSimilarListings"))return;
 let sec=document.createElement("section");sec.id="kmSimilarListings";sec.className="km24SimilarWrap";
 sec.innerHTML='<div class="km24DiscoveryHead"><div><span class="km24SectionKicker">ÄHNLICHE ANGEBOTE</span><h2>Das könnte dich auch interessieren</h2></div></div><div id="kmSimilarGrid" class="km24DiscoveryGrid"><div class="km24HomeEmpty">Ähnliche Inserate werden geladen …</div></div>';
 host.appendChild(sec);
 let query=db.from("listings").select("*").in("status",["active","reserved"]).eq("listing_intent","offer").neq("id",id).order("published_at",{ascending:false}).limit(50);
 if(l.subcategory_slug)query=query.eq("subcategory_slug",l.subcategory_slug);else query=query.eq("category_slug",l.category_slug);
 let sr=await query,arr=sr.data||[];
 if(arr.length<4){
  let q2=await db.from("listings").select("*").in("status",["active","reserved"]).eq("listing_intent","offer").eq("category_slug",l.category_slug).neq("id",id).order("published_at",{ascending:false}).limit(30);
  let have=new Set(arr.map(x=>x.id));(q2.data||[]).forEach(x=>{if(!have.has(x.id))arr.push(x)})
 }
 let price=Number(l.price_chf||0);
 arr.sort((a,b)=>Math.abs(Number(a.price_chf||0)-price)-Math.abs(Number(b.price_chf||0)-price));
 arr=arr.slice(0,8);await kmHydrate(arr);
 // KM24_SIMILAR_LISTING_NAV_GUARD_V1: stale async result after route changed.
 let currentSimilarGrid=document.getElementById("kmSimilarGrid");
 if(!currentSimilarGrid || !currentSimilarGrid.isConnected || (location.hash||"").split("?")[0]!=="#/listing/"+id) return;
 currentSimilarGrid.innerHTML=arr.length?arr.map(card).join(""):'<div class="km24HomeEmpty">Noch keine ähnlichen Inserate verfügbar.</div>'
}

async function kmEnhanceReservations(){
 if(!user||location.hash!=="#/me")return;
 let q=await db.from("listings").select("id,status,price_type,listing_intent").eq("seller_id",user.id).in("status",["active","reserved"]);
 for(let l of q.data||[]){
  if(l.listing_intent!=="offer"||l.price_type==="auction")continue;
  let del=document.querySelector('[data-delete="'+l.id+'"]'),cardEl=del?.closest(".km24MyListingCard");if(!cardEl)continue;
  let row=cardEl.querySelector(".km24MyListingActions");if(!row)continue;
  let old=cardEl.querySelector('[data-status][data-id="'+l.id+'"]');
  if(l.status==="reserved"&&old)old.remove();
  let state=cardEl.querySelector(".km24ListingState");if(state&&l.status==="reserved"){state.textContent="Reserviert";state.className="km24ListingState paused"}
  if(row.querySelector('[data-reserve-id="'+l.id+'"]'))continue;
  let b=document.createElement("button");b.className="btn km24CompactBtn km24ReserveBtn";b.dataset.reserveId=l.id;b.textContent=l.status==="reserved"?"↩ Reservierung aufheben":"🔒 Reservieren";
  let more=row.querySelector(".km24ListingMore");if(more)row.insertBefore(b,more);else row.appendChild(b);
  b.onclick=async()=>{b.disabled=true;let r=await db.rpc("set_listing_reserved",{p_listing_id:l.id,p_reserved:l.status!=="reserved"});if(r.error){b.disabled=false;alert(r.error.message)}else me()}
 }
}

window.__km24HomeHooks=window.__km24HomeHooks||[];
window.__km24HomeHooks.push(async function(){await kmEnhanceHome()});
const kmOldDetail=detail;
detail=async function(id){await kmOldDetail(id);await kmEnhanceDetail(id)};
const kmOldMe=me;
me=async function(){await kmOldMe();await kmEnhanceReservations()};

setTimeout(async()=>{
 let h=location.hash||"#/";
 try{
  if(h==="#/"){}
  else if(h.startsWith("#/listing/"))await kmEnhanceDetail(h.split("/")[2]);
  else if(h==="#/me")await kmEnhanceReservations()
 }catch(e){console.warn("KaufMich24 discovery enhancement",e)}
},450);
})();
