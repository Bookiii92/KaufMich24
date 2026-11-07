
(function(){
 if(window.__km24UltraUIV1)return;window.__km24UltraUIV1=true;
 async function founderPage(){
 let pr=await db.rpc("founder_seller_progress"),prog=(pr.data||[])[0]||{total_qualified:0,seller_limit:1000,enabled:true},st=null;
 if(user){try{let sr=await db.rpc("my_founder_seller_status");st=(sr.data||[])[0]||null}catch(_){}}
 let confirmed=Number(prog.total_qualified||0),pending=Number((await db.rpc('founder_seller_pending_count')).data||0),used=confirmed+pending,limit=Number(prog.seller_limit||1000),left=Math.max(0,limit-used),pct=Math.max(0,Math.min(100,Math.round(used/Math.max(1,limit)*100)));
 let href=!user?'#/login?signup=1&next=sell&founder=1':(sellerReady()?'#/sell?founder=1':'#/verification?next=sell&founder=1'),cta=!user?'Kostenlos registrieren':(sellerReady()?'Erstes Inserat erstellen':'Profil fürs Verkaufen vervollständigen');
 let status='';
 if(!user){status='<div class="km24FounderStatus wait"><b>Dein Weg zum Gründer-Status</b><span>Registrieren und ein echtes öffentliches Verkaufsinserat veröffentlichen. Test- und gelöschte Inserate zählen nicht.</span></div>'}
 else if(st&&st.status==='qualified'){status='<div class="km24FounderStatus good"><b>🏆 Gründer-Verkäufer #'+E(st.founder_rank||'')+'</b><span>Deine Gründer-Vorteile sind aktiv: CHF 30 Plattformguthaben und 0 % Verkaufsgebühr bis 31.12.2027.</span></div>'}
 else if(st&&st.status==='candidate'){
   let d=Math.max(0,Math.floor((Date.now()-new Date(st.candidate_at).getTime())/86400000)),first=!!st.first_bonus_awarded_at;
   status='<div class="km24FounderStatus candidate"><b>🔥 Du bist Gründer-Kandidat</b><span>Qualifizierendes Inserat seit '+d+' Tag'+(d===1?'':'en')+'. '+(first?'CHF 10 Guthaben sind bereits freigeschaltet.':'Noch '+Math.max(0,Number(st.first_bonus_after_days||14)-d)+' Tag(e) bis zur ersten CHF-10-Stufe.')+' Nach 30 Tagen – oder früher nach einem erfolgreich abgeschlossenen Verkauf – wird der volle Gründer-Status aktiviert.</span></div>'
 } else if(user){status='<div class="km24FounderStatus wait"><b>Noch kein Gründer-Kandidat</b><span>Veröffentliche dein erstes echtes Verkaufsinserat, um die Gründer-Aktion zu starten.</span></div>'}
 app.innerHTML=`<main class="km24FounderPage"><div class="wrap">
   <a class="btn km24FounderBack" href="#/">← Zurück zum Marktplatz</a>
   <section class="km24FounderHero">
     <div class="km24FounderHeroCopy"><span class="km24FounderEyebrow">🚀 KAUFMICH24 GRÜNDER-AKTION</span><h1>Die ersten <span>1’000 echten Verkäufer</span> werden Gründer.</h1><p>Stell ein echtes Inserat ein, bleib aktiv und sichere dir bis zu <b>CHF 30 Plattformguthaben</b> sowie nach voller Qualifikation <b>0 % Verkaufsgebühr bis 31.12.2027</b>.</p><div class="km24FounderHeroActions"><a class="btn primary" href="${href}">${cta} →</a><a class="btn" href="#/fees">Gebühren ansehen</a></div></div>
     <div class="km24FounderCounter"><small>GRÜNDERPLÄTZE</small><b>${used.toLocaleString('de-CH')} / ${limit.toLocaleString('de-CH')}</b><div><i style="width:${pct}%"></i></div><span>${pending} in Prüfung · ${confirmed} bestätigt · ${left.toLocaleString('de-CH')} verfügbar</span></div>
   </section>
   ${status}
   <section class="km24FounderSteps"><article><span>1</span><div><b>Echtes Inserat veröffentlichen</b><p>Öffentliches Verkaufsinserat erstellen. Gelöschte Testinserate zählen nicht.</p></div></article><article><span>2</span><div><b>CHF 10 nach erster Stufe</b><p>Bleibt dein Inserat 14 Tage qualifiziert aktiv, erhältst du 1’000 Punkte = CHF 10 Plattformguthaben. Ein erfolgreich abgeschlossener Verkauf kann die Wartezeit verkürzen.</p></div></article><article><span>3</span><div><b>Voller Gründer-Status</b><p>Nach 30 Tagen oder einem erfolgreich abgeschlossenen Verkauf folgen weitere 2’000 Punkte = CHF 20 und 0 % Verkaufsgebühr bis 31.12.2027.</p></div></article></section>
   <section class="km24FounderBenefits"><div><span>🪙</span><b>CHF 30 Guthaben</b><p>3’000 KaufMich24 Punkte insgesamt. 100 Punkte entsprechen CHF 1 Plattformguthaben.</p></div><div><span>0%</span><b>Keine Verkaufsgebühr</b><p>Nach voller Gründer-Qualifikation bis zum 31.12.2027.</p></div><div><span>🏅</span><b>Limitierter Status</b><p>Nur die ersten 1’000 qualifizierten echten Verkäufer erhalten einen Gründerplatz.</p></div></section>
   <section class="km24FounderRules"><h2>Damit die Aktion fair bleibt</h2><p>Ein kurzes Fake-Inserat einstellen und direkt wieder löschen reicht nicht. Es zählt ein echtes öffentliches Verkaufsinserat, das qualifiziert aktiv bleibt, oder ein darüber erfolgreich abgeschlossener Verkauf. Admin- und Testkonten sind ausgeschlossen.</p></section>
   <section class="km24FounderFinal"><div><span>Bereit?</span><h2>Jetzt Gründerplatz sichern.</h2><p>Je früher dein echtes Inserat online ist, desto früher beginnt deine Qualifikationszeit.</p></div><a class="btn primary" href="${href}">${cta} →</a></section>
 </div></main>`;
}


async function sellerLandingPage(){
 let pr=await db.rpc("founder_seller_progress"),prog=(pr.data||[])[0]||{total_qualified:0,seller_limit:1000,enabled:true};
 let confirmed=Number(prog.total_qualified||0),pending=Number((await db.rpc('founder_seller_pending_count')).data||0),used=confirmed+pending,limit=Number(prog.seller_limit||1000),left=Math.max(0,limit-used),pct=Math.max(0,Math.min(100,Math.round(used/Math.max(1,limit)*100)));
 let ctaHref=!user?'#/login?signup=1&next=sell&founder=1':(sellerReady()?'#/sell?founder=1':'#/verification?next=sell&founder=1');
 let ctaText=!user?'Kostenlos starten':(sellerReady()?'Jetzt Inserat erstellen':'Verkaufsprofil vervollständigen');
 app.innerHTML=`<main class="km24SellerLanding"><div class="wrap">
  <a class="btn km24SellerBack" href="#/">← Zum Marktplatz</a>
  <section class="km24SellerHero">
   <div class="km24SellerHeroCopy"><span class="km24SellerEyebrow">🇨🇭 VERKAUFEN AUF KAUFMICH24</span><h1>Verkaufen, ohne dass Gebühren <span>deinen Start bremsen.</span></h1><p>Erstelle dein Inserat in wenigen Schritten, chatte direkt mit Interessenten und nutze Fixpreis, Verhandlungsbasis oder Auktion. Früh dabei sein lohnt sich zusätzlich: Die ersten 1’000 qualifizierten echten Verkäufer können Gründer-Verkäufer werden.</p><div class="km24SellerHeroActions"><a class="btn primary" data-seller-cta href="${ctaHref}">${ctaText} →</a><a class="btn" href="#/founder">Gründer-Aktion ansehen</a></div><div class="km24SellerTrust"><span>✓ Schweizer Marktplatz</span><span>✓ Direkt chatten</span><span>✓ Schnell inserieren</span></div></div>
   <aside class="km24SellerFounderCard"><small>GRÜNDER-AKTION</small><strong>CHF 30</strong><b>Plattformguthaben</b><div class="km24SellerFounderZero">0 % Verkaufsgebühr</div><p>nach voller Qualifikation bis 31.12.2027</p><div class="km24SellerFounderProgress"><span><i style="width:${pct}%"></i></span><small>${used.toLocaleString('de-CH')} / ${limit.toLocaleString('de-CH')} Kandidaturen · ${confirmed} bestätigt</small></div></aside>
  </section>
  <section class="km24SellerFacts"><article><span>⚡</span><b>In wenigen Schritten online</b><p>Kategorie, Fotos, Angaben, Preis und Standort – fertig.</p></article><article><span>💬</span><b>Direkter Kontakt</b><p>Interessenten schreiben dir direkt über KaufMich24.</p></article><article><span>🔨</span><b>Mehrere Verkaufsarten</b><p>Fixpreis, Verhandlungsbasis, Auktion oder kostenlos abgeben.</p></article><article><span>🇨🇭</span><b>Für die Schweiz</b><p>Lokal verkaufen oder Käufer in der ganzen Schweiz erreichen.</p></article></section>
  <section class="km24SellerFounderExplain"><div><span class="km24SellerSectionKicker">FRÜH DABEI SEIN</span><h2>So funktioniert die Gründer-Aktion</h2><p>Ein echtes öffentliches Verkaufsinserat startet deine Qualifikationszeit. Kurze Fake- oder Testinserate zählen nicht.</p></div><div class="km24SellerFounderSteps"><article><span>1</span><div><b>Inserat veröffentlichen</b><p>Registrieren, Verkaufsprofil vervollständigen und ein echtes Angebot online stellen.</p></div></article><article><span>2</span><div><b>CHF 10 erste Stufe</b><p>Nach 14 qualifizierten Tagen werden 1’000 Punkte = CHF 10 Plattformguthaben freigeschaltet.</p></div></article><article><span>3</span><div><b>Voller Gründer-Status</b><p>Nach 30 Tagen oder früher nach einem erfolgreichen Verkauf: weitere CHF 20 und 0 % Verkaufsgebühr bis Ende 2027.</p></div></article></div></section>
  <section class="km24SellerCompare"><div><span class="km24SellerSectionKicker">WARUM JETZT STARTEN?</span><h2>Für private Verkäufer und Händler.</h2><p>Nutze KaufMich24 als zusätzlichen Schweizer Verkaufskanal, ohne deinen bisherigen Kanal aufgeben zu müssen.</p></div><div class="km24SellerCompareGrid"><article><b>Normale Inserate</b><strong>CHF 0</strong><p>während der Startphase. Optionale Promotions können kostenpflichtig sein.</p></article><article><b>Gründer-Verkäufer</b><strong>0 %</strong><p>Verkaufsgebühr nach voller Qualifikation bis 31.12.2027.</p></article><article><b>Verkaufsmöglichkeiten</b><strong>4</strong><p>Fixpreis, Verhandelbar, Auktion und Verschenken.</p></article></div></section>
  <section class="km24SellerSafety"><div><span>🛡️</span><div><b>Vertrauen ohne unnötige Hürden</b><p>Für Kaufen und Verkaufen werden bestätigte E-Mail, Mobilnummer und Wohnadresse verlangt.</p></div></div><div><span>🔎</span><div><b>Gesuche bringen zusätzliche Chancen</b><p>Nutzer können veröffentlichen, was sie suchen. Passende Angebote lassen sich dadurch schneller finden.</p></div></div></section>
  <section class="km24SellerFinal"><div><span>NOCH ${left.toLocaleString('de-CH')} GRÜNDERPLÄTZE VERFÜGBAR</span><h2>Dein erstes Inserat kann heute online sein.</h2><p>Starte kostenlos und nutze KaufMich24 als zusätzlichen Verkaufskanal.</p></div><a class="btn primary" data-seller-cta href="${ctaHref}">${ctaText} →</a></section>
 </div></main>`;
 try{window.km24FounderTrack&&window.km24FounderTrack('founder_view')}catch(_){}
 document.querySelectorAll('[data-seller-cta]').forEach(function(a){a.addEventListener('click',function(){try{window.km24FounderTrack&&window.km24FounderTrack('founder_cta_click')}catch(_){}})});
}

function route(){

   var h=(location.hash||'#/').split('?')[0],b=document.body;if(!b)return;
   ['km24UltraHome','km24UltraSell','km24UltraDetail','km24UltraAccount','km24UltraAdmin','km24UltraMessages'].forEach(function(c){b.classList.remove(c)});
   if(h==='#/'||h==='')b.classList.add('km24UltraHome');
   else if(h==='#/sell')b.classList.add('km24UltraSell');
   else if(h.indexOf('#/listing/')===0)b.classList.add('km24UltraDetail');
   else if(h==='#/me')b.classList.add('km24UltraAccount');
   else if(h.indexOf('#/admin')===0)b.classList.add('km24UltraAdmin');
   else if(h==='#/messages')b.classList.add('km24UltraMessages');
 }
 function homeExtras(){
   if((location.hash||'#/').split('?')[0]!=='#/')return;
   var hero=document.querySelector('.km24HomeHero');if(!hero)return;
   var copy=hero.querySelector('.km24HomeHeroCopy');
   if(copy&&!copy.querySelector('.km24UltraHeroBadge')){
      var badge=document.createElement('div');badge.className='km24UltraHeroBadge';badge.innerHTML='⚡ SCHNELL · SICHER · SCHWEIZERISCH';
      var old=copy.querySelector('.km24HeroEyebrow');if(old)old.insertAdjacentElement('afterend',badge);else copy.prepend(badge);
   }
   if(!document.querySelector('.km24UltraRibbon')){
      var r=document.createElement('div');r.className='km24UltraRibbon';
      r.innerHTML='<div class="km24UltraRibbonItem"><i>🇨🇭</i><span><b>Schweizer Marktplatz</b><small>Lokal kaufen & verkaufen</small></span></div><div class="km24UltraRibbonItem"><i>⚡</i><span><b>Schnell inseriert</b><small>In wenigen Schritten online</small></span></div><div class="km24UltraRibbonItem"><i>🔨</i><span><b>Auktionen</b><small>Mitbieten & entdecken</small></span></div><div class="km24UltraRibbonItem"><i>🛡️</i><span><b>Mehr Vertrauen</b><small>Profile & klare Regeln</small></span></div>';
      hero.insertAdjacentElement('afterend',r);
   }
 }
 function run(){route();homeExtras()}
 addEventListener('hashchange',function(){setTimeout(run,30);setTimeout(run,220)});addEventListener('pageshow',function(){setTimeout(run,30)});
 var app=document.getElementById('app');if(app&&window.MutationObserver)new MutationObserver(function(){setTimeout(run,40)}).observe(app,{childList:true,subtree:true});
 run();setTimeout(run,300);
})();
