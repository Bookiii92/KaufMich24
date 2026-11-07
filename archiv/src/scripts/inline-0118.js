
(function(){
 if(window.__km24ProfessionalSuiteV1)return;window.__km24ProfessionalSuiteV1=true;
 const knownSafetyHash='#/safety';
 function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
 function fmtMember(v){if(!v)return'';try{return new Intl.DateTimeFormat(window.km24Locale?window.km24Locale():'de-CH',{month:'long',year:'numeric'}).format(new Date(v))}catch(_){return''}}
 function homeHash(){let h=(location.hash||'#/').split('?')[0];return h==='#/'||h===''||h==='#/start'}
 function addTrustStrip(){
  let old=document.getElementById('km24ProTrustStrip');if(!homeHash()){if(old)old.remove();return}if(old)return;
  let app=document.getElementById('app');if(!app||!app.firstChild)return;
  let d=document.createElement('div');d.id='km24ProTrustStrip';d.className='km24ProTrustStrip';d.innerHTML='<div class="km24ProTrustInner"><div class="km24ProTrustItem">🇨🇭 <strong>Schweizer Marktplatz</strong></div><div class="km24ProTrustItem">✓ <strong>Verifizierte Profile gekennzeichnet</strong></div><div class="km24ProTrustItem">⚑ <strong>Inserate einfach melden</strong></div><div class="km24ProTrustItem">💬 <strong>Direkter Kontakt</strong></div></div>';
  app.insertBefore(d,app.firstChild)
 }
 function addFooterSafety(){
  let cols=document.querySelectorAll('.km24FooterGrid>div');if(!cols.length)return;let help=[...cols].find(x=>(x.textContent||'').includes('Hilfe & Sicherheit'));if(!help||help.querySelector('[data-km24-pro-safety]'))return;
  let a=document.createElement('a');a.href=knownSafetyHash;a.dataset.km24ProSafety='1';a.textContent='Sicher kaufen & verkaufen';let first=help.querySelector('a');if(first)help.insertBefore(a,first);else help.appendChild(a)
 }
 function enhanceMessages(){
  let h=(location.hash||'').split('?')[0];if(!h.startsWith('#/messages')&&!h.startsWith('#/notifications'))return;
  let root=document.querySelector('.km24MessagesPage,.wrap');if(!root)return;if(root.querySelector('.km24ProInboxNav'))return;
  let nav=document.createElement('div');nav.className='km24ProInboxNav';nav.innerHTML='<a href="#/messages" class="'+(h.startsWith('#/messages')?'active':'')+'">💬 Chats</a><a href="#/notifications" class="'+(h==='#/notifications'?'active':'')+'">🔔 Andere Benachrichtigungen</a>';let anchor=root.querySelector('.km24ChatPageHead,h1');if(anchor&&anchor.parentElement)anchor.parentElement.after(nav);else root.prepend(nav)
 }
 function renderSafety(){
  if((location.hash||'').split('?')[0]!==knownSafetyHash)return false;
  let app=document.getElementById('app');if(!app)return true;
  app.innerHTML='<div class="wrap km24ProSafetyPage"><section class="km24ProSafetyHero"><span class="km24SectionKicker">🛡️ SICHERHEIT</span><h1>Sicher kaufen und verkaufen</h1><p>KaufMich24 bringt Käufer und Verkäufer zusammen. Bezahle oder überweise nur, wenn Angebot, Gegenpartei und Übergabe für dich nachvollziehbar sind.</p></section><div class="km24ProSafetyGrid"><section class="km24ProSafetyCard"><h2>✓ Profil prüfen</h2><p>Achte auf gekennzeichnete Verifizierungen, Bewertungen, Mitgliedsdauer und bisherige Aktivität.</p></section><section class="km24ProSafetyCard"><h2>💬 Auf KaufMich24 kommunizieren</h2><p>Nutze den KaufMich24-Chat für Absprachen. So bleiben wichtige Details zur Unterhaltung nachvollziehbar.</p></section><section class="km24ProSafetyCard"><h2>💳 Vorsicht bei Vorauszahlungen</h2><ul><li>Keine Zahlung unter Zeitdruck.</li><li>Bei Unsicherheit persönliche Übergabe bevorzugen.</li><li>Sei besonders vorsichtig bei externen Links oder ungewöhnlichen Zahlungswegen.</li></ul></section><section class="km24ProSafetyCard"><h2>⚑ Verdächtige Inserate melden</h2><p>Auf jeder Inseratseite findest du „Inserat melden“. Bei Problemen kannst du zusätzlich den <a href="#/support">KaufMich24 Support</a> kontaktieren.</p></section></div></div>';
  try{window.scrollTo(0,0)}catch(_){}return true
 }
 async function enhanceDetail(id){
  try{
   if(!id)return;let side=document.querySelector('.detail .side');if(!side||side.querySelector('.km24ProSellerTrust')||side.querySelector('.km24ProSellerTrustPending'))return;
   let pending=document.createElement('i');pending.className='km24ProSellerTrustPending';pending.hidden=true;side.appendChild(pending);
   setTimeout(()=>{try{if(pending&&pending.isConnected)pending.remove()}catch(_){}},12000);
   let lr=await db.from('listings').select('seller_id,title').eq('id',id).maybeSingle();let sid=lr&&lr.data&&lr.data.seller_id;if(!sid)return;
   let pr=await db.rpc('seller_profile_public',{p_seller_id:sid}),p=(pr.data||[])[0]||{};
   let seller=[...side.querySelectorAll('.panel')].find(x=>(x.textContent||'').includes('Verkäufer'))||side.querySelector('.panel:last-child');if(!seller)return;
   try{pending.remove()}catch(_){}
   let chips=[];
   
   if(p.email_verified)chips.push('<span class="km24ProTrustChip good"><i>✉</i> E-Mail bestätigt</span>');
   if(p.phone_verified)chips.push('<span class="km24ProTrustChip good"><i>☎</i> Mobilnummer bestätigt</span>');
   if(p.member_since)chips.push('<span class="km24ProTrustChip"><i>◷</i> Mitglied seit '+esc(fmtMember(p.member_since))+'</span>');
   if(Number(p.sold_listing_count||0)>0)chips.push('<span class="km24ProTrustChip"><i>✓</i> '+Number(p.sold_listing_count||0)+' Verkäufe</span>');
   if(Number(p.active_listing_count||0)>0)chips.push('<span class="km24ProTrustChip"><i>▦</i> '+Number(p.active_listing_count||0)+' aktive Inserate</span>');
   if(chips.length){let trust=document.createElement('div');trust.className='km24ProSellerTrust';trust.innerHTML=chips.slice(0,6).join('');let rating=seller.querySelector('.ratingStars');if(rating)rating.after(trust);else seller.appendChild(trust)}
   let safe=document.createElement('div');safe.className='km24ProSafety';safe.innerHTML='<b>🛡️ Sicher handeln</b>Nutze den KaufMich24-Chat und prüfe Profil, Angebot und Zahlungsweg. <a href="#/safety">Sicherheitstipps ansehen</a>';seller.appendChild(safe);
   if(!seller.querySelector('[data-km24-share]')&&!seller.querySelector('#kmShareListing')){let share=document.createElement('button');share.type='button';share.className='btn';share.dataset.km24Share='1';share.style.cssText='width:100%;margin-top:8px';share.textContent='↗ Inserat teilen';share.onclick=async()=>{let clean='https://www.kaufmich24.ch/listing/'+id,title=lr.data&&lr.data.title?lr.data.title:'KaufMich24 Inserat';try{if(navigator.share)await navigator.share({title,url:clean});else if(navigator.clipboard){await navigator.clipboard.writeText(clean);share.textContent='✓ Link kopiert';setTimeout(()=>share.textContent='↗ Inserat teilen',1500)}}catch(_){}};let report=seller.querySelector('#reportBtn');if(report)seller.insertBefore(share,report);else seller.appendChild(share)}
  }catch(_){}
 }
 function professional404(){
  let h=(location.hash||'#/').split('?')[0];if(!h.startsWith('#/not-found/'))return;let app=document.getElementById('app');if(app)app.innerHTML='<div class="wrap"><div class="km24Pro404"><span>🔎</span><h1>Seite nicht gefunden</h1><p>Der Link ist nicht mehr gültig oder die Seite wurde verschoben.</p><a class="btn primary" href="#/">Zur Startseite</a></div></div>'
 }
 function sync(){if(renderSafety())return;addTrustStrip();addFooterSafety();enhanceMessages();professional404();let h=(location.hash||'').split('?')[0];if(h.startsWith('#/listing/'))enhanceDetail(h.split('/')[2])}
 try{let oldDetail=detail;detail=async function(id){await oldDetail(id);await enhanceDetail(id)}}catch(_){}
 addEventListener('hashchange',()=>{setTimeout(sync,30);setTimeout(sync,280)});addEventListener('pageshow',()=>setTimeout(sync,80));document.addEventListener('click',()=>setTimeout(sync,120),true);
 setTimeout(sync,120);setTimeout(sync,600)
})();
