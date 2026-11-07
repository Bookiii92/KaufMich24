
(function(){
 if(window.__km24ListingUsernameV2)return;window.__km24ListingUsernameV2=true;
 let seq=0,t=0,cache={listingId:"",username:""};
 function paint(username){
   const seller=document.querySelector(".detail .side .panel .seller");
   if(!seller||!username)return false;
   if((seller.textContent||"").trim()!==username)seller.textContent=username;
   seller.classList.add("km24SellerUsername");
   seller.setAttribute("data-km24-username",username);
   const panel=seller.closest(".panel");
   const label=panel&&panel.querySelector("small.mut");
   if(label && /^Verkäufer\s*$/i.test((label.textContent||"").trim()) && label.textContent!=="Verkäufer")label.textContent="Verkäufer";
   return true;
 }
 async function sync(){
   const m=(location.hash||"").match(/^#\/listing\/([0-9a-f-]{36})/i);
   if(!m||typeof db==="undefined")return;
   const listingId=m[1];
   if(cache.listingId===listingId&&cache.username){paint(cache.username);return}
   const ticket=++seq;
   try{
     const lr=await db.from("listings").select("seller_id").eq("id",listingId).maybeSingle();
     if(ticket!==seq||!lr.data?.seller_id)return;
     const rr=await db.rpc("seller_profile_public",{p_seller_id:lr.data.seller_id});
     if(ticket!==seq)return;
     const p=(rr.data||[])[0]||{};
     const username=(p.display_name||"").trim();
     if(!username)return;
     cache={listingId,username};paint(username);
   }catch(e){console.warn("KM24 seller username",e)}
 }
 function queue(){clearTimeout(t);t=setTimeout(sync,55)}
 addEventListener("hashchange",()=>{cache={listingId:"",username:""};queue()});addEventListener("pageshow",queue);
 const a=document.getElementById("app");if(a)new MutationObserver(queue).observe(a,{childList:true,subtree:true});
 setTimeout(sync,80);
})();
