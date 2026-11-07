
(function(){
if(window.__km24CardThumbsV1)return;window.__km24CardThumbsV1=true;
let timer=null;
function cardsIn(root){
let a=[];
if(root&&root.matches&&root.matches(".km24ListingCard[data-listing-id],.km24AuctionCard[data-listing-id]"))a.push(root);
if(root&&root.querySelectorAll)a.push(...root.querySelectorAll(".km24ListingCard[data-listing-id],.km24AuctionCard[data-listing-id]"));
return a.filter(x=>!x.dataset.km24ThumbState)
}
async function hydrate(root=document){
let cards=cardsIn(root);
if(!cards.length)return;
cards.forEach(x=>x.dataset.km24ThumbState="loading");
let ids=[...new Set(cards.map(x=>x.dataset.listingId).filter(Boolean))];
if(!ids.length){cards.forEach(x=>x.dataset.km24ThumbState="done");return}
let q=await db.from("listing_images").select("listing_id,storage_path,sort_order,focal_x,focal_y,fit_mode").in("listing_id",ids).order("sort_order");
if(q.error){cards.forEach(x=>x.dataset.km24ThumbState="");return}
let grouped={};
(q.data||[]).forEach(x=>(grouped[x.listing_id]||(grouped[x.listing_id]=[])).push(x));
cards.forEach(card=>{
let images=grouped[card.dataset.listingId]||[];
card.dataset.km24ThumbState="done";
if(images.length<2)return;
let pic=card.querySelector(".km24CardPic,.km24AuctionPic");
if(!pic||pic.parentElement?.querySelector(":scope > .km24ThumbStrip"))return;
let main=pic.querySelector("img");
if(!main)return;
main.classList.add("km24CardMainImg");
let strip=document.createElement("div");
strip.className="km24ThumbStrip";
strip.setAttribute("aria-label",window.km24T?window.km24T("Weitere Bilder"):"Weitere Bilder");
images.slice(0,4).forEach((img,i)=>{
let b=document.createElement("button");
b.type="button";
b.className="km24ThumbBtn"+(i===0?" active":"");
b.dataset.src=IMG(img.storage_path);
b.dataset.fit=img.fit_mode==="contain"?"contain":"cover";
b.dataset.fx=String(Number(img.focal_x??50));
b.dataset.fy=String(Number(img.focal_y??50));
b.setAttribute("aria-label",window.km24T?window.km24T("Bild "+(i+1)+" anzeigen"):("Bild "+(i+1)+" anzeigen"));
let thumb=document.createElement("img");
thumb.src=IMG(img.storage_path);thumb.alt="";thumb.loading="lazy";
b.appendChild(thumb);
if(i===3&&images.length>4){
let more=document.createElement("span");
more.className="km24ThumbMore";more.textContent="+"+(images.length-4);
b.appendChild(more)
}
strip.appendChild(b)
});
pic.insertAdjacentElement("afterend",strip)
})
}
function schedule(root=document){clearTimeout(timer);timer=setTimeout(()=>hydrate(root),70)}
document.addEventListener("click",e=>{
let b=e.target.closest&&e.target.closest(".km24ThumbBtn");
if(!b)return;
e.preventDefault();e.stopPropagation();
let strip=b.closest(".km24ThumbStrip"),pic=b.closest(".km24CardPic,.km24AuctionPic"),main=pic&&pic.querySelector(".km24CardMainImg");
if(!main)return;
main.src=b.dataset.src;
main.style.objectFit=b.dataset.fit||"cover";
main.style.objectPosition=(b.dataset.fx||50)+"% "+(b.dataset.fy||50)+"%";
strip.querySelectorAll(".km24ThumbBtn").forEach(x=>x.classList.remove("active"));
b.classList.add("active")
},true);
document.addEventListener("pointerdown",e=>{if(e.target.closest&&e.target.closest(".km24ThumbBtn"))e.stopPropagation()},true);
new MutationObserver(ms=>{
let roots=[];
ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)roots.push(n)}));
if(roots.length){clearTimeout(timer);timer=setTimeout(()=>roots.forEach(r=>hydrate(r)),80)}
}).observe(document.body,{childList:true,subtree:true});
setTimeout(()=>hydrate(document),120);
})();
