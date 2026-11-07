
(function(){
 if(window.__km24PromotionUxV1)return;window.__km24PromotionUxV1=true;

 const active=v=>!!v&&new Date(v).getTime()>Date.now();
 const fmt=v=>{try{return new Date(v).toLocaleDateString((window.km24Locale?window.km24Locale():'de-CH'),{day:'2-digit',month:'2-digit',year:'numeric'})}catch(_){return ''}};
 const left=v=>{
   let ms=new Date(v).getTime()-Date.now();
   if(ms<=0)return 'abgelaufen';
   let h=Math.ceil(ms/3600000);
   if(h<24)return 'noch '+h+' Std.';
   let d=Math.ceil(h/24);
   return 'noch '+d+' '+(d===1?'Tag':'Tage')
 };

 const oldCardPromo=card;
 card=function(l){
   let html=oldCardPromo(l),top=active(l.featured_until),homeBoost=active(l.home_boost_until);
   if(!top&&!homeBoost)return html;
   let flags='<div class="km24PromoFlagStack">'+
     (top?'<span class="km24PromoFlag top">⭐ TOP</span>':'')+
     (homeBoost?'<span class="km24PromoFlag home">🔥 HERVORGEHOBEN</span>':'')+
     '</div>';
   html=html.replace('class="card km24ListingCard"','class="card km24ListingCard'+(top?' km24TopActive':'')+(homeBoost?' km24HomeActive':'')+'"');
   html=html.replace('<div class="pic km24CardPic">','<div class="pic km24CardPic">'+flags);
   return html
 };

 async function hydrateSearchPromos(){
   try{
     if(!Array.isArray(listings)||!listings.length)return;
     let ids=listings.map(x=>x.id),q=await db.from('listings').select('id,featured_until,home_boost_until').in('id',ids),m={};
     (q.data||[]).forEach(x=>m[x.id]=x);
     listings.forEach(x=>Object.assign(x,m[x.id]||{}));
     let g=document.getElementById('grid');
     if(g)g.innerHTML=listings.map(card).join('')
   }catch(e){console.warn('KM24 promo search',e)}
 }
 const oldSearchPromo=runMarketplaceSearch;
 runMarketplaceSearch=async function(){await oldSearchPromo();await hydrateSearchPromos()};

 async function renderHomeBoosts(){
   try{
     if((location.hash||'#/')!=='#/')return;
     const existing=document.getElementById('km24HomeBoostSection');
     let q=await db.from('listings').select('*')
       .eq('status','active').eq('listing_intent','offer')
       .gt('home_boost_until',new Date().toISOString())
       .order('home_boost_until',{ascending:false}).limit(8);
     let arr=q.data||[];
     if(!arr.length){existing?.remove();return;}
     let ids=arr.map(x=>x.id),sellers=[...new Set(arr.map(x=>x.seller_id))],auctionIds=arr.filter(x=>x.price_type==='auction').map(x=>x.id);
     let [iq,pq,sq]=await Promise.all([
       db.from('listing_images').select('listing_id,storage_path,sort_order,focal_x,focal_y,fit_mode').in('listing_id',ids).order('sort_order'),
       db.rpc('seller_cards_public',{p_seller_ids:sellers}),
       auctionIds.length?db.from('auction_stats').select('*').in('listing_id',auctionIds):Promise.resolve({data:[]})
     ]);
     let im={},pm={},sm={};
     (iq.data||[]).forEach(x=>{if(!im[x.listing_id])im[x.listing_id]=x});
     (pq.data||[]).forEach(x=>pm[x.seller_id]=x);
     (sq.data||[]).forEach(x=>sm[x.listing_id]=x);
     arr.forEach(x=>{
       let p=pm[x.seller_id]||{};
       x._img=im[x.id]||null;
       x._p={account_type:p.account_type,business_name:p.business_name,display_name:p.display_name||p.seller_name,city:p.city,identity_verified_at:null};
       x._s=sm[x.id]||null
     });
     let sec=document.createElement('section');
     sec.id='km24HomeBoostSection';sec.className='section km24HomeBoostSection';
     sec.innerHTML='<div class="wrap"><div class="km24HomeBoostBox"><div class="km24HomeBoostHead"><div><span class="km24HomeBoostKicker">🥇 GOLD · STARTSEITE</span><h2>Hervorgehobene Angebote</h2><p>Gold-Inserate werden auf der Startseite präsentiert und in Kategorie und Suche bevorzugt angezeigt.</p></div></div><div class="grid">'+arr.map(card).join('')+'</div></div></div>';
     let before=document.querySelector('.km24AuctionSection')||document.querySelector('.km24LatestSection');
     if(existing)existing.replaceWith(sec);else if(before)before.insertAdjacentElement('beforebegin',sec)
   }catch(e){console.warn('KM24 homepage promos',e)}
 }
 window.__km24HomeHooks=window.__km24HomeHooks||[];
 window.__km24HomeHooks.push(async function(){await renderHomeBoosts()});

 async function markDetailPromo(id){
   try{
     if(!user)return;
     let q=await db.from('listings').select('featured_until,home_boost_until').eq('id',id).maybeSingle(),l=q.data;
     if(!l)return;
     let top=active(l.featured_until),hb=active(l.home_boost_until);
     if(!top&&!hb)return;
     let h=document.querySelector('.detailgrid .panel h1')||document.querySelector('.detail h1');
     if(!h||document.querySelector('.km24PromoDetailBadges'))return;
     let b=document.createElement('div');b.className='km24PromoDetailBadges';
     b.innerHTML=(top?'<span class="km24PromoDetailBadge top">⭐ Top-Inserat</span>':'')+
       (hb?'<span class="km24PromoDetailBadge home">🥇 Gold-Promotion</span>':'');
     h.insertAdjacentElement('beforebegin',b)
   }catch(e){console.warn('KM24 promo detail',e)}
 }
 const oldDetailPromo=detail;
 detail=async function(id){await oldDetailPromo(id);await markDetailPromo(id)};

 async function markOwnerPromos(){
   try{
     if(!user)return;
     let q=await db.from('listings').select('id,featured_until,home_boost_until').eq('seller_id',user.id).neq('status','deleted');
     (q.data||[]).forEach(l=>{
       let edit=document.querySelector('a[href="#/edit/'+l.id+'"]');
       let c=edit?.closest('.km24MyListingCard');if(!c)return;
       let top=active(l.featured_until),hb=active(l.home_boost_until);
       if(top||hb){
         let meta=c.querySelector('.km24MyListingMeta');
         if(meta&&!c.querySelector('.km24PromoOwnerStatus')){
           let s=document.createElement('div');s.className='km24PromoOwnerStatus';
           s.innerHTML=(top?'<span class="km24PromoOwnerChip top">⭐ Top aktiv · '+left(l.featured_until)+' · bis '+fmt(l.featured_until)+'</span>':'')+
             (hb?'<span class="km24PromoOwnerChip home">🥇 Gold aktiv · '+left(l.home_boost_until)+' · bis '+fmt(l.home_boost_until)+'</span>':'');
           meta.insertAdjacentElement('afterend',s)
         }
       }
       let bt=c.querySelector('[data-promo="top_7d"]'),bh=c.querySelector('[data-promo="homepage_7d"]');
       if(bt&&top){bt.disabled=true;bt.textContent='⭐ Top aktiv bis '+fmt(l.featured_until)}
       if(bh&&hb){bh.disabled=true;bh.textContent='🥇 Gold aktiv bis '+fmt(l.home_boost_until)}
     })
   }catch(e){console.warn('KM24 owner promos',e)}
 }
 const oldMePromo=me;
 me=async function(){await oldMePromo();await markOwnerPromos()};

 setTimeout(()=>{
   let h=location.hash||'#/';
   if(h==='#/'){}
   else if(h.startsWith('#/listing/'))markDetailPromo(h.split('/')[2]);
   else if(h==='#/me')markOwnerPromos()
 },300);
})();
