
(function(){
 if(window.__km24PromoForceV1)return;window.__km24PromoForceV1=true;
 let runId=0,timer=0,busy=false;
 const active=v=>{if(!v)return false;const t=Date.parse(v);return Number.isFinite(t)&&t>Date.now()};
 function apply(card,row){
   const top=!!row&&active(row.featured_until),home=!!row&&active(row.home_boost_until),state=top&&home?'both':top?'top':home?'home':'none';
   if(card.dataset.km24PromoForce===state && (state==='none'||card.querySelector('.km24PromoForceBadge')))return;
   card.dataset.km24PromoForce=state;
   card.classList.remove('km24PromoForceTop','km24PromoForceHome','km24PromoForceBoth');
   card.querySelector('.km24PromoForceBadge')?.remove();
   if(state==='none')return;
   card.classList.add(state==='both'?'km24PromoForceBoth':state==='top'?'km24PromoForceTop':'km24PromoForceHome');
   const pic=card.querySelector('.km24CardPic');if(!pic)return;
   const b=document.createElement('div');
   b.className='km24PromoForceBadge '+(state==='top'?'top':state==='home'?'home':'both');
   b.textContent=state==='both'?'⭐ TOP · 🥇 GOLD · STARTSEITE':state==='top'?'⭐ TOP':'🥇 GOLD · STARTSEITE';
   pic.appendChild(b);
 }
 async function refresh(){
   if(busy||typeof db==='undefined')return;
   const cards=[...document.querySelectorAll('.km24ListingCard[data-listing-id]')];
   const ids=[...new Set(cards.map(c=>c.dataset.listingId).filter(Boolean))];
   if(!ids.length)return;
   busy=true;const my=++runId;
   try{
     const q=await db.from('listings').select('id,featured_until,home_boost_until').in('id',ids);
     if(my!==runId||q.error)return;
     const map={};(q.data||[]).forEach(x=>map[x.id]=x);
     cards.forEach(c=>apply(c,map[c.dataset.listingId]));
   }catch(e){console.warn('KM24 promo force',e)}finally{busy=false}
 }
 function schedule(ms=80){clearTimeout(timer);timer=setTimeout(refresh,ms)}
 const root=document.getElementById('app')||document.body;
 new MutationObserver(()=>schedule(60)).observe(root,{childList:true,subtree:true});
 addEventListener('hashchange',()=>schedule(120));
 addEventListener('pageshow',()=>schedule(120));
 setTimeout(refresh,150);setTimeout(refresh,700);setTimeout(refresh,1800);
})();
