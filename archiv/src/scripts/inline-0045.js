
(function(){
 if(window.__km24LegalSafetyFinalV1)return;window.__km24LegalSafetyFinalV1=true;
 const legalRoutes=[
   ['#/terms','AGB'],['#/privacy','Datenschutz'],['#/imprint','Impressum'],
   ['#/fees','Gebühren'],['#/account-delete','Konto löschen'],['#/support','Support']
 ];
 function injectLegalNav(){
   const h=(location.hash||'#/').split('?')[0];
   if(!legalRoutes.some(x=>x[0]===h))return;
   const host=document.querySelector('#app .legal')||document.querySelector('#app .km24FeesPage')||document.querySelector('#app .km24SupportPage');
   if(!host||host.querySelector('.km24LegalNav'))return;
   const nav=document.createElement('nav');nav.className='km24LegalNav';nav.setAttribute('aria-label','Rechtliches und Hilfe');
   nav.innerHTML=legalRoutes.map(x=>'<a href="'+x[0]+'" class="'+(x[0]===h?'active':'')+'">'+x[1]+'</a>').join('');
   host.prepend(nav)
 }
 function closeReport(){document.querySelector('.km24ReportOverlay')?.remove()}
 async function openReport(kind,listingId,reportedUser){
   if(!user)return go('#/login');
   closeReport();
   const reasons=[
     ['fraud','Betrug oder verdächtiges Verhalten'],
     ['prohibited','Verbotener oder rechtswidriger Inhalt'],
     ['misleading','Irreführende oder falsche Angaben'],
     ['spam','Spam oder Belästigung'],
     ['circumvention','Umgehung von Kontakt-/Plattformregeln'],
     ['rights','Verletzung von Rechten Dritter'],
     ['other','Anderer Grund']
   ];
   const ov=document.createElement('div');ov.className='km24ReportOverlay';
   ov.innerHTML='<div class="km24ReportModal" role="dialog" aria-modal="true">'+
     '<h2>⚑ '+(kind==='listing'?'Inserat':'Nutzer')+' melden</h2>'+
     '<p>Die Meldung wird vertraulich an die KaufMich24-Moderation übermittelt. Eine Meldung führt nicht automatisch zu einer Sperre.</p>'+
     '<label>Grund<select id="km24ReportReason">'+reasons.map(x=>'<option value="'+x[0]+'">'+x[1]+'</option>').join('')+'</select></label>'+
     '<label>Details <small class="mut">(optional, max. 2000 Zeichen)</small><textarea id="km24ReportDetails" maxlength="2000" placeholder="Beschreibe kurz, was dir aufgefallen ist. Keine Passwörter oder vollständigen Zahlungsdaten eingeben."></textarea></label>'+
     '<div class="km24ReportActions"><button type="button" class="btn" id="km24ReportCancel">Abbrechen</button><button type="button" class="btn primary" id="km24ReportSend">Meldung senden</button></div>'+
     '<div id="km24ReportMsg"></div></div>';
   document.body.appendChild(ov);
   ov.addEventListener('click',e=>{if(e.target===ov)closeReport()});
   ov.querySelector('#km24ReportCancel').onclick=closeReport;
   ov.querySelector('#km24ReportSend').onclick=async()=>{
     const b=ov.querySelector('#km24ReportSend'),msg=ov.querySelector('#km24ReportMsg');
     const code=ov.querySelector('#km24ReportReason').value;
     const label=(reasons.find(x=>x[0]===code)||reasons[6])[1];
     const details=ov.querySelector('#km24ReportDetails').value.trim()||null;
     b.disabled=true;b.textContent='Wird gesendet …';
     const rr=await db.rpc('submit_report',{
       p_listing_id:kind==='listing'?listingId:null,
       p_reported_user_id:reportedUser||null,
       p_reason:label,
       p_details:details
     });
     if(rr.error){msg.innerHTML=N(rr.error.message,1);b.disabled=false;b.textContent='Meldung senden';return}
     msg.innerHTML='<div class="notice">✓ Danke. Die Meldung wurde an die KaufMich24-Moderation übermittelt.</div>';
     setTimeout(closeReport,900)
   }
 }
 reportListing=function(listingId,reportedUser){return openReport('listing',listingId,reportedUser)};
 reportUser=function(reportedUser){return openReport('user',null,reportedUser)};
 let timer=0;function schedule(){clearTimeout(timer);timer=setTimeout(injectLegalNav,40)}
 addEventListener('hashchange',schedule);new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});setTimeout(injectLegalNav,120)
})();
