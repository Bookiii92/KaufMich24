
(function(){
 if(window.__km24GuestAuctionPriceFixV1)return;window.__km24GuestAuctionPriceFixV1=true;
 let cache=null,cacheAt=0,busy=false,timer=0;
 function guest(){try{return typeof user==='undefined'||!user}catch(_){return true}}
 async function prices(){
  if(cache&&Date.now()-cacheAt<60000)return cache;
  if(busy)return null;busy=true;
  try{
   const r=await db.rpc('search_marketplace_v3',{p_query:null,p_category_slug:null,p_subcategory_slug:null,p_min_price_chf:null,p_max_price_chf:null,p_condition:null,p_canton:null,p_seller_type:null,p_price_type:'auction',p_sort:'ending_soon',p_limit:50,p_offset:0,p_location:null,p_verified_only:false,p_listing_intent:'offer'});
   if(r.error)return null;
   cache={};(r.data||[]).forEach(x=>cache[x.id]=x);cacheAt=Date.now();return cache;
  }catch(_){return null}finally{busy=false}
 }
 async function apply(){
  if(!guest())return;
  const cards=[...document.querySelectorAll('.km24AuctionCard[data-listing-id]')].filter(c=>/Preis für registrierte Nutzer sichtbar/i.test(c.querySelector('.km24AuctionPrice')?.textContent||''));
  if(!cards.length)return;
  const map=await prices();if(!map)return;
  cards.forEach(c=>{
   const x=map[c.dataset.listingId],p=c.querySelector('.km24AuctionPrice');if(!x||!p)return;
   const n=Number(x.auction_start_price_chf??x.price_chf??0);
   p.textContent=n>0?'ab CHF '+(typeof F==='function'?F(n):n.toFixed(2)):'Auktion';
   p.classList.remove('km24GuestLockedPrice');p.removeAttribute('title');
  });
 }
 function queue(){clearTimeout(timer);timer=setTimeout(apply,80)}
 addEventListener('hashchange',queue);addEventListener('pageshow',queue);
 try{new MutationObserver(queue).observe(document.getElementById('app')||document.body,{childList:true,subtree:true})}catch(_){}
 setTimeout(apply,120);setTimeout(apply,700);
})();
