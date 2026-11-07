
(function(){
 if(window.__km24UxSimplifyV2)return;window.__km24UxSimplifyV2=true;
 var timer=0;
 function schedule(){clearTimeout(timer);timer=setTimeout(apply,55)}
 function emptyStates(){
  document.querySelectorAll('.empty').forEach(function(box){
   if(box.dataset.km24UxEmpty==='1')return;
   var txt=(box.textContent||'').replace(/\s+/g,' ').trim();
   if(!(txt==='Keine passenden Inserate gefunden.'||/^Keine Inserate für „.+“ gefunden\.$/.test(txt)))return;
   box.dataset.km24UxEmpty='1';box.classList.add('km24UxEmptyState');
   box.innerHTML='<div class="km24UxEmptyIcon">🔎</div><b>Nichts Passendes gefunden</b><p>Erstelle ein Gesuch für genau das, was du suchst. Verkäufer können dich direkt über KaufMich24 kontaktieren.</p><button type="button" class="btn primary" data-km24-empty-wanted>＋ Gesuch erstellen</button>';
   var b=box.querySelector('[data-km24-empty-wanted]');
   if(b)b.onclick=function(){try{if(typeof go==='function')return go((typeof user!=='undefined'&&user)?'#/wanted/new':'#/login?next=wanted')}catch(_){}location.hash='#/wanted/new'};
  });
 }
 function payment(){
  document.querySelectorAll('.km24PromoChoiceModal').forEach(function(m){
   var h=m.querySelector('h2');if(!h)return;
   var title=(h.textContent||'').trim();
   if(title==='Sicher bezahlen'||title==='Zahlungsart wählen'){
    if(m.dataset.km24PayUx==='1')return;m.dataset.km24PayUx='1';h.textContent='Sicher bezahlen';
    var p=h.nextElementSibling;if(p&&p.tagName==='P')p.textContent='Auf der nächsten Seite kannst du mit einer der folgenden verfügbaren Zahlungsarten bezahlen:';
    var card=m.querySelector('[data-km24-pay="card"]'),link=m.querySelector('[data-km24-pay="link"]');
    if(!m.querySelector('.km24PayMethods')){var methods=document.createElement('div');methods.className='km24PayMethods';methods.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:16px 0 4px';methods.innerHTML='<div style="padding:10px 8px;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:12px;text-align:center;font-weight:700;font-size:13px">💳 Visa / Mastercard</div><div style="padding:10px 8px;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:12px;text-align:center;font-weight:700;font-size:13px">Apple Pay</div><div style="padding:10px 8px;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:12px;text-align:center;font-weight:700;font-size:13px">Google Pay</div><div style="padding:10px 8px;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:12px;text-align:center;font-weight:700;font-size:13px">Link</div>';if(p)p.insertAdjacentElement('afterend',methods)}if(card)card.textContent='Weiter zur sicheren Zahlung';if(link)link.remove();
    var notes=m.querySelectorAll('p.mut');
    notes.forEach(function(n){if(/Apple Pay|Google Pay|Stripe zeigt/i.test(n.textContent||''))n.textContent='Je nach Gerät sind Visa / Mastercard, Apple Pay, Google Pay oder Link verfügbar.'});
    if(!m.querySelector('.km24UxPayNote')){var note=document.createElement('div');note.className='km24UxPayNote';note.textContent='Die verfügbaren Zahlungsarten werden automatisch passend zu deinem Gerät angezeigt.';m.appendChild(note)}
    return;
   }
   if(!m.querySelector('.km24UxPromoExplain')){
    var text=title==='Top-Inserat'?'Weiter oben in passenden Suchergebnissen.':title==='Startseiten-Boost'?'Zusätzlich im Bereich „Hervorgehobene Angebote“ auf der Startseite.':'';
    if(text){var x=document.createElement('div');x.className='km24UxPromoExplain';x.innerHTML='<span>So wirkt es</span><b>'+text+'</b>';var p2=h.nextElementSibling;if(p2)p2.insertAdjacentElement('afterend',x);else h.insertAdjacentElement('afterend',x)}
   }
  });
 }
 function founder(){
  var p=document.getElementById('km24FounderProgress');
  if(p&&p.textContent!=='Gründerplätze verfügbar · echtes Inserat erforderlich')p.textContent='Gründerplätze verfügbar · echtes Inserat erforderlich';
 }
 function apply(){emptyStates();payment();founder()}
 addEventListener('hashchange',schedule);addEventListener('pageshow',schedule);document.addEventListener('click',schedule,true);
 try{new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true})}catch(_){}
 apply();setTimeout(apply,180);setTimeout(apply,650);
})();
