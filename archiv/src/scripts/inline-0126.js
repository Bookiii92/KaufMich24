
(function(){
 if(window.__km24TxStepsClickableV1)return;
 window.__km24TxStepsClickableV1=true;
 function stepEls(card){return card?Array.from(card.querySelectorAll('.txSteps>span')):[]}
 function setAction(el,action,msg){
  if(!el||el.classList.contains('done'))return;
  el.classList.add('km24TxStepAction');
  el.setAttribute('role','button');el.setAttribute('tabindex','0');
  el.dataset.km24Action=action||'info';
  if((action||'info')==='info')el.dataset.km24Info='1';
  if(msg)el.dataset.km24Message=msg;
 }
 async function enhanceBuyer(){
  try{
   if(typeof db==='undefined'||typeof user==='undefined'||!user)return;
   let r=await db.rpc('my_purchases');if(r.error)return;
   let map={};(r.data||[]).forEach(x=>map[String(x.listing_id)]=x);
   document.querySelectorAll('.activityCard [data-purchase-chat]').forEach(chat=>{
    let card=chat.closest('.activityCard'),x=map[String(chat.dataset.purchaseChat)];if(!card||!x)return;
    let s=stepEls(card);if(s.length<4)return;
    let paymentDone=x.payment_status==='paid'||x.payment_status==='not_applicable';
    let handoverDone=['shipped','picked_up','completed'].includes(x.fulfillment_status);
    if(!paymentDone)setAction(s[1],'info','Die Zahlung erfolgt direkt zwischen Käufer und Verkäufer. Der Verkäufer bestätigt hier den Zahlungseingang.');
    if(!handoverDone){
      let m=x.fulfillment_status==='ready_for_pickup'?'Der Artikel ist abholbereit. Der Verkäufer bestätigt die Übergabe, sobald sie erfolgt ist.':x.fulfillment_status==='shipping'?'Der Versand wird vorbereitet. Der Verkäufer markiert den Artikel nach dem Versand als versendet.':'Der Verkäufer muss Versand oder Übergabe zuerst bestätigen.';
      setAction(s[2],'info',m);
    }
    if(x.fulfillment_status!=='completed'){
      if(['shipped','picked_up'].includes(x.fulfillment_status)&&card.querySelector('[data-confirm-received]'))setAction(s[3],'buyer-complete','');
      else setAction(s[3],'info','Der Abschluss wird freigeschaltet, sobald der Verkäufer Versand oder Übergabe bestätigt hat.');
    }
   });
  }catch(_){ }
 }
 async function enhanceSales(){
  try{
   if(typeof db==='undefined'||typeof user==='undefined'||!user)return;
   let r=await db.rpc('my_sales');if(r.error)return;
   let map={};(r.data||[]).forEach(x=>map[String(x.listing_id)]=x);
   document.querySelectorAll('.activityCard [data-sale-chat]').forEach(chat=>{
    let card=chat.closest('.activityCard'),x=map[String(chat.dataset.saleChat)];if(!card||!x)return;
    let s=stepEls(card);if(s.length<4)return;
    let paymentDone=x.payment_status==='paid'||x.payment_status==='not_applicable';
    let handoverDone=['shipped','picked_up','completed'].includes(x.fulfillment_status);
    if(!paymentDone){
      if(card.querySelector('[data-pay="paid"]'))setAction(s[1],'seller-payment','');
      else setAction(s[1],'info','Der Zahlungsstatus kann aktuell nicht geändert werden.');
    }
    if(!handoverDone){
      if(!paymentDone)setAction(s[2],'info','Bitte zuerst Schritt 2 „Zahlung“ bestätigen.');
      else if(card.querySelector('[data-fulfill]'))setAction(s[2],'seller-handover','');
      else setAction(s[2],'info','Für diesen Verkauf ist aktuell keine Übergabe-Aktion verfügbar.');
    }
    if(x.fulfillment_status!=='completed'){
      let m=['shipped','picked_up'].includes(x.fulfillment_status)?'Übergabe ist bestätigt. Jetzt muss der Käufer den Erhalt bestätigen, damit der Verkauf abgeschlossen wird.':'Bitte zuerst Schritt 3 „Übergabe“ abschliessen.';
      setAction(s[3],'info',m);
    }
   });
  }catch(_){ }
 }
 function activate(el){
  if(!el||el.classList.contains('done'))return;
  let card=el.closest('.activityCard'),a=el.dataset.km24Action||'info';
  if(a==='info'){alert(el.dataset.km24Message||'Dieser Schritt ist noch nicht verfügbar.');return}
  if(!card)return;
  if(a==='seller-payment'){
    let b=card.querySelector('[data-pay="paid"]');if(b&&!b.disabled)b.click();else alert('Die Zahlung kann aktuell nicht bestätigt werden.');return
  }
  if(a==='seller-handover'){
    let bs=Array.from(card.querySelectorAll('[data-tx][data-fulfill]')).filter(b=>!b.disabled);
    if(!bs.length){alert('Für die Übergabe ist aktuell keine Aktion verfügbar.');return}
    if(bs.length===1){bs[0].click();return}
    let text='Wie möchtest du fortfahren?\n'+bs.map((b,i)=>(i+1)+' = '+b.textContent.trim()).join('\n');
    let n=Number(prompt(text,'1'));if(Number.isInteger(n)&&n>=1&&n<=bs.length)bs[n-1].click();return
  }
  if(a==='buyer-complete'){
    let b=card.querySelector('[data-confirm-received]');if(b&&!b.disabled)b.click();else alert('Der Abschluss ist noch nicht verfügbar.');return
  }
 }
 document.addEventListener('click',function(e){let el=e.target&&e.target.closest?e.target.closest('.km24TxStepAction'):null;if(!el)return;e.preventDefault();e.stopPropagation();activate(el)},true);
 document.addEventListener('keydown',function(e){if(e.key!=='Enter'&&e.key!==' ')return;let el=e.target&&e.target.closest?e.target.closest('.km24TxStepAction'):null;if(!el)return;e.preventDefault();activate(el)},true);
 try{
  if(typeof buyerCenter==='function'){
   let baseBuyerCenter=buyerCenter;
   buyerCenter=async function(){let out=await baseBuyerCenter.apply(this,arguments);await enhanceBuyer();return out};window.buyerCenter=buyerCenter;
  }
  if(typeof salesCenter==='function'){
   let baseSalesCenter=salesCenter;
   salesCenter=async function(){let out=await baseSalesCenter.apply(this,arguments);await enhanceSales();return out};window.salesCenter=salesCenter;
  }
 }catch(_){ }
 setTimeout(function(){enhanceBuyer();enhanceSales()},80);
})();
