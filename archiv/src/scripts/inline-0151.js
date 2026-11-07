
(function(){
  if(window.__km24PromoCanonicalV2)return;
  window.__km24PromoCanonicalV2=true;
  const active=v=>{if(!v)return false;const t=Date.parse(v);return Number.isFinite(t)&&t>Date.now()};
  const stateFor=l=>{
    const top=!!l&&active(l.featured_until),home=!!l&&active(l.home_boost_until);
    return top&&home?'both':top?'top':home?'home':'none';
  };
  const classFor=s=>s==='both'?'km24PromoForceBoth':s==='top'?'km24PromoForceTop':s==='home'?'km24PromoForceHome':'';
  const textFor=s=>s==='both'?'⭐ TOP · 🥇 GOLD · STARTSEITE':s==='top'?'⭐ TOP':'🥇 GOLD · STARTSEITE';
  const badgeClass=s=>'km24PromoForceBadge '+(s==='top'?'top':s==='home'?'home':'both');
  const originalCard=(typeof card==='function')?card:null;

  function renderCard(l){
    let html=originalCard(l),state=stateFor(l);
    if(state==='none')return html;
    const promoClass=classFor(state);
    html=html.replace(/class="card km24ListingCard([^"]*)"/,function(_,rest){
      return 'class="card km24ListingCard '+promoClass+rest+'" data-km24-promo-force="'+state+'"';
    });
    if(html.indexOf('km24PromoForceBadge')<0){
      html=html.replace('<div class="pic km24CardPic">','<div class="pic km24CardPic"><div class="'+badgeClass(state)+'">'+textFor(state)+'</div>');
    }
    return html;
  }

  if(originalCard){
    card=renderCard;
    try{window.card=renderCard}catch(_){}
  }

  function apply(cardEl,row){
    if(!cardEl||!row)return;
    const state=stateFor(row),promoClass=classFor(state);
    cardEl.classList.remove('km24PromoForceTop','km24PromoForceHome','km24PromoForceBoth');
    cardEl.querySelector('.km24PromoForceBadge')?.remove();
    cardEl.dataset.km24PromoForce=state;
    if(state==='none')return;
    cardEl.classList.add(promoClass);
    const pic=cardEl.querySelector('.km24CardPic');
    if(!pic)return;
    const b=document.createElement('div');
    b.className=badgeClass(state);
    b.textContent=textFor(state);
    pic.appendChild(b);
  }

  function sync(){
    try{
      const arr=Array.isArray(window.listings)?window.listings:(typeof listings!=='undefined'&&Array.isArray(listings)?listings:[]);
      if(!arr.length)return;
      const map={};arr.forEach(x=>{if(x&&x.id)map[x.id]=x});
      document.querySelectorAll('.km24ListingCard[data-listing-id]').forEach(c=>{
        const row=map[c.dataset.listingId];
        if(row)apply(c,row);
      });
    }catch(e){console.warn('KM24 promo canonical sync',e)}
  }

  let timer=0;
  const schedule=()=>{clearTimeout(timer);timer=setTimeout(sync,25)};
  try{new MutationObserver(schedule).observe(document.getElementById('app')||document.body,{childList:true,subtree:true})}catch(_){}
  addEventListener('pageshow',schedule,{passive:true});
  addEventListener('hashchange',schedule,{passive:true});
  sync();setTimeout(sync,80);setTimeout(sync,300);setTimeout(sync,1000);
})();
