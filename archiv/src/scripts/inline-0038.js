
(function(){
 if(window.__km24ServiceFeesV1)return;window.__km24ServiceFeesV1=true;
 function feeByAmount(v){v=Number(v||0);if(v<250)return 2.90;if(v<1000)return 4.90;if(v<2500)return 7.90;if(v<5000)return 9.90;return 14.90}
 function feePoints(f){return Math.round(Number(f||0)*100)}
 function injectMain(){
   let hero=document.querySelector('.km24SvcHero .wrap');if(!hero||hero.querySelector('.km24SvcFeeBanner'))return;
   let d=document.createElement('div');d.className='km24SvcFeeBanner';
   d.innerHTML='<b>🚀 Einführungsaktion: aktuell CHF 0</b><small>Auftrag erstellen, Dienstleistung anbieten und Angebote senden ist während der Startphase kostenlos. Später bezahlt der Dienstleister erst bei echtem Erfolg: CHF 2.90–14.90 bei angenommener Offerte. Auftraggeber bleiben kostenlos.</small>';
   hero.appendChild(d)
 }
 function injectForm(){
   let form=document.getElementById('svcForm');if(!form||form.querySelector('.km24SvcFeeInfo'))return;
   let side=form.querySelector('.side');if(!side)return;
   let offer=(location.hash||'').includes('/offer/new'),box=document.createElement('section');box.className='panel km24SvcFeeInfo';
   box.innerHTML=offer
     ?'<h3>💰 Gebühren</h3><div class="km24SvcFeePreview"><strong>Aktuell: CHF 0</strong>Einführungsaktion – keine Inseratsgebühr und keine Erfolgsgebühr.<br><br><b>Regulär später:</b><br>• 1 Dienstleistungsinserat gratis<br>• weitere Inserate CHF 2.90 / 30 Tage<br>• Erfolgsgebühr nur bei angenommener Offerte: CHF 2.90–14.90<br>• alternativ mit Punkten bezahlbar (100 Punkte = CHF 1)</div>'
     :'<h3>💰 Für Auftraggeber</h3><div class="km24SvcFeePreview"><strong>Dauerhaft CHF 0</strong>Auftrag erstellen, Angebote erhalten und Dienstleister auswählen bleibt kostenlos.</div>';
   side.appendChild(box)
 }
 function injectQuote(){
   let send=document.getElementById('sqSend'),price=document.getElementById('sqPrice');if(!send||!price||document.getElementById('km24SvcQuoteFee'))return;
   let box=document.createElement('div');box.id='km24SvcQuoteFee';box.className='km24SvcFeePreview';send.parentNode.insertBefore(box,send);
   function draw(){let f=feeByAmount(price.value);box.innerHTML='<strong>Einführungsaktion: Erfolgsgebühr CHF 0</strong><span class="km24SvcFeeOld">regulär CHF '+f.toFixed(2)+'</span><span class="km24SvcFeeNow">jetzt gratis</span><br>Später erst fällig, wenn der Auftraggeber deine Offerte annimmt. Entspricht '+feePoints(f)+' Punkten.'}
   price.addEventListener('input',draw);draw()
 }
 function injectMine(){
   let h=location.hash||'';if(h!=='#/services/mine')return;
   let head=document.querySelector('.formPage .head');if(!head||document.getElementById('km24SvcMineFee'))return;
   let n=document.createElement('div');n.id='km24SvcMineFee';n.className='km24SvcFeeBanner';n.innerHTML='<b>Aktuell alle Service-Gebühren CHF 0</b><small>Reguläres Modell ist bereits vorbereitet. Deine erste Dienstleistungsanzeige bleibt gratis; weitere kosten später CHF 2.90 pro 30 Tage. Bei vermittelten Aufträgen gilt später die Erfolgsgebühr.</small>';head.insertAdjacentElement('afterend',n)
 }
 function injectAll(){injectMain();injectForm();injectQuote();injectMine()}
 let t=0;function schedule(){clearTimeout(t);t=setTimeout(injectAll,80)}
 window.addEventListener('hashchange',schedule);new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});setTimeout(injectAll,250);

 if(typeof feesPage==='function'&&!window.__km24FeesPageServiceWrapped){
   window.__km24FeesPageServiceWrapped=true;const oldFees=feesPage;
   feesPage=async function(){
     await oldFees();
     if(document.getElementById('km24ServiceFeeSection'))return;
     let wrap=document.createElement('section');wrap.id='km24ServiceFeeSection';wrap.className='section';
     wrap.innerHTML='<div class="wrap"><div class="head"><div><span class="km24SectionKicker">🛠️ KAUFMICH24 SERVICES</span><h2 style="margin:5px 0">Gebühren für Dienstleistungen</h2><p class="mut">Auftraggeber kostenlos. Dienstleister zahlen später nur wenig – und hauptsächlich bei Erfolg.</p></div><span class="badge">Einführungsaktion: CHF 0</span></div><div class="panel"><h3>Späteres Standardmodell</h3><p><b>Auftraggeber:</b> Auftrag erstellen, Angebote erhalten und Anbieter wählen = <b>CHF 0</b>.</p><p><b>Dienstleister-Inserate:</b> erstes Inserat gratis, weitere <b>CHF 2.90 für 30 Tage</b>.</p><table class="km24SvcFeeTable"><thead><tr><th>Angenommener Auftragswert</th><th>Erfolgsgebühr</th></tr></thead><tbody><tr><td>bis CHF 249</td><td>CHF 2.90</td></tr><tr><td>CHF 250–999</td><td>CHF 4.90</td></tr><tr><td>CHF 1\'000–2\'499</td><td>CHF 7.90</td></tr><tr><td>CHF 2\'500–4\'999</td><td>CHF 9.90</td></tr><tr><td>ab CHF 5\'000</td><td>CHF 14.90</td></tr></tbody></table><div class="notice" style="margin-top:14px"><b>🚀 Startphase:</b> Diese Erfolgsgebühren werden aktuell vollständig erlassen. Im Service-Bereich wird der reguläre Preis transparent als Vergleich angezeigt.</div><p class="mut" style="margin-bottom:0">100 Punkte = CHF 1. Das System ist vorbereitet, Service-Gebühren später auch vollständig mit Punkten zu bezahlen. Ein freiwilliges <b>Service Pro</b> für CHF 29.90/Monat ist technisch vorbereitet, bleibt aber vorerst deaktiviert.</p></div></div>';
     app.appendChild(wrap)
   }
 }
})();
