
(function(){
 if(window.__km24PromoOptionsV2)return;window.__km24PromoOptionsV2=true;

 const promoCfg={
   top:{
     title:'Top-Inserat',
     subtitle:'Dein Inserat wird in passenden Suchergebnissen vor normalen Inseraten angezeigt.',
     plans:[
       {days:3,price:3.90,points:390,type:'top_3d',code:'promo_top_3d'},
       {days:7,price:5.90,points:590,type:'top_7d',code:'promo_top_7d',recommended:true}
     ]
   },
   homepage:{
     title:'Gold-Promotion',
     subtitle:'✓ Startseite · ✓ Kategorie ganz oben · ✓ Suche bevorzugt · ✓ 1× täglich automatisch hochgepusht.',
     plans:[
       {days:3,price:8.90,points:890,type:'homepage_3d',code:'promo_homepage_3d'},
       {days:7,price:12.90,points:1290,type:'homepage_7d',code:'promo_homepage_7d',recommended:true}
     ]
   }
 };

 function money(n){return Number(n).toFixed(2)}
 async function balance(){
   let r=await db.rpc('my_loyalty_summary');
   if(r.error)return 0;
   return Number(((r.data||[])[0]||{}).points_balance||0)
 }
 function closeModal(){document.querySelector('.km24PromoChoiceOverlay')?.remove()}

 
function openPaymentMethodPicker(code,id,sandbox){
   closeModal();
   let ov=document.createElement('div');
   ov.className='km24PromoChoiceOverlay km24TrustedPaymentOverlay';
   ov.innerHTML='<div class="km24PromoChoiceModal km24TrustedPaymentModal" data-km24-pay-ux="1" role="dialog" aria-modal="true" aria-labelledby="km24PayTitle">'+
     '<button class="km24PromoClose" type="button" aria-label="Schliessen">×</button>'+
     '<div class="km24PayLock" aria-hidden="true">🔒</div>'+
     '<h2 id="km24PayTitle">Sicher bezahlen</h2>'+
     '<p class="km24PayLead">Du wirst zur sicheren Zahlungsseite weitergeleitet. Dort wählst du deine bevorzugte Zahlungsart.</p>'+
     '<div class="km24PayBrandRow" aria-label="Verfügbare Zahlungsarten">'+
       '<span>VISA</span><span>Mastercard</span><span>Apple Pay</span><span>Google Pay</span>'+
     '</div>'+
     '<button type="button" class="btn primary km24PayContinue" data-km24-pay="card">Sicher weiter zur Zahlung</button>'+
     '<div class="km24TwintSoon"><b>TWINT</b><span>folgt in Kürze</span></div>'+
     '<div class="km24SecureFoot">🔒 Verschlüsselte &amp; sichere Zahlungsabwicklung</div>'+
   '</div>';
   ov.addEventListener('click',e=>{if(e.target===ov)ov.remove()});
   ov.querySelector('.km24PromoClose').onclick=()=>ov.remove();
   const payBtn=ov.querySelector('[data-km24-pay="card"]');
   if(payBtn)payBtn.onclick=async()=>{
     if(payBtn.disabled)return;
     payBtn.disabled=true;
     const old=payBtn.textContent;
     payBtn.textContent='Zahlung wird geöffnet …';
     try{
       ov.remove();
       await startBillingCheckout(code,id,null,false);
     }catch(err){
       payBtn.disabled=false;
       payBtn.textContent=old;
       throw err;
     }
   };
   document.body.appendChild(ov)
 }


 async function openPromoChooser(id,kind){
   if(!user)return go('#/login');
   closeModal();
   const cfg=promoCfg[kind],bal=await balance();
   if(!cfg)return;
   let payR=await db.rpc('promotion_payment_availability'),
       payEnabled=!!((payR.data||[])[0]||{}).enabled,
       sandbox=false;
   if(profile?.is_admin&&!payEnabled){
     try{
       const st=await db.functions.invoke('kaufmich-billing-status',{body:{}});
       sandbox=!!st.data?.configured&&st.data?.mode==='test';
     }catch(_){}
   }
   const cardAllowed=payEnabled||sandbox;

   let ov=document.createElement('div');
   ov.className='km24PromoChoiceOverlay';
   ov.innerHTML='<div class="km24PromoChoiceModal" role="dialog" aria-modal="true">'+
     '<button class="km24PromoClose" type="button" aria-label="Schliessen">×</button>'+
     '<h2>'+cfg.title+'</h2><p>'+cfg.subtitle+(!payEnabled&&!sandbox?' <b>Kartenzahlungen sind während der Startphase noch deaktiviert. Promotionen bleiben kostenpflichtig und können aktuell mit KaufMich24 Punkten aktiviert werden.</b>':'')+'</p>'+
     '<div class="km24PromoChoiceGrid">'+cfg.plans.map(p=>
       '<div class="km24PromoPlanCard '+(p.recommended?'recommended':'')+'">'+
         '<small>'+(p.recommended?'EMPFOHLEN':'FLEXIBEL')+'</small>'+
         '<b>'+p.days+' Tage</b>'+
         '<div class="km24PromoPlanPrice"><strong>CHF '+money(p.price)+'</strong><span>oder '+p.points+' Punkte</span></div>'+
         '<div class="km24PromoPlanActions">'+
           '<button type="button" class="btn primary" data-promo-card="'+p.code+'" data-promo-type="'+p.type+'" '+(!cardAllowed?'disabled':'')+'>'+(sandbox?'Sicher bezahlen':payEnabled?'Sicher bezahlen':'Zahlung später')+'</button>'+
           '<button type="button" class="btn" data-promo-points="'+p.type+'" data-points="'+p.points+'" '+(bal<p.points?'disabled':'')+'>'+p.points+' Punkte</button>'+
         '</div>'+
       '</div>'
     ).join('')+'</div>'+
     '<div class="km24PromoBalance">Dein Punktestand: <b>'+bal+' Punkte</b></div>'+
   '</div>';

   ov.addEventListener('click',e=>{if(e.target===ov)closeModal()});
   ov.querySelector('.km24PromoClose').onclick=closeModal;
   ov.querySelectorAll('[data-promo-card]').forEach(b=>b.onclick=async()=>{
     if(b.disabled)return;
     const code=b.dataset.promoCard;
     closeModal();
     openPaymentMethodPicker(code,id,sandbox);
   });
   ov.querySelectorAll('[data-promo-points]').forEach(b=>b.onclick=async()=>{
     if(b.disabled)return;
     const type=b.dataset.promoPoints,pts=Number(b.dataset.points||0);
     b.disabled=true;
     let pr=await db.rpc('redeem_points_for_promotion',{p_listing_id:id,p_type:type});
     if(pr.error){b.disabled=false;return alert(pr.error.message)}
     closeModal();
     alert(pts+' Punkte eingelöst. Promotion wurde aktiviert.');
     if(typeof me==='function')me();
   });
   document.body.appendChild(ov)
 }

 // Final promotion handler: legacy buttons only select the promotion family.
 window.__km24OpenPromoChooser=openPromoChooser;
 promoteListing=async function(id,type){
   return openPromoChooser(id,String(type||'').startsWith('homepage')?'homepage':'top')
 };

 function updateOwnerButtons(){
   document.querySelectorAll('[data-promo="top_7d"]:not(:disabled)').forEach(b=>b.textContent='⭐ Top-Promotion');
   document.querySelectorAll('[data-promo="homepage_7d"]:not(:disabled)').forEach(b=>b.textContent='🏠 Startseiten-Boost');
 }

 function updateFeesPromoBox(){
   if((location.hash||'').split('?')[0]!=='#/fees')return;
   let box=document.querySelector('.km24PromoPrices');
   if(box){
     box.innerHTML=
       '<div><b>⭐ Top-Inserat · 3 Tage</b><strong>CHF 3.90</strong><span>oder 390 Punkte</span></div>'+
       '<div><b>⭐ Top-Inserat · 7 Tage</b><strong>CHF 5.90</strong><span>oder 590 Punkte</span></div>'+
       '<div><b>🏠 Startseiten-Boost · 3 Tage</b><strong>CHF 8.90</strong><span>oder 890 Punkte</span></div>'+
       '<div><b>🏠 Startseiten-Boost · 7 Tage</b><strong>CHF 12.90</strong><span>oder 1’290 Punkte</span></div>';
   }
   document.querySelectorAll('#app .mut,#app .notice,#app .panel p').forEach(el=>{
     const t=(el.textContent||'').trim();
     if(t.includes('Top-Inserat 7 Tage')&&t.includes('Startseiten-Boost 7 Tage')){
       el.innerHTML='<b>Kostenlose Startphase:</b> Kartenzahlungen sind noch deaktiviert. Promotionen kannst du aktuell mit KaufMich24 Punkten aktivieren; die CHF-Beträge zeigen die späteren regulären Preise.';
     }
   })
 }

 const oldMeV2=me;
 me=async function(){await oldMeV2();updateOwnerButtons()};

 if(typeof feesPage==='function'){
   const oldFeesV2=feesPage;
   feesPage=async function(){await oldFeesV2();setTimeout(updateFeesPromoBox,20)}
 }

 setTimeout(()=>{updateOwnerButtons();updateFeesPromoBox()},150);
})();
