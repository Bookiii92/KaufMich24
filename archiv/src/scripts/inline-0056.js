
(function(){
 if(window.__km24ListingContactGuardV1)return;window.__km24ListingContactGuardV1=true;
 function hasContact(v){
   v=String(v||'');
   return /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(v)
     || /(https?:\/\/|www\.|wa\.me|t\.me|whatsapp|telegram|signal|viber|snapchat|instagram|facebook|messenger|discord)/i.test(v)
     || /(^|[^0-9])(\+|00)[0-9][0-9 ()/.\-]{6,}[0-9]([^0-9]|$)/.test(v)
     || /(^|[^0-9])0[2-9][0-9][0-9 ()/.\-]{5,}[0-9]([^0-9]|$)/.test(v)
     || /(^|[\s.,;:!?()\[\]{}])@[A-Z0-9_.]{3,}/i.test(v)
     || /(telefonnummer|handynummer|mobilnummer|whatsapp[\s_-]*nummer|e[\s_-]*mail\s*:|telefon\s*:|tel\s*:)/i.test(v);
 }
 window.km24ListingDescriptionHasContact=hasContact;
 function ensureHint(area){
   let h=area.parentElement?.querySelector('.km24ListingContactHint');
   if(!h){
     h=document.createElement('small');
     h.className='km24ListingContactHint';
     h.textContent='🔒 Zu deiner Sicherheit: Keine Telefonnummern, E-Mail-Adressen, Links oder Messenger-/Social-Media-Kontakte in der Beschreibung. Für Kontakt bitte den KaufMich24-Chat nutzen.';
     area.insertAdjacentElement('afterend',h);
   }
   return h;
 }
 function sync(area){
   const bad=hasContact(area.value),h=ensureHint(area);
   area.classList.toggle('km24ContactBlocked',bad);
   area.setCustomValidity(bad?'Bitte entferne Telefonnummern, E-Mail-Adressen, Links und andere direkte Kontaktdaten aus der Beschreibung.':'');
   h.classList.toggle('bad',bad);
   h.textContent=bad
     ?'⛔ Kontaktdaten erkannt. Bitte Telefonnummer, E-Mail, Link oder Messenger-/Social-Media-Kontakt entfernen.'
     :'🔒 Zu deiner Sicherheit: Keine Telefonnummern, E-Mail-Adressen, Links oder Messenger-/Social-Media-Kontakte in der Beschreibung. Für Kontakt bitte den KaufMich24-Chat nutzen.';
   return bad;
 }
 function attach(){
   document.querySelectorAll('#desc,#edesc,#wdesc').forEach(area=>{
     if(area.dataset.km24ContactGuard==='1')return;
     area.dataset.km24ContactGuard='1';
     ensureHint(area);sync(area);
     area.addEventListener('input',()=>sync(area));
     area.addEventListener('change',()=>sync(area));
   });
 }
 document.addEventListener('submit',e=>{
   const form=e.target;
   if(!(form instanceof HTMLFormElement))return;
   const area=form.querySelector('#desc,#edesc,#wdesc');
   if(!area||!hasContact(area.value))return;
   e.preventDefault();
   e.stopImmediatePropagation();
   sync(area);
   area.focus({preventScroll:true});
   area.scrollIntoView({behavior:'smooth',block:'center'});
   setTimeout(()=>area.reportValidity?.(),180);
 },true);
 const root=document.getElementById('app')||document.body;
 new MutationObserver(()=>setTimeout(attach,20)).observe(root,{childList:true,subtree:true});
 addEventListener('hashchange',()=>setTimeout(attach,80));
 setTimeout(attach,80);
})();
