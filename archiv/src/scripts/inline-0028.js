
(function(){
if(window.__km24ListingGrowthV1)return;window.__km24ListingGrowthV1=true;

let s=document.createElement("style");s.id="km24-listing-growth-style";s.textContent=
".km24GrowthBadge{display:inline-flex;align-items:center;gap:5px;padding:5px 8px;border-radius:999px;border:1px solid #41594c;background:#1c2b23;font-size:12px}.km24WantedMatches{margin-top:18px}.km24WantedMatchesHead{display:flex;justify-content:space-between;gap:12px;align-items:end;margin-bottom:12px}.km24WantedMatchesHead h2{margin:0}.km24WantedMatchesHead p{margin:4px 0 0}.km24CloneBusy{opacity:.6;pointer-events:none}@media(max-width:640px){.km24WantedMatchesHead{align-items:flex-start;flex-direction:column}}";
document.head.appendChild(s);

async function km24CopyListing(id,mode,intent,button){
 let label=mode==="relist"?"Dieses Inserat erneut einstellen? Das bisherige Inserat bleibt in deiner Historie.":"Eine Kopie dieses Inserats erstellen? Die Kopie wird als neues aktives Inserat veröffentlicht.";
 if(!confirm(label))return;
 if(button){button.disabled=true;button.classList.add("km24CloneBusy")}
 let r=await db.rpc("copy_listing",{p_listing_id:id,p_mode:mode});
 if(r.error){
   if(button){button.disabled=false;button.classList.remove("km24CloneBusy")}
   return alert(r.error.message)
 }
 let nid=r.data;
 if(mode==="relist"){
   alert("Inserat wurde neu eingestellt.");
   return go("#/listing/"+nid)
 }
 alert("Kopie erstellt. Du kannst sie jetzt anpassen.");
 go(intent==="wanted"?"#/wanted/edit/"+nid:"#/edit/"+nid)
}

async function enhanceMyListingGrowthTools(){
 if(!user)return;
 let r=await db.from("listings").select("id,status,listing_intent").eq("seller_id",user.id).neq("status","deleted");
 if(r.error)return;
 (r.data||[]).forEach(l=>{
   let anchor=document.querySelector('[data-delete="'+l.id+'"]'),cardEl=anchor?.closest(".km24MyListingCard"),menu=cardEl?.querySelector(".km24ListingMoreMenu");
   if(!menu||menu.querySelector('[data-copy-listing="'+l.id+'"]'))return;

   let dup=document.createElement("button");
   dup.className="btn km24CompactBtn";dup.dataset.copyListing=l.id;dup.textContent="⧉ Duplizieren";
   dup.onclick=()=>km24CopyListing(l.id,"duplicate",l.listing_intent,dup);

   let view=menu.querySelector('a[href="#/listing/'+l.id+'"]');
   menu.insertBefore(dup,view||menu.firstChild);

   if(l.status!=="active"){
     let rel=document.createElement("button");
     rel.className="btn km24CompactBtn";rel.dataset.relistListing=l.id;rel.textContent="↻ Erneut einstellen";
     rel.onclick=()=>km24CopyListing(l.id,"relist",l.listing_intent,rel);
     menu.insertBefore(rel,dup)
   }
 })
}

const km24GrowthBaseMe=me;
me=async function(){
 await km24GrowthBaseMe();
 await enhanceMyListingGrowthTools()
};

async function enhanceWantedMatches(id){
 if(!user)return;
 let lr=await db.from("listings").select("id,seller_id,listing_intent,title,status").eq("id",id).maybeSingle(),l=lr.data;
 if(!l||l.listing_intent!=="wanted"||l.seller_id!==user.id)return;

 let wrap=document.querySelector(".detail .wrap");if(!wrap)return;
 document.getElementById("km24WantedMatchesSection")?.remove();

 let r=await db.rpc("my_wanted_matches",{p_wanted_listing_id:id});
 if(r.error)return;
 let arr=r.data||[],sec=document.createElement("section");
 sec.id="km24WantedMatchesSection";sec.className="section km24WantedMatches";
 sec.innerHTML='<div class="km24WantedMatchesHead"><div><span class="km24SectionKicker">🎯 AUTOMATISCH GEFUNDEN</span><h2>Mögliche Treffer</h2><p class="mut">KaufMich24 vergleicht neue Verkaufsinserate automatisch mit deinem Gesuch.</p></div><span class="km24GrowthBadge">'+arr.length+' Treffer</span></div><div class="grid" id="km24WantedMatchesGrid"></div>';
 wrap.appendChild(sec);

 let grid=sec.querySelector("#km24WantedMatchesGrid");
 if(!arr.length){
   grid.innerHTML="<div class='empty' style='grid-column:1/-1'>Noch kein passendes Inserat gefunden. KaufMich24 sucht automatisch weiter.</div>";
   return
 }
 arr.forEach(x=>{
   x.id=x.offer_listing_id;
   x.listing_intent="offer";
   x._img=x.image_path?{storage_path:x.image_path,focal_x:x.focal_x,focal_y:x.focal_y,fit_mode:x.fit_mode}:null;
   x._p={account_type:x.seller_type,business_name:x.seller_name,display_name:x.seller_name,identity_verified_at:null}
 });
 grid.innerHTML=arr.map(card).join("")
}

const km24GrowthBaseDetail=detail;
detail=async function(id){
 await km24GrowthBaseDetail(id);
 await enhanceWantedMatches(id)
};

setTimeout(()=>{
 let h=location.hash||"";
 if(h==="#/me")enhanceMyListingGrowthTools();
 if(h.startsWith("#/listing/"))enhanceWantedMatches((h.split("/")[2]||"").split("?")[0])
},650);
})();
