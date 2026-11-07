
const db=supabase.createClient('https://aaqqcnrnrvybboirrrtd.supabase.co','sb_publishable_pA-qtySDeZreM_0CQyIKYg_UaT1Bw8S'),app=document.getElementById('app');let user=null,profile=null,cats=[],listings=[],filter='all',query='',recovery=false,marketSearchPreset=null;
const E=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),F=v=>new Intl.NumberFormat((window.km24Locale?window.km24Locale():'de-CH'),{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(v||0)),D=v=>{if(!v)return '–';try{return new Intl.DateTimeFormat((window.km24Locale?window.km24Locale():'de-CH'),{dateStyle:'medium',timeStyle:'short'}).format(new Date(v))}catch(_){try{return new Intl.DateTimeFormat((window.km24Locale?window.km24Locale():'de-CH'),{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(v))}catch(__){return new Date(v).toLocaleString()}}},N=(t,e)=>'<div class="notice '+(e?'err':'')+'">'+E(t)+'</div>',IMG=p=>db.storage.from('listing-images').getPublicUrl(p).data.publicUrl,L=t=>({fixed:'Fixpreis',negotiable:'Verhandelbar',free:'Verschenken',auction:'Auktion',on_request:'Preis auf Anfrage'}[t]||t);
function go(h){
 try{window.scrollTo(0,0)}catch(e){}
 if(typeof h==="string"&&h.startsWith("#/listing/")){let id=h.split("/")[2]||"";if(id){location.href="/listing/"+encodeURIComponent(id);return}}
 if(location.hash===h){try{route()}catch(e){};setTimeout(()=>{try{window.scrollTo(0,0)}catch(e){}},40);return}
 location.hash=h;
 setTimeout(()=>{try{window.scrollTo(0,0)}catch(e){}},40)
}function goNotifications(){go(user?'#/notifications':'#/login')}async function refreshNotificationBadge(){let b=document.getElementById("notifyBadge");if(!b)return;if(!user){b.textContent="0";b.classList.remove("show");return}let r=await db.rpc("unread_notification_count");let n=Number(r.data||0);b.textContent=n>99?"99+":String(n);b.classList.toggle("show",n>0);if(window.refreshMessageBadge)await window.refreshMessageBadge(true)}function contactReady(){return !!(user?.email_confirmed_at&&/^\+[1-9][0-9]{7,14}$/.test(profile?.phone||'')&&profile?.address_confirmed_at&&String(profile?.street_address||'').trim()&&String(profile?.postal_code||'').trim()&&String(profile?.city||'').trim())}function buyerReady(){return contactReady()}function sellerReady(){return contactReady()}function goSell(){go(user?'#/create':'#/login?next=create')}function goMe(){return go(user?'#/me':'#/login')}function goMessages(){go(user?'#/messages':'#/login')}function ptxt(l,s){if(l.price_type==='free')return'Gratis';if(l.price_type==='auction')return s&&s.highest_bid_chf!=null?'CHF '+F(s.highest_bid_chf):'ab CHF '+F(l.auction_start_price_chf||l.price_chf);if(l.price_type==='negotiable')return'CHF '+F(l.price_chf)+' VB';return l.price_type==='on_request'?'Preis auf Anfrage':'CHF '+F(l.price_chf)}
async function loadProfile(){let previousProfile=profile&&profile.id===user?.id?profile:null;if(user){let r=await db.from('profiles').select('*').eq('id',user.id).maybeSingle();if(r.error&&!previousProfile){await new Promise(function(resolve){setTimeout(resolve,250)});r=await db.from('profiles').select('*').eq('id',user.id).maybeSingle()}profile=r.data||previousProfile||null}else profile=null;{let b=document.getElementById('meBtn'),t=profile?(profile.business_name||profile.display_name||'Mein Konto'):(user?'Mein Konto':'Anmelden');b.textContent=t;b.title=t}await refreshNotificationBadge();if(window.refreshMessageBadge)await window.refreshMessageBadge(true)}
async function init(){recovery=new URLSearchParams(location.search).get('recovery')==='1'||location.hash.includes('type=recovery');let s=await db.auth.getSession();if(s&&s.error){await new Promise(function(resolve){setTimeout(resolve,350)});s=await db.auth.getSession();if(s&&s.error){try{await db.auth.signOut({scope:'local'})}catch(_){}s={data:{session:null},error:null}}}user=s&&s.data&&s.data.session?s.data.session.user:null;let c=await db.from('categories').select('*').eq('is_active',true).order('sort_order');cats=c.data||[];await loadProfile();try{if(user&&user.email_confirmed_at&&localStorage.getItem('km24_signup_pending')==='1'){localStorage.removeItem('km24_signup_pending');location.hash='#/welcome'}}catch(_){}db.auth.onAuthStateChange(async(e,s)=>{user=s&&s.user?s.user:null;if(e==='PASSWORD_RECOVERY'){recovery=true;resetView();return}await loadProfile();setTimeout(km24PromptOAuthResidency,260)});addEventListener('hashchange',()=>{try{window.scrollTo(0,0)}catch(e){};requestAnimationFrame(()=>{try{window.scrollTo(0,0)}catch(e){}})});addEventListener('hashchange',route);route();setTimeout(km24PromptOAuthResidency,400);try{window.km24ReleaseInitialBoot&&window.km24ReleaseInitialBoot()}catch(_){document.documentElement.classList.remove('km24AppBoot')}}

function startPage(){
  const roots=(typeof marketCategoryRoots==="function"?marketCategoryRoots():[]).slice(0,6);
  const mainCta=user?"#/create":"#/login?signup=1";
  const mainText=user?"Inserat erstellen":"Kostenlos inserieren";
  const categoryHtml=roots.map(function(c){
    return '<a class="km24StartCategory" href="#/category/'+encodeURIComponent(c.slug)+'"><span>'+E(c.icon||"📦")+'</span><b>'+E(c.name_de)+'</b><small>Angebote entdecken</small></a>'
  }).join("");
  app.innerHTML=
   '<main class="km24StartPage">'+
    '<section class="km24StartHero"><div class="wrap km24StartHeroGrid">'+
      '<div class="km24StartHeroCopy">'+
        '<span class="km24StartEyebrow">🇨🇭 SCHWEIZER MARKTPLATZ · EINFACH STARTEN</span>'+
        '<h1>Einfach kaufen und verkaufen.<br><span>Kostenlos inserieren.</span></h1>'+
        '<p>Entdecke Angebote aus der Schweiz, erstelle dein Inserat in wenigen Schritten und verkaufe direkt oder per Auktion. Das Inserieren ist in der Startphase kostenlos.</p>'+
        (!user?'<div class="km24StartAdBenefits"><span>🎁 <b>Bis zu 3\'000 Startpunkte</b><small>für die ersten 500 registrierten Nutzer</small></span><span>⚡ <b>Einfach verkaufen</b><small>Inserate in wenigen Schritten erstellen</small></span></div>':'')+
        '<div class="km24StartActions"><a class="btn primary km24StartPrimary km24AdSignupCta" href="'+mainCta+'">'+(user?mainText:'Kostenlos inserieren')+' →</a><a class="btn km24StartSecondary" href="#/">Erst Marktplatz ansehen</a></div>'+
        '<div class="km24StartTrustRow"><span>✓ Kostenlos inserieren</span><span>✓ Auktionen und Direktverkauf</span><span>✓ Schweizer Marktplatz</span></div>'+
      '</div>'+
      '<aside class="km24StartBonus">'+
        '<div class="km24StartBonusIcon">🎁</div>'+
        '<small>STARTAKTION</small><h2>Bis zu 3\'000 Punkte</h2>'+
        '<p>Früh registrieren lohnt sich. Die Startpunkte kannst du auf KaufMich24 für Plattformgebühren und Vorteile einsetzen.</p>'+
        '<div class="km24StartTiers">'+
          '<div><b>1.–100. Nutzer</b><strong>3\'000 Punkte</strong></div>'+
          '<div><b>101.–300. Nutzer</b><strong>1\'500 Punkte</strong></div>'+
          '<div><b>301.–500. Nutzer</b><strong>1\'000 Punkte</strong></div>'+
        '</div>'+
        '<div class="km24StartPointNote"><b>100 Punkte = CHF 1 Plattformguthaben</b><span>Keine Barauszahlung. Gültig gemäss den KaufMich24-Punkteregeln.</span></div>'+
      '</aside>'+
    '</div></section>'+
    '<section class="wrap km24StartSection">'+
      '<div class="km24StartSectionHead"><span>WARUM KAUFMICH24?</span><h2>Mehr als nur Kleinanzeigen.</h2><p>Eine Plattform für unterschiedliche Arten zu kaufen, zu verkaufen und Aufträge zu vergeben.</p></div>'+
      '<div class="km24StartFeatureGrid">'+
        '<article><i>🏷️</i><b>Fixpreis & Verhandelbar</b><p>Verkaufe direkt zum Festpreis oder lass Interessenten Angebote machen.</p></article>'+
        '<article><i>🔨</i><b>Echte Auktionen</b><p>Lege Laufzeit und Startpreis fest und lass Käufer bieten.</p></article>'+
        '<article><i>🔎</i><b>Gesuche</b><p>Du findest etwas nicht? Erstelle ein Gesuch und lass passende Verkäufer reagieren.</p></article>'+
        '<article><i>🛠️</i><b>Dienstleistungen</b><p>Services anbieten, Aufträge ausschreiben und strukturierte Offerten erhalten.</p></article>'+
      '</div>'+
    '</section>'+
    '<section class="km24StartDark"><div class="wrap km24StartSection">'+
      '<div class="km24StartSectionHead"><span>ENTDECKEN</span><h2>Was suchst du heute?</h2><p>Direkt in eine Kategorie springen oder den ganzen Marktplatz öffnen.</p></div>'+
      '<div class="km24StartCategoryGrid">'+(categoryHtml||'<a class="km24StartCategory" href="#/"><span>🛍️</span><b>Marktplatz</b><small>Jetzt entdecken</small></a>')+'</div>'+
      '<div class="km24StartCenter"><a class="btn km24StartSecondary" href="#/">Alle Inserate ansehen →</a></div>'+
    '</div></section>'+
    '<section class="wrap km24StartSection">'+
      '<div class="km24StartSafe">'+
        '<div><span class="km24StartEyebrow">ZU DEINER SICHERHEIT</span><h2>Vertrauen gehört zum Marktplatz dazu.</h2><p>KaufMich24 kombiniert Verifizierung, geschützte Kontaktfunktionen und Nutzerfeedback, damit Kaufen und Verkaufen übersichtlicher und sicherer wird.</p></div>'+
        '<div class="km24StartSafeGrid"><span>🛡️ <b>Schutzmechanismen</b><small>Kontaktdaten werden nicht unnötig öffentlich gezeigt.</small></span><span>✓ <b>Verifizierung</b><small>Verifizierungsstatus schafft zusätzliche Orientierung.</small></span><span>💬 <b>Feedback</b><small>Nutzer können Rückmeldungen zur Plattform geben.</small></span></div>'+
      '</div>'+
    '</section>'+
    '<section class="wrap km24StartFinal"><div><span>🇨🇭 KAUFMICH24</span><h2>Sei von Anfang an dabei.</h2><p>Registriere dich kostenlos, sichere dir deinen Startbonus und stelle dein erstes Angebot online.</p></div><a class="btn primary km24StartPrimary" href="'+mainCta+'">'+mainText+' →</a></section>'+
   '</main>';
  try{window.scrollTo(0,0)}catch(_){}
  try{document.querySelectorAll('.km24AdSignupCta').forEach(function(a){a.addEventListener('click',function(){try{window.km24Track&&window.km24Track('signup_cta_click')}catch(_){}})})}catch(_){}
  setTimeout(async function(){
    try{
      const r=await db.from("listings").select("id",{count:"exact",head:true}).eq("status","active");
      const el=document.getElementById("km24StartLiveCount");
      if(el&&!r.error&&Number.isFinite(Number(r.count)))el.textContent=Number(r.count)+" aktive Inserate";
    }catch(_){}
  },0)
}

function goSearchBottom(){function openSearch(){let q=document.getElementById("q"),p=q?.closest(".marketSearchPanel")||q?.closest("section")||document.getElementById("latestSection");try{p?.scrollIntoView({behavior:"smooth",block:"start"})}catch(_){}setTimeout(()=>{try{q?.focus({preventScroll:true})}catch(_){try{q?.focus()}catch(__){}}},180)}if((location.hash||"#/")==="#/")openSearch();else{go("#/");setTimeout(openSearch,420)}}function refreshMobileNav(){let h=location.hash||"#/";document.querySelectorAll(".km24BottomNav [data-nav]").forEach(x=>x.classList.remove("active"));let key=h.startsWith("#/messages")?"messages":h.startsWith("#/sell")||h.startsWith("#/verification?next=sell")?"sell":h.startsWith("#/buyer")?"favorites":h.startsWith("#/me")||h.startsWith("#/login")?"account":h==="#/"?"home":null;if(key)document.querySelector('.km24BottomNav [data-nav="'+key+'"]')?.classList.add("active")}const KM24_TERMS_VERSION="2026-10-28",KM24_PRIVACY_VERSION="2026-10-28";
function legalCurrent(){return !!(profile&&profile.terms_version===KM24_TERMS_VERSION&&profile.terms_accepted_at&&profile.privacy_version===KM24_PRIVACY_VERSION&&profile.privacy_acknowledged_at&&profile.age18_confirmed_at)}
function legalAcceptancePage(){
 if(!user)return go("#/login");
 app.innerHTML='<div class="wrap formPage"><div class="panel" style="max-width:760px;margin:32px auto"><span class="badge">Rechtliche Bestätigung</span><h1 style="margin-top:10px">Kurz bestätigen, dann geht es weiter</h1><p class="mut">Wir haben die rechtlichen Grundlagen von KaufMich24 aktualisiert. Bestehende Konten bestätigen die aktuelle Fassung einmalig.</p><div style="display:grid;gap:12px;margin:20px 0"><label style="display:flex;gap:10px;align-items:flex-start"><input id="legalAge" type="checkbox" style="width:auto;margin-top:4px"><span><b>Ich bin mindestens 18 Jahre alt.</b><br><small class="mut">KaufMich24 ist für volljährige Nutzer vorgesehen.</small></span></label><label style="display:flex;gap:10px;align-items:flex-start"><input id="legalTerms" type="checkbox" style="width:auto;margin-top:4px"><span>Ich akzeptiere die <a href="#/terms">AGB</a> (Stand 28.10.2026).</span></label><label style="display:flex;gap:10px;align-items:flex-start"><input id="legalPrivacy" type="checkbox" style="width:auto;margin-top:4px"><span>Ich habe die <a href="#/privacy">Datenschutzerklärung</a> (Stand 28.10.2026) zur Kenntnis genommen.</span></label></div><div class="notice"><b>Nachweisbar gespeichert:</b> KaufMich24 protokolliert Version und Zeitpunkt dieser Bestätigung am Konto.</div><button class="btn primary" id="legalAccept" style="width:100%;margin-top:14px">Bestätigen & weiter</button><button class="btn" id="legalLogout" style="width:100%;margin-top:8px">Abmelden</button><div id="legalMsg"></div></div></div>';
 const btn=document.getElementById("legalAccept"),msg=document.getElementById("legalMsg");
 btn.onclick=async()=>{
  if(!document.getElementById("legalAge").checked||!document.getElementById("legalTerms").checked||!document.getElementById("legalPrivacy").checked){msg.innerHTML=N("Bitte bestätige alle drei Punkte.",1);return}
  btn.disabled=true;btn.textContent="Wird gespeichert …";
  let r=await db.rpc("accept_current_legal");
  if(r.error){msg.innerHTML=N(r.error.message,1);btn.disabled=false;btn.textContent="Bestätigen & weiter";return}
  await loadProfile();
  let next=sessionStorage.getItem("km24LegalNext")||"#/";
  sessionStorage.removeItem("km24LegalNext");
  go(next==="#/legal-update"?"#/":next)
 };
 document.getElementById("legalLogout").onclick=async()=>{await db.auth.signOut({scope:'local'});user=null;profile=null;sessionStorage.removeItem("km24LegalNext");go("#/login")}
}


function businessPage(){
 const isBusiness=!!(user&&profile&&(profile.account_type==='dealer'||profile.account_type==='business'));
 const primaryHref=isBusiness?'#/me':(user?'#/support':'#/login?signup=1&account=dealer');
 const primaryText=isBusiness?'Firmenkonto öffnen':(user?'Firmenkonto anfragen':'Kostenloses Firmenprofil erstellen');
 const secondaryHref=isBusiness?'#/create':'#/';
 const secondaryText=isBusiness?'Inserat erstellen':'Marktplatz ansehen';
 document.body?.classList.remove('km24StartActive');
 app.innerHTML=`
 <style id="km24-business-page-v1">
 .km24BizPage{padding:34px 0 58px;color:#e7eee9;background:linear-gradient(180deg,#111713 0,#0b0f0c 58%,#111713 100%);min-height:70vh}
 .km24BizHero{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(290px,.75fr);gap:24px;align-items:stretch}
 .km24BizHeroMain,.km24BizHeroCard,.km24BizCard,.km24BizStep,.km24BizFinal{border:1px solid rgba(255,255,255,.08);background:linear-gradient(145deg,rgba(28,37,31,.97),rgba(14,20,16,.97));box-shadow:0 20px 60px rgba(0,0,0,.18)}
 .km24BizHeroMain{padding:34px;border-radius:26px;background:radial-gradient(circle at 92% 8%,rgba(54,210,103,.18),transparent 32%),linear-gradient(145deg,#19261e,#101612)}
 .km24BizEyebrow{display:inline-flex;align-items:center;gap:7px;padding:7px 10px;border-radius:999px;background:rgba(63,210,107,.10);border:1px solid rgba(76,222,116,.16);color:#88e9a2;font-size:11px;font-weight:900;letter-spacing:.08em}
 .km24BizHero h1{margin:15px 0 12px;font-size:clamp(34px,5vw,62px);line-height:.98;letter-spacing:-.04em}
 .km24BizHero h1 span{color:#64dc85}
 .km24BizLead{max-width:720px;margin:0;color:#a9b6ae;font-size:17px;line-height:1.6}
 .km24BizActions{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px}.km24BizActions .btn{min-height:46px;display:inline-flex;align-items:center;justify-content:center;text-decoration:none!important}
 .km24BizHeroCard{border-radius:26px;padding:26px;display:flex;flex-direction:column;justify-content:center}
 .km24BizHeroCard small{color:#78df96;font-weight:900;letter-spacing:.09em}.km24BizHeroCard strong{font-size:32px;margin:7px 0}.km24BizHeroCard p{margin:0 0 16px;color:#93a299;line-height:1.5}.km24BizPills{display:flex;flex-wrap:wrap;gap:7px}.km24BizPills span{padding:7px 9px;border-radius:999px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);font-size:11px;color:#b7c3bc}
 .km24BizSection{padding-top:42px}.km24BizHead{max-width:760px;margin-bottom:17px}.km24BizHead small{color:#70dd90;font-weight:900;letter-spacing:.1em}.km24BizHead h2{margin:5px 0 8px;font-size:clamp(25px,4vw,38px)}.km24BizHead p{margin:0;color:#8f9c94;line-height:1.55}
 .km24BizGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.km24BizCard{border-radius:19px;padding:20px}.km24BizCard i{font-style:normal;font-size:27px}.km24BizCard b{display:block;margin:12px 0 6px;font-size:16px}.km24BizCard p{margin:0;color:#89978e;font-size:13px;line-height:1.5}
 .km24BizSteps{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.km24BizStep{padding:20px;border-radius:19px}.km24BizStep span{display:grid;place-items:center;width:34px;height:34px;border-radius:11px;background:#1a8f4b;color:white;font-weight:950}.km24BizStep b{display:block;margin:12px 0 5px}.km24BizStep p{margin:0;color:#89978e;font-size:13px;line-height:1.5}
 .km24BizFuture{margin-top:14px;padding:16px 18px;border-radius:17px;border:1px dashed rgba(103,220,136,.22);background:rgba(49,135,73,.08);color:#a9b6ae;font-size:13px;line-height:1.5}.km24BizFuture b{color:#c9f3d5}
 .km24BizFinal{margin-top:42px;padding:26px;border-radius:23px;display:flex;align-items:center;justify-content:space-between;gap:18px}.km24BizFinal h2{margin:0 0 6px}.km24BizFinal p{margin:0;color:#8f9c94}.km24BizFinal .btn{text-decoration:none!important;white-space:nowrap}
 @media(max-width:800px){.km24BizPage{padding-top:18px}.km24BizHero{grid-template-columns:1fr}.km24BizHeroMain,.km24BizHeroCard{padding:22px;border-radius:20px}.km24BizGrid,.km24BizSteps{grid-template-columns:1fr}.km24BizFinal{align-items:flex-start;flex-direction:column}.km24BizFinal .btn{width:100%}.km24BizLead{font-size:15px}}
 </style>
 <main class="km24BizPage"><div class="wrap">
   <section class="km24BizHero">
     <div class="km24BizHeroMain">
       <span class="km24BizEyebrow">🏪 KAUFMICH24 FÜR UNTERNEHMEN</span>
       <h1>Mehr Sichtbarkeit für <span>dein Unternehmen.</span></h1>
       <p class="km24BizLead">Präsentiere Fahrzeuge, Produkte und Dienstleistungen auf einem Schweizer Marktplatz. Mit eigenem Firmenprofil, zentraler Inserateverwaltung und direktem Kontakt zu Interessenten.</p>
       <div class="km24BizActions"><a class="btn primary" href="${primaryHref}">${primaryText} →</a><a class="btn" href="${secondaryHref}">${secondaryText}</a>${isBusiness?'<a class="btn" href="#/foto-massenimport">📸 Foto-Massenimport</a>':''}</div>
     </div>
     <aside class="km24BizHeroCard"><small>KOSTENLOSE STARTPHASE</small><strong>Gebührenfrei starten</strong><p>Normale Inserate sind während der Startphase gebührenfrei. Optionale Promotions bleiben freiwillig.</p><div class="km24BizPills"><span>🇨🇭 Schweizer Fokus</span><span>🏪 Firmenprofil</span><span>💬 Direkte Anfragen</span></div></aside>
   </section>

   <section class="km24BizSection"><div class="km24BizHead"><small>FÜR HÄNDLER & FIRMEN</small><h2>Ein Auftritt, der nach Unternehmen aussieht.</h2><p>Firmenkonten sind klar von Privatkonten getrennt und können Unternehmensdaten direkt im Profil hinterlegen.</p></div>
     <div class="km24BizGrid">
       <article class="km24BizCard"><i>🏢</i><b>Professionelles Firmenprofil</b><p>Firmenname, UID, Website, Adresse, Beschreibung und Unternehmensauftritt an einem Ort.</p></article>
       <article class="km24BizCard"><i>📦</i><b>Inserate zentral verwalten</b><p>Aktive, pausierte und verkaufte Angebote im Firmenkonto bearbeiten, reaktivieren und hervorheben.</p></article>
       <article class="km24BizCard"><i>✓</i><b>Verifizierung & Vertrauen</b><p>Verifizierungsstatus und Händlerkennzeichnung helfen Käufern, gewerbliche Anbieter schnell zu erkennen.</p></article>
       <article class="km24BizCard"><i>🚗</i><b>Für viele Branchen</b><p>Geeignet für Autohäuser, Möbel, Elektronik, Maschinen, Zweiräder, Handel und weitere gewerbliche Anbieter.</p></article>
       <article class="km24BizCard"><i>🛠️</i><b>Produkte & Dienstleistungen</b><p>Nicht nur Waren: Unternehmen können auch Dienstleistungen passend zu den vorhandenen Kategorien anbieten.</p></article>
       <article class="km24BizCard"><i>📣</i><b>Optionale Promotion</b><p>Top-Inserate und Startseiten-Boosts können bei Bedarf zusätzliche Reichweite bringen.</p></article>
     </div>
   </section>

   <section class="km24BizSection"><div class="km24BizHead"><small>SO GEHT'S</small><h2>In drei Schritten starten.</h2></div><div class="km24BizSteps">
     <article class="km24BizStep"><span>1</span><b>Firmenkonto registrieren</b><p>Bei der Registrierung „Firmenprofil“ wählen und den Firmennamen hinterlegen.</p></article>
     <article class="km24BizStep"><span>2</span><b>Profil vervollständigen</b><p>UID, Website, Firmenadresse und Beschreibung ergänzen, damit Interessenten das Unternehmen einordnen können.</p></article>
     <article class="km24BizStep"><span>3</span><b>Angebote veröffentlichen</b><p>Inserate einstellen, Anfragen erhalten und den Bestand direkt über KaufMich24 verwalten.</p></article>
   </div><div class="km24BizFuture"><b>Nächster Ausbau für grössere Händler:</b> Massenimport per CSV/Excel, erweiterte Händlerstatistiken und mehrere Mitarbeiter pro Firmenkonto sind die nächsten sinnvollen Ausbaustufen.</div></section>

   <section class="km24BizFinal"><div><h2>Bereit für dein Firmenprofil?</h2><p>Jetzt kostenlos starten und KaufMich24 als zusätzlichen Verkaufskanal testen.</p></div><a class="btn primary" href="${primaryHref}">${primaryText} →</a></section>
 </div></main>`;
}

async function founderPage(){
 let pr=await db.rpc("founder_seller_progress"),prog=(pr.data||[])[0]||{total_qualified:0,seller_limit:1000,enabled:true},st=null;
 if(user){try{let sr=await db.rpc("my_founder_seller_status");st=(sr.data||[])[0]||null}catch(_){}}
 let confirmed=Number(prog.total_qualified||0),pending=Number((await db.rpc('founder_seller_pending_count')).data||0),used=confirmed+pending,limit=Number(prog.seller_limit||1000),left=Math.max(0,limit-used),pct=Math.max(0,Math.min(100,Math.round(used/Math.max(1,limit)*100)));
 let href=!user?'#/login?signup=1&next=sell&founder=1':(sellerReady()?'#/sell?founder=1':'#/verification?next=sell&founder=1'),cta=!user?'Kostenlos registrieren':(sellerReady()?'Erstes Inserat erstellen':'Profil fürs Verkaufen vervollständigen');
 if(st&&(st.status==='candidate'||st.status==='qualified')){href=st.qualifying_listing_id?'#/listing/'+st.qualifying_listing_id:'#/me';cta=st.qualifying_listing_id?'Inserat ansehen':'Meine Inserate'}
 let founderFinalTitle=(st&&st.status==='candidate')?'Gründerplatz läuft – Qualifikation aktiv.':((st&&st.status==='qualified')?'Gründerplatz gesichert.':'Jetzt Gründerplatz sichern.');
 let founderFinalText=(st&&st.status==='candidate')?'Dein Inserat ist online und deine Gründer-Qualifikationszeit läuft bereits.':((st&&st.status==='qualified')?'Dein Gründer-Status ist aktiv. Deine Vorteile sind freigeschaltet.':'Je früher dein echtes Inserat online ist, desto früher beginnt deine Qualifikationszeit.');
 let secondaryHref=(st&&(st.status==='candidate'||st.status==='qualified'))?'#/me':'#/fees';
 let secondaryCta=(st&&(st.status==='candidate'||st.status==='qualified'))?'Meine Inserate':'Gebühren ansehen';
 let status='';
 if(!user){status='<div class="km24FounderStatus wait"><b>Dein Weg zum Gründer-Status</b><span>Registrieren und ein echtes öffentliches Verkaufsinserat veröffentlichen. Test- und gelöschte Inserate zählen nicht.</span></div>'}
 else if(st&&st.status==='qualified'){status='<div class="km24FounderStatus good"><b>🏆 Gründer-Verkäufer #'+E(st.founder_rank||'')+'</b><span>Deine Gründer-Vorteile sind aktiv: CHF 30 Plattformguthaben und 0 % Verkaufsgebühr bis 31.12.2027.</span></div>'}
 else if(st&&st.status==='candidate'){
   let d=Math.max(0,Math.floor((Date.now()-new Date(st.candidate_at).getTime())/86400000)),first=!!st.first_bonus_awarded_at;
   status='<div class="km24FounderStatus candidate"><b>🎉 Inserat erfolgreich veröffentlicht!</b><span>Deine Gründer-Qualifikation ist aktiv. Inserat seit '+d+' Tag'+(d===1?'':'en')+'. '+(first?'CHF 10 Guthaben sind bereits freigeschaltet.':'Noch '+Math.max(0,Number(st.first_bonus_after_days||14)-d)+' Tag(e) bis zur ersten CHF-10-Stufe.')+' Nach 30 Tagen – oder früher nach einem erfolgreich abgeschlossenen Verkauf – wird der volle Gründer-Status aktiviert.</span></div>'
 } else if(user){status='<div class="km24FounderStatus wait"><b>Noch kein Gründer-Kandidat</b><span>Veröffentliche dein erstes echtes Verkaufsinserat, um die Gründer-Aktion zu starten.</span></div>'}
 app.innerHTML=`<main class="km24FounderPage"><div class="wrap">
   <a class="btn km24FounderBack" href="#/">← Zurück zum Marktplatz</a>
   <section class="km24FounderHero">
     <div class="km24FounderHeroCopy"><span class="km24FounderEyebrow">🚀 KAUFMICH24 GRÜNDER-AKTION</span><h1>Die ersten <span>1’000 echten Verkäufer</span> werden Gründer.</h1><p>Stell ein echtes Inserat ein, bleib aktiv und sichere dir bis zu <b>CHF 30 Plattformguthaben</b> sowie nach voller Qualifikation <b>0 % Verkaufsgebühr bis 31.12.2027</b>.</p><div class="km24FounderHeroActions"><a class="btn primary" href="${href}">${cta} →</a><a class="btn" href="${secondaryHref}">${secondaryCta}</a></div></div>
     <div class="km24FounderCounter"><small>GRÜNDERPLÄTZE</small><b>${used.toLocaleString('de-CH')} / ${limit.toLocaleString('de-CH')}</b><div><i style="width:${pct}%"></i></div><span>${pending} in Prüfung · ${confirmed} bestätigt · ${left.toLocaleString('de-CH')} verfügbar</span></div>
   </section>
   ${status}
   <section class="km24FounderSteps"><article><span>1</span><div><b>Echtes Inserat veröffentlichen</b><p>Öffentliches Verkaufsinserat erstellen. Gelöschte Testinserate zählen nicht.</p></div></article><article><span>2</span><div><b>CHF 10 nach erster Stufe</b><p>Bleibt dein Inserat 14 Tage qualifiziert aktiv, erhältst du 1’000 Punkte = CHF 10 Plattformguthaben. Ein erfolgreich abgeschlossener Verkauf kann die Wartezeit verkürzen.</p></div></article><article><span>3</span><div><b>Voller Gründer-Status</b><p>Nach 30 Tagen oder einem erfolgreich abgeschlossenen Verkauf folgen weitere 2’000 Punkte = CHF 20 und 0 % Verkaufsgebühr bis 31.12.2027.</p></div></article></section>
   <section class="km24FounderBenefits"><div><span>🪙</span><b>CHF 30 Guthaben</b><p>3’000 KaufMich24 Punkte insgesamt. 100 Punkte entsprechen CHF 1 Plattformguthaben.</p></div><div><span>0%</span><b>Keine Verkaufsgebühr</b><p>Nach voller Gründer-Qualifikation bis zum 31.12.2027.</p></div><div><span>🏅</span><b>Limitierter Status</b><p>Nur die ersten 1’000 qualifizierten echten Verkäufer erhalten einen Gründerplatz.</p></div></section>
   <section class="km24FounderRules"><h2>Damit die Aktion fair bleibt</h2><p>Ein kurzes Fake-Inserat einstellen und direkt wieder löschen reicht nicht. Es zählt ein echtes öffentliches Verkaufsinserat, das qualifiziert aktiv bleibt, oder ein darüber erfolgreich abgeschlossener Verkauf. Admin- und Testkonten sind ausgeschlossen.</p></section>
   <section class="km24FounderFinal"><div><span>Bereit?</span><h2>${founderFinalTitle}</h2><p>${founderFinalText}</p></div><a class="btn primary" href="${href}">${cta} →</a></section>
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

function welcomePage(){
 if(!user)return go('#/login?signup=1');
 try{if(!sessionStorage.getItem('km24_welcome_tracked')){sessionStorage.setItem('km24_welcome_tracked','1');window.km24Track&&window.km24Track('email_confirmed')}}catch(_){}
 let ready=typeof sellerReady==='function'&&sellerReady();
 let createHref=ready?'#/create':'#/verification?next=create';
 let wantedHref=ready?'#/wanted/new':'#/verification?next=wanted';
 app.innerHTML='<div class="wrap formPage"><div class="panel" style="max-width:760px;margin:22px auto"><div style="font-size:42px">🎉</div><h1 style="margin:8px 0">Willkommen bei KaufMich24!</h1><p class="mut">Deine E-Mail ist bestätigt. Was möchtest du als Nächstes tun?</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin-top:18px"><a class="btn primary" style="padding:18px;text-decoration:none;text-align:center" href="'+createHref+'">🏷️<br><b>Inserat erstellen</b><br><small>Etwas verkaufen oder versteigern</small></a><a class="btn" style="padding:18px;text-decoration:none;text-align:center" href="#/">🔎<br><b>Marktplatz entdecken</b><br><small>Angebote ansehen</small></a><a class="btn" style="padding:18px;text-decoration:none;text-align:center" href="'+wantedHref+'">📣<br><b>Gesuch erstellen</b><br><small>Sagen, was du suchst</small></a></div>'+(!ready?'<div class="notice" style="margin-top:16px"><b>Für Kaufen und Verkaufen:</b><br>Mobilnummer und Wohnadresse ergänzt du erst dann, wenn du diese Funktionen nutzen möchtest.</div><a class="btn" style="display:block;margin-top:10px;text-align:center;text-decoration:none" href="#/verification">Konto vervollständigen</a>':'')+'</div></div>'
}

function route(){

refreshMobileNav();if(recovery)return resetView();let qcat=new URLSearchParams(location.search).get('cat');if(qcat)return categoryView(qcat);let h=location.hash||'#/';if(!location.hash){let p;try{p=decodeURIComponent(location.pathname||'/')}catch(e){p=location.pathname||'/'}p=p.replace(/\/+$/,'')||'/';if(p.indexOf('/kategorie/')===0){let s=p.substring('/kategorie/'.length).split('/')[0];if(s)h='#/category/'+encodeURIComponent(s)}else if(p.indexOf('/listing/')===0){let id=p.substring('/listing/'.length).split('/')[0];if(id)h='#/listing/'+encodeURIComponent(id)}else if(p.indexOf('/messages/')===0){let id=p.substring('/messages/'.length).split('/')[0];if(id)h='#/messages/'+encodeURIComponent(id)}else if(p==='/gebuehren')h='#/fees';else if(p==='/hilfe')h='#/support';else if(p==='/agb')h='#/terms';else if(p==='/datenschutz')h='#/privacy';else if(p==='/impressum')h='#/imprint';else if(p==='/entdecken')h='#/';else if(p==='/admin')h='#/admin';if(h!=='#/'&&location.pathname!=='/'&&p.indexOf('/listing/')!==0){try{history.replaceState({},'', '/'+h)}catch(e){}}}document.body?.classList.toggle('km24StartActive',h.startsWith('#/start'));let legalAllowed=h==="#/legal-update"||h==="#/terms"||h==="#/privacy"||h==="#/imprint"||h==="#/prohibited"||h==="#/support"||h==="#/account-delete"||h.startsWith("#/login");if(user&&profile&&!legalCurrent()&&!legalAllowed){sessionStorage.setItem("km24LegalNext",h);return legalAcceptancePage()}if(h==="#/legal-update")return legalAcceptancePage();if(h.startsWith('#/start'))return startPage();if(h==='#/welcome')return welcomePage();if(h==='#/foto-massenimport'){const betaHash=h;const progress=document.createElement('p');progress.textContent='Foto-Massenimport wird geladen …';app.replaceChildren(progress);import('https://aaqqcnrnrvybboirrrtd.supabase.co/functions/v1/kaufmich-photo-bulk-assets/spa-photo-route-bridge.mjs').then(mod=>mod.openPhotoBulkRoute({root:app,client:db,user,profile,navigate:go,isRouteActive:()=>location.hash===betaHash})).catch(()=>{if(location.hash!==betaHash)return;const info=document.createElement('p');info.textContent='Foto-Import konnte nicht geladen werden. Bitte neu laden.';app.replaceChildren(info)});return;}if(h==='#/business')return businessPage();if(h.startsWith('#/listing/'))return detail(h.split('/')[2]);if(h.startsWith('#/edit/'))return editListing(h.split('/')[2]);if(h.startsWith('#/profile/'))return publicProfile(h.split('/')[2]);if(h.startsWith('#/messages/'))return messagesPage(h.split('/')[2]);if(h==='#/messages')return messagesPage();if(h==='#/notifications')return notificationsPage();if(h.startsWith('#/review/'))return transactionReviewPage(h.split('/')[2]);if(h==='#/saved-searches')return savedSearchesPage();if(h==='#/create')return createChoicePage();if(h==='#/wanted')return wantedPage();if(h.startsWith('#/wanted/new'))return wantedForm();if(h.startsWith('#/wanted/edit/'))return wantedForm(h.split('/')[3]);if(h==='#/buyer-activation')return buyerActivationPage();if(h==='#/buyer')return buyerCenter();if(h==='#/sales')return salesCenter();if(h==='#/giveaway')return giveawayPage();if(h==='#/founder')return founderPage();if(h==='#/verkaufen'||h==='#/seller')return sellerLandingPage();if(h==='#/fees')return feesPage();if(h==='#/terms')return termsPage();if(h==='#/privacy')return privacyPage();if(h==='#/account-delete')return accountDeletePage();if(h==='#/imprint')return imprintPage();if(h==='#/prohibited')return prohibitedPage();if(h==='#/feedback')return window.userFeedbackPage?window.userFeedbackPage():home();if(h==='#/support')return supportPage();if(h.startsWith('#/verification'))return verificationPage();if(h==='#/admin')return adminPage();if(h.startsWith('#/category/'))return categoryView(decodeURIComponent(h.split('/')[2]));if(h.startsWith('#/sell'))return sell();if(h.startsWith('#/login'))return login();if(h.startsWith('#/me'))return me();home()}
function marketCategoryRoots(){return cats.filter(c=>!c.parent_slug).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0))}
function marketCategoryName(slug){return (cats.find(c=>c.slug===slug)||{}).name_de||slug||""}
function marketFillSubcategories(selected){
 let root=document.getElementById("scat")?.value||"",sub=document.getElementById("ssub");if(!sub)return;
 let children=cats.filter(c=>c.parent_slug===root).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
 sub.innerHTML='<option value="">Alle Unterkategorien</option>'+children.map(c=>'<option value="'+E(c.slug)+'">'+E(c.name_de)+'</option>').join("");
 sub.disabled=!root||!children.length;
 if(selected&&children.some(c=>c.slug===selected))sub.value=selected
}
function marketFiltersLegacyCore(){
 let num=id=>{let v=document.getElementById(id)?.value;return v===""||v==null?null:Number(v)};
 return{
  query:(document.getElementById("q")?.value||"").trim()||null,
  category_slug:document.getElementById("scat")?.value||null,
  subcategory_slug:document.getElementById("ssub")?.value||null,
  min_price_chf:num("smin"),
  max_price_chf:num("smax"),
  condition:document.getElementById("scond")?.value||null,
  canton:document.getElementById("scanton")?.value||null,
  seller_type:document.getElementById("sseller")?.value||null,
  price_type:document.getElementById("sprice")?.value||null,
  sort:document.getElementById("ssort")?.value||"newest"
 }
}
function marketApplyPresetLegacyCore(p){
 if(!p)return;
 document.getElementById("q").value=p.query_text||p.query||"";
 document.getElementById("scat").value=p.category_slug||"";
 marketFillSubcategories(p.subcategory_slug||"");
 document.getElementById("ssub").value=p.subcategory_slug||"";
 document.getElementById("smin").value=p.min_price_chf??"";
 document.getElementById("smax").value=p.max_price_chf??"";
 document.getElementById("scond").value=p.condition||"";
 document.getElementById("scanton").value=p.canton||"";
 document.getElementById("sseller").value=p.seller_type||"";
 document.getElementById("sprice").value=p.price_type||"";
 document.getElementById("ssort").value=p.sort||"newest"
}
async function runMarketplaceSearchLegacyCore(){
 let g=document.getElementById("grid"),st=document.getElementById("resultStatus");if(!g)return;
 let f=marketFilters();
 if(f.min_price_chf!=null&&f.max_price_chf!=null&&f.min_price_chf>f.max_price_chf){st.innerHTML=N("Der Mindestpreis darf nicht höher als der Höchstpreis sein.",1);return}
 st.textContent="Inserate werden gesucht …";g.innerHTML='<div class="empty" style="grid-column:1/-1">Suche läuft …</div>';
 let r=await db.rpc("search_marketplace_v3",{
  p_query:f.query,p_category_slug:f.category_slug,p_subcategory_slug:f.subcategory_slug,
  p_min_price_chf:f.min_price_chf,p_max_price_chf:f.max_price_chf,p_condition:f.condition,
  p_canton:f.canton,p_seller_type:f.seller_type,p_price_type:f.price_type,p_sort:f.sort,p_limit:100,p_offset:0,p_listing_intent:"offer"
 });
 if(r.error){st.innerHTML=N(r.error.message,1);g.innerHTML="";return}
 let arr=r.data||[],stats={},verified={};
 if(arr.length){
  let auctionIds=arr.filter(x=>x.price_type==="auction").map(x=>x.id),sellerIds=[...new Set(arr.map(x=>x.seller_id))];
  let [sq,pq]=await Promise.all([
   auctionIds.length&&user?db.from("auction_stats").select("*").in("listing_id",auctionIds):Promise.resolve({data:[]}),
   sellerIds.length?db.rpc("seller_cards_public",{p_seller_ids:sellerIds}):Promise.resolve({data:[]})
  ]);
  (sq.data||[]).forEach(x=>stats[x.listing_id]=x);(pq.data||[]).forEach(x=>verified[x.seller_id]=x.is_verified?"verified":null)
 }
 arr.forEach(x=>{x._img=x.image_path?{storage_path:x.image_path,focal_x:x.focal_x,focal_y:x.focal_y,fit_mode:x.fit_mode}:null;x._p={account_type:x.seller_type,business_name:x.seller_name,display_name:x.seller_name,city:x.city,identity_verified_at:null};x._s=stats[x.id]||null});
 listings=arr;query=f.query||"";
 st.textContent=arr.length+(arr.length===1?" Treffer":" Treffer")+" angezeigt";
 g.innerHTML=arr.length?arr.map(card).join(""):'<div class="empty" style="grid-column:1/-1">Keine passenden Inserate gefunden.</div>'
}
async function saveCurrentSearch(){
 if(!user)return go("#/login");
 let f=marketFilters(),suggest=f.query||marketCategoryName(f.subcategory_slug||f.category_slug)||"Meine Suche",name=prompt("Name für diesen Suchauftrag:",suggest);
 if(!name)return;
 let r=await db.rpc("create_saved_search",{
  p_name:name.trim(),p_query_text:f.query,p_category_slug:f.category_slug,p_subcategory_slug:f.subcategory_slug,
  p_min_price_chf:f.min_price_chf,p_max_price_chf:f.max_price_chf,p_condition:f.condition,p_canton:f.canton,
  p_seller_type:f.seller_type,p_price_type:f.price_type,p_notify_on_new:true
 });
 let m=document.getElementById("saveSearchMsg");
 if(r.error)m.innerHTML=N(r.error.message,1);else m.innerHTML=N("Suchauftrag gespeichert. Du wirst bei neuen passenden Inseraten benachrichtigt.")
}

function homeAuctionRemaining(v){
 if(!v)return "";
 let ms=new Date(v)-new Date();
 if(ms<=0)return "Beendet";
 let d=Math.floor(ms/86400000),h=Math.floor(ms%86400000/3600000),m=Math.floor(ms%3600000/60000);
 if(d>0)return d+" T "+h+" Std";
 if(h>0)return h+" Std "+m+" Min";
 return Math.max(1,m)+" Min"
}
async function loadHomeAuctions(){/* public-price-v1 */
 let box=document.getElementById("homeAuctions");
 if(!box)return;
 let r=await db.from("listings").select("*").eq("status","active").eq("price_type","auction").gt("auction_end_at",new Date().toISOString()).order("auction_end_at",{ascending:true}).limit(6);
 if(r.error){box.innerHTML="<div class='km24AuctionEmpty'>Auktionen konnten nicht geladen werden.</div>";return}
 let arr=r.data||[];
 if(!arr.length){
   box.innerHTML="<div class='km24AuctionEmpty'><span>🔨</span><div><b>Noch keine laufenden Auktionen</b><p>Sobald neue Auktionen starten, erscheinen sie hier ganz oben.</p></div></div>";
   return
 }
 let ids=arr.map(x=>x.id),sellers=[...new Set(arr.map(x=>x.seller_id))];
 let [sq,iq,pq]=await Promise.all([
   db.from("auction_stats").select("*").in("listing_id",ids),
   db.from("listing_images").select("listing_id,storage_path,sort_order,focal_x,focal_y,fit_mode").in("listing_id",ids).order("sort_order"),
   db.rpc("seller_cards_public",{p_seller_ids:sellers})
 ]);
 let stats={},imgs={},profiles={};
 (sq.data||[]).forEach(x=>stats[x.listing_id]=x);
 (iq.data||[]).forEach(x=>(imgs[x.listing_id]||(imgs[x.listing_id]=[])).push(x));
 (pq.data||[]).forEach(x=>profiles[x.seller_id]=x);
 box.innerHTML=arr.map(l=>{
   let s=stats[l.id]||{},p=profiles[l.seller_id]||{},images=imgs[l.id]||[],img=images[0]?.storage_path,thumbs=km24ThumbStripHtml(images),
       price=s.highest_bid_chf!=null?"CHF "+F(s.highest_bid_chf):"ab CHF "+F(l.auction_start_price_chf||l.price_chf),
       bids=Number(s.bid_count||0);
   return "<article class='km24AuctionCard' data-listing-id='"+E(l.id)+"' onclick=\"go('#/listing/"+l.id+"')\">"+
     "<div class=\'km24AuctionPic\'>"+(img?"<img class=\'km24CardMainImg\' src=\'"+E(IMG(img))+"\' alt=\'\'>":"<span>📷</span>")+"<div class=\'km24AuctionTimer\'>⏱ "+E(homeAuctionRemaining(l.auction_end_at))+"</div></div>"+thumbs+
     "<div class='km24AuctionBody'><div class='km24AuctionMeta'><span>🔨 Auktion</span><small>"+bids+" Gebot"+(bids===1?"":"e")+"</small></div><h3>"+E(l.title)+"</h3><div class='km24AuctionPrice'>"+E(price)+"</div><div class='km24AuctionFoot'><span>"+E(((l.postal_code||"")+" "+(l.city||"")).trim()||"Schweiz")+"</span><span>"+E(p.display_name||((p.account_type==='dealer'||p.account_type==='business')?'Händler':'Privatperson'))+"</span></div></div>"+
   "</article>"
 }).join("")
}
async function homeLegacyUnused(){
 let roots=marketCategoryRoots(),
     catOptions=roots.map(c=>'<option value="'+E(c.slug)+'">'+E(c.name_de)+'</option>').join(""),
     cantons=["AG","AI","AR","BE","BL","BS","FR","GE","GL","GR","JU","LU","NE","NW","OW","SG","SH","SO","SZ","TG","TI","UR","VD","VS","ZG","ZH"];

 app.innerHTML=[
 '<section class="km24HomeHero"><div class="wrap km24HomeHeroInner"><div class="km24HomeHeroCopy"><div class="km24HeroEyebrow">🍂 Herbst-Special · 🇨🇭 Schweizer Marktplatz</div><h1>Kaufen. Verkaufen. <span>Bieten.</span></h1><p>Finde spannende Angebote, entdecke laufende Auktionen und verkaufe in wenigen Schritten.</p><div class="km24HeroFinder"><div class="km24HeroSearchLine"><span class="km24HeroSearchIcon">⌕</span><input id="q" aria-label="Marktplatz durchsuchen" placeholder="Was suchst du?"><button id="qs" type="button">Suchen</button></div><div class="km24HeroShortcuts"><button type="button" id="homeDiscover">✨ Neueste</button><button type="button" id="homeAuctionShortcut">🔨 Auktionen</button><button type="button" id="homeWantedShortcut">🔎 Gesuche</button></div></div></div><div class="km24HeroStatCard"><span class="km24HeroStatIcon">🔨</span><div><small>Jetzt entdecken</small><b>Laufende Auktionen</b><span>Mitbieten, bevor die Zeit abläuft.</span></div><button class="btn primary" id="homeAuctionJump">Zu den Auktionen</button></div></div></section>',

 '',

 '<section class="km24TrustSection"><div class="wrap"><div class="km24TrustShell"><div class="km24TrustTop"><span class="km24TrustKicker">🛡️ VERTRAUEN & SICHERHEIT</span><h2 class="km24TrustTitle">Sicher kaufen & verkaufen auf KaufMich24</h2><p class="km24TrustLead">Ein Schweizer Marktplatz mit Verifizierung, direkter Kommunikation und klaren Regeln.</p></div><div class="km24TrustGrid"><div class="km24TrustItem"><span class="km24TrustIcon">🇨🇭</span><div><b>Für die Schweiz</b><small>Marktplatz für Käufer und Verkäufer in der Schweiz.</small></div></div><div class="km24TrustItem"><span class="km24TrustIcon">✓</span><div><b>Bestätigte Kontaktdaten</b><small>E-Mail, Mobilnummer und Wohnadresse schaffen klare Grundbestätigungen.</small></div></div><div class="km24TrustItem"><span class="km24TrustIcon">💬</span><div><b>Direkt kommunizieren</b><small>Nachrichten und Angebote direkt über KaufMich24.</small></div></div><div class="km24TrustItem"><span class="km24TrustIcon">🛡️</span><div><b>Klare Gebühren & Support</b><small>Transparent, verständlich und mit Support direkt über KaufMich24.</small></div></div></div><div class="km24TrustBottom"><div class="km24TrustFree"><strong>✓</strong> Normale Inserate sind während der Startphase kostenlos. Optionale Promotions können kostenpflichtig sein.</div><a class="km24TrustLink" href="#/support">Hilfe & Sicherheit →</a></div></div></div></section>',

 '<section class="section km24CategorySection"><div class="wrap"><div class="km24HomeSectionHead"><div><span class="km24SectionKicker">DIREKT EINSTEIGEN</span><h2>Kategorien</h2><p>Alle Kategorien auf einen Blick.</p></div></div><div id="cats" class="cats"></div></div></section>',

 '',

 '<section class="km24FounderHomeBand km24FounderSpotlight"><div class="wrap"><a class="km24FounderHome" href="#/founder"><span class="km24FounderCoin">🚀</span><span class="km24FounderHomeCopy"><small>LIMITIERT · DIE ERSTEN 1’000 ECHTEN VERKÄUFER</small><b>Werde KaufMich24 Gründer-Verkäufer</b><strong>CHF 30 Guthaben + 0 % Verkaufsgebühr bis 31.12.2027</strong><em id="km24FounderProgress">Gründerplätze verfügbar · echtes Inserat erforderlich</em></span><span class="km24FounderHomeCta">Gründer werden →</span></a></div></section>',

 '<section class="km24CompactNav"><div class="wrap km24CompactNavGrid"><a href="#/buyer"><span>🛍️</span><b>Meine Käufe</b></a><a href="#/sales"><span>✓</span><b>Meine Verkäufe</b></a><a href="#/messages"><span>💬</span><b>Nachrichten</b></a><a href="#/saved-searches"><span>🔎</span><b>Suchaufträge</b></a></div></section>',

 '<section class="section km24AuctionSection" id="auctionSection"><div class="wrap"><div class="km24HomeSectionHead"><div><span class="km24SectionKicker">JETZT SPANNEND</span><h2>🔥 Laufende Auktionen</h2><p>Die Auktionen mit der kürzesten Restzeit zuerst.</p></div><button class="btn" id="allAuctionsBtn">Alle Auktionen</button></div><div id="homeAuctions" class="km24AuctionGrid"><div class="km24AuctionSkeleton"></div><div class="km24AuctionSkeleton"></div><div class="km24AuctionSkeleton"></div></div></div></section>',

 '<section class="section km24WantedSection" id="wantedSection"><div class="wrap"><div class="km24HomeSectionHead"><div><span class="km24SectionKicker">🔎 ICH SUCHE</span><h2>Aktuelle Gesuche</h2><p>Nutzer suchen diese Artikel – vielleicht hast du genau das Passende. Passende neue Angebote werden automatisch gemeldet.</p></div><button class="btn" id="allWantedBtn">Alle Gesuche ansehen</button></div><div id="homeWanted" class="grid"><div class="km24AuctionSkeleton"></div><div class="km24AuctionSkeleton"></div><div class="km24AuctionSkeleton"></div><div class="km24AuctionSkeleton"></div></div></div></section>',

 '<section class="section km24LatestSection" id="latestSection"><div class="wrap"><div class="km24HomeSectionHead"><div><span class="km24SectionKicker">NEU AUF KAUFMICH24</span><h2>Neueste Inserate</h2><p>Frisch eingestellte Angebote aus der ganzen Schweiz.</p></div>',
 user?'<a class="btn" href="#/saved-searches">🔔 Suchaufträge</a>':'',
 '</div><details class="km24HomeFilter"><summary>⚙️ Suche & Filter <span>Preis, Kategorie, Zustand, Kanton …</span></summary><div class="marketSearchPanel"><div class="marketSearchGrid">',
 '<label>Hauptkategorie<select id="scat"><option value="">Alle Kategorien</option>'+catOptions+'</select></label>',
 '<label>Unterkategorie<select id="ssub" disabled><option value="">Alle Unterkategorien</option></select></label>',
 '<label>Preis von CHF<input id="smin" type="number" min="0" step=".05" placeholder="0"></label>',
 '<label>Preis bis CHF<input id="smax" type="number" min="0" step=".05" placeholder="beliebig"></label>',
 '<label>Zustand<select id="scond"><option value="">Alle Zustände</option><option value="new">Neu</option><option value="like_new">Wie neu</option><option value="used">Gebraucht</option><option value="defective">Defekt</option></select></label>',
 '<label>Kanton<select id="scanton"><option value="">Ganze Schweiz</option>'+cantons.map(x=>'<option value="'+x+'">'+x+'</option>').join("")+'</select></label>',
 '<label>Verkäufer<select id="sseller"><option value="">Privat & Händler</option><option value="private">Privat</option><option value="dealer">Händler</option><option value="business">Unternehmen</option></select></label>',
 '<label>Verkaufsart<select id="sprice"><option value="">Alle</option><option value="fixed">Fixpreis</option><option value="negotiable">Verhandelbar</option><option value="auction">Auktion</option><option value="free">Verschenken</option></select></label>',
 '<label>Sortierung<select id="ssort"><option value="newest">Neueste zuerst</option><option value="price_asc">Preis aufsteigend</option><option value="price_desc">Preis absteigend</option><option value="ending_soon">Auktionen enden bald</option></select></label>',
 '</div><div class="marketSearchActions"><button class="btn primary" id="applySearch">🔎 Filter anwenden</button><button class="btn" id="resetSearch">Zurücksetzen</button><button class="btn" id="saveSearch">🔔 Suche speichern</button></div><div id="saveSearchMsg"></div></div></details><div class="searchResultHead km24LatestMeta"><b id="resultStatus"></b></div><div id="grid" class="grid"></div></div></section>',

 '<section class="section km24WhySection"><div class="wrap"><div class="km24HomeSectionHead"><div><span class="km24SectionKicker">WARUM KAUFMICH24?</span><h2>Einfach handeln. Ohne Umwege.</h2></div></div><div class="km24WhyGrid"><div class="km24WhyCard"><span>⚡</span><b>Schnell inserieren</b><p>In wenigen Schritten ist dein Angebot online.</p></div><div class="km24WhyCard"><span>💬</span><b>Direkt kommunizieren</b><p>Käufer und Verkäufer bleiben unkompliziert in Kontakt.</p></div><div class="km24WhyCard"><span>🛡️</span><b>Übersichtlich handeln</b><p>Käufe, Verkäufe und Nachrichten an einem Ort.</p></div><div class="km24WhyCard"><span>🇨🇭</span><b>Für die ganze Schweiz</b><p>Lokal suchen oder schweizweit verkaufen.</p></div></div></div></section>'
 ].join("");

 drawCats();
 loadHomeAuctions();if(typeof loadHomeWanted==='function')loadHomeWanted();document.getElementById("allWantedBtn")?.addEventListener("click",()=>go("#/wanted"));

 document.getElementById("scat").onchange=()=>marketFillSubcategories();
 document.getElementById("applySearch").onclick=runMarketplaceSearch;
 document.getElementById("qs").onclick=()=>{
   document.getElementById("latestSection")?.scrollIntoView({behavior:"smooth",block:"start"});
   runMarketplaceSearch()
 };
 document.getElementById("q").onkeydown=e=>{if(e.key==="Enter"){document.getElementById("latestSection")?.scrollIntoView({behavior:"smooth",block:"start"});runMarketplaceSearch()}};
 document.getElementById("saveSearch").onclick=saveCurrentSearch;
 document.getElementById("resetSearch").onclick=()=>{
   ["q","smin","smax"].forEach(id=>document.getElementById(id).value="");
   ["scat","scond","scanton","sseller","sprice"].forEach(id=>document.getElementById(id).value="");
   document.getElementById("ssort").value="newest";
   marketFillSubcategories();
   runMarketplaceSearch()
 };
 document.getElementById("homeDiscover").onclick=()=>document.getElementById("latestSection")?.scrollIntoView({behavior:"smooth",block:"start"});
 document.getElementById("homeAuctionShortcut").onclick=()=>document.getElementById("auctionSection")?.scrollIntoView({behavior:"smooth",block:"start"});
 document.getElementById("homeWantedShortcut").onclick=()=>go("#/wanted");
 document.getElementById("homeAuctionJump").onclick=()=>document.getElementById("auctionSection")?.scrollIntoView({behavior:"smooth",block:"start"});
 document.getElementById("allAuctionsBtn").onclick=()=>{
   document.getElementById("sprice").value="auction";
   document.getElementById("ssort").value="ending_soon";
   document.getElementById("latestSection")?.scrollIntoView({behavior:"smooth",block:"start"});
   runMarketplaceSearch()
 };

 if(marketSearchPreset){marketApplyPreset(marketSearchPreset);marketSearchPreset=null}
 else if(query)document.getElementById("q").value=query;

 try{
   let fr=await db.rpc("loyalty_founder_progress_v2"),fp=(fr.data||[])[0],el=document.getElementById("km24FounderProgress");
   if(el&&fp){
     let left1=Math.max(0,100-Number(fp.first_100_used||0)),
         left2=Math.max(0,200-Number(fp.second_200_used||0)),
         left3=Math.max(0,200-Number(fp.third_200_used||0));
     el.textContent=left1>0?("Noch "+left1+" Plätze mit 3'000 Punkten"):
       left2>0?("Noch "+left2+" Plätze mit 1'500 Punkten"):
       ("Noch "+left3+" Plätze mit 1'000 Punkten")
   }
 }catch(_){}
 await runMarketplaceSearch()
}
function drawCats(){
 let root=marketCategoryRoots(),el=document.getElementById("cats");if(!el)return;
 let expanded=el.dataset.expanded==="1",shown=expanded?root:root.slice(0,8);
 el.innerHTML=shown.map(c=>'<button type="button" class="cat" data-category-slug="'+E(c.slug)+'" style="display:block;width:100%;text-decoration:none;color:inherit"><i>'+E(c.icon||"📦")+'</i><b>'+E(c.name_de)+'</b></button>').join("");
 el.querySelectorAll('[data-category-slug]').forEach(b=>b.onclick=()=>go('#/category/'+encodeURIComponent(b.dataset.categorySlug)));
 let btn=document.getElementById("km24CatToggle");
 if(root.length>8){
  if(!btn){btn=document.createElement("button");btn.id="km24CatToggle";btn.type="button";btn.className="btn";btn.style.cssText="margin:14px auto 0;display:flex;min-width:220px";el.insertAdjacentElement("afterend",btn)}
  {
  let lng=(window.km24Language&&window.km24Language())||(()=>{try{return localStorage.getItem("km24Lang")||"de"}catch(e){return "de"}})();
  let less={de:"Weniger Kategorien anzeigen",fr:"Afficher moins de catégories",it:"Mostra meno categorie",en:"Show fewer categories"};
  let all={de:"Alle "+root.length+" Kategorien anzeigen",fr:"Afficher les "+root.length+" catégories",it:"Mostra tutte le "+root.length+" categorie",en:"Show all "+root.length+" categories"};
  btn.textContent=expanded?(less[lng]||less.de):(all[lng]||all.de);
}
  btn.onclick=()=>{el.dataset.expanded=expanded?"0":"1";drawCats();if(expanded)el.scrollIntoView({behavior:"smooth",block:"start"})}
 }else if(btn)btn.remove()
}
function km24CardImages(l){
 let a=Array.isArray(l._images)?l._images.filter(Boolean):[];
 if(!a.length&&l._img)a=[l._img];
 return a.map(x=>typeof x==="string"?{storage_path:x}:x)
}
function km24ThumbStripHtml(images){
 if(!Array.isArray(images)||images.length<2)return "";
 return '<div class="km24ThumbStrip" aria-label="'+E(window.km24T?window.km24T("Weitere Bilder"):"Weitere Bilder")+'">'+images.slice(0,4).map((img,i)=>{
  let path=img?.storage_path||"",fit=img?.fit_mode==="contain"?"contain":"cover",fx=Number(img?.focal_x??50),fy=Number(img?.focal_y??50),more=i===3&&images.length>4?'<span class="km24ThumbMore">+'+(images.length-4)+'</span>':"";
  return '<button type="button" class="km24ThumbBtn '+(i===0?"active":"")+'" data-src="'+E(IMG(path))+'" data-fit="'+fit+'" data-fx="'+fx+'" data-fy="'+fy+'" data-index="'+i+'" data-total="'+images.length+'" onclick="km24CardThumbClick(event,this)" aria-label="'+E(window.km24T?window.km24T("Bild "+(i+1)+" anzeigen"):("Bild "+(i+1)+" anzeigen"))+'"><img src="'+E(IMG(path))+'" alt="" loading="lazy">'+more+'</button>'
 }).join("")+'<span class="km24ThumbCount">1/'+images.length+'</span></div>'
}
function km24CardThumbClick(ev,btn){
 if(ev){ev.preventDefault();ev.stopPropagation()}
 let pic=btn?.closest(".km24CardPic,.km24AuctionPic"),main=pic?.querySelector(":scope > img,.km24CardMainImg");
 if(!main)return false;
 main.src=btn.dataset.src||main.src;
 main.style.objectFit=btn.dataset.fit||"cover";
 main.style.objectPosition=(btn.dataset.fx||50)+"% "+(btn.dataset.fy||50)+"%";
 pic.parentElement?.querySelectorAll(".km24ThumbBtn").forEach(x=>x.classList.remove("active"));
 btn.classList.add("active");
 let count=pic.parentElement?.querySelector(".km24ThumbCount");
 if(count)count.textContent=(Number(btn.dataset.index||0)+1)+"/"+(btn.dataset.total||"");
 return false
}
async function km24AttachCardImages(arr){
 if(!Array.isArray(arr)||!arr.length)return arr||[];
 let ids=[...new Set(arr.map(x=>x.id||x.offer_listing_id).filter(Boolean))];
 if(!ids.length)return arr;
 let q=await db.from("listing_images").select("listing_id,storage_path,sort_order,focal_x,focal_y,fit_mode").in("listing_id",ids).order("sort_order");
 if(q.error)return arr;
 let m={};(q.data||[]).forEach(x=>(m[x.listing_id]||(m[x.listing_id]=[])).push(x));
 arr.forEach(x=>{let id=x.id||x.offer_listing_id;x._images=m[id]||[];if(x._images.length)x._img=x._images[0]});
 return arr
}

function card(l){
 let p=l._p||{},
     images=km24CardImages(l),
     ii=images[0]||l._img,
     path=typeof ii==="string"?ii:ii?.storage_path,
     fit="cover",
     fx=Number(ii?.focal_x??50),
     fy=Number(ii?.focal_y??50),
     im=path?'<img class="km24CardMainImg" src="'+E(IMG(path))+'" style="object-fit:'+fit+';object-position:'+fx+'% '+fy+'%">':'<span class="km24NoImage">📷</span>',
     wanted=l.listing_intent==="wanted",
     auction=!wanted&&l.price_type==="auction",
     timer=auction&&l.auction_end_at?'<span class="km24CardTimer">⏱ '+E(typeof homeAuctionRemaining==="function"?homeAuctionRemaining(l.auction_end_at):"Auktion")+'</span>':"",
     views=Number(l.view_count||0),
     favs=Number(l.favorite_count||0),
     thumbs=km24ThumbStripHtml(images),
     typeLabel=wanted?"Gesucht wird":L(l.price_type),
     typeClass=wanted?"wanted":(auction?"auction":l.price_type==="free"?"free":""),
     topPromo=!!l.featured_until&&new Date(l.featured_until)>new Date(),
     homePromo=!!l.home_boost_until&&new Date(l.home_boost_until)>new Date(),
     promoClass=topPromo&&homePromo?' km24PromoBoth':topPromo?' km24PromoTop':homePromo?' km24PromoHome':'',
     promoBadge=topPromo&&homePromo?'<span class="km24PromoBadge both">⭐ TOP · 🥇 GOLD · STARTSEITE</span>':topPromo?'<span class="km24PromoBadge top">⭐ TOP</span>':homePromo?'<span class="km24PromoBadge home">🥇 GOLD · STARTSEITE</span>':'',
     priceLabel=wanted
       ?(l.price_chf!=null&&Number(l.price_chf)>0?"Budget bis CHF "+F(l.price_chf):"Budget auf Anfrage")
       :ptxt(l,l._s);
 return '<article class="card km24ListingCard'+(wanted?' km24WantedCard':'')+promoClass+'" data-listing-id="'+E(l.id)+'" onclick="go(\'#/listing/'+l.id+'\')"><div class="pic km24CardPic">'+im+'<div class="km24CardOverlay"><span class="km24TypePill '+typeClass+'">'+E(typeLabel)+'</span>'+timer+'</div>'+promoBadge+'</div>'+thumbs+'<div class="cb km24CardBody"><div class="km24CardTitleRow"><div class="title">'+E(l.title)+'</div>'+'</div><div class="price">'+E(priceLabel)+'</div><div class="km24CardSeller">'+(p.account_type==="dealer"||p.account_type==="business"?'<span class="km24DealerTag">Händler</span>':"")+'<span>'+E(p.display_name||((p.account_type==='dealer'||p.account_type==='business')?'Händler':'Privatperson'))+'</span></div><div class="km24CardMeta"><span>📍 '+E(((l.postal_code||"")+" "+(l.city||"")).trim()||"Schweiz")+'</span></div></div></article>'
}
async function savedSearchesPage(){
 if(!user)return go("#/login");
 let r=await db.from("saved_searches").select("*").eq("user_id",user.id).order("created_at",{ascending:false}),rows=r.data||[];
 let summary=x=>{let a=[];if(x.query_text)a.push("„"+x.query_text+"“");if(x.category_slug)a.push(marketCategoryName(x.category_slug));if(x.subcategory_slug)a.push(marketCategoryName(x.subcategory_slug));if(x.min_price_chf!=null)a.push("ab CHF "+F(x.min_price_chf));if(x.max_price_chf!=null)a.push("bis CHF "+F(x.max_price_chf));if(x.condition)a.push(({new:"Neu",like_new:"Wie neu",used:"Gebraucht",defective:"Defekt"}[x.condition]||x.condition));if(x.canton)a.push(x.canton);if(x.seller_type)a.push(x.seller_type==="private"?"Privat":"Händler");if(x.price_type)a.push(L(x.price_type));return a};
 let html=rows.length?rows.map(x=>{let a=summary(x);return'<div class="adminCard savedSearchRow"><div><div class="head" style="margin:0"><b>'+E(x.name)+'</b><span class="badge '+(x.notify_on_new?"":"auction")+'">'+(x.notify_on_new?"🔔 Benachrichtigungen an":"🔕 Benachrichtigungen aus")+'</span></div><div class="savedSearchMeta">'+(a.length?a.map(v=>'<span class="badge">'+E(v)+'</span>').join(""):'<span class="mut">Keine Filter – alle neuen Inserate</span>')+'</div><small class="mut">Erstellt '+E(D(x.created_at))+'</small></div><div class="actions"><button class="btn primary" data-run-search="'+x.id+'">Suchen</button><button class="btn" data-toggle-search="'+x.id+'" data-state="'+(x.notify_on_new?"1":"0")+'">'+(x.notify_on_new?"Benachrichtigungen aus":"Benachrichtigungen an")+'</button><button class="btn" data-delete-search="'+x.id+'">Löschen</button></div></div>'}).join(""):'<div class="empty">Du hast noch keinen Suchauftrag gespeichert.</div>';
 app.innerHTML='<div class="wrap formPage"><div class="head"><div><h1 style="margin:0">Meine Suchaufträge</h1><p class="mut" style="margin:5px 0 0">KaufMich24 benachrichtigt dich, wenn ein neues Inserat zu einem aktiven Suchauftrag passt.</p></div><a class="btn primary" href="#/">Neue Suche</a></div><div class="manage">'+html+'</div></div>';
 document.querySelectorAll("[data-run-search]").forEach(b=>b.onclick=()=>{let x=rows.find(r=>r.id===b.dataset.runSearch);if(!x)return;marketSearchPreset={...x,sort:"newest"};go("#/")});
 document.querySelectorAll("[data-toggle-search]").forEach(b=>b.onclick=async()=>{let on=b.dataset.state==="1",q=await db.from("saved_searches").update({notify_on_new:!on,updated_at:new Date().toISOString()}).eq("id",b.dataset.toggleSearch).eq("user_id",user.id);if(q.error)alert(q.error.message);else savedSearchesPage()});
 document.querySelectorAll("[data-delete-search]").forEach(b=>b.onclick=async()=>{if(!confirm("Suchauftrag wirklich löschen?"))return;let q=await db.from("saved_searches").delete().eq("id",b.dataset.deleteSearch).eq("user_id",user.id);if(q.error)alert(q.error.message);else savedSearchesPage()})
}
async function passwordLeakCheck(p){
 try{
  let d=await crypto.subtle.digest("SHA-1",new TextEncoder().encode(String(p||"")));
  let hash=Array.from(new Uint8Array(d),b=>b.toString(16).padStart(2,"0")).join("").toUpperCase();
  let r=await fetch("https://aaqqcnrnrvybboirrrtd.supabase.co/functions/v1/kaufmich-password-check",{
   method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({sha1:hash})
  });
  if(!r.ok)return{checked:false,pwned:false,count:0};
  let x=await r.json();
  return{checked:x?.ok===true,pwned:x?.pwned===true,count:Number(x?.count||0)}
 }catch(_){return{checked:false,pwned:false,count:0}}
}
function km24UsernameRule(value,firstName,lastName){
 let v=String(value||'').trim();
 if(v.length<3||v.length>30)return{ok:false,message:'Der Benutzername muss 3 bis 30 Zeichen lang sein.'};
 if(!/^[A-Za-zÀ-ÖØ-öø-ÿ0-9][A-Za-zÀ-ÖØ-öø-ÿ0-9._-]{2,29}$/.test(v))return{ok:false,message:'Benutzername: nur Buchstaben, Zahlen, Punkt, Unterstrich und Bindestrich. Keine Leerzeichen.'};
 const norm=x=>String(x||'').toLowerCase().replace(/ä/g,'a').replace(/ö/g,'o').replace(/ü/g,'u').replace(/ß/g,'ss').replace(/[^a-z0-9]/g,'');
 let u=norm(v),f=norm(firstName),l=norm(lastName);
 if(f&&l&&(u===f+l||u===l+f||(f.length>=3&&l.length>=3&&u.includes(f)&&u.includes(l))))return{ok:false,message:'Zu deiner Sicherheit darf dein echter Vor- und Nachname nicht als Benutzername verwendet werden. Bitte wähle einen Fantasienamen, ein Kürzel oder neutrale Zahlen.'};
 return{ok:true,message:''}
}

function km24PromptOAuthResidency(){
  try{
    if(!user||!profile||recovery)return;
    var provider=String(user.app_metadata?.provider||'').toLowerCase();
    if(!['google','facebook','apple'].includes(provider))return;
    if(profile.address_confirmed_at||profile.residency_selected_at)return;
    if(document.getElementById('km24OAuthResidencyOverlay'))return;
    var overlay=document.createElement('div');
    overlay.id='km24OAuthResidencyOverlay';
    overlay.style.cssText='position:fixed;inset:0;z-index:20000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(9,18,40,.76);backdrop-filter:blur(4px);';
    overlay.innerHTML='<section role="dialog" aria-modal="true" aria-labelledby="km24OAuthResidencyTitle" style="box-sizing:border-box;width:100%;max-width:440px;padding:24px;border-radius:18px;background:#fff;color:#172538;box-shadow:0 20px 60px rgba(0,0,0,.3);font-family:inherit">'
      +'<h2 id="km24OAuthResidencyTitle" style="margin:0 0 10px;font-size:22px;color:#172538!important;-webkit-text-fill-color:#172538!important;opacity:1!important">Wo wohnst du?</h2>'
      +'<p style="margin:0 0 18px;line-height:1.55">Bitte wähle deinen tatsächlichen Wohnsitz aus. Auch mit Wohnsitz im Ausland kannst du KaufMich24 kostenlos nutzen. Die Wohnadresse bestätigst du später, wenn du kaufen oder verkaufen möchtest.</p>'
      +'<label for="km24OAuthCountry" style="display:block;margin-bottom:8px;font-weight:700">Wohnsitz</label>'
      +'<select id="km24OAuthCountry" style="width:100%;min-height:46px;padding:10px;border:1px solid #9aaac0;border-radius:10px;background:#fff;color:#172538"><option value="">Bitte auswählen</option><option value="CH">Schweiz</option><option value="FOREIGN">Ausland</option></select>'
      +'<div id="km24OAuthCountryMsg" role="status" style="min-height:20px;margin:10px 0;color:#ab3030;font-size:13px"></div>'
      +'<button id="km24OAuthCountrySave" type="button" disabled style="width:100%;min-height:47px;border:0;border-radius:10px;background:#1261ce;color:#fff;font:inherit;font-weight:700;cursor:pointer;opacity:.6">Speichern und weiter</button>'
      +'</section>';
    document.body.appendChild(overlay);
    var country=overlay.querySelector('#km24OAuthCountry');
    var save=overlay.querySelector('#km24OAuthCountrySave');
    var msg=overlay.querySelector('#km24OAuthCountryMsg');
    country.onchange=function(){save.disabled=!country.value;save.style.opacity=country.value?'1':'.6';msg.textContent=''};
    save.onclick=async function(){
      if(!['CH','FOREIGN'].includes(country.value))return;
      save.disabled=true;country.disabled=true;save.textContent='Wird gespeichert …';msg.textContent='';
      try{
        var result=await db.rpc('set_my_oauth_residency',{p_residency:country.value});
        if(result.error)throw result.error;
        await loadProfile();
        if(!profile||profile.residency_scope!==country.value||!profile.residency_selected_at)throw new Error('Die Wohnsitzauswahl konnte noch nicht bestätigt werden.');
        overlay.remove();
        if(location.hash.startsWith('#/verification'))route();
      }catch(err){
        msg.textContent=String(err?.message||'Bitte versuche es erneut.');
        save.disabled=false;country.disabled=false;save.textContent='Speichern und weiter';
      }
    };
    country.focus();
  }catch(err){console.warn('Wohnsitzauswahl konnte nicht angezeigt werden',err)}
}

function login(){if(user)return go('#/me');app.innerHTML='<div class="auth"><div class="panel"><h1 id="at">Anmelden</h1><p class="mut" id="ai">Willkommen zurück.</p><div id="oauthBox" style="display:grid;gap:10px;margin:18px 0 12px"><button type="button" class="btn" data-oauth="google" style="width:100%;min-height:48px;display:flex;align-items:center;justify-content:center;gap:12px;font-weight:800"><span style="font-size:20px;font-weight:900"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48" aria-hidden="true" focusable="false" style="display:block;flex-shrink:0"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.28 5.48-4.84 7.18l7.73 6C44.34 38.03 46.98 31.9 46.98 24.55z"/><path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.6.27-3.15.76-4.59l-7.98-6.2A23.9 23.9 0 0 0 0 24c0 3.87.93 7.51 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg></span>Mit Google anmelden</button><button type="button" class="btn" data-oauth="facebook" style="width:100%;min-height:48px;display:flex;align-items:center;justify-content:center;gap:12px;font-weight:800"><span style="font-size:22px;font-weight:900"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style="display:block;flex-shrink:0"><circle cx="12" cy="12" r="12" fill="#1877F2"/><path fill="#FFFFFF" d="M13.61 23.89V15.2h2.93l.44-3.4h-3.37V9.62c0-.99.27-1.66 1.69-1.66h1.8V4.92a24.1 24.1 0 0 0-2.62-.13c-2.6 0-4.38 1.59-4.38 4.5v2.51H7.16v3.4h2.94v8.69z"/></svg></span>Mit Facebook anmelden</button></div><div id="oauthOr" style="display:flex;align-items:center;gap:10px;margin:12px 0;color:var(--muted)"><span style="height:1px;background:var(--line);flex:1"></span><small>oder</small><span style="height:1px;background:var(--line);flex:1"></span></div><div id="acc" class="choices account hide"><button class="choice on" data-a="private"><em>👤</em><b>Privatperson</b><small>Einfach kaufen & verkaufen</small></button><button class="choice" data-a="dealer"><em>🏪</em><b>Firmenprofil</b><small>Für Händler & Unternehmen</small></button></div><form id="af" class="stack"><div id="lnr" class="two hide"><label>Vorname<input id="signupFirst" autocomplete="given-name" placeholder="Nicht öffentlich"></label><label>Nachname<input id="signupLast" autocomplete="family-name" placeholder="Nicht öffentlich"></label></div><label id="nr" class="hide">Benutzername<input id="name" maxlength="30" autocomplete="username" placeholder="z. B. BVPerf__"><small class="mut" style="display:block;margin-top:5px">Öffentlich sichtbar. Dein echter Vor- und Nachname dürfen nicht als Benutzername verwendet werden. Erlaubt: Buchstaben, Zahlen, Punkt, _ und -.</small></label><label id="br" class="hide">Firmenname<input id="business"></label><label id="rr" class="hide">Wohnsitz<select id="signupResidency"><option value="CH">Schweiz</option><option value="FOREIGN">Ausland</option></select><small class="mut" style="display:block;margin-top:5px">KaufMich24 richtet sich primär an die Schweiz. Anmeldung und Nutzung als Käufer sind auch mit Wohnsitz im Ausland kostenlos.</small></label><div id="signupAddressBlock" class="hide" style="display:grid;gap:10px"><label id="phr">Mobilnummer *<input id="signupPhone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+41 79 123 45 67"><small class="mut" style="display:block;margin-top:5px">Ausländische Nummern bitte mit Ländervorwahl, z. B. +49 …</small></label><label>Strasse & Hausnummer<input id="signupStreet" autocomplete="street-address" placeholder="Musterstrasse 12"></label><div class="two"><label>PLZ<input id="signupPostal" inputmode="text" autocomplete="postal-code" maxlength="12"></label><label>Ort<input id="signupCity" autocomplete="address-level2"></label></div><label>Kanton <small class="mut">(optional)</small><input id="signupCanton" maxlength="2" autocomplete="address-level1" placeholder="LU"></label><label style="display:flex;gap:9px;align-items:flex-start"><input id="signupAddressConfirm" type="checkbox" style="width:auto;margin-top:4px"><span>Ich bestätige, dass dies meine aktuelle Wohnadresse ist. Nach der Bestätigung kann sie nur durch den KaufMich24-Admin geändert werden.</span></label></div><div id="legalr" class="hide" style="display:grid;gap:10px;padding:13px;border:1px solid var(--line);border-radius:12px"><label style="display:flex;gap:9px;align-items:flex-start"><input id="signupAge18" type="checkbox" style="width:auto;margin-top:4px"><span>Ich bin mindestens 18 Jahre alt und akzeptiere die <a href="#/terms" target="_blank" rel="noopener">AGB</a>. Die <a href="#/privacy" target="_blank" rel="noopener">Datenschutzerklärung</a> habe ich zur Kenntnis genommen.</span></label><label style="display:none"><input id="signupTerms" type="checkbox"><span>AGB</span></label><label style="display:none"><input id="signupPrivacy" type="checkbox"><span>Datenschutz</span></label></div><label>E-Mail<input required id="email" type="email"></label><label>Passwort<input required id="pw" type="password" minlength="8"></label><button class="btn primary" id="as">Anmelden</button></form><div id="am"></div><button class="btn" id="forgot" style="width:100%;margin-top:10px">Passwort vergessen?</button><button class="btn" id="resendConfirm" style="width:100%;margin-top:8px">Bestätigungs-E-Mail erneut senden</button><button class="btn" id="sw" style="width:100%;margin-top:8px">Noch kein Konto? Registrieren</button></div></div>';let mode='login',account='private',bs=[...document.querySelectorAll('[data-a]')];[...document.querySelectorAll('[data-oauth]')].forEach(b=>b.onclick=async()=>{let m=document.getElementById('am'),provider=b.dataset.oauth;b.disabled=true;try{let r=await db.auth.signInWithOAuth({provider,options:{redirectTo:'https://www.kaufmich24.ch/'}});if(r.error)m.innerHTML=N('Social Login konnte nicht gestartet werden: '+r.error.message,1)}catch(err){m.innerHTML=N('Social Login konnte nicht gestartet werden.',1)}finally{b.disabled=false}});bs.forEach(b=>b.onclick=()=>{account=b.dataset.a;bs.forEach(x=>x.classList.toggle('on',x.dataset.a===account));document.getElementById('br').classList.toggle('hide',account!=='dealer')});document.getElementById('sw').onclick=()=>{mode=mode==='login'?'signup':'login';let s=mode==='signup';let ob=document.getElementById('oauthBox'),oo=document.getElementById('oauthOr');if(ob)ob.style.display=s?'none':'grid';if(oo)oo.style.display=s?'none':'flex';document.getElementById('af').noValidate=false;if(s){try{window.km24Track&&window.km24Track('signup_start')}catch(_){}}document.getElementById('at').textContent=s?'Konto erstellen':'Anmelden';document.getElementById('ai').textContent=s?'Kostenlos registrieren – Benutzername, E-Mail und Passwort. Mobilnummer und Wohnadresse ergänzt du erst später, wenn du kaufen oder verkaufen möchtest.':'Willkommen zurück.';document.getElementById('as').textContent=s?'Kostenlos registrieren':'Anmelden';document.getElementById('sw').textContent=s?'Schon ein Konto? Anmelden':'Noch kein Konto? Registrieren';document.getElementById('acc').classList.add('hide');document.getElementById('lnr').classList.add('hide');document.getElementById('signupFirst').required=false;document.getElementById('signupLast').required=false;document.getElementById('nr').classList.toggle('hide',!s);document.getElementById('br').classList.add('hide');document.getElementById('rr').classList.add('hide');document.getElementById('phr').classList.add('hide');document.getElementById('signupPhone').required=false;let ab=document.getElementById('signupAddressBlock');ab.classList.add('hide');ab.style.display='none';['signupStreet','signupPostal','signupCity','signupAddressConfirm'].forEach(id=>document.getElementById(id).required=false);let lr=document.getElementById('legalr');lr.classList.toggle('hide',!s);lr.style.display=s?'grid':'none'};if(location.hash.includes('signup=1')){document.getElementById('sw').click();if(location.hash.includes('account=dealer')){account='dealer';bs.forEach(x=>x.classList.toggle('on',x.dataset.a===account));document.getElementById('br').classList.remove('hide')}};document.getElementById('forgot').onclick=async()=>{let e=document.getElementById('email').value.trim(),m=document.getElementById('am');if(!e)return m.innerHTML=N('Bitte zuerst E-Mail eingeben.',1);let r=await db.auth.resetPasswordForEmail(e,{redirectTo:'https://www.kaufmich24.ch/?recovery=1'});m.innerHTML=r.error?N(r.error.message,1):N('E-Mail zum Zurücksetzen wurde gesendet.')};document.getElementById('resendConfirm').onclick=async()=>{let e=document.getElementById('email').value.trim(),m=document.getElementById('am');if(!e)return m.innerHTML=N('Bitte zuerst E-Mail eingeben.',1);let r=await db.auth.resend({type:'signup',email:e,options:{emailRedirectTo:'https://www.kaufmich24.ch'}});m.innerHTML=r.error?N(r.error.message,1):N('Neue Bestätigungs-E-Mail wurde gesendet. Bitte prüfe auch den Spam-Ordner.')};document.getElementById('af').onsubmit=async e=>{e.preventDefault();let mail=document.getElementById('email').value.trim(),pw=document.getElementById('pw').value,m=document.getElementById('am'),r;if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail))return m.innerHTML=N('Bitte eine gültige E-Mail-Adresse eingeben.',1);if(mode==='signup'){try{window.km24Track&&window.km24Track('signup_email_entered');window.km24Track&&window.km24Track('signup_submit')}catch(_){}if(!document.getElementById('signupAge18').checked)return m.innerHTML=N('Bitte bestätige Mindestalter, AGB und Datenschutzerklärung.',1);if(pw.length<8)return m.innerHTML=N('Das Passwort muss mindestens 8 Zeichen lang sein.',1);let leak=await passwordLeakCheck(pw);if(!leak.checked)return m.innerHTML=N('Die Passwort-Sicherheitsprüfung ist momentan nicht erreichbar. Bitte versuche es gleich nochmals.',1);if(leak.pwned)return m.innerHTML=N('Dieses Passwort ist aus bekannten Datenlecks bekannt und darf nicht verwendet werden. Bitte wähle ein anderes Passwort.',1);let name=document.getElementById('name').value.trim()||('Nutzer'+Math.random().toString(36).slice(2,8)),biz=document.getElementById('business').value.trim(),residency=document.getElementById('signupResidency')?.value==='FOREIGN'?'FOREIGN':'CH';let unameCheck=km24UsernameRule(name,'','');if(!unameCheck.ok)return m.innerHTML=N(unameCheck.message,1);r=await db.auth.signUp({email:mail,password:pw,options:{emailRedirectTo:'https://www.kaufmich24.ch',data:{display_name:name,account_type:account,founder_funnel:!!(window.km24FounderIntent&&window.km24FounderIntent()),founder_funnel_started_at:(window.km24FounderIntent&&window.km24FounderIntent())?new Date().toISOString():null,business_name:account==='dealer'?biz:null,residency_scope:residency,age18_confirmed:true,terms_accepted:true,terms_version:KM24_TERMS_VERSION,privacy_acknowledged:true,privacy_version:KM24_PRIVACY_VERSION,...(window.km24MarketingMeta?window.km24MarketingMeta():{})}}});if(!r.error){let km24NewSignup=!!(r.data&&r.data.user&&(!Array.isArray(r.data.user.identities)||r.data.user.identities.length>0));if(km24NewSignup){try{if(window.km24FounderIntent&&window.km24FounderIntent()&&window.km24FounderTrack)window.km24FounderTrack('founder_signup_complete')}catch(_){}try{window.km24Track&&window.km24Track('signup_complete');window.km24Track&&window.km24Track('signup_email_sent');localStorage.setItem('km24_signup_pending','1')}catch(_){}}m.innerHTML=N(km24NewSignup?'Fast geschafft ✓ Wir haben dir eine Bestätigungs-E-Mail gesendet. Öffne den Link in deinem Postfach. Nichts erhalten? Prüfe den Spam-Ordner oder nutze „Bestätigungs-E-Mail erneut senden“.':'Bitte prüfe dein E-Mail-Postfach. Falls du bereits ein Konto hast, melde dich an oder nutze Passwort vergessen.')}}else{r=await db.auth.signInWithPassword({email:mail,password:pw});if(!r.error){await loadProfile();let hh=location.hash,p=new URLSearchParams((hh.split('?')[1]||'')),next=p.get('next'),rid=p.get('id');if(next==='review'&&rid&&/^[0-9a-f-]{36}$/i.test(rid))return go('#/review/'+rid);if(next==='messages'&&rid&&/^[0-9a-f-]{36}$/i.test(rid))return go('#/messages/'+rid);return go(next==='create'?'#/create':next==='wanted'?'#/wanted/new':next==='sell'?'#/sell':next==='messages'?'#/messages':'#/')}}if(r&&r.error){let t=r.error.message;if(t==='Invalid login credentials')t='E-Mail oder Passwort ist falsch.';if(t.toLowerCase().includes('rate limit'))t='Zu viele E-Mails wurden angefordert. Bitte später erneut versuchen.';m.innerHTML=N(t,1)}}}
function resetView(){app.innerHTML='<div class="auth"><div class="panel"><h1>Neues Passwort festlegen</h1><p class="mut">Wähle ein neues Passwort für dein KaufMich24-Konto.</p><form id="rf" class="stack"><label>Neues Passwort<input id="np" type="password" minlength="8" autocomplete="new-password" required></label><label>Passwort wiederholen<input id="np2" type="password" minlength="8" autocomplete="new-password" required></label><button class="btn primary">Passwort speichern</button></form><div id="rm"></div></div></div>';document.getElementById('rf').onsubmit=async e=>{e.preventDefault();let p=document.getElementById('np').value,p2=document.getElementById('np2').value,m=document.getElementById('rm');if(p.length<8)return m.innerHTML=N('Das Passwort muss mindestens 8 Zeichen lang sein.',1);if(p!==p2)return m.innerHTML=N('Die beiden Passwörter stimmen nicht überein.',1);let leak=await passwordLeakCheck(p);if(!leak.checked)return m.innerHTML=N('Die Passwort-Sicherheitsprüfung ist momentan nicht erreichbar. Bitte versuche es gleich nochmals.',1);if(leak.pwned)return m.innerHTML=N('Dieses Passwort ist aus bekannten Datenlecks bekannt und darf nicht verwendet werden. Bitte wähle ein anderes Passwort.',1);let r=await db.auth.updateUser({password:p});if(r.error)return m.innerHTML=N(r.error.message,1);m.innerHTML=N('Passwort geändert. Du wirst jetzt abgemeldet und kannst dich mit dem neuen Passwort anmelden.');setTimeout(async()=>{await db.auth.signOut();user=null;profile=null;recovery=false;history.replaceState({},'',location.pathname+'#/login');login()},900)}}

async function categoryView(slug){

  let c=cats.find(x=>x.slug===slug);
  if(!c){app.innerHTML='<div class="wrap section"><div class="empty">Kategorie nicht gefunden.</div></div>';return}
  let children=cats.filter(x=>x.parent_slug===slug);
  app.innerHTML='<section class="section"><div class="wrap"><a class="btn" style="display:inline-block;text-decoration:none;color:inherit" href="#/">← Zurück</a><div class="head" style="margin-top:16px"><div><h1 style="margin:0">'+E(c.icon||'📦')+' '+E(c.name_de)+'</h1><p class="mut">Unterkategorie wählen oder alle Inserate ansehen.</p></div></div>'+(children.length?'<div class="cats" id="subcats"></div>':'')+'<div class="head" style="margin-top:24px"><div><h2 style="margin:0">Inserate & Gesuche</h2><small class="mut">Gesuche sind mit „🔎 Gesucht“ gekennzeichnet.</small></div></div><div id="catgrid" class="grid"></div></div></section>';
  if(children.length){
  let el=document.getElementById('subcats');
  el.innerHTML=children.map(x=>'<button type="button" class="cat" data-category-slug="'+E(x.slug)+'" style="display:block;width:100%;text-decoration:none;color:inherit"><i>'+E(x.icon||'📦')+'</i><b>'+E(x.name_de)+'</b></button>').join('');
  el.querySelectorAll('[data-category-slug]').forEach(b=>b.onclick=()=>go('#/category/'+encodeURIComponent(b.dataset.categorySlug)));
}
  let slugs=[slug,...children.map(x=>x.slug)];
  /* km24-guest-category-rpc-v1: guests use public-safe marketplace RPC; signed-in users keep full detail queries */
  let q=user
    ?db.from('listings').select('*').eq('status','active').in('category_slug',slugs).order('created_at',{ascending:false}).limit(80)
    :db.rpc('search_marketplace_v3',{
      p_query:null,p_category_slug:slug,p_subcategory_slug:null,
      p_min_price_chf:null,p_max_price_chf:null,p_condition:null,p_canton:null,
      p_seller_type:null,p_price_type:null,p_sort:'newest',p_limit:80,p_offset:0,
      p_location:null,p_verified_only:false,p_listing_intent:null
    });
  let r=await q, arr=r.data||[];
  if(!user){
    arr.forEach(x=>{
      x._img=x.image_path?{storage_path:x.image_path,focal_x:x.focal_x,focal_y:x.focal_y,fit_mode:x.fit_mode}:null;
      x._p={account_type:x.seller_type,business_name:x.seller_name,display_name:x.seller_name,identity_verified_at:null};
      x._s=null
    })
  }else if(arr.length){
    let ids=arr.map(x=>x.id),sids=[...new Set(arr.map(x=>x.seller_id))],[im,pr,st]=await Promise.all([
      db.from('listing_images').select('listing_id,storage_path,sort_order,focal_x,focal_y,fit_mode').in('listing_id',ids).order('sort_order'),
      db.rpc('seller_cards_public',{p_seller_ids:sids}),
      db.from('auction_stats').select('*').in('listing_id',ids)
    ]),a={},b={},s={};
    (im.data||[]).forEach(x=>{if(!a[x.listing_id])a[x.listing_id]=x});
    (pr.data||[]).forEach(x=>b[x.seller_id]=x);
    (st.data||[]).forEach(x=>s[x.listing_id]=x);
    arr.forEach(x=>{x._img=a[x.id];x._p=b[x.seller_id];x._s=s[x.id]});
  }
  var km24CatGrid=document.getElementById('catgrid');if(!km24CatGrid||((location.hash||'').split('?')[0]!=='#/category/'+encodeURIComponent(slug)))return;km24CatGrid.innerHTML=arr.length?arr.map(card).join(''):'<div class="empty" style="grid-column:1/-1">In dieser Kategorie gibt es noch keine Inserate.</div>';
}


async function giveawayPage(){
 let cr=await db.from("giveaway_campaigns").select("*").eq("id","year_end_2026").maybeSingle(),
     c=cr.data||{prize_chf:500,required_listings:0,registration_deadline:"2026-12-31T23:59:59+01:00",listing_deadline:"2026-12-31T23:59:59+01:00"},
     status=null;
 if(user){
   let sr=await db.rpc("giveaway_status",{p_campaign_id:"year_end_2026"});
   status=(sr.data||[])[0]||null
 }
 let need=0,
     count=Math.min(need,Number(status?.qualifying_listings||0)),
     pct=Math.min(100,Math.round((count/need)*100)),
     qualified=!!status?.eligible,
     deadline=c.listing_deadline||c.registration_deadline,
     closed=deadline?Date.now()>=new Date(deadline).getTime():false;

 let state=!user
   ?"<div class='giveawayStatus'>Registriere dich kostenlos bis zum 31.12.2026. Damit bist du automatisch mit einer Gewinnchance dabei.</div>"
   :status?.admin_account
   ?"<div class='giveawayStatus'>Admin- und Betreiberkonten nehmen nicht am Gewinnspiel teil.</div>"
   :status?.excluded
   ?"<div class='giveawayStatus'>Dieses Konto ist vom Gewinnspiel ausgeschlossen.</div>"
   :qualified
   ?"<div class='giveawayStatus ok'><b>✓ Teilnahme aktiv.</b><br>Du bist rechtzeitig registriert. Damit nimmst du automatisch mit genau einer Gewinnchance teil.</div>"
   :closed
   ?"<div class='giveawayStatus'><b>Teilnahmefrist beendet.</b></div>"
   :"<div class='giveawayStatus'><b>Teilnahme wird automatisch über deine Registrierung geprüft.</b></div>";

 let entryAction=!user
   ?"<a class='btn primary' href='#/login?signup=1'>Kostenlos registrieren</a>"
   :status?.admin_account||status?.excluded
   ?""
   :qualified
   ?"<span class='badge'>✓ Teilnahme aktiv</span>"
   :closed
   ?"<span class='badge'>Teilnahmefrist beendet</span>"
   :"<span class='badge'>Teilnahme wird automatisch geprüft</span>";

 app.innerHTML="<div class='wrap formPage'><div class='giveawayCard km24GiveawaySpotlight'><div class='giveawayEyebrow'>🎁 KaufMich24 Jahresend-Gewinnspiel</div><div class='giveawayPrize'>CHF "+F(c.prize_chf||500)+"</div><h2>CHF 500 gewinnen – registrieren und automatisch teilnehmen.</h2><p><b>So einfach ist die Teilnahme:</b> Registriere dein kostenloses KaufMich24-Konto bis zum 31.12.2026. Danach wirst du automatisch mit genau einer Gewinnchance berücksichtigt.</p><div class='giveawaySteps'><span class='giveawayStep'>✓ Kostenlos registrieren</span><span class='giveawayStep'>📅 Bis 31.12.2026 registrieren</span><span class='giveawayStep'>🎟️ 1 Chance pro Person</span></div>"+state+"<div class='actions' style='margin-top:14px'>"+entryAction+"</div></div><div class='legal' style='max-width:none;margin-top:18px'><h1>Teilnahmebedingungen</h1><div class='giveawayTerms'><div><b>Gewinn</b><br>Verlost wird einmalig ein Geldpreis von CHF 500.</div><div><b>Teilnahmefrist</b><br>Massgebend ist der 31.12.2026, 23:59 Uhr Schweizer Zeit.</div><div><b>Teilnahmevoraussetzung</b><br>Du benötigst ein bis spätestens 31.12.2026 registriertes KaufMich24-Konto. Weitere Aktionen sind für die Teilnahme nicht erforderlich.</div><div><b>Was zählt?</b><br>Massgebend ist eine rechtzeitige Registrierung des KaufMich24-Kontos bis zum Ende der Teilnahmefrist.</div><div><b>Eine Gewinnchance pro Person</b><br>Jede teilnahmeberechtigte, rechtzeitig registrierte Person erhält genau eine Chance in der Ziehung.</div><div><b>Automatische Teilnahme</b><br>Die Teilnahme wird automatisch durch die rechtzeitige Registrierung aktiviert.</div><div><b>Fairness</b><br>Mehrfachkonten und sonstige Manipulationsversuche können geprüft und ausgeschlossen werden. Admin- und Betreiberkonten sind ausgeschlossen.</div><div><b>Ziehung & Kontakt</b><br>Nach Ablauf der Teilnahmefrist wird der Gewinner oder die Gewinnerin zufällig aus allen berechtigten Personen ermittelt und über die beim Konto hinterlegte E-Mail-Adresse kontaktiert.</div><div><b>Datenschutz</b><br>Für die Teilnahme werden die vorhandenen Kontodaten und der Registrierungszeitpunkt verwendet. Es werden dafür keine zusätzlichen öffentlichen Profildaten verlangt.</div></div></div></div>";
}
async function buyerActivationPage(){
 if(!user)return go("#/login");
 await loadProfile();
 if(!contactReady())return go("#/verification?next=buyer");
 return go("#/buyer");
}

async function feesPage(){
 let qs=new URLSearchParams(location.search),
     cancelledOrder=qs.get("billing")==="cancelled"?qs.get("order_id"):null;

 if(user&&cancelledOrder){
   try{await db.functions.invoke("kaufmich-billing-manage",{body:{action:"cancel_checkout",order_id:cancelledOrder}})}catch(_){}
 }

 let reqs=[
  db.from("fee_plans").select("*").eq("is_active",true).order("sort_order"),
  db.rpc("payment_availability"),
  db.from("loyalty_category_rewards").select("*").order("points",{ascending:false}),
  db.rpc("loyalty_founder_progress_v2")
 ];
 if(user){
   reqs.push(db.from("dealer_subscriptions").select("*").eq("user_id",user.id).maybeSingle());
   reqs.push(db.rpc("my_loyalty_summary"));
   reqs.push(db.rpc("my_loyalty_expiry_summary"));
   reqs.push(db.rpc("my_loyalty_history",{p_limit:8}));
   reqs.push(db.from("sale_fees").select("*").eq("seller_id",user.id).eq("status","due").order("created_at",{ascending:false}));
   reqs.push(db.rpc("my_sale_fee_billing_summary"));
   reqs.push(db.rpc("my_business_reward_monthly"));
 }
 let rr=await Promise.all(reqs),
     ps=rr[0].data||[],
     state=(rr[1].data||[])[0]||{enabled:false,provider:null,display_name:null},
     rewards=rr[2].data||[],
     founder=(rr[3].data||[])[0]||{first_100_used:0,second_200_used:0,third_200_used:0,total_used:0,total_limit:500},
     sub=user?(rr[4]?.data||null):null,
     points=user?((rr[5]?.data||[])[0]||{points_balance:0,chf_value:0,points_per_chf:100,subscription_max_redemption_percent:25}):null,
     expiry=user?((rr[6]?.data||[])[0]||{next_expiry_at:null,points_expiring:0}):null,
     pointHistory=user?(rr[7]?.data||[]):[],
     openFees=user?(rr[8]?.data||[]):[],
     feeBilling=user?((rr[9]?.data||[])[0]||{due_fee_count:0,due_total_chf:0,small_fee_count:0,small_fee_total_chf:0,small_fee_threshold_chf:5,small_fee_ready:false,next_batch_at:null}):null,
     businessReward=user?((rr[10]?.data||[])[0]||{plan_code:null,points_used:0,points_cap:5000,points_remaining:5000}):null;

 let stripeConfigured=false;
 if(user&&profile?.is_admin){
  try{let sr=await db.functions.invoke("kaufmich-billing-status",{body:{}});stripeConfigured=!!sr.data?.configured}catch(_){}
 }

 let payBanner=state.enabled
  ?"<div class='notice'><b>✓ Sichere Online-Zahlung aktiviert</b><br>Bezahlte Leistungen werden über "+E(state.display_name||"Stripe")+" abgewickelt.</div>"
  :(profile?.is_admin
    ?"<div class='notice'><b>Testmodus:</b> "+(stripeConfigured?"Stripe ist verbunden. Testzahlungen sind nur für Admins möglich.":"Die Zahlungslogik ist vorbereitet. Es fehlt nur noch die Verbindung zum Stripe-Testkonto.")+"</div>"
    :"<div class='notice'><b>🚀 Kostenlose Startphase:</b> Geldzahlungen sind für normale Nutzer vollständig deaktiviert. Inserieren und die regulären Plattformfunktionen bleiben ohne Abbuchung nutzbar. Promotionen können aktuell nur mit vorhandenen KaufMich24 Punkten aktiviert werden. Die späteren Preise bleiben transparent sichtbar.</div>");

 let returnNotice=qs.get("billing")==="success"
   ?"<div class='notice'><b>✓ Zahlung abgeschlossen</b><br>Die Bestätigung wird automatisch verarbeitet.</div>"
   :qs.get("billing")==="cancelled"
     ?"<div class='notice'><b>Zahlung abgebrochen</b><br>Es wurde nichts freigeschaltet. Reservierte Punkte wurden wieder freigegeben.</div>"
     :"";

 let founderHtml="<div class='km24FounderFeeCard' id='km24FounderSellerFeeCard'><div><span class='km24PointsKicker'>🚀 GRÜNDER-VERKÄUFER</span><h2>0 % Verkaufsgebühr bis Ende 2027</h2><p>Die ersten 1’000 qualifizierten echten Verkäufer können insgesamt CHF 30 Plattformguthaben erhalten: CHF 10 nach 14 qualifizierten Tagen und weitere CHF 20 plus 0 % Verkaufsgebühr bis 31.12.2027 nach 30 qualifizierten Tagen oder früher nach einem erfolgreich abgeschlossenen Verkauf. Gelöschte Test- oder Fake-Inserate zählen nicht. <a href='#/founder'>Aktionsbedingungen ansehen</a>.</p></div><div class='km24FounderCounts'><b id='km24FounderFeeProgress'>Wird geladen …</b><span>Gründerplätze</span></div></div>";

 let pointsHtml=user
  ?"<div class='km24PointsCard'><div class='km24PointsBalance'><span>🪙 Dein Punktestand</span><b>"+F(points.points_balance)+" Punkte</b><strong>Wert CHF "+F(points.chf_value)+"</strong></div><div class='km24PointsRules'><b>100 Punkte = CHF 1</b><span>✓ Verkaufsgebühren bis 100 % mit Punkten</span><span>✓ Top- & Startseiten-Boosts bis 100 % mit Punkten</span><span>✓ Abos beim Abschluss bis max. "+F(points.subscription_max_redemption_percent)+" % mit Punkten</span><span>⏳ Punkte verfallen 18 Monate nach der Gutschrift. Älteste Punkte werden zuerst eingesetzt.</span><span>✕ Nicht auszahlbar und nicht übertragbar</span>"+(points.founder_rank?"<span class='km24FounderBadge'>🏅 Gründungsmitglied #"+E(points.founder_rank)+" · Bonus "+F(points.founder_bonus_points)+" Punkte</span>":"")+"</div></div>"
  :"<div class='km24PointsCard'><div class='km24PointsBalance'><span>🪙 KaufMich24 Punkte</span><b>Sammeln & Gebühren sparen</b><strong>100 Punkte = CHF 1 Plattformguthaben</strong></div><div class='km24PointsRules'><span>Nach erfolgreichen Verkäufen Punkte sammeln.</span><span>Punkte für Verkaufsgebühren, Promotionen und teilweise für Abos einsetzen.</span><span>⏳ Punkte verfallen 18 Monate nach der Gutschrift.</span><a class='btn primary' href='#/login'>Anmelden & Punktestand sehen</a></div></div>";

 let subBox="";
 if(sub){
   let currentPlan=ps.find(x=>x.code===sub.product_code),
       endTxt=sub.current_period_end?new Date(sub.current_period_end).toLocaleDateString("de-CH"):"–",
       live=["active","trialing","past_due"].includes(sub.status||""),
       badge=sub.cancel_at_period_end?"Kündigung vorgemerkt":(sub.status==="active"?"Aktiv":E(sub.status||""));
   subBox="<div class='panel' style='margin-top:16px'><div class='head' style='margin:0'><div><span class='badge'>Abo</span><h2 style='margin:8px 0 0'>"+E(currentPlan?.name||sub.product_code)+"</h2></div><span class='badge'>"+badge+"</span></div>"+
     "<p class='mut' style='margin-top:10px'>"+(sub.cancel_at_period_end?"Dein Abo bleibt bis "+E(endTxt)+" aktiv und endet danach automatisch.":"Aktuelle Abrechnungsperiode bis "+E(endTxt)+".")+"</p>"+
     (live?(sub.cancel_at_period_end
       ?"<button class='btn' data-sub-action='resume_subscription'>Kündigung zurücknehmen</button>"
       :"<button class='btn' data-sub-action='cancel_subscription'>Abo zum Periodenende kündigen</button>"):"")+
   "</div>"
 }


 let renderPlan=p=>{
  let paid=Number(p.price_chf)>0,
      action="",
      limit=p.listing_limit==null?"Unbegrenzt":E(p.listing_limit),
      commission=Number(p.commission_percent||0)>0
        ?F(p.commission_percent)+" % · max. CHF "+F(p.commission_cap_chf)
        :"0 % KaufMich24-Provision",
      userAudience=["dealer","business"].includes(profile?.account_type||"")?"dealer":"private",
      eligible=p.audience===userAudience,
      period=p.billing_period==="30_days"?"/30 Tage":(p.billing_period==="month"?"/Monat":"");
  if(paid){
   if(sub&&sub.product_code===p.code&&["active","trialing","past_due"].includes(sub.status||"")){
    action="<span class='badge'>✓ Aktiver Plan</span>"
   }else if(state.enabled&&user&&eligible){
    action="<div class='km24PlanActions'><button class='btn primary' data-plan='"+E(p.code)+"'>Plan wählen</button>"+(Number(points?.points_balance||0)>0?"<button class='btn' data-plan-points='"+E(p.code)+"'>🪙 Bis 25 % mit Punkten</button>":"")+"</div>"
   }else if(!state.enabled&&user&&profile?.is_admin&&stripeConfigured){
    action="<button class='btn primary' data-plan='"+E(p.code)+"'>🧪 Testzahlung</button>"
   }else if(state.enabled&&!user){
    action="<a class='btn primary' href='#/login'>Anmelden & wählen</a>"
   }else if(state.enabled&&user&&!eligible){
    action="<span class='badge'>"+(p.audience==="private"?"Nur für Privatkonten":"Nur für Firmenkonten")+"</span>"
   }else if(!state.enabled&&!profile?.is_admin){
    action="<span class='badge'>🚀 Nach der Startphase verfügbar</span>"
   }
  }
  let recommended=p.code==="dealer_pro";
  return "<div class='plan "+(recommended?"km24RecommendedPlan":"")+"'>"+(recommended?"<span class='km24RecommendedTag'>BELIEBT</span>":"")+"<span class='badge "+(p.audience==="dealer"?"dealer":"")+"'>"+(p.audience==="dealer"?"Firma":"Privat")+"</span><h3>"+E(p.name)+"</h3><div class='planPrice'>"+(paid?"CHF "+Number(p.price_chf).toFixed(2)+period:"CHF 0")+"</div><div class='km24PlanFacts'><span>📦 "+limit+" aktive Inserate</span><span>💰 "+commission+"</span></div><p>"+E(p.description||"")+"</p>"+action+"</div>"
 };
 let privateCards=ps.filter(p=>p.audience==="private").map(renderPlan).join(""),
     businessCards=ps.filter(p=>p.audience==="dealer").map(renderPlan).join(""),
     pricingSections="<section class='section km24FeeAudienceSection'><div class='head' style='margin-bottom:12px'><div><span class='badge'>👤 PRIVAT</span><h2 style='margin:8px 0 4px'>Privat verkaufen</h2><p class='mut' style='margin:0'>Eigene Tarife für Privatverkäufer – Basis, Plus oder Max.</p></div></div><div class='planGrid'>"+privateCards+"</div></section>"+
       "<section class='section km24FeeAudienceSection'><div class='head' style='margin-bottom:12px'><div><span class='badge dealer'>🏢 FIRMEN & HÄNDLER</span><h2 style='margin:8px 0 4px'>Business-Tarife</h2><p class='mut' style='margin:0'>Separate Profi-Tarife für Unternehmen und gewerbliche Verkäufer.</p></div></div><div class='planGrid'>"+businessCards+"</div></section>";

 let feeThreshold=Number(feeBilling?.small_fee_threshold_chf||5),
     smallFeeCount=Number(feeBilling?.small_fee_count||0),
     smallFeeTotal=Number(feeBilling?.small_fee_total_chf||0),
     smallFeeReady=!!feeBilling?.small_fee_ready,
     smallFeeNext=feeBilling?.next_batch_at?new Date(feeBilling.next_batch_at).toLocaleDateString("de-CH"):null,
     smallFeeBox=smallFeeCount
       ?"<div class='notice km24FeeBatchNotice'><b>🧾 Sammelabrechnung für kleine Gebühren</b><br>"+smallFeeCount+" Gebühr"+(smallFeeCount===1?"":"en")+" unter CHF "+F(feeThreshold)+" · zusammen CHF "+F(smallFeeTotal)+". "+(smallFeeReady?"Die Sammelabrechnung ist zahlungsbereit.":"Sie werden gesammelt, bis CHF "+F(feeThreshold)+" erreicht sind oder spätestens zum Monatswechsel.")+(smallFeeNext&&!smallFeeReady?" Nächster Abrechnungstermin: "+E(smallFeeNext)+".":"")+(smallFeeReady&&state.enabled?"<br><button class='btn primary' id='paySmallFeeBatch' style='margin-top:10px'>Sammelabrechnung CHF "+F(smallFeeTotal)+" bezahlen</button>":"")+"</div>"
       :"";
 let feeHtml=openFees.length
  ?"<div class='panel km24OpenFees'><h2>Offene Verkaufsgebühren</h2><p class='mut'>Du kannst Punkte bis zum vollständigen Betrag einsetzen. Gebühren unter CHF "+F(feeThreshold)+" werden nicht einzeln belastet, sondern sicher gesammelt.</p>"+smallFeeBox+openFees.map(f=>{let small=Number(f.amount_due_chf)<feeThreshold;return "<div class='km24FeeRow'><div><b>Verkaufsgebühr · CHF "+F(f.amount_due_chf)+"</b><span>"+E(f.plan_code||"Tarif")+" · bereits "+F(f.points_used||0)+" Punkte eingesetzt"+(small?" · wird gesammelt":"")+"</span></div><div class='actions'><button class='btn' data-fee-points='"+f.transaction_id+"'>🪙 Punkte einlösen</button>"+(!small?"<button class='btn primary' data-fee-pay='"+f.transaction_id+"'>Rest bezahlen</button>":"")+"</div></div>"}).join("")+"</div>"
  :"";

 let rewardsMap={fahrzeuge:"🚗 Fahrzeuge",immobilien:"🏠 Immobilien",werkzeuge:"🛠️ Werkzeuge & Maschinen",elektronik:"📱 Elektronik",haus_garten:"🏡 Haus & Garten",freizeit_sport:"⚽ Freizeit & Sport",sammeln_kunst:"🎨 Sammeln & Kunst",mode:"👔 Mode",baby_kind:"👶 Baby & Kind",tiere:"🐾 Tiere & Tierbedarf",jobs_dienstleistungen:"💼 Jobs & Dienstleistungen",sonstiges:"📦 Sonstiges"};
 let businessRewardInfo=businessReward?.plan_code==="dealer_business"
   ?"<div class='notice' style='margin-top:12px'><b>Business-Monatslimit</b><br>"+F(businessReward.points_used)+" von "+F(businessReward.points_cap)+" Verkaufspunkten diesen Monat vergeben · noch "+F(businessReward.points_remaining)+" Punkte verfügbar.</div>"
   :"";
 let rewardHtml="<div class='panel km24RewardPanel'><h2>🪙 Punkte pro erfolgreichem Verkauf</h2><p>Die Kategorie legt den maximalen Bonus fest. Bei provisionspflichtigen Tarifen wird der Bonus automatisch so begrenzt, dass sein Wert höchstens 20 % der normalen Plattformgebühr dieses Verkaufs beträgt. Im Business-Tarif ohne Verkaufsprovision gilt zusätzlich ein Limit von 5'000 Verkaufspunkten pro Kalendermonat.</p>"+businessRewardInfo+"<div class='km24RewardGrid'>"+rewards.map(x=>"<div><span>"+E(rewardsMap[x.category_slug]||x.category_slug)+"</span><b>bis "+E(x.points)+" P.</b></div>").join("")+"</div></div>";

 let historyHtml=user&&pointHistory.length
  ?"<div class='panel km24PointsHistory'><h2>Letzte Punktebewegungen</h2>"+pointHistory.map(x=>"<div class='km24PointHistoryRow'><div><b>"+E(x.description)+"</b><span>"+E(D(x.created_at))+"</span></div><strong class='"+(Number(x.points)>0?"plus":"minus")+"'>"+(Number(x.points)>0?"+":"")+E(x.points)+"</strong></div>").join("")+"</div>"
  :"";

 app.innerHTML="<div class='wrap formPage km24FeesPage'><div class='panel'><h1>Gebühren, Abos & Punkte</h1>"+payBanner+returnNotice+"<p class='mut' style='margin-top:12px'><b>Kostenlose Startphase:</b> Es werden aktuell keine Geldzahlungen von normalen Nutzern eingezogen. Spätere Tarife und Gebühren werden schon angezeigt, damit die Preisstruktur transparent bleibt. Promotionen lassen sich währenddessen mit KaufMich24 Punkten aktivieren.</p></div>"+founderHtml+pointsHtml+(user&&expiry?.next_expiry_at?"<div class='notice km24PointsExpiry'><b>⏳ Nächster Punkteverfall</b><br>"+F(expiry.points_expiring)+" Punkte verfallen am "+E(new Date(expiry.next_expiry_at).toLocaleDateString("de-CH"))+".</div>":"")+subBox+pricingSections+feeHtml+"<div class='panel km24BillingPolicy'><h2>So werden kleine Verkaufsgebühren abgerechnet</h2><p>Einzelne Verkaufsgebühren unter CHF 5 werden nicht separat belastet. KaufMich24 sammelt sie, bis mindestens CHF 5 erreicht sind. Wird die Schwelle vorher nicht erreicht, wird die offene Summe spätestens beim nächsten Monatswechsel als Sammelabrechnung fällig. Dadurch werden unnötige Kleinstzahlungen vermieden.</p></div><div class='panel km24RefundPolicy'><h2>Storno & Rückerstattung</h2><p>Noch nicht aktivierte Promotionen können bis zur Aktivierung storniert werden. Nach Aktivierung besteht bei ordnungsgemäss bereitgestellten zeitlich befristeten Promotionen grundsätzlich kein Anspruch auf anteilige Rückerstattung. Doppelbelastungen, technische Fehlbuchungen oder bezahlte, aber von KaufMich24 nicht erbrachte Leistungen werden nach Prüfung zurückerstattet oder gutgeschrieben. Abos können zum Ende der laufenden Abrechnungsperiode gekündigt werden; bereits begonnene Perioden werden grundsätzlich nicht anteilig erstattet. Zwingende gesetzliche Ansprüche bleiben vorbehalten.</p></div><div class='panel'><h2>Hervorhebungen</h2><div class='km24PromoPrices'><div><b>⭐ Top-Inserat 3 Tage</b><strong>CHF 3.90</strong><span>oder 390 Punkte</span></div><div><b>⭐ Top-Inserat 7 Tage</b><strong>CHF 5.90</strong><span>oder 590 Punkte</span></div><div><b>🏠 Startseiten-Boost 3 Tage</b><strong>CHF 8.90</strong><span>oder 890 Punkte</span></div><div><b>🏠 Startseiten-Boost 7 Tage</b><strong>CHF 12.90</strong><span>oder 1’290 Punkte</span></div></div><p class='mut'><b>Während der kostenlosen Startphase gibt es keine Kartenzahlung.</b> Promotionen können mit KaufMich24 Punkten aktiviert werden. Die CHF-Beträge zeigen bereits die späteren regulären Preise.</p>"+(profile?.is_admin&&stripeConfigured?"<div class='km24SandboxBox'><div><span class='badge'>NUR ADMIN</span><h3>🧪 Zahlungs-Sicherheitstest</h3><p>Teste direkt, ob KaufMich24 fehlgeschlagene Zahlungen korrekt erkennt und nichts freischaltet.</p></div><button class='btn primary' id='kmFailedPaymentTest'>Fehlzahlung testen</button><div class='km24SandboxSubActions'><button class='btn' data-sub-action='cancel_subscription'>Test-Abo kündigen</button><button class='btn' data-sub-action='resume_subscription'>Kündigung zurücknehmen</button></div></div>":"")+"</div>"+rewardHtml+historyHtml+"<div class='panel km24PointTerms'><h2>Wichtig zu den Punkten</h2><p>KaufMich24 Punkte sind Plattformguthaben. Sie haben keinen Barauszahlungsanspruch, können nicht an andere Nutzer übertragen werden und werden nur für von KaufMich24 angebotene Gebühren und Leistungen eingesetzt. Punkte verfallen 18 Monate nach der jeweiligen Gutschrift; beim Einlösen werden die ältesten verfügbaren Punkte zuerst verwendet. Bei Storno, Rückerstattung, manipulierten oder missbräuchlichen Transaktionen können bereits gutgeschriebene Verkaufspunkte automatisch korrigiert werden. Der Punktestand kann dabei nie unter 0 fallen.</p></div></div>";

 document.querySelectorAll("[data-plan]").forEach(b=>b.onclick=()=>startBillingCheckout(b.dataset.plan,null,null,false));
 document.querySelectorAll("[data-plan-points]").forEach(b=>b.onclick=()=>startBillingCheckout(b.dataset.planPoints,null,null,true));
 document.querySelectorAll("[data-fee-pay]").forEach(b=>b.onclick=()=>startBillingCheckout("private_sale_commission",null,b.dataset.feePay,false));
 let paySmallFeeBatch=document.getElementById("paySmallFeeBatch");
 if(paySmallFeeBatch)paySmallFeeBatch.onclick=()=>startBillingCheckout("private_sale_commission",null,null,false);
 document.querySelectorAll("[data-fee-points]").forEach(b=>b.onclick=async()=>{
   if(!confirm("Möchtest du so viele verfügbare Punkte wie möglich für diese Verkaufsgebühr einsetzen?"))return;
   b.disabled=true;
   let r=await db.rpc("redeem_points_for_sale_fee",{p_transaction_id:b.dataset.feePoints,p_points:null});
   if(r.error){alert(r.error.message);b.disabled=false;return}
   let x=(r.data||[])[0]||{};
   alert(F(x.points_used||0)+" Punkte eingelöst. Verbleibende Gebühr: CHF "+F(x.remaining_fee_chf||0));
   feesPage()
 });

 let kmFailBtn=document.getElementById("kmFailedPaymentTest");
 if(kmFailBtn)kmFailBtn.onclick=async()=>{
   kmFailBtn.disabled=true;
   let q=await db.from("listings").select("id,title").eq("seller_id",user.id).eq("status","active").order("updated_at",{ascending:false}).limit(1);
   if(q.error||!q.data?.length){alert("Für den Test braucht es mindestens ein aktives Inserat.");kmFailBtn.disabled=false;return}
   alert("Jetzt öffnet sich Stripe Sandbox. Verwende die Ablehnungs-Testkarte 4000 0000 0000 0002. Es wird kein echtes Geld belastet.");
   await startBillingCheckout("promo_top_7d",q.data[0].id,null,false);
   kmFailBtn.disabled=false;
 };

 document.querySelectorAll("[data-sub-action]").forEach(b=>b.onclick=async()=>{
   let action=b.dataset.subAction,cancel=action==="cancel_subscription";
   if(cancel&&!confirm("Abo wirklich zum Ende der aktuellen Abrechnungsperiode kündigen?"))return;
   b.disabled=true;
   let r=await db.functions.invoke("kaufmich-billing-manage",{body:{action}});
   if(r.error){
     let msg=r.error.message||"Aktion fehlgeschlagen.";
     try{let x=await r.error.context.json();msg=x?.message||x?.error||msg}catch(_){}
     alert(msg);b.disabled=false;return
   }
   alert(cancel?"Kündigung wurde vorgemerkt. Das Abo bleibt bis Periodenende aktiv.":"Kündigung wurde zurückgenommen.");
   feesPage()
 });

 if(qs.get("billing")){
   try{let clean=location.origin+location.pathname+location.hash;history.replaceState(null,"",clean)}catch(_){}
 }
}

async function startBillingCheckout(productCode,listingId,transactionId,usePoints,paymentMethod){
 if(!user)return go("#/login");
 let r=await db.functions.invoke("kaufmich-billing-checkout",{body:{product_code:productCode,listing_id:listingId||null,transaction_id:transactionId||null,use_points:!!usePoints,payment_method:paymentMethod||null}});
 if(r.error){
  let msg="Zahlung konnte nicht gestartet werden.";
  try{let x=await r.error.context.json();msg=x?.message||x?.error||msg}catch(_){msg=r.error.message||msg}
  alert(msg);return
 }
 if(r.data?.points_reserved)alert(F(r.data.points_reserved)+" Punkte wurden für diese Zahlung reserviert und nach erfolgreicher Zahlung eingelöst.");
 if(r.data?.checkout_url){location.href=r.data.checkout_url;return}
 alert("Checkout konnte nicht geöffnet werden.")
}

async function accountDeletePage(){
 let req=null;
 if(user){
   let r=await db.from("account_deletion_requests").select("id,status,requested_at,updated_at").eq("user_id",user.id).maybeSingle();
   req=r.data||null;
 }
 let state=req&&["pending","processing"].includes(req.status)
   ?"<div class='notice'><b>Deine Löschanfrage ist aktiv.</b><br>Angefordert am "+E(D(req.requested_at))+". Solange die endgültige Löschung noch nicht ausgeführt wurde, kannst du die Anfrage hier zurückziehen.</div><button class='btn' id='cancelDeleteAccount'>Löschanfrage zurückziehen</button>"
   :"";
 app.innerHTML="<div class='wrap formPage'><div class='legal' style='max-width:760px'><h1>KaufMich24-Konto löschen</h1><p>Du kannst hier die Löschung deines KaufMich24-Kontos und der dazugehörigen personenbezogenen Daten anfordern.</p><div class='panel' style='margin-top:18px'><h2>Konto löschen – auch ohne Anmeldung</h2><p>Du kannst die Löschung deines KaufMich24-Kontos und der dazugehörigen Daten auch ohne Login per E-Mail beantragen: <a href='mailto:info@kaufmich24.ch?subject=KaufMich24%20Kontoloeschung'>info@kaufmich24.ch</a>. Schreibe möglichst von der E-Mail-Adresse, mit der du dich registriert hast. Hast du darauf keinen Zugriff mehr, kannst du uns ebenfalls kontaktieren. Wir prüfen dann deine Berechtigung, bevor wir Daten löschen.</p></div><div class='notice'><b>Was passiert nach der Anfrage?</b><br>Dein Konto wird zur Löschung vorgemerkt. Profildaten und nutzergenerierte Inhalte werden gelöscht oder anonymisiert, soweit sie nicht noch für laufende Transaktionen, Streitfälle, Betrugsprävention oder gesetzliche Aufbewahrungs- und Nachweispflichten benötigt werden. Solche verbleibenden Daten werden nur für den erforderlichen Zweck und Zeitraum aufbewahrt.</div>"+(user?(state||"<div class='panel' style='margin-top:20px'><h2>Löschung anfordern</h2><p class='mut'>Prüfe vorher offene Käufe, Verkäufe, Auktionen, Supportfälle und laufende Abwicklungen. Eine Löschanfrage ist kein Ersatz für die Erfüllung bereits eingegangener Verpflichtungen gegenüber anderen Nutzern.</p><label>Grund <small class='mut'>(optional)</small><textarea id='deleteReason' rows='3' maxlength='1000' placeholder='Optionaler Hinweis'></textarea></label><button class='btn km24DangerBtn' id='requestDeleteAccount' style='margin-top:12px'>Kontolöschung anfordern</button></div>"):"<div class='notice'>Bitte melde dich mit dem Konto an, das du löschen möchtest.</div><a class='btn primary' href='#/login'>Anmelden</a>")+"<p style='margin-top:24px'><a href='#/privacy'>Datenschutzerklärung</a> · <a href='#/terms'>AGB</a> · <a href='#/support'>Support</a></p></div></div>";
 let b=document.getElementById("requestDeleteAccount");
 if(b)b.onclick=async()=>{if(!confirm("Kontolöschung wirklich anfordern? Offene Verpflichtungen gegenüber anderen Nutzern bleiben bestehen und gesetzlich erforderliche Daten können weiterhin aufbewahrt werden."))return;b.disabled=true;let reason=document.getElementById("deleteReason")?.value||null,r=await db.rpc("request_account_deletion",{p_reason:reason});if(r.error){b.disabled=false;alert(r.error.message)}else accountDeletePage()};
 let c=document.getElementById("cancelDeleteAccount");
 if(c)c.onclick=async()=>{let r=await db.rpc("cancel_account_deletion");if(r.error)alert(r.error.message);else accountDeletePage()};
}
function termsPage(){app.innerHTML="<div class='wrap'><div class='legal'><h1>Allgemeine Geschäftsbedingungen (AGB)</h1><p><b>Stand: 28. Oktober 2026.</b></p><h2>1. Betreiber und Geltungsbereich</h2><p>KaufMich24 ist eine Online-Marktplatzplattform, betrieben durch MB CarConcept by Vasic (Inhaber: Bojan Vasic), Winkel 3, 6234 Triengen, Schweiz. Kontakt: <a href='mailto:info@kaufmich24.ch'>info@kaufmich24.ch</a>. Diese AGB gelten für die Nutzung der Plattform durch private und gewerbliche Nutzer.</p><h2>2. Rolle von KaufMich24</h2><p>KaufMich24 stellt die technische Plattform für Inserate, Sofortkäufe, Preisvorschläge, Auktionen, Nachrichten und weitere Marktplatzfunktionen bereit. KaufMich24 ist bei Nutzerangeboten grundsätzlich weder Verkäufer noch Käufer und wird nicht Partei des Kaufvertrags zwischen den beteiligten Nutzern, sofern bei einer Funktion nicht ausdrücklich etwas anderes angegeben wird.</p><h2>3. Konto und Nutzung</h2><p>KaufMich24 ist grundsätzlich für Personen ab 18 Jahren bestimmt. Bei der Registrierung bestätigt der Nutzer seine Volljährigkeit sowie die aktuelle AGB- und Datenschutzfassung; Version und Zeitpunkt werden am Konto protokolliert. Nutzer müssen richtige und aktuelle Angaben machen und ihr Konto vor unbefugtem Zugriff schützen. Für bestimmte Funktionen werden eine bestätigte E-Mail-Adresse, eine gültige Mobilnummer und eine bestätigte Wohnadresse verlangt. KaufMich24 richtet sich primär an den Schweizer Markt. Eine kostenpflichtige Käuferaktivierung für Wohnsitz im Ausland ist derzeit nicht freigeschaltet und darf erst nach separater Aktivierung und klarer Preisangabe eingeführt werden. Nutzer müssen rechtlich befugt sein, die von ihnen abgeschlossenen Geschäfte einzugehen.</p><h2>3a. Private und gewerbliche Nutzung</h2><p>Wer KaufMich24 überwiegend im Rahmen einer geschäftlichen oder beruflichen Tätigkeit nutzt, muss ein Händler- bzw. Unternehmenskonto verwenden und die dort verlangten Unternehmensangaben wahrheitsgemäss hinterlegen. Gewerbliche Anbieter bleiben selbst dafür verantwortlich, die für sie geltenden gesetzlichen Informations-, Preis-, Gewährleistungs-, Steuer- und Konsumentenschutzpflichten einzuhalten. Die Kennzeichnung als Privatperson darf nicht verwendet werden, um solche Pflichten zu umgehen.</p><h2>4. Inserate und Inhalte</h2><p>Nutzer können Verkaufsangebote oder Gesuche veröffentlichen. Ein Gesuch ist kein Verkaufsangebot und ein Klick auf <b>„Ich habe das“</b> stellt lediglich den Kontakt zwischen den Nutzern her; ein Vertrag entsteht dadurch noch nicht.</p><p>Inserate müssen wahrheitsgemäss, vollständig und rechtmässig sein. Verboten sind insbesondere rechtswidrige, gestohlene, gefälschte, irreführend bezeichnete oder Rechte Dritter verletzende Angebote sowie Angebote, deren Handel gesetzlich verboten ist oder gegen Plattformregeln verstösst. Ergänzend gelten die <a href='#/prohibited'>Regeln zu verbotenen und eingeschränkten Artikeln</a>. Verkäufer müssen die erforderlichen Rechte an hochgeladenen Bildern und Texten besitzen. Mit dem Hochladen erhält KaufMich24 das nicht ausschliessliche Recht, diese Inhalte soweit nötig für Betrieb, Darstellung und Bewerbung des Inserats auf der Plattform zu verwenden.</p><h2>5. Vertragsabschluss zwischen Nutzern</h2><p>Bei Fixpreis-Inseraten wird der Nutzer vor dem Abschluss nochmals auf die Verbindlichkeit hingewiesen. Mit dem Klick auf <b>Verbindlich kaufen</b> wird der Kauf verbindlich abgeschlossen und das Inserat als verkauft markiert. Bei Preisvorschlägen kommt der Vertrag zustande, wenn der Verkäufer ein noch offenes Angebot annimmt. Bei Auktionen ist ein gültiges Gebot verbindlich; endet die Auktion mit erreichtem Mindestpreis, kommt der Vertrag mit dem Höchstbietenden zum Endpreis zustande. Wird ein Mindestpreis nicht erreicht oder liegt kein gültiges Gebot vor, kommt kein Verkauf zustande. Zwingende gesetzliche Rechte, insbesondere im Verhältnis zwischen gewerblichen Verkäufern und Konsumenten, bleiben vorbehalten.</p><h2>6. Auktionen</h2><p>Eigengebote, künstliche Preismanipulation und Absprachen zur Verfälschung des Auktionsverlaufs sind untersagt. Gültige Gebote können nach Abgabe nicht einseitig zurückgenommen werden, soweit nicht zwingendes Recht etwas anderes verlangt. Gebote in der letzten Minute können die Auktion automatisch verlängern; die jeweils auf der Auktionsseite angezeigte Endzeit ist massgebend. Verweigert der Höchstbieter die Abwicklung oder reagiert nicht mehr, kann der Verkäufer dem zweit- oder dritthöchsten Bieter dessen ursprüngliches Gebot als Nachrücker-Angebot unterbreiten. Für den Nachrücker entsteht der Kauf erst mit seiner ausdrücklichen Annahme.</p><h2>7. Zahlung, Übergabe und Versand</h2><p>Die Bezahlung des Kaufpreises für Waren oder sonstige Nutzerangebote erfolgt derzeit grundsätzlich direkt zwischen Käufer und Verkäufer. KaufMich24 verwahrt keine Kaufpreise, führt keine Treuhand- oder Escrow-Funktion und leitet keine Kaufpreise an Verkäufer weiter. Eine auf KaufMich24 angezeigte Stripe-Zahlung betrifft ausschliesslich eigene Plattformleistungen von KaufMich24, etwa Händler-Abonnements oder optionale Inserat-Hervorhebungen. Käufer und Verkäufer vereinbaren Zahlung, Versand oder Abholung des Kaufgegenstands selbst. KaufMich24 übernimmt keine Garantie für Zahlung, Lieferung, Zustand, Eigentum oder sonstige Vertragserfüllung durch einen Nutzer.</p><h2>8. Gebühren, Abonnements, Promotionen und Punkte</h2><p>Es gelten die jeweils auf der Seite <a href='#/fees'>Gebühren, Abos & Punkte</a> veröffentlichten Konditionen. Kostenpflichtige Leistungen werden vor dem Abschluss klar ausgewiesen. Händler-Abonnements werden, soweit aktiviert, periodisch entsprechend dem gewählten Tarif abgerechnet und können gemäss der im Konto angezeigten Regelung zum Ende der laufenden Abrechnungsperiode gekündigt werden. Einmalige Promotionen wie Top-Inserate oder Startseiten-Boosts gelten für die jeweils angegebene Dauer. KaufMich24 kann Nutzern Punkte als Plattformguthaben gutschreiben. 100 Punkte entsprechen derzeit CHF 1 anrechenbarem Plattformguthaben. Punkte sind nicht auszahlbar oder übertragbar. Verkaufsgebühren und Promotionen können gemäss Gebührenseite bis zu 100 %, Händler-Abonnements bis zum dort angegebenen Höchstanteil mit Punkten verrechnet werden. Punkte aus stornierten, manipulierten oder missbräuchlichen Vorgängen können korrigiert oder entzogen werden. Während der aktuellen kostenlosen Startphase werden von normalen Nutzern keine Geldzahlungen für Inserieren, reguläre Verkaufsgebühren, Händler-Abonnements, Käuferaktivierung oder Promotionen eingezogen. Optionale Promotionen können in dieser Phase mit verfügbaren KaufMich24 Punkten aktiviert werden; angezeigte CHF-Beträge dienen als transparente Vorschau auf die späteren regulären Preise. Geldzahlungen werden erst nach ausdrücklicher Freischaltung der Zahlungsfunktion und klarer Anzeige vor dem Abschluss möglich. Zeitlich begrenzte kostenlose Leistungen und Bonusaktionen begründen keinen Anspruch auf dauerhafte kostenlose Nutzung. Zwingende gesetzliche Rechte bleiben vorbehalten.</p><p><b>Gründer-Aktion:</b> Die ersten 1’000 qualifizierten echten Verkäufer können Gründer-Verkäufer werden. Nach 14 qualifizierten Tagen mit einem echten öffentlichen Verkaufsinserat werden 1’000 Punkte (= CHF 10 Plattformguthaben) gutgeschrieben. Nach 30 qualifizierten Tagen oder früher nach einem über KaufMich24 erfolgreich abgeschlossenen Verkauf werden weitere 2’000 Punkte (= CHF 20) sowie 0 % Verkaufsgebühr bis 31.12.2027 freigeschaltet. Gelöschte Test- oder Fake-Inserate zählen nicht. Der Gründer-Status und die Vorteile sind kontobezogen, nicht übertragbar und gelten nur im Rahmen der veröffentlichten Aktionsbedingungen.</p><h2>8a. Stornierung, Rückerstattungen und Fehlbuchungen</h2><p>Für kostenpflichtige Leistungen von KaufMich24 gilt: Eine noch nicht aktivierte Promotion kann bis zur Aktivierung storniert werden. Nach Aktivierung einer zeitlich befristeten Promotion besteht grundsätzlich kein Anspruch auf anteilige Rückerstattung, sofern die Leistung vertragsgemäss bereitgestellt wurde. Bei Doppelbelastungen, technisch fehlerhaften Belastungen oder einer von KaufMich24 nicht erbrachten bezahlten Leistung wird der zu Unrecht belastete Betrag nach Prüfung zurückerstattet oder gutgeschrieben. Händler-Abonnements können zum Ende der laufenden Abrechnungsperiode gekündigt werden; bereits begonnene Abrechnungsperioden werden grundsätzlich nicht anteilig erstattet. Zwingende gesetzliche Ansprüche bleiben vorbehalten. Für Kaufverträge zwischen Nutzern richten sich Rücktritt, Rückgabe, Gewährleistung und allfällige Rückerstattungen nach dem Vertrag zwischen Käufer und Verkäufer sowie dem anwendbaren Recht; KaufMich24 ist nicht Verkäufer der Nutzerangebote.</p><h2>9. Kommunikation, Besichtigungen, Bewertungen und Meldungen</h2><p>Beim erstmaligen Kontakt zu einem aktiven Verkaufsinserat wird zwischen allgemeinen Fragen und der Vereinbarung einer Besichtigung, Probefahrt oder Abholung unterschieden. In Chats für allgemeine Fragen dürfen private Kontaktdaten wie Telefonnummern, E-Mail-Adressen, Messenger-Kontakte oder externe Kontaktlinks vor einer bestätigten Besichtigung bzw. vor einem abgeschlossenen Geschäft nicht ausgetauscht werden. KaufMich24 kann solche Angaben technisch erkennen und die Übermittlung blockieren. Nach Bestätigung eines über KaufMich24 vereinbarten Termins oder nach einem abgeschlossenen Geschäft wird der Kontaktaustausch für die betreffende Unterhaltung freigegeben. Eine absichtliche Umgehung dieser Schutzmechanismen kann als missbräuchliche Nutzung behandelt werden. Nach einem bestätigten Besichtigungstermin kann KaufMich24 beide Beteiligten fragen, ob der Termin stattgefunden hat und ob ein Verkauf zustande kam. Ein Verkauf wird nur dann automatisch erfasst, wenn beide Beteiligten dies bestätigen; bei widersprüchlichen Angaben erfolgt keine automatische Änderung.</p><p>Nachrichten, Bewertungen, Meldungen und Supportfunktionen dürfen nicht für Belästigung, Betrug, Spam oder rechtswidrige Inhalte verwendet werden. Bewertungen sollen auf tatsächlichen Transaktionen und eigenen Erfahrungen beruhen.</p><h2>10. Moderation und Kontosperren</h2><p>KaufMich24 darf Inhalte pausieren oder entfernen und Konten vorübergehend oder dauerhaft einschränken, wenn konkrete Hinweise auf Rechtsverstösse, Betrug, Sicherheitsrisiken, Manipulation, wiederholte Regelverstösse oder missbräuchliche Nutzung bestehen. Wo angemessen, kann der betroffene Nutzer den Support kontaktieren.</p><h2>11. Verfügbarkeit</h2><p>KaufMich24 bemüht sich um einen zuverlässigen Betrieb, kann aber keine jederzeitige unterbrechungs- oder fehlerfreie Verfügbarkeit garantieren. Wartung, Sicherheitsmassnahmen und technische Störungen können Funktionen zeitweise einschränken.</p><h2>12. Haftung</h2><p>Jeder Nutzer ist für eigene Inserate, Angaben, Kommunikation und Vertragserfüllung verantwortlich. KaufMich24 haftet im gesetzlich zulässigen Umfang nicht für Angaben, Handlungen oder Pflichtverletzungen anderer Nutzer oder für Schäden aus Verträgen zwischen Nutzern. Eine Haftungsbeschränkung gilt nicht, soweit sie nach zwingendem Recht unzulässig ist, insbesondere nicht für vorsätzlich oder grobfahrlässig verursachte eigene Schäden, soweit ein Ausschluss gesetzlich nicht zulässig ist.</p><h2>13. Datenschutz</h2><p>Informationen über die Bearbeitung von Personendaten enthält die <a href='#/privacy'>Datenschutzerklärung</a>.</p><h2>14. Änderungen</h2><p>KaufMich24 kann diese AGB für die zukünftige Nutzung anpassen, wenn dies aufgrund neuer Funktionen, rechtlicher Anforderungen oder Sicherheits- und Betriebsbedürfnisse erforderlich ist. Wesentliche Änderungen werden angemessen bekanntgegeben.</p><h2>15. Anwendbares Recht und Gerichtsstand</h2><p>Es gilt Schweizer Recht. Zwingende gesetzliche Gerichtsstände, insbesondere zugunsten von Konsumenten, bleiben vorbehalten.</p></div></div>"}
function privacyPage(){app.innerHTML="<div class='wrap'><div class='legal'><h1>Datenschutzerklärung</h1><p><b>Stand: 28. Oktober 2026.</b></p><h2>1. Verantwortlicher</h2><p>Verantwortlich für die Datenbearbeitung auf KaufMich24 ist MB CarConcept by Vasic (Inhaber: Bojan Vasic), Winkel 3, 6234 Triengen, Schweiz. Datenschutzanfragen können an <a href='mailto:info@kaufmich24.ch'>info@kaufmich24.ch</a> oder über den <a href='#/support'>Support</a> gerichtet werden.</p><h2>2. Welche Personendaten wir bearbeiten</h2><p>Je nach Nutzung bearbeiten wir insbesondere Konto- und Kontaktdaten wie E-Mail-Adresse und Mobilnummer, Profilangaben, Geschäftsangaben, Inserate, Beschreibungen und Bilder, Favoriten und Suchaufträge, Nachrichten zwischen Nutzern, Preisvorschläge, Gebote, Käufe und Verkäufe, Bewertungen, Meldungen und Supportanfragen sowie technische Daten wie Zeitpunkt von Zugriffen, Browser-/Geräteinformationen, Push-Abonnements und sicherheitsrelevante Protokolldaten. Bei Registrierung bzw. rechtlichen Aktualisierungen speichern wir zusätzlich die bestätigte AGB-Version, die zur Kenntnis genommene Datenschutzversion, die Bestätigung der Volljährigkeit und den jeweiligen Zeitpunkt. Wenn kostenpflichtige KaufMich24-Leistungen genutzt werden, bearbeiten wir zusätzlich Abrechnungsdaten wie gewählten Tarif oder Promotion, Betrag, Währung, Zahlungsstatus sowie technische Zahlungs- und Transaktionskennungen. Vollständige Karten- oder Kontodaten werden dabei grundsätzlich direkt vom eingesetzten Zahlungsdienstleister verarbeitet und nicht in unserer Plattformdatenbank gespeichert.</p><p><b>Keine Ausweisprüfung im normalen Kontoablauf:</b> Für Registrierung, Kaufen oder Verkaufen verlangt KaufMich24 derzeit keinen Upload von Ausweisen, Pässen oder anderen Identitätsdokumenten und erhebt solche Dokumente hierfür nicht.</p><h2>3. Zwecke der Bearbeitung</h2><p>Wir bearbeiten Personendaten, um Konten zu registrieren und zu verwalten, Inserate und Marktplatzfunktionen bereitzustellen, Sofortkäufe, Preisvorschläge und Auktionen technisch abzuwickeln, Nutzerkommunikation, Besichtigungstermine und Rückmeldungen nach Besichtigungen zu ermöglichen, Benachrichtigungen zu versenden, kostenpflichtige Plattformleistungen abzurechnen, Zahlungsbestätigungen und Abonnementstatus zu verarbeiten, Missbrauch und Betrug zu verhindern, Support und Moderation durchzuführen, die Sicherheit und Stabilität der Plattform zu gewährleisten und rechtliche Pflichten zu erfüllen.</p><p>Vor der Freigabe des Kontaktaustauschs werden Nachrichtentexte automatisiert auf typische Muster von Telefonnummern, E-Mail-Adressen, Messenger-Kontakten und externen Kontaktlinks geprüft. Erkannte Kontaktdaten können technisch blockiert werden. Diese Prüfung dient dem sicheren Plattformablauf und der Durchsetzung der Kommunikationsregeln und nicht personalisierter Werbung.</p><h2>4. Sichtbarkeit gegenüber anderen Nutzern</h2><p>Öffentliche Inserate und die dafür vorgesehenen öffentlichen Profilinformationen können anderen Besuchern angezeigt werden. Private Kontaktdaten und nicht für die Öffentlichkeit bestimmte Kontodaten werden nicht öffentlich angezeigt. Kontaktdaten können nach Bestätigung eines über KaufMich24 vereinbarten Besichtigungs-, Probefahrt- oder Abholtermins sowie nach einem abgeschlossenen Geschäft zwischen den beteiligten Nutzern ausgetauscht werden.</p><h2>5. Dienstleister und Datenempfänger</h2><p>Für den technischen Betrieb setzen wir derzeit insbesondere <b>Supabase</b> für Datenbank, Anmeldung, Dateispeicher und die technische Bereitstellung wesentlicher Webfunktionen, <b>Resend</b> für automatische E-Mails, <b>ImprovMX</b> für die Weiterleitung von E-Mails an unsere Domain-Adressen und <b>OpenAI</b> für ausdrücklich eingesetzte KI-Funktionen ein. Für künftig kostenpflichtige KaufMich24-Leistungen ist <b>Stripe</b> als Zahlungsdienstleister vorgesehen; Stripe verarbeitet dabei die zur Zahlungsabwicklung erforderlichen Zahlungs- und Transaktionsdaten. Während der kostenlosen Startphase sind Echtgeld-Zahlungen für normale Nutzer technisch gesperrt. Administrativ können isolierte Testzahlungen in einer Sandbox-Umgebung durchgeführt werden; diese dienen ausschliesslich der Funktionsprüfung. Push-Benachrichtigungen werden zusätzlich über die Push-Infrastruktur des jeweils verwendeten Browsers oder Betriebssystems zugestellt. Diese Anbieter bearbeiten Daten nur soweit dies für die jeweilige Leistung erforderlich ist.</p><h2>6. Bearbeitung im Ausland</h2><p>Je nach eingesetztem Dienstleister können Personendaten ausserhalb der Schweiz, insbesondere in Staaten der EU/des EWR oder in den USA, bearbeitet werden. Soweit für ein Empfängerland kein als angemessen anerkanntes Datenschutzniveau besteht, verwenden wir die gesetzlich vorgesehenen geeigneten Garantien oder stützen uns auf eine zulässige Ausnahme.</p><h2>7. E-Mail- und Push-Benachrichtigungen</h2><p>Transaktions- und Sicherheitsmeldungen können an die hinterlegte E-Mail-Adresse gesendet werden. Automatische Nachrichten werden derzeit von <b>noreply@kaufmich24.ch</b> versendet; Antworten werden an <b>support@kaufmich24.ch</b> geleitet. Push-Benachrichtigungen werden nur eingerichtet, wenn der Nutzer die entsprechende Browser-Berechtigung erteilt. Eine Push-Subscription kann wieder deaktiviert werden.</p><h2>8. Browser-Speicher und Reichweitenmessung</h2><p>Für Anmeldung, Sitzungsverwaltung und technische Funktionen kann notwendiger Browser-Speicher verwendet werden. Zur Messung eigener Werbekampagnen verarbeitet KaufMich24 zudem Kampagnenparameter wie Quelle, Medium und Kampagnenname (z. B. UTM-Parameter) sowie eine zufällig erzeugte Sitzungskennung im Sitzungsspeicher des Browsers. Damit messen wir in zusammengefasster Form, wie viele Kampagnenbesuche zu einer Registrierung und später zu einem Inserat führen. Diese Messung dient der eigenen Reichweiten- und Erfolgskontrolle und wird nicht für personalisierte Werbung oder den Aufbau eines werblichen Interessenprofils verwendet. Meta Pixel und TikTok Pixel sind derzeit nicht aktiviert. Falls zukünftig zusätzliche externe Analyse- oder Marketingdienste eingeführt werden, wird diese Datenschutzerklärung entsprechend aktualisiert und erforderliche Einwilligungen werden eingeholt.</p><h2>9. Speicherdauer</h2><p>Personendaten werden nur so lange aufbewahrt, wie sie für den jeweiligen Zweck, die Sicherheit der Plattform, die Bearbeitung von Streitfällen oder gesetzliche Aufbewahrungs- und Nachweispflichten erforderlich sind. Kontodaten können während der Dauer des Kontos gespeichert werden. Transaktions-, Moderations- und Sicherheitsdaten sowie Nachweise über die Annahme rechtlicher Fassungen können auch danach für eine angemessene oder gesetzlich vorgeschriebene Frist aufbewahrt werden.</p><h2>10. Datensicherheit</h2><p>Wir treffen angemessene technische und organisatorische Massnahmen zum Schutz der Personendaten. Dazu gehören unter anderem Zugriffsbeschränkungen, rollenbasierte Datenbankregeln, technische Protokollierung sicherheitsrelevanter Vorgänge und verschlüsselte Verbindungen. Kein Online-System kann jedoch absolute Sicherheit garantieren.</p><h2>11. Rechte betroffener Personen</h2><p>Betroffene Personen können nach Massgabe des Schweizer Datenschutzrechts insbesondere Auskunft über ihre bearbeiteten Personendaten sowie die Berichtigung unrichtiger Daten verlangen und, soweit die gesetzlichen Voraussetzungen erfüllt sind, die Löschung oder weitere datenschutzrechtliche Ansprüche geltend machen. Eine Kontolöschung kann direkt über <a href='#/account-delete'>Konto löschen</a> angefordert werden. Datenschutzanfragen können zusätzlich an <a href='mailto:info@kaufmich24.ch'>info@kaufmich24.ch</a> gerichtet werden. Bei einer konkreten Datenschutzanfrage können wir, soweit dies zur sicheren Zuordnung erforderlich ist, angemessene zusätzliche Angaben zur Identitätsprüfung verlangen; ein genereller Ausweis-Upload ist nicht Teil der Kontoregistrierung.</p><h2>12. Änderungen</h2><p>Wir können diese Datenschutzerklärung anpassen, wenn sich Datenbearbeitungen, eingesetzte Dienstleister oder rechtliche Anforderungen ändern. Die jeweils aktuelle Fassung ist auf KaufMich24 veröffentlicht.</p></div></div>"}
function imprintPage(){app.innerHTML="<div class='wrap'><div class='legal'><h1>Impressum</h1><p><b>Plattform:</b> KaufMich24</p><p><b>Betreiber:</b><br>MB CarConcept by Vasic<br><b>Inhaber:</b> Bojan Vasic<br><b>Unternehmensform:</b> Einzelfirma<br>Winkel 3<br>6234 Triengen<br>Schweiz</p><p><b>Allgemeine Anfragen:</b> <a href='mailto:info@kaufmich24.ch'>info@kaufmich24.ch</a><br><b>Support:</b> <a href='mailto:support@kaufmich24.ch'>support@kaufmich24.ch</a></p><p><a href='#/support'>Kontakt & Support</a> · <a href='#/privacy'>Datenschutz</a> · <a href='#/terms'>AGB</a></p></div></div>"}

function prohibitedPage(){app.innerHTML="<div class='wrap'><div class='legal'><h1>Verbotene & eingeschränkte Angebote</h1><p><b>Stand: 27. September 2026.</b></p><p>Diese Regeln ergänzen die AGB. Sie dienen der Sicherheit der Nutzer und reduzieren rechtliche Risiken auf dem Marktplatz.</p><h2>1. Nicht erlaubt</h2><p>Auf KaufMich24 dürfen insbesondere keine gestohlenen oder rechtswidrig erlangten Sachen, Fälschungen, verbotenen Waffen oder verbotenen Waffenteile, Munition oder Explosivstoffe, illegale Betäubungsmittel, verschreibungspflichtige Medikamente ohne zulässigen Vertrieb, gefälschte amtliche Dokumente, gestohlene Zugangsdaten sowie Angebote veröffentlicht werden, die Rechte Dritter verletzen.</p><h2>2. Alkohol, Tabak & Nikotin</h2><p>Alkoholische Getränke sowie Tabak-, Nikotin- und Vape-Produkte dürfen derzeit nicht über KaufMich24 angeboten werden. Damit werden Alterskontroll- und Vertriebspflichten nicht auf einzelne Nutzer verlagert.</p><h2>3. Tiere & geschützte Arten</h2><p>Tierbedarf ist zulässig. Bei lebenden Tieren, geschützten Arten oder daraus hergestellten Produkten gelten besondere gesetzliche Anforderungen. KaufMich24 kann solche Angebote ablehnen, Nachweise verlangen oder Kategorien technisch einschränken.</p><h2>4. Gefährliche, regulierte oder sensible Güter</h2><p>Für Chemikalien, Medizinprodukte, Lebensmittel, Fahrzeuge, Finanzprodukte, Kulturgüter oder andere regulierte Güter bleiben sämtliche gesetzlichen Verkaufs-, Kennzeichnungs-, Sicherheits- und Bewilligungspflichten beim Anbieter. KaufMich24 kann Angebote vorsorglich sperren, wenn die Rechtmässigkeit unklar ist.</p><h2>5. Dienstleistungen</h2><p>Verboten sind rechtswidrige Dienstleistungen, Betrugsangebote, Umgehung gesetzlicher Pflichten sowie Angebote, die Gewalt, Ausbeutung oder andere strafbare Handlungen fördern.</p><h2>6. Meldung & Entfernung</h2><p>Nutzer können verdächtige Inserate über die Melde- oder Supportfunktion melden. KaufMich24 darf Angebote pausieren oder entfernen und Konten einschränken, wenn konkrete Hinweise auf Rechtsverstösse oder erhebliche Sicherheitsrisiken bestehen.</p><p><a href='#/terms'>AGB</a> · <a href='#/support'>Verdächtiges Angebot melden</a></p></div></div>"}

function supportCategoryLabel(c){
 return ({
  buying:"Kaufen & Bestellung",
  selling:"Verkaufen & Inserate",
  auction:"Auktionen & Gebote",
  payment:"Zahlung & Übergabe",
  account:"Konto & Anmeldung",
  verification:"Konto & Sicherheit",
  safety:"Sicherheit & Meldung",
  fees:"Gebühren & Promotionen",
  technical:"Technisches Problem",
  other:"Sonstiges"
 }[c]||"Sonstiges")
}
function supportTopicCategory(t){
 if(["buyNow","offer","sellerNoReply"].includes(t))return "buying";
 if(["buyerNoReply","createListing","manageListing","markSold","promotion"].includes(t))return "selling";
 if(["auction","auctionWon","outbid"].includes(t))return "auction";
 if(["payment","delivery","paidNotReceived"].includes(t))return "payment";
 if(["account","notifications","savedSearch","privacy"].includes(t))return "account";
 if(t==="verification")return "verification";
 if(["fraud","reportBlock"].includes(t))return "safety";
 if(t==="fees")return "fees";
 return "other"
}
async function supportPage(){
 let tickets=[];
 if(user){
   let tr=await db.from("support_requests").select("*").eq("user_id",user.id).order("created_at",{ascending:false}).limit(50);
   tickets=tr.data||[]
 }

 let lastQ=sessionStorage.getItem("km_ai_last_question")||"",
     lastTopic=sessionStorage.getItem("km_ai_last_topic")||"",
     presetCat=supportTopicCategory(lastTopic),
     catOptions=["buying","selling","auction","payment","account","verification","safety","fees","technical","other"]
       .map(c=>"<option value='"+c+"' "+(c===presetCat?"selected":"")+">"+E(supportCategoryLabel(c))+"</option>").join(""),
     ticketHtml=tickets.length?tickets.map(t=>{
       let open=t.status!=="closed";
       return "<article class='km24SupportTicket'>"+
         "<div class='km24SupportTicketTop'><div><span class='km24SupportTicketCat'>"+E(supportCategoryLabel(t.category))+"</span><h3>"+E(t.subject)+"</h3></div><span class='km24SupportStatus "+(open?"open":"closed")+"'>"+(open?"Offen":"Erledigt")+"</span></div>"+
         "<p>"+E(t.message)+"</p>"+
         "<div class='km24SupportTicketMeta'>Gesendet "+E(D(t.created_at))+"</div>"+
         (t.public_reply?"<div class='km24SupportReply'><b>Antwort vom KaufMich24 Support</b><p>"+E(t.public_reply)+"</p></div>":"")+
       "</article>"
     }).join(""):"<div class='km24SupportEmpty'><span>📨</span><b>Noch keine Support-Anfragen</b><p>Wenn du persönliche Hilfe brauchst, kannst du unten direkt eine Anfrage senden.</p></div>";

 app.innerHTML=
 "<div class='wrap formPage km24SupportPage'>"+
   "<section class='km24SupportHero'>"+
     "<div><span class='km24AccountKicker'>HILFE & SUPPORT</span><h1>Wie können wir helfen?</h1><p>Nutze zuerst den kostenlosen Hilfe-Assistenten. Wenn dein Problem persönlich oder nicht lösbar ist, kannst du direkt eine Support-Anfrage senden.</p></div>"+
     "<button class='btn primary' id='openHelpAssistant'>💬 Hilfe-Assistent öffnen</button>"+
   "</section>"+

   "<section class='km24SupportChoiceGrid'>"+
     "<button type='button' id='supportAskAssistant'><span>💬</span><div><b>Sofort-Hilfe</b><small>Fragen zu Käufen, Verkäufen, Auktionen, Konto und mehr</small></div><i>›</i></button>"+
     "<button type='button' id='supportJumpForm'><span>👤</span><div><b>Menschlicher Support</b><small>Für konkrete Konten-, Zahlungs-, Streit- oder Betrugsfälle</small></div><i>›</i></button>"+
     "<a href='mailto:support@kaufmich24.ch'><span>✉️</span><div><b>E-Mail</b><small>support@kaufmich24.ch</small></div><i>›</i></a>"+
   "</section>"+

   "<section class='km24SupportFaq'>"+
     "<div class='km24AccountSectionHead'><div><span class='km24AccountKicker'>SCHNELLE HILFE</span><h2>Häufige Fragen</h2><p>Die wichtigsten Antworten ohne Wartezeit.</p></div></div>"+
     "<div class='km24SupportFaqGrid'>"+
       "<details><summary>🔨 Wie funktionieren Auktionen?</summary><p>Gebote sind verbindlich. Ein allfälliger Mindestpreis muss erreicht sein. Nach Auktionsende gewinnt grundsätzlich der Höchstbietende; Gebote kurz vor Schluss können die Auktion automatisch verlängern.</p></details>"+
       "<details><summary>🏆 Auktion gewonnen – was jetzt?</summary><p>Kontaktiere den Verkäufer über KaufMich24 und vereinbart Zahlung sowie Abholung oder Versand. Prüfe nochmals Inserat, Endpreis und Übergabedetails.</p></details>"+
       "<details><summary>🛍 Wie funktioniert Fixpreis?</summary><p>Mit „Verbindlich kaufen“ wird der Kauf abgeschlossen. Prüfe vorher Preis, Zustand und Übergabe. Zahlung und Übergabe werden derzeit grundsätzlich direkt vereinbart.</p></details>"+
       "<details><summary>💬 Verkäufer antwortet nicht</summary><p>Schreibe nochmals über KaufMich24 und gib etwas Zeit. Wenn weiterhin keine Antwort kommt oder du bereits bezahlt hast, sende eine Support-Anfrage.</p></details>"+
       "<details><summary>💳 Wie läuft die Zahlung?</summary><p>Solange keine eigene Zahlungsfunktion ausdrücklich angezeigt wird, vereinbaren Käufer und Verkäufer Zahlung, Versand oder Abholung direkt miteinander.</p></details>"+
       "<details><summary>🛡️ Welche Kontodaten muss ich bestätigen?</summary><p>Für Kaufen und Verkaufen brauchst du eine bestätigte E-Mail-Adresse, eine gültige Mobilnummer und eine einmal bestätigte Wohnadresse.</p></details>"+
       "<details><summary>⚠️ Ich vermute Betrug</summary><p>Zahle nicht weiter, sende keine sensiblen Daten und sichere Chat, Inserat und Zahlungsbelege. Melde Nutzer/Inserat und sende zusätzlich eine Support-Anfrage.</p></details>"+
       "<details><summary>💰 Was kostet KaufMich24?</summary><p>Während der kostenlosen Startphase werden von normalen Nutzern keine Geldzahlungen eingezogen. Spätere Tarife und Gebühren sind unter „Gebühren“ transparent sichtbar. Promotionen können aktuell mit KaufMich24 Punkten aktiviert werden.</p></details>"+
     "</div>"+
   "</section>"+

   (user?
   "<section class='km24MySupport'><div class='km24AccountSectionHead'><div><span class='km24AccountKicker'>DEINE ANFRAGEN</span><h2>Meine Support-Anfragen</h2><p>Status und Antworten vom KaufMich24 Support.</p></div><span class='km24SupportCount'>"+tickets.length+"</span></div><div class='km24SupportTicketList'>"+ticketHtml+"</div></section>"
   :"")+

   "<section class='km24SupportFormSection' id='supportRequestForm'>"+
     "<div class='km24AccountSectionHead'><div><span class='km24AccountKicker'>PERSÖNLICHE HILFE</span><h2>Support-Anfrage senden</h2><p>Beschreibe das Problem möglichst genau. Keine Passwörter oder vollständigen Zahlungsdaten senden.</p></div></div>"+
     "<form id='supportForm' class='stack km24SupportForm'>"+
       "<label>Kategorie<select id='scategory' required>"+catOptions+"</select></label>"+
       "<label>E-Mail für Rückmeldung<input id='semail' type='email' value='"+E(user?.email||"")+"' "+(user?"":"required")+" placeholder='name@beispiel.ch'></label>"+
       "<label>Betreff<input id='ssubject' required maxlength='160' value='"+E(lastQ?("Hilfe zu: "+lastQ.slice(0,90)):"")+"' placeholder='Worum geht es?'></label>"+
       "<label>Nachricht<textarea id='smessage' rows='7' required maxlength='5000' placeholder='Was ist passiert? Was hast du bereits versucht?'>"+E(lastQ?("Meine Frage aus dem Hilfe-Assistenten:\n"+lastQ+"\n\nWeitere Details:\n"):"")+"</textarea></label>"+
       "<div class='km24SupportFormNote'>🔒 Bitte keine Passwörter, vollständigen Karten-/Bankdaten oder Ausweisnummern senden.</div>"+
       "<button class='btn primary' id='supportSubmit'>Anfrage senden</button>"+
     "</form><div id='supportMsg'></div>"+
   "</section>"+
 "</div>";

 let openAssistant=()=>{if(window.openKaufMichAiSupport)window.openKaufMichAiSupport()};
 document.getElementById("openHelpAssistant").onclick=openAssistant;
 document.getElementById("supportAskAssistant").onclick=openAssistant;
 document.getElementById("supportJumpForm").onclick=()=>document.getElementById("supportRequestForm").scrollIntoView({behavior:"smooth",block:"start"});

 document.getElementById("supportForm").onsubmit=async e=>{
   e.preventDefault();
   let btn=document.getElementById("supportSubmit"),
       email=document.getElementById("semail").value.trim(),
       subject=document.getElementById("ssubject").value.trim(),
       message=document.getElementById("smessage").value.trim(),
       category=document.getElementById("scategory").value,
       msg=document.getElementById("supportMsg");

   if(!user&&!email)return msg.innerHTML=N("Bitte gib eine E-Mail-Adresse für die Rückmeldung an.",1);
   if(subject.length<3||message.length<10)return msg.innerHTML=N("Bitte beschreibe dein Anliegen etwas genauer.",1);

   btn.disabled=true;
   btn.textContent="Wird gesendet …";
   let r=await db.from("support_requests").insert({
     user_id:user?user.id:null,
     email:email||null,
     subject,
     message,
     category,
     language:(navigator.language||"de").slice(0,10),
     source:lastQ?"ai_assistant":"support_page",
     updated_at:new Date().toISOString()
   });

   if(r.error){
     msg.innerHTML=N("Die Anfrage konnte nicht gesendet werden: "+r.error.message,1);
     btn.disabled=false;btn.textContent="Anfrage senden";
     return
   }

   sessionStorage.removeItem("km_ai_last_question");
   sessionStorage.removeItem("km_ai_last_topic");
   msg.innerHTML="<div class='notice'>✓ Support-Anfrage wurde gesendet. "+(user?"Du kannst den Status unter „Meine Support-Anfragen“ verfolgen.":"Wir melden uns über die angegebene E-Mail-Adresse.")+"</div>";
   document.getElementById("supportForm").reset();
   btn.disabled=false;btn.textContent="Anfrage senden";
   if(user)setTimeout(()=>supportPage(),850)
 }
}
function rootCategoryOf(slug){let c=cats.find(x=>x.slug===slug);return c?(c.parent_slug||c.slug):slug}
function detailPanels(pre,x){
 x=x||{};let v=k=>E(x[k]??"");
 return '<section class="panel catDetails hide" data-root="fahrzeuge"><h3>Fahrzeugdetails</h3><div class="two"><label>Marke<input class="field" id="'+pre+'vbrand" value="'+v("brand")+'" placeholder="z. B. BMW"></label><label>Modell<input class="field" id="'+pre+'vmodel" value="'+v("model")+'" placeholder="z. B. 320d"></label></div><div class="two"><label>Jahrgang / Erstzulassung<input class="field" id="'+pre+'vyear" type="number" min="1900" max="2100" value="'+v("year")+'"></label><label>Kilometerstand<input class="field" id="'+pre+'vkm" type="number" min="0" value="'+v("mileage_km")+'"></label></div><div class="two"><label>Treibstoff<select class="field" id="'+pre+'vfuel">'+sel(["","Benzin","Diesel","Elektro","Hybrid","Plug-in-Hybrid","Gas / LPG","Andere"],x.fuel)+'</select></label><label>Getriebe<select class="field" id="'+pre+'vgear">'+sel(["","Automatik","Manuell","Halbautomatik"],x.gearbox)+'</select></label></div><div class="two"><label>Leistung (PS)<input class="field" id="'+pre+'vpower" type="number" min="0" value="'+v("power_ps")+'"></label><label>Hubraum (cm³)<input class="field" id="'+pre+'vcc" type="number" min="0" value="'+v("engine_cc")+'"></label></div><div class="two"><label>Antrieb<select class="field" id="'+pre+'vdrive">'+sel(["","Vorderradantrieb","Hinterradantrieb","Allrad"],x.drive)+'</select></label><label>Karosserie<select class="field" id="'+pre+'vbody">'+sel(["","Limousine","Kombi","SUV / Geländewagen","Coupé","Cabriolet","Kleinwagen","Van / Bus","Pickup","Naked Bike","Supersportler / Sport","Sporttourer","Tourer","Reiseenduro","Enduro","Motocross","Supermoto","Chopper / Cruiser","Café Racer / Scrambler","Trial","Gespann","Roller / Scooter","Maxi-Scooter","Mofa / Töffli","Elektro-Roller","Trike / Dreirad","Andere"],x.body)+'</select></label></div><div class="two"><label>Farbe<input class="field" id="'+pre+'vcolor" value="'+v("color")+'"></label><label>MFK<select class="field" id="'+pre+'vmfk">'+sel(["","Frisch ab MFK","MFK gültig","Nicht geprüft","Ab Platz"],x.mfk)+'</select></label></div></section>'+
 '<section class="panel catDetails hide" data-root="elektronik"><h3>Elektronikdetails</h3><div class="two"><label>Marke<input class="field" id="'+pre+'ebrand" value="'+v("brand")+'"></label><label>Modell<input class="field" id="'+pre+'emodel" value="'+v("model")+'"></label></div><div class="two"><label>Speicher / Kapazität<input class="field" id="'+pre+'estorage" value="'+v("storage")+'"></label><label>Farbe<input class="field" id="'+pre+'ecolor" value="'+v("color")+'"></label></div><div class="two"><label>Garantie<select class="field" id="'+pre+'ewarranty">'+sel(["","Keine","Herstellergarantie","Händlergarantie","Restgarantie"],x.warranty)+'</select></label><label>Zubehör<input class="field" id="'+pre+'eaccessories" value="'+v("accessories")+'"></label></div></section>'+
 '<section class="panel catDetails hide" data-root="immobilien"><h3>Immobiliendetails</h3><div class="two"><label>Objektart<input class="field" id="'+pre+'ptype" value="'+v("property_type")+'"></label><label>Zimmer<input class="field" id="'+pre+'prooms" type="number" min="0" step=".5" value="'+v("rooms")+'"></label></div><div class="two"><label>Wohnfläche m²<input class="field" id="'+pre+'parea" type="number" min="0" value="'+v("area_m2")+'"></label><label>Etage<input class="field" id="'+pre+'pfloor" value="'+v("floor")+'"></label></div><div class="two"><label>Verfügbar ab<input class="field" id="'+pre+'pavailable" type="date" value="'+v("available_from")+'"></label><label>Nebenkosten CHF<input class="field" id="'+pre+'pcharges" type="number" min="0" step=".05" value="'+v("charges_chf")+'"></label></div></section>'+
 '<section class="panel catDetails hide" data-root="mode"><h3>Mode-Details</h3><div class="two"><label>Marke<input class="field" id="'+pre+'fbrandx" value="'+v("brand")+'"></label><label>Grösse<input class="field" id="'+pre+'fsize" value="'+v("size")+'"></label></div><div class="two"><label>Farbe<input class="field" id="'+pre+'fcolor" value="'+v("color")+'"></label><label>Material<input class="field" id="'+pre+'fmaterial" value="'+v("material")+'"></label></div></section>'+
 '<section class="panel catDetails hide" data-root="werkzeuge"><h3>Werkzeug-/Maschinendetails</h3><div class="two"><label>Marke<input class="field" id="'+pre+'tbrand" value="'+v("brand")+'"></label><label>Modell<input class="field" id="'+pre+'tmodel" value="'+v("model")+'"></label></div><div class="two"><label>Betriebsart<select class="field" id="'+pre+'tpower">'+sel(["","Akku","230 V","400 V","Benzin","Diesel","Manuell"],x.power_source)+'</select></label><label>Leistung / Daten<input class="field" id="'+pre+'tspec" value="'+v("specification")+'"></label></div></section>';
}
function sel(arr,current){return arr.map(v=>'<option value="'+E(v)+'" '+(String(current??"")===String(v)?"selected":"")+'>'+(v?E(v):"Bitte wählen")+'</option>').join("")}
function showDetailPanels(scope,root){scope.querySelectorAll(".catDetails").forEach(x=>x.classList.toggle("hide",x.dataset.root!==root))}
function collectExtra(pre,root){
 let o={},grab=(map,nums=[])=>Object.entries(map).forEach(([k,id])=>{let e=document.getElementById(pre+id),v=e?e.value.trim():"";if(v!=="")o[k]=nums.includes(k)?Number(v):v});
 if(root==="fahrzeuge")grab({brand:"vbrand",model:"vmodel",year:"vyear",mileage_km:"vkm",fuel:"vfuel",gearbox:"vgear",power_ps:"vpower",engine_cc:"vcc",drive:"vdrive",body:"vbody",color:"vcolor",mfk:"vmfk"},["year","mileage_km","power_ps","engine_cc"]);
 if(root==="elektronik")grab({brand:"ebrand",model:"emodel",storage:"estorage",color:"ecolor",warranty:"ewarranty",accessories:"eaccessories"});
 if(root==="immobilien")grab({property_type:"ptype",rooms:"prooms",area_m2:"parea",floor:"pfloor",available_from:"pavailable",charges_chf:"pcharges"},["rooms","area_m2","charges_chf"]);
 if(root==="mode")grab({brand:"fbrandx",size:"fsize",color:"fcolor",material:"fmaterial"});
 if(root==="werkzeuge")grab({brand:"tbrand",model:"tmodel",power_source:"tpower",specification:"tspec"});
 return o;
}
async function km24AutoFocal(source){
 try{
  let blob=source;
  if(typeof source==="string"){
    const res=await fetch(source,{cache:"force-cache"});
    if(!res.ok)throw new Error("image");
    blob=await res.blob()
  }
  let bmp;
  if(typeof createImageBitmap==="function")bmp=await createImageBitmap(blob);
  else{
    const url=URL.createObjectURL(blob);
    bmp=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{URL.revokeObjectURL(url);resolve(im)};im.onerror=reject;im.src=url})
  }
  const max=144,scale=Math.min(1,max/Math.max(bmp.width||1,bmp.height||1)),w=Math.max(24,Math.round((bmp.width||max)*scale)),h=Math.max(24,Math.round((bmp.height||max)*scale));
  const c=document.createElement("canvas");c.width=w;c.height=h;
  const ctx=c.getContext("2d",{willReadFrequently:true});ctx.drawImage(bmp,0,0,w,h);
  if(bmp.close)bmp.close();
  const d=ctx.getImageData(0,0,w,h).data,lum=new Float32Array(w*h),weights=new Float32Array(w*h);
  for(let i=0,p=0;i<d.length;i+=4,p++)lum[p]=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];
  let sum=0,sum2=0,n=0;
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
    const p=y*w+x,L=lum[p],gx=Math.abs(lum[p+1]-lum[p-1]),gy=Math.abs(lum[p+w]-lum[p-w]);
    const i=p*4,mx=Math.max(d[i],d[i+1],d[i+2]),mn=Math.min(d[i],d[i+1],d[i+2]),sat=mx-mn;
    const dx=(x/(w-1)-.5)*2,dy=(y/(h-1)-.5)*2,center=.48+.52*Math.max(0,1-Math.sqrt(dx*dx+dy*dy)/1.414);
    const wt=(gx+gy+sat*.12+Math.abs(L-128)*.025)*center;
    weights[p]=wt;sum+=wt;sum2+=wt*wt;n++
  }
  const mean=sum/Math.max(1,n),sd=Math.sqrt(Math.max(0,sum2/Math.max(1,n)-mean*mean)),cut=mean+sd*.35;
  let sw=0,sx=0,sy=0;
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
    const wt=weights[y*w+x];if(wt<cut)continue;
    sw+=wt;sx+=x*wt;sy+=y*wt
  }
  if(!sw)return{x:50,y:50};
  const clamp=v=>Math.max(18,Math.min(82,v));
  return{x:clamp(sx/sw/(w-1)*100),y:clamp(sy/sw/(h-1)*100)}
 }catch(e){return{x:50,y:50}}
}
function photoManager(el,items,onChange){
 items.forEach(x=>{if(x.focal_x==null)x.focal_x=50;if(x.focal_y==null)x.focal_y=50;if(!x.fit_mode)x.fit_mode="cover";if(x.auto_focus==null)x.auto_focus=true});
 el.innerHTML=items.length?items.map((x,i)=>'<div class="photoTile"><div class="focusStage" data-focus="'+i+'"><img src="'+E(x.url)+'" style="object-fit:'+(x.fit_mode==="contain"?"contain":"cover")+';object-position:'+Number(x.focal_x)+'% '+Number(x.focal_y)+'%">'+(x.auto_focus?'':'<span class="focusDot" style="left:'+Number(x.focal_x)+'%;top:'+Number(x.focal_y)+'%"></span>')+'</div><span class="photoNumber">'+(i+1)+(i===0?" · Titelbild":"")+'</span><div class="photoAutoState">'+(x.auto_focus?'✓ Automatisch zentriert':'↙ Manueller Fokus')+'</div><details class="imageAdjust"><summary>⚙️ Bild anpassen</summary><div class="imageAdjustRow"><label>Darstellung <select data-fit="'+i+'"><option value="cover" '+(x.fit_mode==="cover"?"selected":"")+'>Bild ausfüllen</option><option value="contain" '+(x.fit_mode==="contain"?"selected":"")+'>Ganzes Bild</option></select></label><button type="button" class="btn" data-auto-focus="'+i+'">◎ Auto</button></div><small class="mut">Nur falls nötig: Tippe ins Bild, um den Fokus manuell zu setzen.</small></details><div class="photoActions"><button type="button" data-pl="'+i+'" '+(i===0?"disabled":"")+'>←</button><button type="button" data-pr="'+i+'" '+(i===items.length-1?"disabled":"")+'>→</button><button type="button" data-px="'+i+'">×</button></div></div>').join(""):'<div class="empty" style="grid-column:1/-1;padding:18px">Noch keine Fotos ausgewählt.</div>';
 el.querySelectorAll("[data-focus]").forEach(stage=>stage.onclick=e=>{let i=+stage.dataset.focus,r=stage.getBoundingClientRect(),x=items[i];x.focal_x=Math.max(0,Math.min(100,((e.clientX-r.left)/r.width)*100));x.focal_y=Math.max(0,Math.min(100,((e.clientY-r.top)/r.height)*100));x.auto_focus=false;onChange()});
 el.querySelectorAll("[data-auto-focus]").forEach(b=>b.onclick=async e=>{e.preventDefault();e.stopPropagation();let i=+b.dataset.autoFocus,x=items[i];b.disabled=true;b.textContent="…";let f=await km24AutoFocal(x.file||x.url);x.focal_x=f.x;x.focal_y=f.y;x.auto_focus=true;onChange()});
 el.querySelectorAll("[data-fit]").forEach(s=>s.onchange=()=>{items[+s.dataset.fit].fit_mode=s.value;onChange()});
 el.querySelectorAll("[data-pl]").forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();let sy=window.scrollY;let i=+b.dataset.pl,[x]=items.splice(i,1);items.splice(i-1,0,x);onChange();requestAnimationFrame(()=>window.scrollTo({top:sy,behavior:"auto"}));setTimeout(()=>window.scrollTo({top:sy,behavior:"auto"}),80)});
 el.querySelectorAll("[data-pr]").forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();let sy=window.scrollY;let i=+b.dataset.pr,[x]=items.splice(i,1);items.splice(i+1,0,x);onChange();requestAnimationFrame(()=>window.scrollTo({top:sy,behavior:"auto"}));setTimeout(()=>window.scrollTo({top:sy,behavior:"auto"}),80)});
 el.querySelectorAll("[data-px]").forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();let sy=window.scrollY;let i=+b.dataset.px,x=items[i];if(x.kind==="new"&&x.url.startsWith("blob:"))URL.revokeObjectURL(x.url);items.splice(i,1);onChange();requestAnimationFrame(()=>window.scrollTo({top:sy,behavior:"auto"}));setTimeout(()=>window.scrollTo({top:sy,behavior:"auto"}),80)});
 try{if(window.km24EnhancePhotoManager)window.km24EnhancePhotoManager(el,items,onChange)}catch(e){console.warn("KM24 crop editor",e)}
}

function liveListingPreview(el,sale,items,prefix){
 if(!el)return;
 items=Array.isArray(items)?items:[];
 prefix=prefix||"";
 const by=id=>document.getElementById(prefix+id);
 const safe=v=>typeof E==="function"?E(String(v??"")):String(v??"").replace(/[&<>\"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;","'":"&#39;"}[m]));
 const title=by("title")?.value.trim()||"Dein Inserat";
 const city=by("city")?.value.trim()||"";
 const zip=by("zip")?.value.trim()||"";
 const cat=by("cat")?.value||by("catRoot")?.value||"";
 const cobj=(typeof cats!=="undefined"&&Array.isArray(cats))?cats.find(x=>x.slug===cat):null;
 const cn=cobj?.name_de||"Kategorie";
 const desc=by("desc")?.value.trim()||"";
 const condEl=by("cond");
 const condition=condEl?.selectedOptions?.[0]?.textContent?.trim()||"";
 const pickupEl=prefix?document.getElementById(prefix+"pick"):document.getElementById("pickup");
 const shipEl=document.getElementById(prefix+"ship");
 const pickup=!!pickupEl?.checked, shipping=!!shipEl?.checked;
 const saleNames={fixed:"Fixpreis",negotiable:"Verhandelbar",auction:"Auktion",free:"Verschenken"};
 const saleName=saleNames[sale]||"Inserat";
 let price=sale==="free"?"Gratis":sale==="auction"?"ab CHF "+F(by("start")?.value||0):sale==="negotiable"?"CHF "+F(by("price")?.value||0)+" VB":"CHF "+F(by("price")?.value||0);

 let index=Math.max(0,Number(el.dataset.km24PreviewIndex||0));
 if(index>=items.length)index=Math.max(0,items.length-1);
 el.dataset.km24PreviewIndex=String(index);
 el.__km24PreviewCtx={sale,items,prefix};

 if(!document.getElementById("km24-preview-detail-v2-style")){
  const st=document.createElement("style");st.id="km24-preview-detail-v2-style";
  st.textContent=`
  .livePreview .km24UxPreviewNote{color:var(--mut)!important;opacity:1!important;font-size:12px!important;line-height:1.45!important;margin:5px 0 14px!important}
  .km24PreviewShell{overflow:hidden;border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,.025)}
  .km24PreviewGallery{padding:10px 10px 0}
  .km24PreviewMain{position:relative;width:100%;aspect-ratio:4/3;border-radius:13px;overflow:hidden;background:#0d110e;display:grid;place-items:center;touch-action:pan-y;user-select:none;-webkit-user-select:none}
  .km24PreviewMain img{width:100%;height:100%;object-fit:contain!important;display:block;pointer-events:none}
  .km24PreviewEmpty{font-size:38px;color:var(--mut)}
  .km24PreviewCount{position:absolute;right:9px;top:9px;z-index:3;padding:5px 9px;border-radius:999px;background:rgba(8,12,9,.78);color:#fff;font-size:12px;font-weight:900;border:1px solid rgba(255,255,255,.14)}
  .km24PreviewNav{position:absolute;z-index:3;top:50%;transform:translateY(-50%);width:40px;height:40px;min-height:40px!important;padding:0!important;border-radius:50%!important;border:1px solid rgba(255,255,255,.22)!important;background:rgba(8,12,9,.74)!important;color:#fff!important;font-size:24px!important;font-weight:900!important;display:grid;place-items:center;box-shadow:0 4px 14px rgba(0,0,0,.24)!important}
  .km24PreviewPrev{left:8px}.km24PreviewNext{right:8px}
  .km24PreviewThumbs{display:flex;gap:7px;overflow-x:auto;padding:8px 1px 10px;scrollbar-width:none;-webkit-overflow-scrolling:touch}.km24PreviewThumbs::-webkit-scrollbar{display:none}
  .km24PreviewThumb{flex:0 0 68px;width:68px;height:52px;min-height:52px!important;padding:0!important;border:2px solid transparent!important;border-radius:9px!important;overflow:hidden;background:#0d110e!important;opacity:.72;box-shadow:none!important}
  .km24PreviewThumb.on{border-color:var(--g)!important;opacity:1}.km24PreviewThumb img{width:100%;height:100%;object-fit:cover;display:block}
  .km24PreviewBody{padding:13px 14px 15px}.km24PreviewBadges{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}.km24PreviewBadge{display:inline-flex;align-items:center;min-height:24px;padding:4px 8px;border-radius:999px;background:rgba(24,166,101,.12);border:1px solid rgba(24,166,101,.2);font-size:10px;font-weight:900}.km24PreviewBadge.soft{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.08);color:var(--mut)}
  .km24PreviewTitle{font-size:20px;font-weight:950;line-height:1.18;letter-spacing:-.02em;overflow-wrap:anywhere}.km24PreviewPrice{font-size:25px;font-weight:950;color:var(--g);margin-top:5px}.km24PreviewMeta{font-size:12px;color:var(--mut);margin-top:7px;line-height:1.4}
  .km24PreviewTransfer{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.km24PreviewTransfer span{padding:5px 8px;border-radius:9px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);font-size:11px;font-weight:800}
  .km24PreviewSection{margin-top:14px;padding-top:13px;border-top:1px solid rgba(255,255,255,.07)}.km24PreviewSection h4{margin:0 0 7px;font-size:13px}.km24PreviewDesc{white-space:pre-wrap;font-size:12.5px;line-height:1.5;color:inherit;overflow-wrap:anywhere}
  .km24PreviewSpecs{display:grid;grid-template-columns:1fr 1fr;gap:7px}.km24PreviewSpec{min-width:0;padding:8px 9px;border-radius:10px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.06)}.km24PreviewSpec small{display:block;color:var(--mut);font-size:9.5px;line-height:1.2}.km24PreviewSpec b{display:block;margin-top:2px;font-size:11.5px;line-height:1.3;overflow-wrap:anywhere}
  @media(max-width:700px){.km24PreviewMain{aspect-ratio:4/3}.km24PreviewTitle{font-size:21px}.km24PreviewPrice{font-size:27px}.km24PreviewThumb{flex-basis:72px;width:72px;height:55px}.km24PreviewSpecs{grid-template-columns:1fr 1fr}}
  @media(max-width:390px){.km24PreviewSpecs{grid-template-columns:1fr}.km24PreviewNav{width:38px;height:38px;min-height:38px!important}}
  `;document.head.appendChild(st)
 }

 const imgHtml=(x,thumb)=>{
  if(!x||!x.url)return "";
  const fx=Number(x.focal_x??50),fy=Number(x.focal_y??50);
  return '<img src="'+safe(x.url)+'" alt="" style="object-position:'+fx+'% '+fy+'%">'
 };
 let gallery="";
 if(items.length){
  const current=items[index];
  gallery='<div class="km24PreviewGallery"><div class="km24PreviewMain" data-km24-preview-main>'+imgHtml(current,false)+(items.length>1?'<button type="button" class="km24PreviewNav km24PreviewPrev" aria-label="Vorheriges Bild">‹</button><button type="button" class="km24PreviewNav km24PreviewNext" aria-label="Nächstes Bild">›</button><span class="km24PreviewCount">'+(index+1)+' / '+items.length+'</span>':'<span class="km24PreviewCount">1 / 1</span>')+'</div>'+
   (items.length>1?'<div class="km24PreviewThumbs">'+items.map((x,i)=>'<button type="button" class="km24PreviewThumb '+(i===index?'on':'')+'" data-km24-preview-thumb="'+i+'" aria-label="Bild '+(i+1)+'">'+imgHtml(x,true)+'</button>').join("")+'</div>':'')+'</div>';
 }else gallery='<div class="km24PreviewGallery"><div class="km24PreviewMain"><span class="km24PreviewEmpty">📷</span></div></div>';

 const form=el.closest("form");
 let specs=[];
 if(form){
  form.querySelectorAll('.catDetails:not(.hide) label').forEach(label=>{
   const ctrl=label.querySelector('input,select,textarea');if(!ctrl)return;
   let val=ctrl.tagName==='SELECT'?(ctrl.selectedOptions?.[0]?.textContent||'').trim():String(ctrl.value||'').trim();
   if(!val||/^Bitte wählen$/i.test(val))return;
   let key=Array.from(label.childNodes).filter(n=>n.nodeType===3).map(n=>n.textContent).join(' ').replace(/\s+/g,' ').trim();
   if(!key)key=ctrl.getAttribute('aria-label')||'Detail';
   specs.push([key,val])
  })
 }
 const specHtml=specs.length?'<div class="km24PreviewSection"><h4>Details</h4><div class="km24PreviewSpecs">'+specs.map(([k,v])=>'<div class="km24PreviewSpec"><small>'+safe(k)+'</small><b>'+safe(v)+'</b></div>').join('')+'</div></div>':'';
 const transfer=[];if(pickup)transfer.push('📍 Abholung');if(shipping)transfer.push('📦 Versand');
 const transferHtml=transfer.length?'<div class="km24PreviewTransfer">'+transfer.map(x=>'<span>'+safe(x)+'</span>').join('')+'</div>':'';
 const descHtml=desc?'<div class="km24PreviewSection"><h4>Beschreibung</h4><div class="km24PreviewDesc">'+safe(desc)+'</div></div>':'';

 el.innerHTML='<div class="km24PreviewShell">'+gallery+'<div class="km24PreviewBody"><div class="km24PreviewBadges"><span class="km24PreviewBadge">'+safe(saleName)+'</span>'+(condition?'<span class="km24PreviewBadge soft">'+safe(condition)+'</span>':'')+'</div><div class="km24PreviewTitle">'+safe(title)+'</div><div class="km24PreviewPrice">'+safe(price)+'</div><div class="km24PreviewMeta">'+safe(cn)+(zip||city?' · 📍 '+safe([zip,city].filter(Boolean).join(' ')):'')+'</div>'+transferHtml+descHtml+specHtml+'</div></div>';

 function setIndex(next){
  if(!items.length)return;next=(next+items.length)%items.length;el.dataset.km24PreviewIndex=String(next);liveListingPreview(el,sale,items,prefix)
 }
 el.querySelector('.km24PreviewPrev')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setIndex(index-1)});
 el.querySelector('.km24PreviewNext')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setIndex(index+1)});
 el.querySelectorAll('[data-km24-preview-thumb]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setIndex(Number(b.dataset.km24PreviewThumb))}));
 const main=el.querySelector('[data-km24-preview-main]');
 if(main&&items.length>1){let sx=0;main.addEventListener('touchstart',e=>{sx=e.changedTouches?.[0]?.clientX||0},{passive:true});main.addEventListener('touchend',e=>{let ex=e.changedTouches?.[0]?.clientX||sx,dx=ex-sx;if(Math.abs(dx)>45)setIndex(index+(dx<0?1:-1))},{passive:true})}
 if(form&&form.dataset.km24PreviewBound!=="1"){
  form.dataset.km24PreviewBound="1";
  const refresh=()=>requestAnimationFrame(()=>{const p=form.querySelector(prefix?'#editPreview':'#sellPreview');const c=p?.__km24PreviewCtx;if(c)liveListingPreview(p,c.sale,c.items,c.prefix)});
  form.addEventListener('input',refresh);form.addEventListener('change',refresh)
 }
}
function saleChoices(sale,locked){let a=[["fixed","💰","Fixpreis","Fester Preis"],["negotiable","🤝","Verhandelbar","Angebote"],["auction","🔨","Auktion","Gebote"],["free","🎁","Verschenken","CHF 0.–"]];return a.map(x=>'<button type="button" class="choice '+(sale===x[0]?"on":"")+'" data-s="'+x[0]+'" '+(locked?"disabled":"")+'><em>'+x[1]+'</em><b>'+x[2]+'</b><small>'+x[3]+'</small></button>').join("")}


function auctionDayOptions(selected=7){
 let sel=String(selected??"d7");
 if(/^\d+$/.test(sel))sel="d"+sel;
 if(/^h(1|3|6|12)$/.test(sel))sel="d1";
 if(!/^d([1-9]|1[0-4])$/.test(sel))sel="d7";
 let a=Array.from({length:14},(_,i)=>["d"+(i+1),(i+1)+" "+(i===0?"Tag":"Tage")]);
 return a.map(x=>'<option value="'+x[0]+'" '+(sel===x[0]?'selected':'')+'>'+x[1]+'</option>').join("")
}
function auctionEndFromDaysTime(duration,time){
 let v=String(duration||"d7"),d=new Date(),hm=/^h(1|3|6|12)$/.exec(v);
 if(hm){d.setTime(Date.now()+Number(hm[1])*3600000);return d}
 let dm=/^d(\d{1,2})$/.exec(v),n=Math.max(1,Math.min(14,dm?Number(dm[1]):Number(v)||7)),
     parts=String(time||"20:00").split(":"),
     h=Math.max(0,Math.min(23,Number(parts[0])||0)),
     m=Math.max(0,Math.min(59,Number(parts[1])||0));
 d.setDate(d.getDate()+n);d.setHours(h,m,0,0);return d
}
function auctionDaysUntil(endValue){
 let e=endValue?new Date(endValue):new Date(Date.now()+7*86400000),
     hrs=Math.max(1,(e-Date.now())/3600000);
 if(hrs<=1.5)return"h1";if(hrs<=4.5)return"h3";if(hrs<=9)return"h6";if(hrs<=18)return"h12";
 return"d"+Math.max(1,Math.min(14,Math.round(hrs/24)||1))
}
function auctionLocalTime(endValue){
 let d=endValue?new Date(endValue):new Date();
 return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")
}

function sell(){
 if(!user)return go("#/login?next=sell");
 if(document.getElementById("sf")&&location.hash.startsWith("#/sell"))return;
 if(!profile){setTimeout(async()=>{try{await loadProfile()}catch(_){}if(location.hash.startsWith("#/sell")){if(sellerReady())sell();else go("#/verification?next=sell")}},350);return}if(!sellerReady())return go("#/verification?next=sell");
 let roots=cats.filter(c=>!c.parent_slug).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)),opts=roots.map(c=>'<option value="'+E(c.slug)+'">'+E(c.name_de)+'</option>').join(""),sale=(((location.hash||'').indexOf('job=employer')>=0||(sessionStorage.getItem('km24CreateJobIntent')||'').indexOf('"kind":"employer"')>=0)?'on_request':'fixed'),photos=[];
 app.innerHTML='<div class="formPage"><div class="wrap">'+((profile?.account_type==='business'||profile?.account_type==='dealer')?'<section class="km24BulkSellSwitch" aria-label="Inserierart auswählen" style="padding:17px 16px 18px;border:1px solid #237b61;border-radius:18px;background:linear-gradient(135deg,#132c23,#142336);color:#f1fff6;margin:10px 0 22px;box-shadow:0 12px 24px rgba(0,0,0,.13)"><div style="font-weight:800;font-size:12px;letter-spacing:.07em;color:#9fefc1">🏪 FÜR FIRMEN & HÄNDLER</div><h2 style="margin:9px 0 5px;font-size:clamp(21px,5vw,29px);line-height:1.2;color:#fff">Wie möchtest du inserieren?</h2><p style="color:#d3e6df;font-size:14px;line-height:1.5;margin:0">Wähle zwischen einem einzelnen Artikel und dem Foto-Massenimport.</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin-top:15px"><div style="padding:15px;border-radius:14px;background:#203a32;border:1px solid #4b7260;display:flex;flex-direction:column;gap:6px"><strong style="font-size:17px;color:#fff">📦 Einzelnes Inserat</strong><span style="color:#bce7d0;font-size:13px">Du bist hier – Formular weiter unten</span></div><a href="#/foto-massenimport" aria-label="Mehrere Artikel mit Fotos gleichzeitig inserieren" style="padding:15px;border-radius:14px;background:#1eaa68;border:1px solid #59dfa0;display:flex;flex-direction:column;gap:6px;text-decoration:none;color:white;box-shadow:0 3px 10px rgba(0,0,0,.16)"><strong style="font-size:17px;color:white">📸 Mehrere Artikel mit Fotos</strong><span style="color:white;font-size:13px">Fotos auswählen · viele Inserate auf einmal</span><span style="font-size:14px;font-weight:900;margin-top:3px;color:white">Foto-Massenimport öffnen →</span></a></div></section>':'')+'<h1>Inserat erstellen</h1><p class="mut">3 kurze Schritte: Kategorie & Fotos, Angaben & Preis, Standort & Prüfen.</p><form id="sf" class="formgrid"><div class="main"><section class="panel"><h3>Verkaufsart</h3><div class="choices" id="saleChoices">'+saleChoices(sale,false)+'</div></section><section class="panel stack"><h3>Artikel</h3><label>Titel<input id="title" required maxlength="120"></label><div class="two"><label>Hauptkategorie<select id="catRoot" required><option value="">Hauptkategorie wählen</option>'+opts+'</select></label><label>Unterkategorie<select id="cat" required disabled><option value="">Zuerst Hauptkategorie wählen</option></select></label></div><label>Zustand<select id="cond"><option value="used">Gebraucht</option><option value="like_new">Wie neu</option><option value="new">Neu</option><option value="defective">Defekt</option></select></label><div class="notice" id="catHint">Wähle zuerst eine Hauptkategorie.</div><label>Beschreibung<textarea id="desc" rows="7" maxlength="5000" placeholder="Zustand, Lieferumfang, Besonderheiten ..."></textarea></label></section>'+detailPanels("",{})+'<section class="panel"><h3>Preis</h3><div id="pricebox"><label>Preis CHF<input class="field" id="price" type="number" min="0" step=".05" required></label></div><div id="auctionfields" class="hide"><div class="two"><label>Startpreis CHF<input class="field" id="start" type="number" min="0" step=".05"></label><label>Mindestpreis CHF (optional)<input class="field" id="reserve" type="number" min="0" step=".05"></label></div><div class="two"><label>Dauer<select class="field" id="days">'+auctionDayOptions(7)+'</select></label><label>Endzeit<input class="field" id="auctionTime" type="time" value="20:00" required></label></div><label>Mindest-Erhöhung CHF<input class="field" id="inc" type="number" min=".05" step=".05" value="1"></label><small class="mut">Auktionsdauer: 1 bis maximal 14 Tage. Du bestimmst zusätzlich die genaue Endzeit. Der Mindestpreis bleibt geheim.</small></div><div id="freenote" class="notice hide">Dieses Inserat wird kostenlos / zu verschenken veröffentlicht.</div></section><details class="panel km24ProOptions"><summary><span>⚙️ Erweiterte Verkaufsoptionen</span><small>optional</small></summary><div class="km24ProGrid"><label>Sichtbarkeit<select id="visibility"><option value="public">🌐 Öffentlich – für alle</option><option value="business_only">🏪 Nur verifizierte Gewerbekonten</option></select></label><label>Gewerbepreis CHF <span class="mut">(optional)</span><input id="businessPrice" type="number" min="0" step=".05" placeholder="Nur für Gewerbe sichtbar"></label></div><label class="km24ProToggle"><input id="offerRound" type="checkbox"> <span><b>🤝 Angebotsrunde</b><small>Mehrere Angebote sammeln und danach eines auswählen.</small></span></label><div id="offerRoundOptions" class="km24ProSub hide"><div class="two"><label>Dauer<select id="offerRoundDuration"></select></label><label class="km24ProToggle"><input id="offerEarly" type="checkbox" checked> <span><b>Vorzeitig annehmen erlauben</b><small>Ein gutes Angebot kann schon vor Ablauf angenommen werden.</small></span></label></div><small class="mut">Für eine Angebotsrunde muss oben «Verhandelbar» gewählt sein.</small></div></details><section class="panel"><h3>📎 Videos & Dokumente</h3><label class="photoAdd">＋ Dateien hinzufügen<input id="attachments" type="file" accept="video/*,.mp4,.mov,.webm,application/pdf,.pdf,.doc,.docx,.xls,.xlsx,.txt" multiple></label><div class="formHelp">Optional · bis 4 Dateien · maximal 50 MB pro Datei. Für Videos, Rechnungen, Garantien oder technische Unterlagen.</div><div id="attachmentMsg" class="mut"></div></section><section class="panel"><h3>Fotos</h3><label class="photoAdd">＋ Fotos hinzufügen<input id="photos" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" multiple></label><div class="formHelp">Bis zu 8 Bilder (max. 10 MB pro Bild). Mit ✂️ Zuschneiden bestimmst du Ausschnitt und Zentrierung. Mit ← und → legst du die Reihenfolge fest. Bild 1 ist das Titelbild.</div><div id="photoManager" class="photoManager"></div><div id="kmListingAi" class="kmListingAi"><b>✨ Kostenlose Bilder-KI & Inserathilfe</b><span>Analysiert deine hochgeladenen Fotos gemeinsam. Bei Fahrzeugen und Markenartikeln versucht sie auch Marke und Modell zu erkennen. Unsichere Details werden nicht erfunden.</span><button id="kmListingAiBtn" type="button" class="btn">Fotos analysieren & Text erstellen</button><small id="kmListingAiMsg" class="mut">Lade Fotos hoch und starte danach die Analyse.</small></div></section></div><aside class="side"><section class="panel stack"><h3>Standort & Übergabe</h3><div class="two"><label>PLZ<input id="zip" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" required value="'+E(profile?.postal_code||"")+'"></label><label>Ort<input id="city" required value="'+E(profile?.city||"")+'"></label></div><label><input id="pickup" type="checkbox" checked> Abholung</label><label><input id="ship" type="checkbox"> Versand</label></section><section class="panel livePreview"><h3>Vorschau</h3><div id="sellPreview"></div><button class="btn primary" style="width:100%;margin-top:16px">Inserat veröffentlichen</button><div id="sm"></div></section></aside></form></div></div>';
 if(sale==='on_request'){
  var kmSc=document.getElementById('saleChoices'),kmSp=kmSc&&kmSc.closest('.panel');if(kmSp)kmSp.style.display='none';
  var kmPr=document.getElementById('price'),kmPp=kmPr&&kmPr.closest('.panel');if(kmPr)kmPr.required=false;if(kmPp)kmPp.style.display='none';
 }
 /* __km24SellDirectOrderV1 */
 {
  const kmMain=document.querySelector("#sf > .main"),kmSide=document.querySelector("#sf > .side");
  if(kmMain&&kmSide){
   const kmFind=name=>[...kmMain.children].find(el=>(el.querySelector("h3")?.textContent||"").trim()===name)||null;
   const photo=kmFind("Fotos"),article=kmFind("Artikel"),salePanel=kmFind("Verkaufsart"),pricePanel=kmFind("Preis"),attach=kmFind("📎 Videos & Dokumente")||kmFind("Videos & Dokumente"),pro=kmMain.querySelector(".km24ProOptions"),location=[...kmSide.children].find(el=>(el.querySelector("h3")?.textContent||"").trim()==="Standort & Übergabe")||null;
   const detailSections=[...kmMain.children].filter(el=>el.classList?.contains("catDetails"));
   [photo,article,...detailSections,salePanel,pricePanel,location,pro,attach].filter(Boolean).forEach(el=>kmMain.appendChild(el));
   if(photo)photo.dataset.sellSection="photos";if(article)article.dataset.sellSection="article";if(salePanel)salePanel.dataset.sellSection="sale";if(pricePanel)pricePanel.dataset.sellSection="price";if(location)location.dataset.sellSection="location";if(attach)attach.dataset.sellSection="attachments";
  }
 }

 let form=document.getElementById("sf"),pm=document.getElementById("photoManager"),pv=document.getElementById("sellPreview");
 let aiBtn=document.getElementById("kmListingAiBtn"),aiMsg=document.getElementById("kmListingAiMsg");
 async function km24DirectListingAi(){
   const title=document.getElementById("title"),desc=document.getElementById("desc");
   if(!title||!desc||!aiMsg)return;
   const src=photos.map(x=>x&&x.file?x.file:(x&&x.url?x.url:null)).filter(Boolean).slice(0,3);
   if(!src.length){aiMsg.textContent="Bitte lade zuerst mindestens ein Foto hoch.";return}
   const clean=v=>String(v||"").replace(/\s+/g," ").trim();
   const setField=(id,v)=>{let x=document.getElementById(id);if(x&&v&&!clean(x.value)){x.value=v;x.dispatchEvent(new Event("input",{bubbles:true}))}};
   const readImage=async(mod,s)=>typeof File!=="undefined"&&s instanceof File?await mod.RawImage.fromBlob(s):await mod.load_image(s);
   aiMsg.textContent="Bilder-KI wird vorbereitet …";
   try{
     const mod=window.__km24TransformersMod||(window.__km24TransformersMod=await import("https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/+esm"));
     let exact="",visual="";
     if(navigator.gpu&&mod.AutoProcessor&&mod.AutoModelForVision2Seq){
       try{
         if(!window.__km24SellVision){
           const progress_callback=x=>{if(x&&x.status==="progress"&&Number.isFinite(Number(x.progress)))aiMsg.textContent="Präzise Bilder-KI wird geladen … "+Math.max(0,Math.min(100,Math.round(Number(x.progress))))+"%"};
           const modelId="HuggingFaceTB/SmolVLM-256M-Instruct";
           const processor=await mod.AutoProcessor.from_pretrained(modelId,{progress_callback});
           const model=await mod.AutoModelForVision2Seq.from_pretrained(modelId,{device:"webgpu",dtype:{embed_tokens:"q4f16",vision_encoder:"q4f16",decoder_model_merged:"q4f16"},progress_callback});
           window.__km24SellVision={processor,model}
         }
         const images=[];for(const s of src){try{images.push(await readImage(mod,s))}catch(_){}}
         if(images.length){
           aiMsg.textContent="Fotos werden gemeinsam auf Marke und Modell geprüft …";
           const prompt="These photos show the SAME marketplace item. Identify it as specifically as visual evidence allows. For a vehicle inspect badges, grille, lights, body shape and interior. Identify exact make and model only when reliable. NEVER invent trim, year, engine, condition or accessories. Reply with exactly five lines: BRAND=<value or blank>\nMODEL=<value or blank>\nOBJECT=<specific object>\nDESCRIPTION_DE=<one short factual German sentence>\nCONFIDENCE=<high, medium, or low>";
           const content=images.map((_,i)=>({type:"image",image:"image_"+i}));content.push({type:"text",text:prompt});
           const processor=window.__km24SellVision.processor,model=window.__km24SellVision.model;
           const txt=processor.apply_chat_template([{role:"user",content}],{add_generation_prompt:true});
           const inputs=await processor(txt,images,{do_image_splitting:false});
           const out=await model.generate({...inputs,do_sample:false,repetition_penalty:1.08,max_new_tokens:140,return_dict_in_generate:true});
           let decoded=(processor.batch_decode(out.sequences,{skip_special_tokens:true})||[])[0]||"";let ai=decoded.lastIndexOf("assistant");if(ai>=0)decoded=decoded.slice(ai+9);
           const field=n=>{let re=new RegExp("(?:^|\\n)\\s*\\*{0,2}"+n+"\\*{0,2}\\s*[:=]\\s*([^\\n]*)","ig"),m=[...decoded.matchAll(re)],v=clean(m.length?m[m.length-1][1]:"");return /^(unknown|uncertain|unsure|none|not visible|not sure|unbekannt|unsicher)$/i.test(v)?"":v};
           const brand=field("BRAND"),modelName=field("MODEL"),confidence=(field("CONFIDENCE")||"low").toLowerCase();visual=field("DESCRIPTION_DE");
           if(confidence==="high"||confidence==="medium"){exact=[brand,modelName].filter(Boolean).join(" ").trim();if(brand)setField("vbrand",brand);if(modelName)setField("vmodel",modelName)}
         }
       }catch(e){console.warn("KM24 precise image AI fallback",e)}
     }
     if(exact){if(!clean(title.value))title.value=exact.slice(0,80);if(!clean(desc.value))desc.value="Zum Verkauf steht "+exact+"."+(visual?"\n\nAuf den Fotos zu sehen:\n• "+visual:"");title.dispatchEvent(new Event("input",{bubbles:true}));desc.dispatchEvent(new Event("input",{bubbles:true}));aiMsg.textContent="✓ Erkannt: "+exact+". Bitte Marke und Modell kurz prüfen.";return}
     if(!window.__km24SellCaption){
       aiMsg.textContent="Kostenlose Bilder-KI wird geladen …";
       window.__km24SellCaption=await mod.pipeline("image-to-text","Xenova/vit-gpt2-image-captioning",{progress_callback:x=>{if(x&&x.status==="progress"&&Number.isFinite(Number(x.progress)))aiMsg.textContent="Kostenlose Bilder-KI wird geladen … "+Math.max(0,Math.min(100,Math.round(Number(x.progress))))+"%"}})
     }
     const caps=[];for(let i=0;i<src.length;i++){aiMsg.textContent="Foto "+(i+1)+" von "+src.length+" wird analysiert …";try{let img=await readImage(mod,src[i]),r=await window.__km24SellCaption(img,{max_new_tokens:40}),t=clean(r?.[0]?.generated_text||r?.[0]?.caption||"").replace(/[.]+$/,"");if(t&&!caps.includes(t))caps.push(t)}catch(_){}}
     if(!caps.length)throw new Error("Keine Bildbeschreibung erkannt");
     let de=caps;try{if(!window.__km24SellTranslate)window.__km24SellTranslate=await mod.pipeline("translation","Xenova/opus-mt-en-de");de=[];for(const c of caps){let r=await window.__km24SellTranslate(c,{max_new_tokens:70});de.push(clean(r?.[0]?.translation_text||r?.[0]?.generated_text||c))}}catch(_){}
     if(!clean(title.value))title.value=(de[0]||"Inserat").replace(/^(ein|eine|der|die|das)\s+/i,"").slice(0,80);
     if(!clean(desc.value))desc.value="Zum Verkauf steht "+title.value+".\n\nAuf den Fotos zu sehen:\n"+de.map(x=>"• "+x).join("\n");
     title.dispatchEvent(new Event("input",{bubbles:true}));desc.dispatchEvent(new Event("input",{bubbles:true}));
     aiMsg.textContent="✓ Fotos analysiert und Text erstellt. Bitte Angaben kurz prüfen."
   }catch(e){console.error("KM24 direct listing AI",e);aiMsg.textContent="Die Bilder-KI konnte auf diesem Gerät nicht geladen werden. Bitte Internetverbindung prüfen und nochmals versuchen."}
 }
 window.km24RunListingAi=km24DirectListingAi;
 if(aiBtn)aiBtn.onclick=async()=>{if(aiBtn.disabled)return;aiBtn.disabled=true;try{await km24DirectListingAi()}finally{aiBtn.disabled=false}};
 function redrawPhotos(){photoManager(pm,photos,()=>{redrawPhotos();preview()});preview();let m=document.getElementById("kmListingAiMsg");if(m)m.textContent=photos.length?(photos.length+" Foto"+(photos.length===1?"":"s")+" bereit zur Analyse."):"Lade Fotos hoch und starte danach die Analyse."}
 function preview(){liveListingPreview(pv,sale,photos,"")}
 function fillSubs(selected){let root=document.getElementById("catRoot").value,sub=document.getElementById("cat"),children=cats.filter(c=>c.parent_slug===root).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));if(!root){sub.innerHTML='<option value="">Zuerst Hauptkategorie wählen</option>';sub.disabled=true}else if(children.length){sub.innerHTML='<option value="">Unterkategorie wählen</option>'+children.map(c=>'<option value="'+E(c.slug)+'">'+E(c.name_de)+'</option>').join("");sub.disabled=false;if(selected)sub.value=selected}else{sub.innerHTML='<option value="'+E(root)+'">'+E((cats.find(c=>c.slug===root)||{}).name_de||root)+'</option>';sub.disabled=false;sub.value=root}showDetailPanels(form,rootCategoryOf(sub.value||root));preview()}
 function saleUI(){document.querySelectorAll("#saleChoices [data-s]").forEach(b=>b.classList.toggle("on",b.dataset.s===sale));document.getElementById("auctionfields").classList.toggle("hide",sale!=="auction");document.getElementById("pricebox").classList.toggle("hide",sale==="auction"||sale==="free");document.getElementById("freenote").classList.toggle("hide",sale!=="free");document.getElementById("price").required=["fixed","negotiable"].includes(sale);document.getElementById("start").required=sale==="auction";preview()}
 document.querySelectorAll("#saleChoices [data-s]").forEach(b=>b.onclick=()=>{sale=b.dataset.s;saleUI()});
 document.getElementById("catRoot").onchange=()=>fillSubs();document.getElementById("cat").onchange=()=>{showDetailPanels(form,rootCategoryOf(document.getElementById("cat").value));preview()};
 document.getElementById("photos").onchange=async e=>{let add=[...e.target.files].filter(f=>f.type.startsWith("image/")),fresh=[];for(let f of add){if(photos.length>=8)break;let x={kind:"new",file:f,url:URL.createObjectURL(f),focal_x:50,focal_y:50,fit_mode:"cover",auto_focus:true};photos.push(x);fresh.push(x)}e.target.value="";redrawPhotos();await Promise.all(fresh.map(async x=>{let p=await km24AutoFocal(x.file);x.focal_x=p.x;x.focal_y=p.y}));redrawPhotos()};
 ["title","price","start","zip","city"].forEach(id=>document.getElementById(id).addEventListener("input",preview));
 redrawPhotos();saleUI();
 form.onsubmit=async e=>{
  e.preventDefault();let m=document.getElementById("sm"),category=document.getElementById("cat").value;if(!category)return m.innerHTML=N("Bitte eine Kategorie auswählen.",1);
  let offerRound=!!document.getElementById("offerRound")?.checked;if(offerRound&&sale!=="negotiable")return m.innerHTML=N("Für eine Angebotsrunde bitte die Verkaufsart «Verhandelbar» wählen.",1);
  let offerEnd=offerRound?km24DurationEnd(document.getElementById("offerRoundDuration")?.value||"d3").toISOString():null;
  let price=0,start=null,end=null,inc=1;if(["fixed","negotiable"].includes(sale))price=+document.getElementById("price").value;if(sale==="auction"){start=+document.getElementById("start").value;price=start;inc=+document.getElementById("inc").value||1;let endDate=auctionEndFromDaysTime(document.getElementById("days").value,document.getElementById("auctionTime").value);end=endDate.toISOString()}
  m.innerHTML=N("Inserat wird erstellt ...");
  let payload={seller_id:user.id,category_slug:category,title:document.getElementById("title").value.trim(),description:document.getElementById("desc").value.trim(),price_chf:price,price_type:sale,condition:document.getElementById("cond").value,postal_code:document.getElementById("zip").value.trim()||null,city:document.getElementById("city").value.trim()||null,pickup_available:document.getElementById("pickup").checked,shipping_available:document.getElementById("ship").checked,extra_fields:collectExtra("",rootCategoryOf(category)),status:"active",published_at:new Date().toISOString(),auction_start_price_chf:start,auction_end_at:end,auction_min_increment_chf:inc,listing_visibility:document.getElementById("visibility")?.value||"public",sale_mode:offerRound?"offer_round":"standard",offer_round_end_at:offerEnd,offer_round_allow_early_accept:document.getElementById("offerEarly")?.checked!==false};
  let r=await db.from("listings").insert(payload).select("id").single();if(r.error)return m.innerHTML=N(r.error.message,1);let id=r.data.id;
  if(sale==="auction"&&document.getElementById("reserve").value!==""){let rr=await db.from("auction_reserves").insert({listing_id:id,seller_id:user.id,reserve_price_chf:+document.getElementById("reserve").value});if(rr.error)m.innerHTML=N("Inserat erstellt, Mindestpreis konnte nicht gespeichert werden.",1)}

  let photoErrors=[];
  for(let i=0;i<photos.length;i++){
    let x=photos[i];
    try{
      m.innerHTML=N("Foto "+(i+1)+" von "+photos.length+" wird hochgeladen …");
      let f=await window.km24CompressUploadImage(x.file);
      if(!f||f.size>10*1024*1024){photoErrors.push("Foto "+(i+1)+": Die Datei ist grösser als 10 MB.");continue;}
      let ext=(f.name.split(".").pop()||"jpg").replace(/[^a-z0-9]/gi,"");
      let path=user.id+"/"+id+"/"+(window.crypto&&typeof crypto.randomUUID==='function'?crypto.randomUUID():('km24_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)))+"."+ext;
      let up=await db.storage.from("listing-images").upload(path,f,{contentType:f.type});
      if(up.error){photoErrors.push("Foto "+(i+1)+": "+up.error.message);continue;}
      let linked=await db.from("listing_images").insert({listing_id:id,storage_path:path,sort_order:i,focal_x:x.focal_x??50,focal_y:x.focal_y??50,fit_mode:x.fit_mode||"contain"});
      if(linked.error){await db.storage.from("listing-images").remove([path]);photoErrors.push("Foto "+(i+1)+": "+linked.error.message);}
    }catch(error){photoErrors.push("Foto "+(i+1)+": "+String(error?.message||"Hochladen fehlgeschlagen"));}
  }
  await km24SaveBusinessPrice(id,"businessPrice");
  let attUploadResult=await km24UploadListingAttachments(id,"attachments",m);
  if(photoErrors.length||attUploadResult.failed){
    let problems=[];
    if(photoErrors.length)problems.push(photoErrors.length+" Foto(s) konnten nicht gespeichert werden:\n"+photoErrors.join("\n").slice(0,500));
    if(attUploadResult.failed)problems.push(attUploadResult.failed+" Zusatzdatei(en) konnten nicht gespeichert werden:\n"+attUploadResult.errors.join("\n").slice(0,300));
    alert("Das Inserat wurde erstellt, aber nicht alle Dateien konnten hochgeladen werden.\n\n"+problems.join("\n\n")+"\n\nBitte füge die fehlenden Dateien unter «Inserat bearbeiten» erneut hinzu.");
    go("#/edit/"+id);return;
  }
  try{sessionStorage.setItem("km24PromoAfterCreateV1",id)}catch(_){}
  try{if(window.km24FounderAfterListing&&await window.km24FounderAfterListing(id))return}catch(_){}
  go("#/listing/"+id);
 };
}

async function editListing(id){
 if(!user)return go("#/login");
 if(document.getElementById("editForm")&&location.hash.startsWith("#/edit/"+id))return;
 let [lr,ir,rr,br]=await Promise.all([
  db.from("listings").select("*").eq("id",id).eq("seller_id",user.id).maybeSingle(),
  db.from("listing_images").select("*").eq("listing_id",id).order("sort_order"),
  db.from("auction_reserves").select("*").eq("listing_id",id).maybeSingle(),
  db.from("bids").select("id").eq("listing_id",id).limit(1)
 ]);
 if(!lr.data){app.innerHTML='<div class="wrap formPage"><div class="empty">Inserat nicht gefunden.</div></div>';return}
 let l=lr.data,extra=l.extra_fields||{},sale=l.price_type,bidLocked=(br.data||[]).length>0,originalImages=ir.data||[],photos=originalImages.map(x=>({kind:"existing",id:x.id,path:x.storage_path,url:IMG(x.storage_path),focal_x:x.focal_x??50,focal_y:x.focal_y??50,fit_mode:x.fit_mode||"contain"})),reserve=rr.data?.reserve_price_chf??"",root=rootCategoryOf(l.category_slug),roots=cats.filter(c=>!c.parent_slug).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)),rootOpts=roots.map(c=>'<option value="'+E(c.slug)+'" '+(c.slug===root?"selected":"")+">"+E(c.name_de)+'</option>').join("");
 let editAuctionDays=auctionDaysUntil(l.auction_end_at),editAuctionTime=l.auction_end_at?auctionLocalTime(l.auction_end_at):"20:00";
 app.innerHTML='<div class="formPage"><div class="wrap"><a class="btn" href="#/me">← Zurück</a><h1>Inserat bearbeiten</h1><form id="editForm" class="formgrid"><div class="main"><section class="panel"><h3>Verkaufsart</h3>'+(bidLocked?'<div class="editLock">🔒 Für diese Auktion wurde bereits geboten. Verkaufsart und Auktionsbedingungen sind deshalb gesperrt.</div>':'')+'<div class="choices" id="editSaleChoices">'+saleChoices(sale,bidLocked)+'</div></section><section class="panel stack"><h3>Artikel</h3><label>Titel<input id="etitle" required maxlength="120" value="'+E(l.title)+'"></label><div class="two"><label>Hauptkategorie<select id="ecatRoot" required>'+rootOpts+'</select></label><label>Unterkategorie<select id="ecat" required></select></label></div><label>Zustand<select id="econd">'+sel(["new","like_new","used","defective"],l.condition).replace(">new<",">Neu<").replace(">like_new<",">Wie neu<").replace(">used<",">Gebraucht<").replace(">defective<",">Defekt<")+'</select></label><label>Beschreibung<textarea id="edesc" rows="7" maxlength="5000">'+E(l.description||"")+'</textarea></label></section>'+detailPanels("e",extra)+'<section class="panel"><h3>Preis</h3><div id="epricebox"><label>Preis CHF<input class="field" id="eprice" type="number" min="0" step=".05" value="'+E(l.price_chf||0)+'"></label></div><div id="eauctionfields"><div class="two"><label>Startpreis CHF<input class="field" id="estart" type="number" min="0" step=".05" value="'+E(l.auction_start_price_chf??l.price_chf??0)+'" '+(bidLocked?"disabled":"")+'></label><label>Mindestpreis CHF (optional)<input class="field" id="ereserve" type="number" min="0" step=".05" value="'+E(reserve)+'" '+(bidLocked?"disabled":"")+'></label></div><div class="two"><label>Dauer<select class="field" id="edays" '+(bidLocked?"disabled":"")+'>'+auctionDayOptions(editAuctionDays)+'</select></label><label>Endzeit<input class="field" id="etime" type="time" value="'+E(editAuctionTime)+'" '+(bidLocked?"disabled":"")+'></label></div><label>Mindest-Erhöhung CHF<input class="field" id="einc" type="number" min=".05" step=".05" value="'+E(l.auction_min_increment_chf||1)+'" '+(bidLocked?"disabled":"")+'></label><small class="mut">Auktionsdauer: 1 bis maximal 14 Tage.</small></div><div id="efreenote" class="notice hide">Dieses Inserat ist kostenlos / zu verschenken.</div></section><details class="panel km24ProOptions"><summary><span>⚙️ Erweiterte Verkaufsoptionen</span><small>optional</small></summary><div class="km24ProGrid"><label>Sichtbarkeit<select id="evisibility"><option value="public">🌐 Öffentlich – für alle</option><option value="business_only">🏪 Nur verifizierte Gewerbekonten</option></select></label><label>Gewerbepreis CHF <span class="mut">(optional)</span><input id="ebusinessPrice" type="number" min="0" step=".05" placeholder="Nur für Gewerbe sichtbar"></label></div><label class="km24ProToggle"><input id="eofferRound" type="checkbox"> <span><b>🤝 Angebotsrunde</b><small>Mehrere Angebote sammeln und danach eines auswählen.</small></span></label><div id="eofferRoundOptions" class="km24ProSub hide"><div class="two"><label>Dauer<select id="eofferRoundDuration"></select></label><label class="km24ProToggle"><input id="eofferEarly" type="checkbox" checked> <span><b>Vorzeitig annehmen erlauben</b><small>Ein gutes Angebot kann schon vor Ablauf angenommen werden.</small></span></label></div><small class="mut">Nach dem ersten Angebot kann die Laufzeit nicht mehr verändert werden.</small></div></details><section class="panel"><h3>📎 Videos & Dokumente</h3><label class="photoAdd">＋ Weitere Dateien<input id="eattachments" type="file" accept="video/*,.mp4,.mov,.webm,application/pdf,.pdf,.doc,.docx,.xls,.xlsx,.txt" multiple></label><div class="formHelp">Optional · bis 4 neue Dateien · maximal 50 MB pro Datei.</div><div id="eExistingAttachments"></div><div id="eattachmentMsg" class="mut"></div></section><section class="panel"><h3>Fotos</h3><label class="photoAdd">＋ Weitere Fotos hinzufügen<input id="ephotos" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" multiple></label><div class="formHelp">Bis zu 8 Bilder (max. 10 MB pro Bild). Reihenfolge ändern oder Bilder entfernen; Bild 1 ist das Titelbild.</div><div id="editPhotoManager" class="photoManager"></div></section></div><aside class="side"><section class="panel stack"><h3>Standort & Übergabe</h3><div class="two"><label>PLZ<input id="ezip" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" required value="'+E(l.postal_code||"")+'"></label><label>Ort<input id="ecity" required value="'+E(l.city||"")+'"></label></div><label><input id="epick" type="checkbox" '+(l.pickup_available?"checked":"")+'> Abholung</label><label><input id="eship" type="checkbox" '+(l.shipping_available?"checked":"")+'> Versand</label></section><section class="panel livePreview"><h3>Vorschau</h3><div id="editPreview"></div><button class="btn primary" style="width:100%;margin-top:16px">Änderungen speichern</button><div id="editMsg"></div></section></aside></form></div></div>';
 let form=document.getElementById("editForm"),pm=document.getElementById("editPhotoManager"),pv=document.getElementById("editPreview");
 function fillSubs(selected){let r=document.getElementById("ecatRoot").value,sub=document.getElementById("ecat"),children=cats.filter(c=>c.parent_slug===r).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));if(children.length){sub.innerHTML=children.map(c=>'<option value="'+E(c.slug)+'">'+E(c.name_de)+'</option>').join("");sub.value=children.some(c=>c.slug===selected)?selected:children[0].slug}else{sub.innerHTML='<option value="'+E(r)+'">'+E((cats.find(c=>c.slug===r)||{}).name_de||r)+'</option>';sub.value=r}showDetailPanels(form,rootCategoryOf(sub.value));preview()}
 function redrawPhotos(){photoManager(pm,photos,()=>{redrawPhotos();preview()});preview()}
 function preview(){liveListingPreview(pv,sale,photos,"e")}
 function saleUI(){document.querySelectorAll("#editSaleChoices [data-s]").forEach(b=>b.classList.toggle("on",b.dataset.s===sale));document.getElementById("eauctionfields").classList.toggle("hide",sale!=="auction");document.getElementById("epricebox").classList.toggle("hide",sale==="auction"||sale==="free");document.getElementById("efreenote").classList.toggle("hide",sale!=="free");document.getElementById("eprice").required=["fixed","negotiable"].includes(sale);document.getElementById("estart").required=sale==="auction"&&!bidLocked;preview()}
 document.querySelectorAll("#editSaleChoices [data-s]").forEach(b=>b.onclick=()=>{if(!bidLocked){sale=b.dataset.s;saleUI()}});
 document.getElementById("ecatRoot").onchange=()=>fillSubs();document.getElementById("ecat").onchange=()=>{showDetailPanels(form,rootCategoryOf(document.getElementById("ecat").value));preview()};
 document.getElementById("ephotos").onchange=async e=>{let fresh=[];for(let f of [...e.target.files].filter(f=>f.type.startsWith("image/"))){if(photos.length>=8)break;let x={kind:"new",file:f,url:URL.createObjectURL(f),focal_x:50,focal_y:50,fit_mode:"contain",auto_focus:false};photos.push(x);fresh.push(x)}e.target.value="";redrawPhotos();await Promise.all(fresh.map(async x=>{let p=await km24AutoFocal(x.file);x.focal_x=p.x;x.focal_y=p.y}));redrawPhotos()};
 ["etitle","eprice","estart","ezip","ecity"].forEach(x=>document.getElementById(x).addEventListener("input",preview));
 fillSubs(l.category_slug);redrawPhotos();saleUI();
 form.onsubmit=async e=>{
  e.preventDefault();let m=document.getElementById("editMsg"),category=document.getElementById("ecat").value;if(!category)return m.innerHTML=N("Bitte Kategorie auswählen.",1);
  let offerRound=!!document.getElementById("eofferRound")?.checked;if(offerRound&&sale!=="negotiable")return m.innerHTML=N("Für eine Angebotsrunde bitte die Verkaufsart «Verhandelbar» wählen.",1);
  let offerEnd=offerRound?(document.getElementById("eofferRoundDuration")?.disabled&&l.offer_round_end_at?l.offer_round_end_at:km24DurationEnd(document.getElementById("eofferRoundDuration")?.value||"d3",l.offer_round_end_at).toISOString()):null;
  let price=0,start=null,end=null,inc=1;if(["fixed","negotiable"].includes(sale))price=+document.getElementById("eprice").value;if(sale==="auction"){start=bidLocked?l.auction_start_price_chf:+document.getElementById("estart").value;price=start;inc=bidLocked?l.auction_min_increment_chf:(+document.getElementById("einc").value||1);if(bidLocked)end=l.auction_end_at;else{let endDate=auctionEndFromDaysTime(document.getElementById("edays").value,document.getElementById("etime").value);end=endDate.toISOString();if(endDate<=new Date())return m.innerHTML=N("Das Auktionsende muss in der Zukunft liegen.",1)}}
  m.innerHTML=N("Änderungen werden gespeichert ...");
  let payload={title:document.getElementById("etitle").value.trim(),category_slug:category,description:document.getElementById("edesc").value.trim(),price_chf:price,price_type:sale,condition:document.getElementById("econd").value,postal_code:document.getElementById("ezip").value.trim()||null,city:document.getElementById("ecity").value.trim()||null,pickup_available:document.getElementById("epick").checked,shipping_available:document.getElementById("eship").checked,extra_fields:collectExtra("e",rootCategoryOf(category)),updated_at:new Date().toISOString(),auction_start_price_chf:sale==="auction"?start:null,auction_end_at:sale==="auction"?end:null,auction_min_increment_chf:sale==="auction"?inc:1,listing_visibility:document.getElementById("evisibility")?.value||"public",sale_mode:offerRound?"offer_round":"standard",offer_round_end_at:offerEnd,offer_round_allow_early_accept:document.getElementById("eofferEarly")?.checked!==false};
  if(bidLocked){payload.price_type=l.price_type;payload.price_chf=l.price_chf;payload.auction_start_price_chf=l.auction_start_price_chf;payload.auction_end_at=l.auction_end_at;payload.auction_min_increment_chf=l.auction_min_increment_chf}
  let q=await db.from("listings").update(payload).eq("id",id).eq("seller_id",user.id);if(q.error)return m.innerHTML=N(q.error.message,1);
  if(!bidLocked){if(sale==="auction"&&document.getElementById("ereserve").value!==""){let aq=await db.from("auction_reserves").upsert({listing_id:id,seller_id:user.id,reserve_price_chf:+document.getElementById("ereserve").value},{onConflict:"listing_id"});if(aq.error)return m.innerHTML=N(aq.error.message,1)}else await db.from("auction_reserves").delete().eq("listing_id",id).eq("seller_id",user.id)}
  let keep=new Set(photos.filter(x=>x.kind==="existing").map(x=>x.id)),removed=originalImages.filter(x=>!keep.has(x.id));
  if(removed.length){let paths=removed.map(x=>x.storage_path);await db.from("listing_images").delete().in("id",removed.map(x=>x.id));let refs=await db.from("listing_images").select("storage_path").in("storage_path",paths),used=new Set((refs.data||[]).map(x=>x.storage_path)),orphan=paths.filter(x=>!used.has(x));if(orphan.length)await db.storage.from("listing-images").remove(orphan)}
  for(let i=0;i<photos.length;i++){let x=photos[i];if(x.kind==="existing"){if(x._replacementFile){let f=x._replacementFile,ext=(f.name.split(".").pop()||"webp").replace(/[^a-z0-9]/gi,""),oldPath=x.path,path=user.id+"/"+id+"/"+(window.crypto&&typeof crypto.randomUUID==='function'?crypto.randomUUID():('km24_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)))+"."+ext,up=await db.storage.from("listing-images").upload(path,f,{contentType:f.type});if(up.error)return m.innerHTML=N("Bild konnte nicht gespeichert werden: "+up.error.message,1);let uq=await db.from("listing_images").update({storage_path:path,sort_order:i,focal_x:x.focal_x??50,focal_y:x.focal_y??50,fit_mode:x.fit_mode||"cover"}).eq("id",x.id);if(uq.error){await db.storage.from("listing-images").remove([path]);return m.innerHTML=N(uq.error.message,1)}x.path=path;let refs=await db.from("listing_images").select("storage_path").eq("storage_path",oldPath);if(!(refs.data||[]).length)await db.storage.from("listing-images").remove([oldPath])}else{await db.from("listing_images").update({sort_order:i,focal_x:x.focal_x??50,focal_y:x.focal_y??50,fit_mode:x.fit_mode||"contain"}).eq("id",x.id)}}else{let f=await window.km24CompressUploadImage(x.file),ext=(f.name.split(".").pop()||"jpg").replace(/[^a-z0-9]/gi,""),path=user.id+"/"+id+"/"+(window.crypto&&typeof crypto.randomUUID==='function'?crypto.randomUUID():('km24_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)))+"."+ext,up=await db.storage.from("listing-images").upload(path,f,{contentType:f.type});if(up.error)return m.innerHTML=N("Foto "+(i+1)+" konnte nicht hochgeladen werden: "+up.error.message+". Bitte überprüfe die Verbindung und versuche es erneut.",1);let linked=await db.from("listing_images").insert({listing_id:id,storage_path:path,sort_order:i,focal_x:x.focal_x??50,focal_y:x.focal_y??50,fit_mode:x.fit_mode||"contain"}).select("id").single();if(linked.error){await db.storage.from("listing-images").remove([path]);return m.innerHTML=N("Foto "+(i+1)+" konnte nicht gespeichert werden: "+linked.error.message,1)}x.kind="existing";x.id=linked.data.id;x.path=path;x._replacementFile=null;x.file=null;}}
  await km24SaveBusinessPrice(id,"ebusinessPrice");
  let attUploadResult=await km24UploadListingAttachments(id,"eattachments",m);
  if(attUploadResult.failed){m.textContent="Änderungen gespeichert, aber "+attUploadResult.failed+" Datei(en) konnten nicht hochgeladen werden: "+attUploadResult.errors.join("; ");return;}
  m.innerHTML=N("Gespeichert.");setTimeout(()=>go("#/listing/"+id),450);
 };
}

function setDetailImage(src,fit,fx,fy){let mp=document.getElementById("mp");if(!mp)return;fit=fit==="contain"?"contain":"cover";fx=Number(fx??50);fy=Number(fy??50);if(!Number.isFinite(fx))fx=50;if(!Number.isFinite(fy))fy=50;mp.innerHTML='<img src="'+E(src)+'" style="object-fit:'+fit+'!important;object-position:'+fx+'% '+fy+'%!important">';mp.onclick=()=>openImageLightbox(src)}
function openImageLightbox(src){
 let gallery=null;
 document.querySelectorAll(".gallery").forEach(g=>{
  if(gallery)return;
  let mi=g.querySelector(".mainpic img");
  if(mi&&mi.src===src)gallery=g;
 });
 let sources=gallery?Array.from(gallery.querySelectorAll(".thumbs .thumb")).map(x=>x.src).filter(Boolean):[];
 if(!sources.length)sources=[src];
 let current=sources.findIndex(x=>x===src);if(current<0)current=0;
 let o=document.createElement("div");
 o.className="imageLightbox km24SwipeLightbox";
 o.setAttribute("role","dialog");o.setAttribute("aria-modal","true");
 o.innerHTML='<button class="imageLightboxClose" aria-label="Schliessen">×</button>'+(sources.length>1?'<button type="button" class="km24LightboxNav km24LightboxPrev" aria-label="Vorheriges Bild">‹</button><button type="button" class="km24LightboxNav km24LightboxNext" aria-label="Nächstes Bild">›</button><div class="km24LightboxCount"></div>':'')+'<img draggable="false" src="'+E(sources[current])+'">';
 let img=o.querySelector("img"),count=o.querySelector(".km24LightboxCount");
 function show(i){current=(i+sources.length)%sources.length;img.src=sources[current];if(count)count.textContent=(current+1)+" / "+sources.length}
 function close(){o.remove()}
 o.querySelector(".imageLightboxClose").onclick=e=>{e.preventDefault();e.stopPropagation();close()};
 if(sources.length>1){
  o.querySelector(".km24LightboxPrev").onclick=e=>{e.preventDefault();e.stopPropagation();show(current-1)};
  o.querySelector(".km24LightboxNext").onclick=e=>{e.preventDefault();e.stopPropagation();show(current+1)};
  show(current);
 }
 o.onclick=e=>{if(e.target===o)close()};
 let startX=null,startY=null,dragging=false;
 function begin(x,y){startX=x;startY=y;dragging=true}
 function endSwipe(x,y){
  if(!dragging||startX===null)return;
  let dx=x-startX,dy=y-startY;
  dragging=false;startX=startY=null;
  if(sources.length>1&&Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.15)show(current+(dx<0?1:-1))
 }
 o.addEventListener("touchstart",e=>{let t=e.touches&&e.touches[0];if(t)begin(t.clientX,t.clientY)},{passive:true});
 o.addEventListener("touchend",e=>{let t=e.changedTouches&&e.changedTouches[0];if(t)endSwipe(t.clientX,t.clientY)},{passive:true});
 o.addEventListener("pointerdown",e=>{if(e.pointerType!=="touch")begin(e.clientX,e.clientY)});
 o.addEventListener("pointerup",e=>{if(e.pointerType!=="touch")endSwipe(e.clientX,e.clientY)});
 o.tabIndex=-1;
 o.addEventListener("keydown",e=>{if(e.key==="Escape")close();else if(e.key==="ArrowLeft"&&sources.length>1)show(current-1);else if(e.key==="ArrowRight"&&sources.length>1)show(current+1)});
 document.body.appendChild(o);
 requestAnimationFrame(()=>{try{o.focus({preventScroll:true})}catch(_){o.focus()}});
}
function closeBuyModal(){document.getElementById("buyOverlay")?.remove()}
function buyErrorText(msg){let t=String(msg||"Kauf konnte nicht abgeschlossen werden.");if(t.includes("nicht mehr verfügbar")||t.includes("bereits gekauft"))return"Dieser Artikel wurde leider gerade bereits verkauft.";if(t.includes("Mobilnummer")||t.includes("E-Mail"))return"Bitte bestätige zuerst deine E-Mail-Adresse und hinterlege eine gültige Mobilnummer.";if(t.includes("block"))return"Zwischen diesen Konten ist aktuell kein Kauf möglich.";return t}
function openBuyNow(listingId,title,price){
 if(!user)return go("#/login");
 if(!contactReady())return go("#/verification?next=listing%2F"+listingId);
 if(!buyerReady())return go("#/buyer-activation");
 closeBuyModal();
 let o=document.createElement("div");o.id="buyOverlay";o.className="buyOverlay";
 o.innerHTML='<div class="buyModal"><h2>Jetzt kaufen</h2><div class="mut">'+E(title)+'</div><div class="buyPrice">CHF '+F(price)+'</div><div class="notice"><b>Der Kauf ist verbindlich.</b><br>Mit deiner Bestätigung wird der Artikel sofort als verkauft markiert.</div><div id="buyMsg"></div><div class="actions"><button class="btn" id="buyCancel">Abbrechen</button><button class="btn primary" id="buyConfirm">Verbindlich kaufen</button></div></div>';
 document.body.appendChild(o);
 document.getElementById("buyCancel").onclick=closeBuyModal;
 document.getElementById("buyConfirm").onclick=async()=>{
  let b=document.getElementById("buyConfirm"),m=document.getElementById("buyMsg");b.disabled=true;b.textContent="Kauf wird abgeschlossen ...";
  let r=await db.rpc("buy_now",{p_listing_id:listingId});
  if(r.error){m.innerHTML=N(buyErrorText(r.error.message),1);b.disabled=false;b.textContent="Verbindlich kaufen";if(String(r.error.message).includes("nicht mehr verfügbar")||String(r.error.message).includes("bereits gekauft"))setTimeout(()=>{closeBuyModal();detail(listingId)},1200);return}
  let x=(r.data||[])[0]||{};
  o.querySelector(".buyModal").innerHTML='<h2>✓ Kauf erfolgreich</h2><div class="buySuccess"><b>'+E(x.title||title)+'</b><div style="font-size:24px;font-weight:950;margin-top:6px">CHF '+F(x.amount_chf??price)+'</div><div style="margin-top:6px">Der Verkäufer wurde benachrichtigt.</div></div><div class="actions"><button class="btn" id="buyToPurchases">Meine Käufe</button><button class="btn primary" id="buyToChat">Verkäufer kontaktieren</button></div>';
  document.getElementById("buyToPurchases").onclick=()=>{closeBuyModal();go("#/buyer")};
  document.getElementById("buyToChat").onclick=()=>{closeBuyModal();if(x.conversation_id)go("#/messages/"+x.conversation_id);else go("#/buyer")};
 }
}
async function detail(id){app.innerHTML='<div class="wrap detail"><div class="empty">Inserat wird geladen ...</div></div>';let lr=await db.from('listings').select('*').eq('id',id).maybeSingle();if(!lr.data){if(user){let tq=await db.rpc("my_reviewable_transactions");if(!tq.error&&(tq.data||[]).some(x=>x.listing_id===id))return transactionReviewPage(id)}else{let rq=await db.rpc("listing_review_link_status",{p_listing_id:id});if(!rq.error&&rq.data===true)return go("#/login?next=review&id="+encodeURIComponent(id))}app.innerHTML='<div class="wrap detail"><div class="empty">Inserat nicht gefunden.</div></div>';return}let l=lr.data;if(l.price_type==='auction'&&l.status==='active'&&l.auction_end_at&&new Date(l.auction_end_at)<=new Date()&&user){await db.rpc('finalize_auction',{p_listing_id:id});let rr=await db.from('listings').select('*').eq('id',id).maybeSingle();if(rr.data)l=rr.data}let [pr,ir,cr,sr,hr,mr]=await Promise.all([db.rpc('seller_profile_public',{p_seller_id:l.seller_id}),db.from('listing_images').select('*').eq('listing_id',id).order('sort_order'),db.from('categories').select('name_de').eq('slug',l.category_slug).maybeSingle(),user&&l.price_type==='auction'?db.from('auction_stats').select('*').eq('listing_id',id).maybeSingle():Promise.resolve({data:null}),user&&l.price_type==='auction'?db.rpc('auction_bid_history_v2',{p_listing_id:id}):Promise.resolve({data:[]}),user&&l.price_type==='auction'?db.rpc('my_auction_max_bid',{p_listing_id:id}):Promise.resolve({data:null})]),p=(pr.data||[])[0]||{},imgs=ir.data||[],st=sr.data,bidHistory=hr.data||[],myMax=mr.data==null?null:Number(mr.data),own=user&&user.id===l.seller_id,ended=l.price_type==='auction'&&l.auction_end_at&&new Date(l.auction_end_at)<=new Date(),fav=false,vf=l.extra_fields||{},vehicleHtml='';let vehicleLabels={brand:'Marke',model:'Modell',year:'Jahrgang',mileage_km:'Kilometer',fuel:'Treibstoff',gearbox:'Getriebe',power_ps:'Leistung',engine_cc:'Hubraum',drive:'Antrieb',body:'Karosserie',color:'Farbe',mfk:'MFK',storage:'Speicher / Kapazität',warranty:'Garantie',accessories:'Zubehör',property_type:'Objektart',rooms:'Zimmer',area_m2:'Wohnfläche',floor:'Etage',available_from:'Verfügbar ab',charges_chf:'Nebenkosten',size:'Grösse',material:'Material',power_source:'Betriebsart',specification:'Technische Daten'};let vehicleUnits={mileage_km:' km',power_ps:' PS',engine_cc:' cm³',area_m2:' m²',charges_chf:' CHF'};let vehicleRows=Object.keys(vehicleLabels).filter(k=>vf[k]!==undefined&&vf[k]!==null&&vf[k]!=='').map(k=>'<div class="spec km24DetailSpec"><small>'+E(vehicleLabels[k])+'</small><b>'+E(vf[k])+E(vehicleUnits[k]||'')+'</b></div>').join('');if(vehicleRows)vehicleHtml='<h3 class="km24DetailSectionTitle">Details</h3><div class="specs km24DetailSpecs km24DetailSpecsExtra">'+vehicleRows+'</div>';let quickSpecs=[['📅',vf.year,''],['🛣️',vf.mileage_km,' km'],['⛽',vf.fuel,''],['⚙️',vf.gearbox,''],['⚡',vf.power_ps,' PS'],['🏠',vf.rooms,' Zimmer'],['📐',vf.area_m2,' m²'],['💾',vf.storage,'']].filter(x=>x[1]!==undefined&&x[1]!==null&&x[1]!=='').slice(0,5),quickHtml=quickSpecs.length?'<div class="km24DetailQuick">'+quickSpecs.map(x=>'<span class="km24DetailQuickChip"><i>'+x[0]+'</i>'+E(x[1])+E(x[2])+'</span>').join('')+'</div>':'';if(user){let f=await db.from('favorites').select('listing_id').eq('user_id',user.id).eq('listing_id',id).maybeSingle();fav=!!f.data}let first=imgs[0]?IMG(imgs[0].storage_path):'',gallery='<div class="gallery"><div class="mainpic" id="mp" '+(first?'onclick="openImageLightbox(this.querySelector(\'img\').src)"':'')+'>'+(first?'<img src="'+E(first)+'" style="object-fit:'+(imgs[0]?.fit_mode==="contain"?"contain":"cover")+'!important;object-position:'+Number(imgs[0]?.focal_x??50)+'% '+Number(imgs[0]?.focal_y??50)+'%!important">':'📷')+'</div>'+(imgs.length>1?'<div class="thumbs">'+imgs.map(x=>'<img class="thumb" src="'+E(IMG(x.storage_path))+'" style="object-fit:'+(x.fit_mode==="contain"?"contain":"cover")+';object-position:'+Number(x.focal_x??50)+'% '+Number(x.focal_y??50)+'%" onclick="setDetailImage(\''+E(IMG(x.storage_path))+'\',\''+(x.fit_mode==="contain"?"contain":"cover")+'\','+Number(x.focal_x??50)+','+Number(x.focal_y??50)+')">').join('')+'</div>':'')+'</div>',box='';if(l.price_type==='auction'){box='<div class="auctionbox"><small class="mut">Aktuelles Gebot</small><div class="big">'+(st&&st.highest_bid_chf!=null?'CHF '+F(st.highest_bid_chf):'Noch kein Gebot')+'</div><small>Startpreis CHF '+F(l.auction_start_price_chf||l.price_chf)+' · '+(st?st.bid_count:0)+' Gebot(e)</small><div style="margin-top:5px"><small>Ende: <b>'+E(D(l.auction_end_at))+'</b></small></div><div id="countdown" class="countdown" style="margin-top:6px"></div><div style="margin-top:5px"><small class="mut">⏱ Gebote in der letzten Minute verlängern die Auktion automatisch um 2 Minuten.</small></div>'+(st&&st.has_reserve?'<div><small>'+(st.reserve_met?'✅ Mindestpreis erreicht':'⏳ Mindestpreis noch nicht erreicht')+'</small></div>':'')+(ended?N('Diese Auktion ist beendet.'):own?N('Das ist deine Auktion.'):!user?'<button class="btn primary" style="width:100%;margin-top:10px" onclick="go(\'#/login\')">Anmelden und bieten</button>':
'<button type="button" id="km24AuctionNativeCta" class="btn primary" onclick="document.getElementById(\'km24AuctionNativeSheet\').classList.add(\'open\')">'+((bidHistory[0]&&bidHistory[0].is_mine)?'Maximalgebot erhöhen':'Bieten')+'</button><div id="km24AuctionNativeSheet" class="km24AuctionNativeSheet" onclick="if(event.target===this)this.classList.remove(\'open\')"><section class="km24AuctionNativeCard"><div class="km24AuctionNativeHead"><div><b>Gebot abgeben</b><small>'+((bidHistory[0]&&bidHistory[0].is_mine)?'Du führst aktuell. Erhöhe nur dein Maximalgebot.':'Wähle normales Gebot oder Maximalgebot.')+'</small></div><button type="button" class="km24AuctionNativeClose" onclick="this.closest(\'.km24AuctionNativeSheet\').classList.remove(\'open\')" aria-label="Schliessen">×</button></div>'+((bidHistory[0]&&bidHistory[0].is_mine)?'<div class="km24AuctionNativeLead">✓ Du führst aktuell</div>':'')+'<div class="notice km24AuctionNativeInfo"><b>🤖 Automatisches Maximalgebot</b><br>Dein Limit bleibt privat. KaufMich24 bietet automatisch nur so viel wie nötig.</div><form id="bidf" class="rowform"><input id="bid" type="number" step=".05" min="'+E(Math.max(Number(st?st.next_min_bid_chf:(l.auction_start_price_chf||l.price_chf)),myMax!=null?myMax+0.05:0))+'" value="'+E(Math.max(Number(st?st.next_min_bid_chf:(l.auction_start_price_chf||l.price_chf)),myMax!=null?myMax+0.05:0))+'" required><button class="btn primary">Maximalgebot setzen</button></form>'+(myMax!=null?'<small class="mut" style="display:block;margin-top:7px">Dein aktuelles Limit: <b>CHF '+F(myMax)+'</b> · nur für dich sichtbar</small>':'')+'<div id="bm"></div></section></div>'
)+'</div>'}if(l.price_type==='auction'&&bidHistory.length){let lead=!!bidHistory[0]?.is_mine,bh=bidHistory.slice(0,10).map((b,i)=>'<div class="bidRow"><span>'+(b.is_mine?'Dein Gebot':(b.bidder_name_masked||('Gebot '+(i+1))))+'</span><b>CHF '+F(b.amount_chf)+'</b></div>').join('');box=box.slice(0,-6)+(lead?'<div class="notice" style="margin-top:10px"><b>✓ Du führst aktuell.</b></div>':'')+'<div class="bidHistory"><small class="mut">Gebotsverlauf</small>'+bh+'</div></div>'}else if(l.price_type==='negotiable'&&!own){box='<div class="panel"><h3>Preis vorschlagen</h3>'+(!user?'<button class="btn primary" onclick="go(\'#/login\')">Anmelden</button>':'<form id="offf" class="rowform"><input id="off" type="number" min="'+E(Math.ceil(Number(l.price_chf||0)*14)/20)+'" step=".05" required placeholder="CHF"><button class="btn primary">Senden</button></form><small class="mut" style="display:block;margin-top:7px">Mindestens CHF '+F(Math.ceil(Number(l.price_chf||0)*14)/20)+' · maximal 30% unter Inseratpreis</small><div id="om"></div>')+'</div>'}else if(l.price_type==='fixed'){box='<div class="panel"><h3>Sofortkauf</h3><div class="big">CHF '+F(l.price_chf)+'</div>'+(l.status!=='active'?N('Dieser Artikel ist nicht mehr verfügbar.'):own?N('Das ist dein Inserat.'):!user?'<button class="btn primary" style="width:100%;margin-top:10px" onclick="go(\'#/login\')">Anmelden und kaufen</button>':'<button id="buyNowBtn" class="btn primary" style="width:100%;margin-top:10px">Jetzt kaufen</button><small class="mut" style="display:block;margin-top:8px">Der Kauf ist verbindlich.</small>')+'</div>'}app.innerHTML='<div class="detail"><div class="wrap"><div class="detailgrid"><div>'+gallery+'<div class="panel km24DetailMainPanel" style="margin-top:14px"><div class="km24DetailBadges"><span class="badge '+(l.price_type==='auction'?'auction':l.price_type==='free'?'free':'')+'">'+E(L(l.price_type))+'</span>'+(p.account_type==='dealer'?'<span class="badge dealer">Händler</span>':'<span class="badge">Privat</span>')+'</div><h1>'+E(l.title)+'</h1><div class="detailprice">'+E(ptxt(l,st))+'</div>'+quickHtml+'<div class="specs km24DetailSpecs km24DetailOverview"><div class="spec km24DetailSpec"><small>Kategorie</small><b>'+E(cr.data?cr.data.name_de:l.category_slug)+'</b></div><div class="spec km24DetailSpec"><small>Zustand</small><b>'+E({new:'Neu',like_new:'Wie neu',used:'Gebraucht',defective:'Defekt'}[l.condition]||l.condition)+'</b></div><div class="spec km24DetailSpec"><small>Ort</small><b>'+E([l.postal_code,l.city].filter(Boolean).join(' ')||'–')+'</b></div><div class="spec km24DetailSpec"><small>Übergabe</small><b>'+E([l.pickup_available?'Abholung':'',l.shipping_available?'Versand':''].filter(Boolean).join(' / ')||'–')+'</b></div></div>'+vehicleHtml+'<h3 class="km24DetailSectionTitle">Beschreibung</h3><div class="desc km24DetailDescription">'+E(l.description||'Keine Beschreibung.')+'</div></div></div><aside class="side">'+box+'<div class="panel"><small class="mut">Verkäufer</small><div class="seller">'+E(p.display_name||((p.account_type==='dealer'||p.account_type==='business')?'Händler / Unternehmen':'Privatperson'))+'</div><div class="ratingStars">'+(p.rating_count?('★ '+E(p.rating)+' / 5 · '+E(p.rating_count)+' Bewertung(en)'):'Noch keine Bewertungen')+'</div><span class="badge '+(p.account_type==='dealer'?'dealer':'')+'">'+(p.account_type==='dealer'?'🏪 Händler':'👤 Privatperson')+'</span><button class="btn" style="width:100%;margin-top:8px" onclick="go(\'#/profile/'+l.seller_id+'\')">Profil ansehen</button>'+(!own?'<button id="chatBtn" class="btn primary" style="width:100%;margin-top:8px">💬 Verkäufer kontaktieren</button><button id="fav" class="btn" style="width:100%;margin-top:8px">'+(fav?'♥ Gemerkt':'♡ Merken')+'</button><button id="reportBtn" class="btn" style="width:100%;margin-top:8px">⚑ Inserat melden</button>':N('Das ist dein Inserat.'))+'</div></aside></div></div></div>';if(document.getElementById('fav'))document.getElementById('fav').onclick=async function(){if(!user)return go('#/login');if(fav){await db.from('favorites').delete().eq('user_id',user.id).eq('listing_id',id);fav=false}else{await db.from('favorites').insert({user_id:user.id,listing_id:id});fav=true}this.textContent=fav?'♥ Gemerkt':'♡ Merken'};if(document.getElementById('bidf'))document.getElementById('bidf').onsubmit=async e=>{e.preventDefault();if(!contactReady())return go('#/verification?next=listing%2F'+id);if(!buyerReady())return go('#/buyer-activation');let r=await db.rpc('place_bid',{p_listing_id:id,p_amount_chf:+document.getElementById('bid').value}),m=document.getElementById('bm');if(r.error)m.innerHTML=N(r.error.message,1);else{m.innerHTML=N('Maximalgebot gespeichert. KaufMich24 bietet automatisch nur so viel wie nötig.');setTimeout(()=>detail(id),500)}};if(document.getElementById('offf'))document.getElementById('offf').onsubmit=async e=>{e.preventDefault();if(!contactReady())return go('#/verification?next=listing%2F'+id);if(!buyerReady())return go('#/buyer-activation');let offerAmount=+document.getElementById('off').value,offerMin=Math.ceil(Number(l.price_chf||0)*14)/20,m=document.getElementById('om');if(offerAmount<offerMin){m.innerHTML=N('Preisvorschlag zu tief. Mindestens CHF '+F(offerMin)+' (70% des Inseratpreises).',1);return}let r=await db.from('offers').insert({listing_id:id,buyer_id:user.id,seller_id:l.seller_id,amount_chf:offerAmount});m.innerHTML=r.error?N(r.error.message,1):N('Angebot wurde gesendet.')};if(document.getElementById('buyNowBtn'))document.getElementById('buyNowBtn').onclick=()=>openBuyNow(id,l.title,l.price_chf);if(document.getElementById('chatBtn'))document.getElementById('chatBtn').onclick=()=>startChat(id);if(document.getElementById('reportBtn'))document.getElementById('reportBtn').onclick=()=>reportListing(id,l.seller_id);let cd=document.getElementById('countdown');if(cd&&l.auction_end_at){let tick=()=>{let ms=new Date(l.auction_end_at)-new Date();if(ms<=0){cd.textContent='Auktion beendet';return}let d=Math.floor(ms/86400000),h=Math.floor(ms%86400000/3600000),m=Math.floor(ms%3600000/60000),s=Math.floor(ms%60000/1000);cd.textContent='Restzeit: '+d+'T '+h+'Std '+m+'Min '+s+'Sek'};tick();setInterval(tick,1000)}}
function statusText(s){return({draft:"Entwurf",active:"Aktiv",reserved:"Reserviert",sold:"Verkauft",inactive:"Pausiert",deleted:"Gelöscht"}[s]||s)}
async function setListingStatus(id,status){let r=await db.from("listings").update({status:status,updated_at:new Date().toISOString()}).eq("id",id).eq("seller_id",user.id);if(r.error)alert(r.error.message);else me()}
async function markSold(id){if(!confirm("Inserat wirklich als verkauft markieren?"))return;let r=await db.rpc("mark_listing_sold",{p_listing_id:id,p_buyer_id:null});if(r.error)alert(r.error.message);else me()}
async function removeListing(id){if(!confirm("Inserat wirklich löschen?"))return;let r=await db.from("listings").update({status:"deleted",updated_at:new Date().toISOString()}).eq("id",id).eq("seller_id",user.id);if(r.error)alert(r.error.message);else me()}
async function promoteListing(id,type){
  if(typeof window.__km24OpenPromoChooser==="function"){
    return window.__km24OpenPromoChooser(id,String(type||"").startsWith("homepage")?"homepage":"top");
  }
  alert("Promotionen werden gerade geladen. Bitte versuche es in einem Moment erneut.");
}
async function respondOffer(id,accept){let r=await db.rpc("respond_offer",{p_offer_id:id,p_accept:accept});if(r.error)alert(r.error.message);else me()}


function normalizePhone(v,residency){
 v=String(v||"").trim().replace(/[\s().-]/g,"");
 if(v.startsWith("00"))v="+"+v.slice(2);
 if((residency||profile?.residency_scope||"CH")==="CH"){
   if(/^07[4-9]\d{7}$/.test(v))v="+41"+v.slice(1);
   if(/^417[4-9]\d{7}$/.test(v))v="+"+v;
 }
 return /^\+[1-9]\d{7,14}$/.test(v)?v:null;
}

async function verificationPage(){
 if(!user)return go("#/login");
 await loadProfile();
 let params=new URLSearchParams((location.hash.split("?")[1]||"")),next=params.get("next")||"me";
 let emailOk=!!user.email_confirmed_at,
     phoneOk=/^\+[1-9][0-9]{7,14}$/.test(profile?.phone||""),
     addressOk=!!(profile?.address_confirmed_at&&String(profile?.street_address||"").trim()&&String(profile?.postal_code||"").trim()&&String(profile?.city||"").trim());
 let addressCard=addressOk
   ?"<div class='adminCard'><b>✓ Wohnadresse bestätigt</b><div style='margin-top:6px'>"+E([profile.street_address,profile.postal_code,profile.city,profile.canton].filter(Boolean).join(", "))+"</div><small class='mut'>🔒 Diese Adresse kann nur durch den KaufMich24-Admin geändert werden.</small></div>"
   :"<div class='adminCard'><b>Wohnadresse bestätigen</b><p class='mut'>Für Kauf- und Verkaufsfunktionen musst du deine aktuelle Wohnadresse einmal bestätigen.</p><form id='addressConfirmForm' class='stack'><label>Strasse & Hausnummer<input id='safeStreet' autocomplete='street-address' value='"+E(profile?.street_address||"")+"' required></label><div class='two'><label>PLZ<input id='safePostal' autocomplete='postal-code' maxlength='12' value='"+E(profile?.postal_code||"")+"' required></label><label>Ort<input id='safeCity' autocomplete='address-level2' value='"+E(profile?.city||"")+"' required></label></div><label>Kanton <small class='mut'>(optional)</small><input id='safeCanton' maxlength='2' value='"+E(profile?.canton||"")+"' placeholder='LU'></label><label style='display:flex;gap:9px;align-items:flex-start'><input id='safeAddressConfirm' type='checkbox' style='width:auto;margin-top:4px' required><span>Ich bestätige, dass dies meine aktuelle Wohnadresse ist. Danach kann sie nur durch den KaufMich24-Admin geändert werden.</span></label><button class='btn primary'>Wohnadresse bestätigen</button></form><div id='addressConfirmMsg'></div></div>";
 app.innerHTML="<div class='wrap formPage km24VerificationPage'><div class='panel'><h1>Konto & Sicherheit</h1><p class='mut'>Für Kaufen und Verkaufen brauchst du eine bestätigte E-Mail-Adresse, eine gültige Mobilnummer und eine einmal bestätigte Wohnadresse.</p><div class='manage'><div class='adminCard'><b>"+(emailOk?"✓ E-Mail bestätigt":"⚠ E-Mail noch nicht bestätigt")+"</b><div>"+E(user.email||"")+"</div>"+(!emailOk?"<button class='btn' id='resendEmail' style='margin-top:8px'>Bestätigungs-Mail erneut senden</button>":"")+"</div><div class='adminCard'><b>"+(phoneOk?"✓ Mobilnummer hinterlegt":"Mobilnummer hinterlegen")+"</b><form id='phoneSave' class='rowform' style='margin-top:8px'><input id='safePhone' inputmode='tel' autocomplete='tel' value='"+E(profile?.phone||"")+"' placeholder='079 123 45 67' required><button class='btn primary'>Speichern</button></form><small class='mut'>Die Nummer wird anderen Nutzern nicht angezeigt.</small><div id='phoneSaveMsg'></div></div>"+addressCard+"</div></div>"+((emailOk&&phoneOk&&addressOk)?"<div style='margin-top:14px'><button class='btn primary' id='verifyContinue'>Weiter</button></div>":"")+"</div>";
 let pe=document.getElementById("resendEmail");if(pe)pe.onclick=async()=>{let r=await db.auth.resend({type:"signup",email:user.email,options:{emailRedirectTo:'https://www.kaufmich24.ch'}});alert(r.error?r.error.message:"Bestätigungs-Mail wurde gesendet.")};
 let pf=document.getElementById("phoneSave");if(pf)pf.onsubmit=async e=>{e.preventDefault();let ph=normalizePhone(document.getElementById("safePhone").value),m=document.getElementById("phoneSaveMsg");if(!ph){m.innerHTML=N("Bitte eine gültige Mobilnummer eingeben. Ausländische Nummern bitte mit Ländervorwahl, z. B. +49.",1);return}let r=await db.from("profiles").update({phone:ph,updated_at:new Date().toISOString()}).eq("id",user.id);if(r.error){let t=r.error.message.includes("duplicate")?"Diese Mobilnummer wird bereits für ein anderes Konto verwendet.":r.error.message;m.innerHTML=N(t,1);return}await loadProfile();verificationPage()};
 let af=document.getElementById("addressConfirmForm");if(af)af.onsubmit=async e=>{e.preventDefault();let m=document.getElementById("addressConfirmMsg"),street=document.getElementById("safeStreet").value.trim(),postal=document.getElementById("safePostal").value.trim(),city=document.getElementById("safeCity").value.trim(),canton=document.getElementById("safeCanton").value.trim().toUpperCase();if(!document.getElementById("safeAddressConfirm").checked)return m.innerHTML=N("Bitte bestätige die Richtigkeit deiner Wohnadresse.",1);let r=await db.rpc("confirm_my_address",{p_street_address:street,p_postal_code:postal,p_city:city,p_canton:canton||null});if(r.error)return m.innerHTML=N(r.error.message,1);m.innerHTML=N("✓ Wohnadresse bestätigt. Änderungen sind jetzt nur noch über den KaufMich24-Admin möglich.");await loadProfile();setTimeout(()=>verificationPage(),350)};
 let c=document.getElementById("verifyContinue");if(c)c.onclick=()=>go("#/"+next);
}

function km24ReactivateText(key){
 const lang=window.km24Language?window.km24Language():"de";
 const text={
  reactivate:{de:"Reaktivieren",en:"Reactivate",fr:"Réactiver",it:"Riattiva"},
  title:{de:"Inserat reaktivieren",en:"Reactivate listing",fr:"Réactiver l’annonce",it:"Riattiva annuncio"},
  description:{de:"Dein Inserat wird wieder sichtbar. Bilder, Beschreibung und der Inserat-Link bleiben erhalten.",en:"Your listing will become visible again. Photos, description and the listing link are preserved.",fr:"Votre annonce sera de nouveau visible. Les photos, la description et le lien sont conservés.",it:"Il tuo annuncio sarà di nuovo visibile. Foto, descrizione e link restano invariati."},
  auction:{de:"Wähle eine neue Laufzeit. Die bisherigen Gebote werden archiviert; die Auktion startet ohne Gebote neu.",en:"Choose a new duration. Previous bids will be archived and the auction restarts without bids.",fr:"Choisissez une nouvelle durée. Les anciennes offres seront archivées ; l’enchère redémarre sans offres.",it:"Scegli una nuova durata. Le offerte precedenti saranno archiviate; l’asta riparte senza offerte."},
  duration:{de:"Neue Auktionsdauer",en:"New auction duration",fr:"Nouvelle durée de l’enchère",it:"Nuova durata dell’asta"},
  day:{de:"Tag",en:"day",fr:"jour",it:"giorno"},days:{de:"Tage",en:"days",fr:"jours",it:"giorni"},
  cancel:{de:"Abbrechen",en:"Cancel",fr:"Annuler",it:"Annulla"},
  busy:{de:"Wird reaktiviert …",en:"Reactivating …",fr:"Réactivation …",it:"Riattivazione …"},
  done:{de:"Dein Inserat wurde reaktiviert und ist wieder sichtbar.",en:"Your listing has been reactivated and is visible again.",fr:"Votre annonce a été réactivée et est de nouveau visible.",it:"Il tuo annuncio è stato riattivato ed è di nuovo visibile."},
  error:{de:"Reaktivierung fehlgeschlagen. Bitte erneut versuchen.",en:"Reactivation failed. Please try again.",fr:"La réactivation a échoué. Veuillez réessayer.",it:"Riattivazione non riuscita. Riprova."}
 };return text[key]?.[lang]||text[key]?.de||key;
}
function km24CanReactivate(l){
 return !!l&&l.status==="inactive"&&!l.sold_to&&!l.sold_at&&
  (l.price_type!=="auction"||(!!l.auction_end_at&&new Date(l.auction_end_at).getTime()<=Date.now()));
}
function km24OpenReactivate(l,trigger){
 if(!user||l.seller_id!==user.id||!km24CanReactivate(l))return;
 if(document.getElementById("km24ReactivateDialog"))return;
 const dialog=document.createElement("dialog"),auction=l.price_type==="auction",t=km24ReactivateText;
 dialog.id="km24ReactivateDialog";dialog.setAttribute("aria-labelledby","km24ReactivateTitle");
 dialog.innerHTML='<form class="stack"><h2 id="km24ReactivateTitle">'+E(t("title"))+'</h2><b>'+E(l.title)+'</b><p>'+E(t("description"))+'</p>'+
  (auction?'<p>'+E(t("auction"))+'</p><label>'+E(t("duration"))+'<select name="days" required>'+Array.from({length:14},(_,i)=>'<option value="'+(i+1)+'"'+(i===6?' selected':'')+'>'+(i+1)+' '+E(t(i===0?"day":"days"))+'</option>').join("")+'</select></label>':'')+
  '<div class="km24ReactivateMessage" role="status" aria-live="polite"></div><div class="actions"><button type="button" data-cancel class="btn">'+E(t("cancel"))+'</button><button type="submit" class="btn primary">🔁 '+E(t("reactivate"))+'</button></div></form>';
 document.body.appendChild(dialog);
 let busy=false;
 dialog.addEventListener("close",()=>{dialog.remove();if(trigger?.isConnected)trigger.focus()});
 dialog.addEventListener("cancel",e=>{if(busy)e.preventDefault()});
 dialog.querySelector("[data-cancel]").onclick=()=>{if(!busy)window.km24DialogClose(dialog)};
 dialog.querySelector("form").onsubmit=async e=>{
  e.preventDefault();if(busy)return;
  const days=auction?Number(dialog.querySelector("select").value):null;
  if(auction&&(!Number.isInteger(days)||days<1||days>14))return;
  busy=true;const submit=dialog.querySelector('[type="submit"]'),cancel=dialog.querySelector('[data-cancel]'),select=dialog.querySelector("select"),msg=dialog.querySelector(".km24ReactivateMessage");
  submit.disabled=cancel.disabled=true;if(select)select.disabled=true;submit.textContent=t("busy");msg.innerHTML="";
  try{
   const r=await db.rpc("reactivate_listing",{p_listing_id:l.id,p_auction_days:days});
   if(r.error)throw r.error;
   window.km24DialogClose(dialog);
   if((location.hash||"").split("?")[0]==="#/me"){
    await me();
    const host=document.querySelector(".km24MyListingsSection");
    if(host){const notice=document.createElement("div");notice.setAttribute("role","status");notice.innerHTML=N(t("done"));host.prepend(notice)}
   }
  }catch(err){
   if(dialog.isConnected)msg.innerHTML=N(err?.message||t("error"),1);
  }finally{
   busy=false;if(dialog.isConnected){submit.disabled=cancel.disabled=false;if(select)select.disabled=false;submit.textContent="🔁 "+t("reactivate")}
  }
 };
 window.km24DialogOpen(dialog);
}

async function me(){
 if(!user)return go("#/login");
 await loadProfile();
 let companyProfile=profile?.account_type==="dealer"||profile?.account_type==="business";

 let [lr,or,nr,blr,plr]=await Promise.all([
  db.from("listings").select("*").eq("seller_id",user.id).neq("status","deleted").order("created_at",{ascending:false}),
  db.from("offers").select("*").eq("seller_id",user.id).order("created_at",{ascending:false}).limit(30),
  db.from("notifications").select("*").eq("user_id",user.id).order("created_at",{ascending:false}).limit(30),
  db.rpc("my_blocked_users"),
  db.rpc("my_loyalty_summary")
 ]);

 let ls=lr.data||[],offers=or.data||[],notes=nr.data||[],blocked=blr.data||[],points=((plr.data||[])[0]||{points_balance:0,chf_value:0}),imgs={},titles={};

 if(ls.length){
   let iq=await db.from("listing_images").select("listing_id,storage_path,sort_order").in("listing_id",ls.map(x=>x.id)).order("sort_order");
   (iq.data||[]).forEach(x=>{if(!imgs[x.listing_id])imgs[x.listing_id]=x.storage_path});
   ls.forEach(x=>titles[x.id]=x.title)
 }

 let activeCount=ls.filter(x=>x.status==="active").length,
     soldCount=ls.filter(x=>x.status==="sold").length,
     pendingOffers=offers.filter(x=>x.status==="pending").length,
     unreadCount=notes.filter(x=>!x.read_at).length;

 let rows=ls.map(l=>{
   let img=imgs[l.id]
     ?"<img src='"+E(IMG(imgs[l.id]))+"' alt=''>"
     :"<div class='km24MyListingNoPic'>📷</div>";
   let active=l.status==="active",
       sold=l.status==="sold",
       stateClass=active?"active":sold?"sold":"paused",
       toggle=active
         ?"<button class='btn km24CompactBtn' data-status='inactive' data-id='"+l.id+"'>⏸ Pausieren</button>"
         :(km24CanReactivate(l)?"<button type='button' class='btn primary km24CompactBtn' data-reactivate='"+l.id+"'>🔁 "+E(km24ReactivateText("reactivate"))+"</button>":(!sold&&!l.sold_to&&!l.sold_at&&l.status==="inactive"&&l.price_type==="auction"&&new Date(l.auction_end_at).getTime()>Date.now()?"<button class='btn km24CompactBtn' data-status='active' data-id='"+l.id+"'>▶ Aktivieren</button>":"")),
       promo=active
         ?"<button class='btn km24CompactBtn km24PromoBtn' data-promo='top_7d' data-id='"+l.id+"'>⭐ Top 7 Tage</button><button class='btn km24CompactBtn km24PromoBtn' data-promo='homepage_7d' data-id='"+l.id+"'>🏠 Startseite</button>"
         :"";

   return "<article class='km24MyListingCard' data-listing-state='"+E(l.status)+"'>"+
     "<div class='km24MyListingMain'>"+
       "<div class='km24MyListingPic'>"+img+"</div>"+
       "<div class='km24MyListingInfo'>"+
         "<div class='km24MyListingTitleRow'><h3>"+E(l.title)+"</h3><span class='km24ListingState "+stateClass+"'>"+E(statusText(l.status))+"</span></div>"+
         "<div class='km24MyListingPrice'>"+E(ptxt(l,null))+"</div>"+
         "<div class='km24MyListingMeta'>Aktualisiert "+E(D(l.updated_at))+"</div>"+
       "</div>"+
     "</div>"+
     "<div class='km24MyListingActions'>"+
       "<a class='btn primary km24CompactBtn' href='#/edit/"+l.id+"'>✏️ Bearbeiten</a>"+
       toggle+
       "<details class='km24ListingMore'><summary>••• Mehr</summary><div class='km24ListingMoreMenu'>"+
         (!sold?"<button class='btn km24CompactBtn' data-sold='"+l.id+"'>✓ Als verkauft markieren</button>":"")+
         promo+
         "<button type='button' class='btn km24CompactBtn' data-sales-sheet='"+l.id+"'>🖨 Verkaufsbild / PDF</button>"+
    "<a class='btn km24CompactBtn' href='#/listing/"+l.id+"'>👁 Inserat ansehen</a>"+
         "<button class='btn km24CompactBtn km24DangerBtn' data-delete='"+l.id+"'>🗑 Löschen</button>"+
       "</div></details>"+
     "</div>"+
   "</article>"
 }).join("");

 let offerHtml=offers.length?offers.map(o=>{
   let cls=o.status==="accepted"?"good":o.status==="rejected"?"bad":"pending";
   return "<div class='km24MiniRow'><div><b>"+E(titles[o.listing_id]||"Inserat")+"</b><span>CHF "+F(o.amount_chf)+"</span></div><span class='km24OfferState "+cls+"'>"+E(offerStatusLabel(o.status))+"</span>"+
   (o.status==="pending"?"<div class='km24MiniActions'><button class='btn primary' data-offer='"+o.id+"' data-accept='1'>Annehmen</button><button class='btn' data-offer='"+o.id+"' data-accept='0'>Ablehnen</button></div>":"")+
   "</div>"
 }).join(""):"<div class='km24AccountEmpty'>Keine Preisvorschläge.</div>";

 let noteHtml=notes.length?notes.slice(0,8).map(n=>
   "<div class='km24MiniRow "+(!n.read_at?"isUnread":"")+"'><div><b>"+E(n.title)+"</b><span>"+E(n.body||"")+"</span><small>"+E(D(n.created_at))+"</small></div></div>"
 ).join(""):"<div class='km24AccountEmpty'>Keine Benachrichtigungen.</div>";

 let blockedHtml=blocked.length?blocked.map(b=>
   "<div class='km24MiniRow'><div><b>"+E(b.business_name||b.display_name||"Nutzer")+"</b><span>Blockiert seit "+E(D(b.blocked_at))+"</span></div><button class='btn' data-unblock='"+b.user_id+"'>Entblockieren</button></div>"
 ).join(""):"<div class='km24AccountEmpty'>Du hast niemanden blockiert.</div>";

 let name=profile&&profile.business_name?profile.business_name:(profile&&profile.display_name)||"Mein Konto",
     accountBadge=companyProfile?"🏪 Firmenkonto":"👤 Privatkonto",
     addressLocked=!!profile?.address_confirmed_at,
     addressLockAttr=addressLocked?" readonly aria-readonly='true'":"";

 let profileFields=companyProfile
 ?"<div class='two'><label>Benutzername<input id='pdn' maxlength='30' autocomplete='username' placeholder='z. B. AutoPro24' value='"+E(profile?.display_name||"")+"' required><small class='mut'>Öffentlich sichtbar · kein echter Personenname.</small></label><label>Firmenname<input id='pbn' value='"+E(profile?.business_name||"")+"' required></label></div>"+
  "<div class='two'><label>Mobilnummer<input id='pph' inputmode='tel' value='"+E(profile?.phone||"")+"' placeholder='079 123 45 67'></label><label>UID / Firmennummer<input id='puid' value='"+E(profile?.business_uid||"")+"'></label></div>"+
  "<label>Firmenadresse<input id='pstreet' value='"+E(profile?.street_address||"")+"' placeholder='Strasse & Hausnummer'"+addressLockAttr+"></label>"+
  "<div class='two'><label>PLZ<input id='pzip' inputmode='numeric' maxlength='12' value='"+E(profile?.postal_code||"")+"'"+addressLockAttr+"></label><label>Ort<input id='pcity' value='"+E(profile?.city||"")+"'"+addressLockAttr+"></label></div>"+
  "<div class='two'><label>Kanton<input id='pcanton' maxlength='2' value='"+E(profile?.canton||"")+"' placeholder='LU'"+addressLockAttr+"></label><label>Webseite<input id='pweb' value='"+E(profile?.website||"")+"' placeholder='https://...'></label></div>"+
  "<label>Über die Firma<textarea id='pbio' rows='4'>"+E(profile?.bio||"")+"</textarea></label>"+(addressLocked?"<small class='mut'>🔒 Die bestätigte Wohn-/Firmenadresse kann nur durch den KaufMich24-Admin geändert werden.</small>":"")
 :"<label>Benutzername<input id='pdn' maxlength='30' autocomplete='username' placeholder='z. B. BVPerf__' value='"+E(profile?.display_name||"")+"' required><small class='mut'>Öffentlich sichtbar.</small></label>"+
  "<label>Mobilnummer<input id='pph' inputmode='tel' value='"+E(profile?.phone||"")+"' placeholder='079 123 45 67'></label>"+
  "<label>Wohnadresse<input id='pstreet' autocomplete='street-address' value='"+E(profile?.street_address||"")+"' placeholder='Strasse & Hausnummer'"+addressLockAttr+" required></label>"+
  "<div class='two'><label>PLZ<input id='pzip' inputmode='numeric' maxlength='12' value='"+E(profile?.postal_code||"")+"'"+addressLockAttr+" required></label><label>Ort<input id='pcity' value='"+E(profile?.city||"")+"'"+addressLockAttr+" required></label></div>"+
  "<label>Kanton <small class='mut'>(optional)</small><input id='pcanton' maxlength='2' value='"+E(profile?.canton||"")+"' placeholder='LU'"+addressLockAttr+"></label>"+
  "<label>Über mich<textarea id='pbio' rows='4'>"+E(profile?.bio||"")+"</textarea></label>"+
  (addressLocked?"<small class='mut'>🔒 Deine bestätigte Wohnadresse kann nur durch den KaufMich24-Admin geändert werden.</small>":"<small class='mut'>Deine genaue Wohnadresse wird anderen Nutzern nicht angezeigt.</small>");

 app.innerHTML=
 "<div class='wrap formPage km24AccountPage'>"+
   "<div class='accountHead km24AccountHero'>"+
     "<div class='km24AccountHeroText'>"+
       "<span class='km24AccountKicker'>MEIN KAUFMICH24</span>"+
       "<h1>"+E(name)+"</h1>"+
       "<div class='km24AccountBadges'><span>"+accountBadge+"</span>"+(profile&&profile.rating_count?"<span><b style='color:#F5B301;font-size:1.15em;line-height:1'>★</b> "+E(profile.rating)+"</span>":"")+"</div>"+
     "</div>"+
     "<button class='btn km24LogoutTop' id='logout'>Abmelden</button>"+
   "</div>"+

   "<div class='km24AccountStats'>"+
     "<div role='button' tabindex='0' data-account-stat='active' aria-label='Aktive Inserate anzeigen'><b>"+activeCount+"</b><span>Aktiv</span></div>"+
     "<div role='button' tabindex='0' data-account-stat='sold' aria-label='Verkaufte Inserate anzeigen'><b>"+soldCount+"</b><span>Verkauft</span></div>"+
     "<div role='button' tabindex='0' data-account-stat='offers' aria-label='Offene Angebote anzeigen'><b>"+pendingOffers+"</b><span>Offene Angebote</span></div>"+
     "<div role='button' tabindex='0' data-account-stat='unread' aria-label='Ungelesene Benachrichtigungen anzeigen'><b>"+unreadCount+"</b><span>Ungelesen</span></div>"+
   "</div>"+

   "<a class='km24AccountPoints' href='#/fees'><span>🪙</span><div><small>KAUFMICH24 PUNKTE</small><b>"+F(points.points_balance)+" Punkte</b><em>Wert CHF "+F(points.chf_value)+" · für Gebühren, Boosts & Abos einlösen</em></div><i>›</i></a>"+

   "<div class='km24AccountNavHead'><span class='km24AccountKicker'>SCHNELLZUGRIFF</span><h2>Was möchtest du machen?</h2><p>Die wichtigsten Bereiche direkt auf einen Blick.</p></div>"+
   "<section class='km24AccountQuickGrid'>"+
     (companyProfile?"<a class='km24PhotoBulkAccountLink' href='#/foto-massenimport'><span>📸</span><div><b>Foto-Massenimport</b><small>Mehrere Artikel auf einmal inserieren</small></div><i>›</i></a>":"")+
     "<a href='#/buyer'><span>🛍️</span><div><b>Meine Käufe</b><small>Bestellungen & gekaufte Artikel</small></div><i>›</i></a>"+
     "<a href='#/sales'><span>✓</span><div><b>Meine Verkäufe</b><small>Verkaufte Artikel & Teil-Aktionen</small></div><i>›</i></a>"+
     "<a href='#/me' data-account-jump='listings'><span>📦</span><div><b>Meine Inserate</b><small>Bearbeiten, pausieren & hervorheben</small></div><i>›</i></a>"+
     "<a href='#/messages'><span>💬</span><div><b>Nachrichten</b><small>Chats mit Käufern & Verkäufern</small></div><i>›</i></a>"+
     "<a href='#/notifications'><span>🔔</span><div><b>Benachrichti<wbr>gungen</b><small>"+unreadCount+" ungelesen</small></div><i>›</i></a>"+
     "<a href='#/saved-searches'><span>🔎</span><div><b>Suchaufträge</b><small>Gespeicherte Suchen & Treffer</small></div><i>›</i></a>"+
     "<a class='km24BillingShortcut' href='#/fees'><span>💳</span><div><b>Gebühren & Zahlungen</b><small>Tarife, Abo & Promotionen</small></div><i>›</i></a>"+
     "<a href='#/support'><span>🛟</span><div><b>Hilfe & Support</b><small>Hilfe-Assistent & Support-Anfragen</small></div><i>›</i></a>"+"<a href='#/account-delete'><span>🗑️</span><div><b>Konto löschen</b><small>Account & persönliche Daten löschen lassen</small></div><i>›</i></a>"+
     "<a href='#/me' data-account-jump='settings'><span>⚙️</span><div><b>Profil & Einstellungen</b><small>Kontaktdaten & Konto verwalten</small></div><i>›</i></a>"+
     (profile?.is_admin?"<a class='km24AdminShortcut' href='#/admin'><span>🛠️</span><div><b>Adminbereich</b><small>Meldungen, Support & Moderation</small></div><i>›</i></a>":"")+
   "</section>"+

   "<section class='km24SecurityBar "+(contactReady()?"ok":"")+"'>"+
     "<div class='km24SecurityIcon'>🛡️</div><div><b>Konto & Sicherheit</b><span>"+(contactReady()?"E-Mail bestätigt, Mobilnummer und Wohnadresse hinterlegt.":"Bestätige deine E-Mail, hinterlege eine gültige Mobilnummer und bestätige deine Wohnadresse, um alle Kauf- und Verkaufsfunktionen zu nutzen.")+"</span></div>"+
     "<a class='btn "+(sellerReady()?"":"primary")+"' href='#/verification?next=me'>"+(contactReady()?"Sicherheit ansehen":"Kontakt bestätigen")+"</a>"+
   "</section>"+

   "<section class='km24MyListingsSection'>"+
     "<div class='km24AccountSectionHead'><div><span class='km24AccountKicker'>VERKAUFEN</span><h2>Meine Inserate</h2><p>"+ls.length+" Inserat"+(ls.length===1?"":"e")+" insgesamt</p></div><a class='btn primary' href='#/sell'>＋ Neues Inserat</a></div>"+
     (ls.length?"<div class='km24ListingFilters'><button class='active' data-myfilter='all'>Alle <span>"+ls.length+"</span></button><button data-myfilter='active'>Aktiv <span>"+activeCount+"</span></button><button data-myfilter='sold'>Verkauft <span>"+soldCount+"</span></button><button data-myfilter='inactive'>Pausiert</button></div>":"")+
     "<div class='km24MyListingList'>"+(rows||"<div class='km24AccountEmpty km24BigEmpty'><span>📦</span><b>Noch keine Inserate</b><p>Erstelle dein erstes Inserat und verkaufe direkt auf KaufMich24.</p><a class='btn primary' href='#/sell'>Inserat erstellen</a></div>")+"</div>"+
   "</section>"+

   "<section class='km24AccountAccordion'>"+
     "<details "+(pendingOffers?"open":"")+"><summary><span>🤝 Preisvorschläge</span><em>"+offers.length+"</em></summary><div class='km24FoldBody'>"+offerHtml+"</div></details>"+
     "<details><summary><span>🔔 Letzte Benachrichtigungen</span><em>"+notes.length+"</em></summary><div class='km24FoldBody'>"+noteHtml+"<a class='btn km24FoldLink' href='#/notifications'>Alle Benachrichtigungen</a></div></details>"+
     "<details><summary><span>🚫 Blockierte Nutzer</span><em>"+blocked.length+"</em></summary><div class='km24FoldBody'>"+blockedHtml+"</div></details>"+
     "<details class='km24ProfileSettings'><summary><span>⚙️ Profil & Einstellungen</span><em>›</em></summary><div class='km24FoldBody'>"+
       "<div id='km24AvatarSettingsSlot'></div>"+
       "<div class='km24ProfileFormBox'><h3>"+(companyProfile?"Firmenprofil bearbeiten":"Privatprofil bearbeiten")+"</h3><p class='mut'>"+(companyProfile?"Firmendaten und Kontaktdaten verwalten.":"Persönliche Angaben und Kontaktdaten verwalten.")+"</p><form id='profileForm' class='stack'>"+
       profileFields+
       "<button class='btn primary'>Profil speichern</button></form><div id='profileMsg'></div></div>"+
       (profile&&profile.is_admin?"<a class='btn km24AdminLink' href='#/admin'>🛠 Adminbereich öffnen</a>":"")+
     "</div></details>"+
   "</section>"+
 "</div>";

 document.getElementById("logout").onclick=async()=>{await db.auth.signOut({scope:'local'});user=null;profile=null;go("#/")};
 document.querySelectorAll("[data-account-jump]").forEach(a=>a.onclick=e=>{e.preventDefault();let t=a.dataset.accountJump;if(t==="listings"){document.querySelector(".km24MyListingsSection")?.scrollIntoView({behavior:"smooth",block:"start"})}else if(t==="settings"){let d=document.querySelector(".km24ProfileSettings");if(d){d.open=true;d.scrollIntoView({behavior:"smooth",block:"start"})}}});

 function openAccountStat(kind){
   if(kind==="active"||kind==="sold"){
     let filter=document.querySelector('[data-myfilter="'+kind+'"]');
     if(filter)filter.click();
     document.querySelector(".km24MyListingsSection")?.scrollIntoView({behavior:"smooth",block:"start"});
     return;
   }
   if(kind==="offers"){
     let d=document.querySelector(".km24AccountAccordion details:first-child");
     if(d){d.open=true;d.scrollIntoView({behavior:"smooth",block:"start"})}
     return;
   }
   if(kind==="unread")go("#/notifications");
 }
 document.querySelectorAll("[data-account-stat]").forEach(x=>{
   x.onclick=()=>openAccountStat(x.dataset.accountStat);
   x.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openAccountStat(x.dataset.accountStat)}};
 });

 document.querySelectorAll("[data-myfilter]").forEach(b=>b.onclick=()=>{
   document.querySelectorAll("[data-myfilter]").forEach(x=>x.classList.toggle("active",x===b));
   let f=b.dataset.myfilter;
   document.querySelectorAll(".km24MyListingCard").forEach(card=>{
     card.style.display=f==="all"||card.dataset.listingState===f?"":"none"
   })
 });

 document.querySelectorAll("[data-status]").forEach(b=>b.onclick=()=>setListingStatus(b.dataset.id,b.dataset.status));
 document.querySelectorAll("[data-reactivate]").forEach(b=>b.onclick=()=>km24OpenReactivate(ls.find(l=>l.id===b.dataset.reactivate),b));
 document.querySelectorAll("[data-sold]").forEach(b=>b.onclick=()=>markSold(b.dataset.sold));
 document.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>removeListing(b.dataset.delete));
 document.querySelectorAll("[data-promo]").forEach(b=>b.onclick=()=>promoteListing(b.dataset.id,b.dataset.promo));
 document.querySelectorAll("[data-offer]").forEach(b=>b.onclick=()=>respondOffer(b.dataset.offer,b.dataset.accept==="1"));
 document.querySelectorAll("[data-unblock]").forEach(b=>b.onclick=async()=>{
   if(!confirm("Nutzer wirklich entblockieren?"))return;
   let r=await db.rpc("unblock_user",{p_user_id:b.dataset.unblock});
   if(r.error)alert(r.error.message);else me()
 });

 document.getElementById("profileForm").onsubmit=async e=>{
   e.preventDefault();
   let msg=document.getElementById("profileMsg"),
       display=document.getElementById("pdn").value.trim(),
       phoneRaw=document.getElementById("pph").value.trim(),
       ph=normalizePhone(phoneRaw);

   if(!display)return msg.innerHTML=N("Bitte einen Benutzernamen eingeben.",1);let usernameCheck=km24UsernameRule(display);if(!usernameCheck.ok)return msg.innerHTML=N(usernameCheck.message,1);
   if(phoneRaw&&!ph)return msg.innerHTML=N("Bitte eine gültige Mobilnummer eingeben. Ausländische Nummern bitte mit Ländervorwahl, z. B. +49.",1);

   if(companyProfile){
     let firm=document.getElementById("pbn").value.trim();
     if(!firm)return msg.innerHTML=N("Bitte den Firmennamen eingeben.",1);

     let r=await db.from("profiles").update({
       display_name:display,
       business_name:firm,
       phone:ph,
       business_uid:document.getElementById("puid").value.trim()||null,
       street_address:document.getElementById("pstreet").value.trim()||null,
       postal_code:document.getElementById("pzip").value.trim()||null,
       city:document.getElementById("pcity").value.trim()||null,
       canton:document.getElementById("pcanton").value.trim().toUpperCase()||null,
       website:document.getElementById("pweb").value.trim()||null,
       bio:document.getElementById("pbio").value.trim()||null,
       updated_at:new Date().toISOString()
     }).eq("id",user.id);
     if(r.error)return msg.innerHTML=N(r.error.message,1)
   }else{
     let street=document.getElementById("pstreet").value.trim(),
         zip=document.getElementById("pzip").value.trim(),
         city=document.getElementById("pcity").value.trim(),
         canton=document.getElementById("pcanton").value.trim().toUpperCase();

     if(!street||!zip||!city)
       return msg.innerHTML=N("Bitte die vollständige Wohnadresse ausfüllen.",1);

     let r1=await db.from("profiles").update({
       display_name:display,business_name:null,business_uid:null,website:null,phone:ph,
       street_address:addressLocked?profile?.street_address:street,postal_code:addressLocked?profile?.postal_code:zip,city:addressLocked?profile?.city:city,canton:addressLocked?profile?.canton:(canton||null),
       bio:document.getElementById("pbio").value.trim()||null,
       updated_at:new Date().toISOString()
     }).eq("id",user.id);
     if(r1.error)return msg.innerHTML=N(r1.error.message,1);
   }

   msg.innerHTML=N("Profil gespeichert.");
   await loadProfile();
   setTimeout(()=>me(),350)
 }
}
async function startChat(listingId){
 if(!user)return go("#/login");
 if(!contactReady())return go("#/verification?next=listing%2F"+listingId);
 let lr=await db.from("listings").select("id,category_slug,status,sold_to,listing_intent,title").eq("id",listingId).maybeSingle(),l=lr.data;
 if(!l)return alert("Inserat nicht gefunden.");
 if(l.listing_intent==="wanted"){let wr=await db.rpc("respond_to_wanted",{p_listing_id:listingId});if(wr.error)return alert(wr.error.message);return go("#/messages/"+wr.data)}
 if(l.status==="sold"){let sr=await db.rpc("start_conversation_with_purpose",{p_listing_id:listingId,p_purpose:"general"});if(sr.error)return alert(sr.error.message);return go("#/messages/"+sr.data)}
 document.getElementById("km24ContactPurposeModal")?.remove();
 let vehicle=typeof rootCategoryOf==="function"&&rootCategoryOf(l.category_slug)==="fahrzeuge",
     visitLabel=vehicle?"Besichtigung / Probefahrt":"Besichtigung / Abholung",
     ov=document.createElement("div");
 ov.id="km24ContactPurposeModal";ov.className="km24PurposeOverlay";
 ov.innerHTML='<div class="km24PurposeModal"><button class="km24PurposeClose" aria-label="Schliessen">×</button><span class="km24SectionKicker">VERKÄUFER KONTAKTIEREN</span><h2>Worum geht es?</h2><p class="mut">Wähle zuerst den Grund für den Kontakt.</p><div class="km24PurposeChoices"><button class="km24PurposeChoice" data-purpose="general"><span>💬</span><b>Allgemeine Frage</b><small>Fragen zu Zustand, Ausstattung, Versand oder Details. Kontaktdaten bleiben geschützt.</small></button><button class="km24PurposeChoice" data-purpose="inspection"><span>📅</span><b>'+E(visitLabel)+'</b><small>Termin direkt über KaufMich24 vereinbaren. Nach Bestätigung dürfen Kontaktdaten ausgetauscht werden.</small></button></div><div id="km24PurposeMsg"></div></div>';
 document.body.appendChild(ov);
 let close=()=>ov.remove();ov.querySelector(".km24PurposeClose").onclick=close;ov.onclick=e=>{if(e.target===ov)close()};
 ov.querySelectorAll("[data-purpose]").forEach(b=>b.onclick=async()=>{
   let purpose=b.dataset.purpose,msg=ov.querySelector("#km24PurposeMsg");
   ov.querySelectorAll("[data-purpose]").forEach(x=>x.disabled=true);
   msg.innerHTML=N("Chat wird geöffnet …");
   let r=await db.rpc("start_conversation_with_purpose",{p_listing_id:listingId,p_purpose:purpose});
   if(r.error){
     ov.querySelectorAll("[data-purpose]").forEach(x=>x.disabled=false);
     
     msg.innerHTML=N(r.error.message,1);return
   }
   close();go("#/messages/"+r.data)
 })
}

function offerStatusLabel(s){return({pending:"Offen",accepted:"Angenommen",rejected:"Abgelehnt",withdrawn:"Zurückgezogen"}[s]||s)}
function activityImage(path){return path?'<img src="'+E(IMG(path))+'">':"📷"}
async function loadActivityImages(ids){let out={};if(!ids.length)return out;let q=await db.from("listing_images").select("listing_id,storage_path,sort_order").in("listing_id",ids).order("sort_order");(q.data||[]).forEach(x=>{if(!out[x.listing_id])out[x.listing_id]=x.storage_path});return out}


async function messagesPage(selectedId){
 if(!user)return go(selectedId?"#/login?next=messages&id="+encodeURIComponent(selectedId):"#/login?next=messages");

 window.__km24ChatView=window.__km24ChatView||"active";
 let chatLang=()=>{try{return window.km24Language?window.km24Language():"de"}catch(e){return "de"}},
     chatT=key=>{
       let l=chatLang(),d={
         active:{de:"Aktiv",fr:"Actifs",it:"Attive",en:"Active"},
         archived:{de:"Archiviert",fr:"Archivées",it:"Archiviate",en:"Archived"},
         archive:{de:"Archivieren",fr:"Archiver",it:"Archivia",en:"Archive"},
         restore:{de:"Wiederherstellen",fr:"Restaurer",it:"Ripristina",en:"Restore"},
         del:{de:"Löschen",fr:"Supprimer",it:"Elimina",en:"Delete"},
         emptyActive:{de:"Keine aktiven Chats.",fr:"Aucune discussion active.",it:"Nessuna chat attiva.",en:"No active chats."},
         emptyArchived:{de:"Keine archivierten Chats.",fr:"Aucune discussion archivée.",it:"Nessuna chat archiviata.",en:"No archived chats."},
         deleteConfirm:{de:"Chat wirklich löschen? Er wird nur aus deiner Ansicht entfernt. Wenn die andere Person dir später wieder schreibt, erscheint er automatisch erneut.",fr:"Supprimer cette discussion ? Elle sera retirée uniquement de votre vue. Si l’autre personne vous écrit à nouveau, elle réapparaîtra automatiquement.",it:"Eliminare davvero questa chat? Verrà rimossa solo dalla tua vista. Se l’altra persona ti scriverà di nuovo, riapparirà automaticamente.",en:"Delete this chat? It will only be removed from your view. If the other person messages you again, it will automatically reappear."}
       };return d[key]?.[l]||d[key]?.de||key
     },
     archivedFor=c=>c?(c.buyer_id===user.id?c.buyer_archived_at:c.seller_archived_at):null,
     deletedFor=c=>c?(c.buyer_id===user.id?c.buyer_deleted_at:c.seller_deleted_at):null;

 let cr=await db.from("conversations").select("*")
   .or("buyer_id.eq."+user.id+",seller_id.eq."+user.id)
   .order("updated_at",{ascending:false}),
   allCs=cr.data||[];

 if(!allCs.length){
   app.innerHTML="<div class='wrap formPage km24MessagesPage'><div class='km24ChatPageHead'><div><span class='km24ChatKicker'>NACHRICHTEN</span><h1>Deine Chats</h1><p>Hier erscheinen Unterhaltungen mit Käufern und Verkäufern.</p></div><a class='btn' href='#/buyer'>🛍 Käuferbereich</a></div><div class='km24ChatEmpty'><span>💬</span><h2>Noch keine Unterhaltungen</h2><p>Sobald du jemanden zu einem Inserat kontaktierst oder eine Nachricht erhältst, erscheint der Chat hier.</p><a class='btn primary' href='#/'>Inserate entdecken</a></div></div>";
   return
 }

 let selectedRaw=selectedId?allCs.find(c=>c.id===selectedId):null;
 if(selectedRaw&&deletedFor(selectedRaw)){
   window.__km24ChatView="active";
   if((location.hash||"")!=="#/messages")return go("#/messages")
 }
 if(selectedRaw&&!deletedFor(selectedRaw))window.__km24ChatView=archivedFor(selectedRaw)?"archived":"active";

 let activeCs=allCs.filter(c=>!deletedFor(c)&&!archivedFor(c)),
     archivedCs=allCs.filter(c=>!deletedFor(c)&&!!archivedFor(c)),
     view=window.__km24ChatView==="archived"?"archived":"active",
     cs=view==="archived"?archivedCs:activeCs;

 let lids=[...new Set(cs.map(c=>c.listing_id).filter(Boolean))],
     pids=[...new Set(cs.flatMap(c=>[c.buyer_id,c.seller_id]))],
     titles={},profiles={},allMsgs=[],images={};

 let queries=[
   lids.length?db.from("listings").select("id,title,status").in("id",lids):Promise.resolve({data:[]}),
   pids.length?db.rpc("seller_cards_public",{p_seller_ids:pids}):Promise.resolve({data:[]}),
   cs.length?db.from("messages").select("*").in("conversation_id",cs.map(c=>c.id)).order("created_at",{ascending:true}):Promise.resolve({data:[]}),
   loadActivityImages(lids)
 ];
 let [lq,pq,mq,iq]=await Promise.all(queries);
 (lq.data||[]).forEach(x=>titles[x.id]=x);
 (pq.data||[]).forEach(x=>profiles[x.seller_id]=x);
 allMsgs=mq.data||[];
 images=iq||{};

 let other=c=>c.buyer_id===user.id?c.seller_id:c.buyer_id,
     mobile=window.matchMedia&&window.matchMedia("(max-width:900px)").matches,
     active=cs.find(c=>c.id===selectedId)||(!mobile?cs[0]:null),
     meta={};

 let shortTime=v=>{
   if(!v)return "";
   let d=new Date(v),n=new Date(),same=d.toDateString()===n.toDateString();
   return same
     ?new Intl.DateTimeFormat("de-CH",{hour:"2-digit",minute:"2-digit"}).format(d)
     :new Intl.DateTimeFormat("de-CH",{day:"2-digit",month:"2-digit"}).format(d)
 };

 let initials=p=>{
   let n=(p?.business_name||p?.display_name||"Nutzer").trim();
   return n.split(/\s+/).slice(0,2).map(x=>x.charAt(0).toUpperCase()).join("")||"?"
 };

 cs.forEach(c=>{
   let a=allMsgs.filter(m=>m.conversation_id===c.id),
       last=a[a.length-1],
       unread=a.filter(m=>m.sender_id!==user.id&&!m.read_at).length;
   meta[c.id]={last,unread}
 });

 let menuHtml=c=>{
   let archived=!!archivedFor(c);
   return "<button type='button' class='km24ConvMenuBtn' data-chat-menu='"+c.id+"' aria-label='Chat-Menü'>⋮</button>"+
     "<div class='km24ConvMenu' data-chat-menu-box='"+c.id+"' hidden>"+
       (archived
         ?"<button type='button' data-chat-action='restore' data-chat-id='"+c.id+"'>↩ "+E(chatT("restore"))+"</button>"
         :"<button type='button' data-chat-action='archive' data-chat-id='"+c.id+"'>📥 "+E(chatT("archive"))+"</button>")+
       "<button type='button' class='km24Danger' data-chat-action='delete' data-chat-id='"+c.id+"'>🗑 "+E(chatT("del"))+"</button>"+
     "</div>"
 };

 let list=cs.length?cs.map(c=>{
   let p=profiles[other(c)]||{},x=meta[c.id]||{},li=titles[c.listing_id]||{},
       name=p.business_name||p.display_name||"Nutzer",
       preview=x.last?(x.last.sender_id===user.id?"Du: ":"")+x.last.body:"Noch keine Nachricht",
       img=images[c.listing_id]
        ?"<img class='km24ConvThumb' src='"+E(IMG(images[c.listing_id]))+"' alt=''>"
        :"<div class='km24ConvAvatar'>"+E(initials(p))+"</div>";
   return "<div class='km24ConvWrap' data-chat-search='"+E((name+" "+(li.title||"")+" "+preview).toLowerCase())+"'>"+
     "<a class='km24ConvItem "+(active&&c.id===active.id?"active":"")+"' href='#/messages/"+c.id+"'>"+
       img+
       "<span class='km24ConvMain'><span class='km24ConvTop'><b>"+E(name)+"</b><small>"+E(shortTime(x.last?.created_at||c.updated_at))+"</small></span>"+
       "<span class='km24ConvListing'>"+E(li.title||"Inserat")+"</span>"+
       "<span class='km24ConvPreview "+(x.unread?"isUnread":"")+"'>"+E(preview.slice(0,75))+"</span></span>"+
       (x.unread?"<span class='km24UnreadBadge'>"+(x.unread>99?"99+":x.unread)+"</span>":"")+
     "</a>"+menuHtml(c)+"</div>"
 }).join(""):"<div class='km24ChatListEmpty'>"+E(view==="archived"?chatT("emptyArchived"):chatT("emptyActive"))+"</div>";

 let chatHtml="<div class='km24ChatPlaceholder'><span>💬</span><h2>"+E(cs.length?"Wähle eine Unterhaltung":(view==="archived"?chatT("emptyArchived"):chatT("emptyActive")))+"</h2>"+(cs.length?"<p>Tippe links auf einen Chat, um die Nachrichten zu öffnen.</p>":"")+"</div>";

 if(active){
   let ms=allMsgs.filter(m=>m.conversation_id===active.id);
   await db.rpc("mark_conversation_read",{p_conversation_id:active.id});
   await refreshNotificationBadge();

   let bubbles=ms.map(m=>{
     let mine=m.sender_id===user.id;
     return "<div class='km24MessageRow "+(mine?"mine":"theirs")+"'><div class='km24Bubble'>"+
       "<div class='km24BubbleText'>"+E(m.body)+"</div>"+
       "<div class='km24BubbleTime'>"+E(shortTime(m.created_at))+(mine?" <span>✓</span>":"")+"</div>"+
     "</div></div>"
   }).join("");

   let op=profiles[other(active)]||{},
       li=titles[active.listing_id]||{},
       name=op.business_name||op.display_name||"Nutzer",
       img=images[active.listing_id]
         ?"<img class='km24ChatListingThumb' src='"+E(IMG(images[active.listing_id]))+"' alt=''>"
         :"<div class='km24ChatAvatar'>"+E(initials(op))+"</div>";

   chatHtml=
     "<div class='km24ChatHeader'>"+
       "<a class='km24ChatBack' href='#/messages' aria-label='Alle Chats'>‹</a>"+
       img+
       "<div class='km24ChatHeaderInfo'><b>"+E(name)+"</b><span>"+E(li.title||"Inserat")+"</span></div>"+
       "<div class='km24ChatHeaderActions'><a class='btn km24ListingBtn' href='#/listing/"+active.listing_id+"'>Inserat</a><span class='km24ChatActionMenu'>"+menuHtml(active)+"</span></div>"+
     "</div>"+
     "<div id='chatMessages' class='km24ChatMessages'>"+(bubbles||"<div class='km24ChatEmptyInline'>Schreib die erste Nachricht 👋</div>")+"</div>"+
     "<form id='chatForm' class='km24ChatComposer'>"+
       "<textarea id='chatText' maxlength='5000' rows='1' required placeholder='Nachricht schreiben …'></textarea>"+
       "<button class='km24SendBtn' type='submit' aria-label='Senden'>➤</button>"+
     "</form>"
 }

 app.innerHTML=
   "<div class='wrap formPage km24MessagesPage "+(active?"km24HasActive":"")+"'>"+
     "<div class='km24ChatPageHead'>"+
       "<div><span class='km24ChatKicker'>NACHRICHTEN</span><h1>Deine Chats</h1><p>"+cs.length+" Unterhaltung"+(cs.length===1?"":"en")+"</p></div>"+
       "<a class='btn' href='#/buyer'>🛍 Käuferbereich</a>"+
     "</div>"+
     "<div class='km24ChatShell'>"+
       "<aside class='km24ConversationPane'>"+
         "<div class='km24ConversationHead'><div><b>Unterhaltungen</b><small>"+cs.length+" Chats</small></div></div>"+
         "<div class='km24ChatSearch'><span>⌕</span><input id='chatSearch' placeholder='Chats durchsuchen'></div>"+
         "<div class='km24ChatTabs'>"+
           "<button type='button' class='km24ChatTab "+(view==="active"?"on":"")+"' data-chat-view='active'>"+E(chatT("active"))+" ("+activeCs.length+")</button>"+
           "<button type='button' class='km24ChatTab "+(view==="archived"?"on":"")+"' data-chat-view='archived'>"+E(chatT("archived"))+" ("+archivedCs.length+")</button>"+
         "</div>"+
         "<div id='conversationList' class='km24ConversationList'>"+list+"</div>"+
       "</aside>"+
       "<section class='km24ChatPane'>"+chatHtml+"</section>"+
     "</div>"+
   "</div>";

 let closeMenus=except=>{
   document.querySelectorAll(".km24ConvMenu").forEach(m=>{if(m!==except)m.hidden=true})
 };
 document.querySelectorAll("[data-chat-menu]").forEach(b=>b.onclick=e=>{
   e.preventDefault();e.stopPropagation();
   let m=b.parentElement?.querySelector("[data-chat-menu-box]");
   if(!m)return;
   let open=m.hidden;closeMenus(m);m.hidden=!open
 });
 app.onclick=e=>{
   if(!e.target.closest("[data-chat-menu]")&&!e.target.closest(".km24ConvMenu"))closeMenus()
 };

 document.querySelectorAll("[data-chat-action]").forEach(b=>b.onclick=async e=>{
   e.preventDefault();e.stopPropagation();
   let action=b.dataset.chatAction,id=b.dataset.chatId;
   if(action==="delete"&&!confirm(chatT("deleteConfirm")))return;
   b.disabled=true;
   let r=await db.rpc("set_conversation_state",{p_conversation_id:id,p_action:action});
   if(r.error){b.disabled=false;alert(r.error.message);return}
   if(action==="restore"||action==="archive")window.__km24ChatView="active";
   await refreshNotificationBadge();
   if((location.hash||"")!=="#/messages")go("#/messages");else messagesPage()
 });

 document.querySelectorAll("[data-chat-view]").forEach(b=>b.onclick=()=>{
   window.__km24ChatView=b.dataset.chatView;
   if((location.hash||"")!=="#/messages")go("#/messages");else messagesPage()
 });

 let search=document.getElementById("chatSearch");
 if(search)search.oninput=()=>{
   let q=search.value.trim().toLowerCase();
   document.querySelectorAll(".km24ConvWrap").forEach(el=>{
     el.style.display=!q||String(el.dataset.chatSearch||"").includes(q)?"block":"none"
   })
 };

 if(active){
   let box=document.getElementById("chatMessages");
   if(box)box.scrollTop=box.scrollHeight;

   let area=document.getElementById("chatText");
   if(area){
     let resize=()=>{area.style.height="auto";area.style.height=Math.min(area.scrollHeight,120)+"px"};
     area.oninput=resize;
     area.onkeydown=e=>{
       if(e.key==="Enter"&&!e.shiftKey){
         e.preventDefault();
         window.km24RequestSubmit(document.getElementById("chatForm"))
       }
     }
   }

   document.getElementById("chatForm").onsubmit=async e=>{
     e.preventDefault();
     if(!contactReady())return go("#/verification?next=messages");
     let body=document.getElementById("chatText").value.trim();
     if(!body)return;
     let btn=e.currentTarget.querySelector("button");
     btn.disabled=true;
     let r=await db.from("messages").insert({conversation_id:active.id,sender_id:user.id,body});
     if(r.error){btn.disabled=false;alert(r.error.message)}
     else messagesPage(active.id)
   }
 }
}
function notificationIcon(t){return({message:"💬",offer:"🤝",offer_accepted:"✅",offer_rejected:"❌",bid:"🔨",outbid:"⚠️",auction_won:"🏆",auction_sold:"💰",auction_unsold:"⌛",auction_unsold_bidder:"⌛",auction_lost:"🔨",auction_second_chance:"🔁",auction_second_chance_sent:"🔁",auction_second_chance_declined:"↩️",auction_second_chance_accepted:"✅",auction_sale_reassigned:"↪️",listing_sold:"✓",account_moderation:"🛡️",review_available:"⭐",new_review:"⭐",search_match:"🔎",wanted_response:"🙋",inspection_proposed:"📅",inspection_confirmed:"✅",inspection_declined:"📅",inspection_cancelled:"↩️",inspection_followup:"📋",inspection_followup_conflict:"⚠️",inspection_sale_confirmed:"✅",inspection_no_sale:"✓",price_drop:"📉",wanted_match:"🎯",buy_now_bought:"🛍️",buy_now_sold:"💰",transaction_update:"📦"}[t]||"🔔")}
function notificationCategory(t){if(["message","inspection_proposed","inspection_confirmed","inspection_declined","inspection_cancelled","inspection_followup","inspection_followup_conflict","inspection_sale_confirmed","inspection_no_sale"].includes(t))return"messages";if(["buy_now_bought","buy_now_sold","transaction_update","listing_sold","auction_second_chance_sent","auction_second_chance_declined","auction_second_chance_accepted"].includes(t))return"sales";if(["bid","outbid","auction_won","auction_sold","auction_unsold","auction_unsold_bidder","auction_lost","auction_second_chance","auction_sale_reassigned"].includes(t))return"auctions";if(["offer","offer_accepted","offer_rejected"].includes(t))return"offers";if(["search_match","wanted_response","wanted_match","price_drop"].includes(t))return"search";return"other"}
function notificationTarget(n){
 if((n.type==="review_available"||n.type==="new_review")&&n.listing_id)return "#/review/"+n.listing_id;
 if(n.conversation_id)return "#/messages/"+n.conversation_id;
 if(n.type==="buy_now_bought"||n.type==="auction_won"||n.type==="listing_sold"||n.type==="transaction_update"||n.type==="auction_second_chance"||n.type==="auction_sale_reassigned")return "#/buyer";
 if(n.type==="buy_now_sold"||n.type==="auction_sold"||n.type==="offer"||n.type==="bid"||n.type==="auction_second_chance_sent"||n.type==="auction_second_chance_declined"||n.type==="auction_second_chance_accepted")return "#/sales";
 if(n.type==="search_match"&&n.listing_id)return "#/listing/"+n.listing_id;
 if(n.listing_id)return "#/listing/"+n.listing_id;
 return "#/me"
}
async function openNotification(id,target){
 if(!user)return go("#/login");
 await db.from("notifications").update({read_at:new Date().toISOString()}).eq("id",id).eq("user_id",user.id);
 await refreshNotificationBadge();
 go(target)
}
async function notificationsPage(filterMode="all"){
 if(!user)return go("#/login");
 let r=await db.from("notifications").select("*").eq("user_id",user.id).order("created_at",{ascending:false}).limit(100),notes=r.data||[];
 let unread=notes.filter(n=>!n.read_at).length;
 let shown=filterMode==="unread"?notes.filter(n=>!n.read_at):filterMode==="all"?notes:notes.filter(n=>notificationCategory(n.type)===filterMode);
 let filters=[["all","Alle"],["unread","Ungelesen"],["messages","💬 Nachrichten"],["sales","🛍 Käufe/Verkäufe"],["auctions","🔨 Auktionen"],["offers","🤝 Angebote"],["search","🔎 Suchaufträge"]];
 let html=shown.length?shown.map(n=>{let target=notificationTarget(n);return'<div class="notificationCard '+(!n.read_at?"unread":"")+'"><div class="notificationIcon">'+notificationIcon(n.type)+'</div><div><h3>'+E(n.title)+'</h3>'+(n.body?'<p>'+E(n.body)+'</p>':'')+'<div class="notificationMeta">'+E(D(n.created_at))+(n.read_at?" · gelesen":" · ungelesen")+'</div></div><div class="notificationActions"><button class="btn primary" data-open-note="'+n.id+'" data-target="'+E(target)+'">Öffnen</button>'+(!n.read_at?'<button class="btn" data-read-note="'+n.id+'">Als gelesen</button>':'')+'<button class="btn" data-delete-note="'+n.id+'">🗑 Löschen</button></div></div>'}).join(""):'<div class="empty">Hier gibt es aktuell keine Benachrichtigungen.</div>';
 app.innerHTML='<div class="wrap formPage"><div class="head"><div><h1 style="margin:0">Benachrichtigungen</h1><p class="mut" style="margin:5px 0 0">'+unread+' ungelesen · die letzten '+notes.length+' Meldungen</p></div><div class="actions"><button class="btn" id="markAllNotes">Alle gelesen</button><a class="btn" href="#/me">Mein Konto</a></div></div><div class="notificationFilters">'+filters.map(x=>'<button class="btn '+(filterMode===x[0]?"on":"")+'" data-note-filter="'+x[0]+'">'+x[1]+'</button>').join("")+'</div><div class="notificationList">'+html+'</div></div>';
 document.querySelectorAll("[data-note-filter]").forEach(b=>b.onclick=()=>notificationsPage(b.dataset.noteFilter));
 document.querySelectorAll("[data-open-note]").forEach(b=>b.onclick=()=>openNotification(b.dataset.openNote,b.dataset.target));
 document.querySelectorAll("[data-read-note]").forEach(b=>b.onclick=async()=>{let q=await db.from("notifications").update({read_at:new Date().toISOString()}).eq("id",b.dataset.readNote).eq("user_id",user.id);if(q.error)alert(q.error.message);else{await refreshNotificationBadge();notificationsPage(filterMode)}});
 document.querySelectorAll("[data-delete-note]").forEach(b=>b.onclick=async()=>{if(!confirm("Diese Benachrichtigung wirklich löschen?"))return;let q=await db.from("notifications").delete().eq("id",b.dataset.deleteNote).eq("user_id",user.id);if(q.error)alert(q.error.message);else{await refreshNotificationBadge();notificationsPage(filterMode)}});
 document.getElementById("markAllNotes").onclick=async()=>{let q=await db.rpc("mark_all_notifications_read");if(q.error)alert(q.error.message);else{await refreshNotificationBadge();notificationsPage(filterMode)}}
}

async function buyerCenter(){
 if(!user)return go("#/login");
 await loadProfile();
 let activationNotice="";
 let [fr,or,br,pr,scr]=await Promise.all([
  db.from("favorites").select("listing_id").eq("user_id",user.id),
  db.from("offers").select("*").eq("buyer_id",user.id).order("created_at",{ascending:false}),
  db.from("bids").select("*").eq("bidder_id",user.id).order("created_at",{ascending:false}),
  db.rpc("my_purchases"),
  db.rpc("my_auction_second_chance_offers")
 ]);
 let favIds=(fr.data||[]).map(x=>x.listing_id),offers=or.data||[],bids=br.data||[],purchases=pr.data||[],secondChance=scr.data||[];
 let allIds=[...new Set([...favIds,...offers.map(x=>x.listing_id),...bids.map(x=>x.listing_id),...purchases.map(x=>x.listing_id),...secondChance.map(x=>x.listing_id)])],listMap={},stats={},imgs={};
 if(allIds.length){let [lq,iq,sq]=await Promise.all([db.from("listings").select("*").in("id",allIds),loadActivityImages(allIds),db.from("auction_stats").select("*").in("listing_id",allIds)]);(lq.data||[]).forEach(x=>listMap[x.id]=x);(sq.data||[]).forEach(x=>stats[x.listing_id]=x);imgs=iq}
 let latestBid={};bids.forEach(b=>{if(!latestBid[b.listing_id]||Number(b.amount_chf)>Number(latestBid[b.listing_id].amount_chf))latestBid[b.listing_id]=b});
 let favHtml=favIds.length?favIds.map(id=>{let l=listMap[id];if(!l)return"";return"<div class='activityCard'><div class='activityPic'>"+activityImage(imgs[id])+"</div><div><b>"+E(l.title)+"</b><div class='mut'>"+E(ptxt(l,stats[id]))+"</div></div><div class='actions'><a class='btn' href='#/listing/"+id+"'>Ansehen</a></div></div>"}).join(""):"<div class='empty'>Deine Merkliste ist leer.</div>";
 let offerHtml=offers.length?offers.map(o=>{let l=listMap[o.listing_id]||{},cls=o.status==="accepted"?"statusGood":o.status==="rejected"?"statusBad":"statusWarn";return"<div class='activityCard'><div class='activityPic'>"+activityImage(imgs[o.listing_id])+"</div><div><b>"+E(l.title||"Inserat")+"</b><div>Dein Angebot: <b>CHF "+F(o.amount_chf)+"</b></div><div class='activityStatus "+cls+"'>"+E(offerStatusLabel(o.status))+"</div></div><div class='actions'><a class='btn' href='#/listing/"+o.listing_id+"'>Ansehen</a></div></div>"}).join(""):"<div class='empty'>Noch keine Preisvorschläge gesendet.</div>";
 let purchaseListingIds=new Set(purchases.map(x=>String(x.listing_id)));let bidIds=Object.keys(latestBid).filter(id=>!purchaseListingIds.has(String(id))),bidHtml=bidIds.length?bidIds.map(id=>{let b=latestBid[id],l=listMap[id]||{},s=stats[id]||{},ended=l.auction_end_at&&new Date(l.auction_end_at)<=new Date(),leading=Number(s.highest_bid_chf)===Number(b.amount_chf),txt=l.status==="sold"&&l.sold_to===user.id?"🏆 Gewonnen":ended&&!leading?"Beendet":leading?"✓ Du führst":"⚠ Überboten",cls=leading?"statusGood":ended?"":"statusWarn";return"<div class='activityCard'><div class='activityPic'>"+activityImage(imgs[id])+"</div><div><b>"+E(l.title||"Auktion")+"</b><div>Dein höchstes Gebot: <b>CHF "+F(b.amount_chf)+"</b></div><div class='activityStatus "+cls+"'>"+txt+"</div></div><div class='actions'><a class='btn' href='#/listing/"+id+"'>Auktion</a></div></div>"}).join(""):"<div class='empty'>Du hast noch auf keine Auktion geboten.</div>";
 let scLabel=s=>({pending:"Offen",accepted:"Angenommen",declined:"Abgelehnt",expired:"Abgelaufen",cancelled:"Erledigt"}[s]||s);
 let secondChanceHtml=secondChance.length?secondChance.map(o=>{
   let cls=o.status==="accepted"?"statusGood":o.status==="pending"?"statusWarn":"",reason=o.reason==="refused"?"Der ursprüngliche Käufer hat den Kauf verweigert.":"Der ursprüngliche Käufer meldet sich nicht.";
   let actions=o.status==="pending"?"<div class='actions' style='margin-top:10px'><button class='btn primary' data-second-chance='"+o.offer_id+"' data-accept='1' data-amount='"+E(o.amount_chf)+"'>Für CHF "+F(o.amount_chf)+" übernehmen</button><button class='btn' data-second-chance='"+o.offer_id+"' data-accept='0'>Ablehnen</button></div>":"";
   return"<div class='activityCard'><div class='activityPic'>"+activityImage(imgs[o.listing_id])+"</div><div><b>"+E(o.title||"Auktion")+"</b><div>Dein ursprüngliches Gebot: <b>CHF "+F(o.amount_chf)+"</b> · "+E(o.bidder_rank)+". Bieter</div><div class='activityStatus "+cls+"'>"+E(scLabel(o.status))+"</div><small class='mut'>"+E(reason)+(o.status==="pending"?" · gültig bis "+E(D(o.expires_at)):"")+"</small>"+actions+"</div><div class='actions'><a class='btn' href='#/listing/"+o.listing_id+"'>Details</a></div></div>"
 }).join(""):"<div class='empty'>Aktuell keine Nachrücker-Angebote.</div>";
 let payLabel=s=>({open:"Direktzahlung offen",paid:"Zahlung erhalten",refunded:"Rückerstattet",not_applicable:"Keine Zahlung nötig"}[s]||s||"");
 let fulfillLabel=s=>({pending:"Abwicklung offen",shipping:"Versand wird vorbereitet",shipped:"Versendet",ready_for_pickup:"Abholbereit",picked_up:"Abgeholt",completed:"Abgeschlossen"}[s]||s||"");
 let purchaseHtml=purchases.length?purchases.map(x=>"<div class='activityCard'><div class='activityPic'>"+activityImage(imgs[x.listing_id])+"</div><div><b>"+E(x.title)+"</b><div class='activityStatus statusGood'>✓ Gekauft für CHF "+F(x.price_chf)+"</div><div style='margin-top:5px'><span class='badge'>"+E(payLabel(x.payment_status))+"</span> <span class='badge "+(x.fulfillment_status==="completed"?"":"auction")+"'>"+E(fulfillLabel(x.fulfillment_status))+"</span></div><small class='mut' style='display:block;margin-top:6px'>"+E(D(x.sold_at))+" · Verkäufer: "+E(x.seller_name||"Verkäufer")+"</small>"+(x.fulfillment_status==="completed"?"<div class='notice' style='margin-top:8px'>✓ Dieser Kauf ist abgeschlossen. Du kannst den Verkäufer jetzt bewerten.</div>":"")+"</div><div class='actions'><a class='btn' href='#/listing/"+x.listing_id+"'>Details</a><button class='btn' data-purchase-chat='"+x.listing_id+"'>Verkäufer kontaktieren</button></div></div>").join(""):"<div class='empty'>Noch keine Käufe.</div>";
 app.innerHTML="<div class='wrap formPage'>"+activationNotice+"<div class='head'><div><h1 style='margin:0'>Kaufen</h1><p class='mut' style='margin:5px 0 0'>Merkliste, Angebote, Gebote und Käufe an einem Ort.<br>💳 Zahlung erfolgt direkt an den Verkäufer. KaufMich24 verwahrt kein Geld.</p></div><a class='btn' href='#/me'>Mein Konto</a></div><div class='marketSummary'><div class='marketStat'><span class='mut'>Gemerkt</span><b>"+favIds.length+"</b></div><div class='marketStat'><span class='mut'>Angebote offen</span><b>"+offers.filter(x=>x.status==="pending").length+"</b></div><div class='marketStat'><span class='mut'>Auktionen</span><b>"+bidIds.length+"</b></div><div class='marketStat'><span class='mut'>Gekauft</span><b>"+purchases.length+"</b></div></div><div class='marketTabs'><a class='btn' href='#/messages'>💬 Nachrichten</a><a class='btn primary' href='#/'>Inserate entdecken</a></div><section class='section'><h2>🔁 Nachrücker-Angebote</h2><p class='mut'>Wenn der ursprüngliche Gewinner ausfällt, kann dir der Verkäufer dein ursprüngliches Gebot erneut anbieten. Erst wenn du annimmst, wird der Kauf auf dich übertragen.</p><div class='manage'>"+secondChanceHtml+"</div></section><section class='section'><h2>❤ Merkliste</h2><div class='manage'>"+favHtml+"</div></section><section class='section'><h2>🤝 Meine Preisvorschläge</h2><div class='manage'>"+offerHtml+"</div></section><section class='section'><h2>🔨 Meine Auktionen</h2><div class='manage'>"+bidHtml+"</div></section><section class='section'><h2>🛍 Meine Käufe</h2><div class='manage'>"+purchaseHtml+"</div></section></div>";
 document.querySelectorAll("[data-second-chance]").forEach(b=>b.onclick=async()=>{let accept=b.dataset.accept==="1";if(accept&&!confirm("Nachrücker-Angebot für CHF "+F(b.dataset.amount)+" verbindlich annehmen? Danach wird der Kauf auf dein Konto übertragen."))return;if(!accept&&!confirm("Nachrücker-Angebot wirklich ablehnen?"))return;b.disabled=true;let r=await db.rpc("respond_auction_second_chance",{p_offer_id:b.dataset.secondChance,p_accept:accept});if(r.error){b.disabled=false;return alert(r.error.message)}buyerCenter()});
 document.querySelectorAll("[data-purchase-chat]").forEach(b=>b.onclick=()=>startChat(b.dataset.purchaseChat));
}

async function openAuctionSecondChance(listingId,title){
 let r=await db.rpc("auction_second_chance_candidates",{p_listing_id:listingId});if(r.error)return alert(r.error.message);
 let cs=r.data||[],o=document.createElement("div");o.id="buyOverlay";o.className="buyOverlay";
 let statusLabel=s=>({pending:"Angebot läuft",accepted:"bereits übernommen",declined:"bereits abgelehnt",expired:"Angebot abgelaufen",cancelled:"erledigt"}[s]||s||"");
 let rows=cs.length?cs.map(c=>{let used=!!c.existing_offer_status;return"<div class='adminCard' style='margin-top:10px'><div class='head' style='margin:0'><div><b>"+E(c.bidder_rank)+". Bieter</b><div class='mut'>Ursprüngliches Gebot</div></div><div class='big'>CHF "+F(c.bid_amount_chf)+"</div></div>"+(used?"<div class='activityStatus "+(c.existing_offer_status==="pending"?"statusWarn":"")+"'>"+E(statusLabel(c.existing_offer_status))+"</div>":"<button class='btn primary' style='width:100%;margin-top:10px' data-pick-second='"+c.bidder_id+"' data-rank='"+c.bidder_rank+"' data-amount='"+E(c.bid_amount_chf)+"'>Diesem Bieter anbieten</button>")+"</div>"}).join(""):"<div class='empty'>Es gibt keinen verfügbaren 2. oder 3. Bieter für diese Auktion.</div>";
 o.innerHTML="<div class='buyModal'><h2>🔁 Nachrücker auswählen</h2><div class='mut'>"+E(title||"Auktion")+"</div><div class='notice'><b>Nur verwenden, wenn der Gewinner den Kauf verweigert oder sich nicht mehr meldet.</b><br>Der Nachrücker erhält sein ursprüngliches Gebot als 48-Stunden-Angebot. Der Kauf wird erst übertragen, wenn er ausdrücklich annimmt.</div><label style='display:block;margin-top:14px;font-weight:800'>Grund<select id='secondChanceReason' style='width:100%;margin-top:6px'><option value='no_response'>Käufer meldet sich nicht</option><option value='refused'>Käufer verweigert den Kauf</option></select></label><div style='margin-top:12px'>"+rows+"</div><div id='secondChanceMsg'></div><div class='actions'><button class='btn' id='secondChanceClose'>Schliessen</button></div></div>";
 document.body.appendChild(o);document.getElementById("secondChanceClose").onclick=()=>o.remove();o.onclick=e=>{if(e.target===o)o.remove()};
 o.querySelectorAll("[data-pick-second]").forEach(b=>b.onclick=async()=>{let rank=b.dataset.rank,amount=b.dataset.amount,reason=document.getElementById("secondChanceReason").value;if(!confirm("Dem "+rank+". Bieter den Artikel für CHF "+F(amount)+" anbieten? Das Angebot ist 48 Stunden gültig."))return;b.disabled=true;b.textContent="Wird gesendet …";let q=await db.rpc("offer_auction_second_chance",{p_listing_id:listingId,p_candidate_bidder_id:b.dataset.pickSecond,p_reason:reason});if(q.error){b.disabled=false;b.textContent="Diesem Bieter anbieten";document.getElementById("secondChanceMsg").innerHTML=N(q.error.message,1);return}o.remove();salesCenter()})
}


async function salesCenter(){
 if(!user)return go("#/login");
 let [lr,or,sr,scr]=await Promise.all([
  db.from("listings").select("*").eq("seller_id",user.id).order("created_at",{ascending:false}),
  db.from("offers").select("*").eq("seller_id",user.id).order("created_at",{ascending:false}),
  db.rpc("my_sales"),
  db.rpc("my_sent_auction_second_chance_offers")
 ]);
 let ls=lr.data||[],offers=or.data||[],sales=sr.data||[],sentSecond=scr.data||[],ids=ls.map(x=>x.id),imgs=await loadActivityImages(ids),title={};ls.forEach(x=>title[x.id]=x.title);
 let active=ls.filter(x=>x.status==="active"),secondLatest={};sentSecond.forEach(x=>{if(!secondLatest[x.listing_id])secondLatest[x.listing_id]=x});
 let offerHtml=offers.length?offers.map(o=>{let cls=o.status==="accepted"?"statusGood":o.status==="rejected"?"statusBad":"statusWarn";return"<div class='adminCard'><b>"+E(title[o.listing_id]||"Inserat")+"</b><div>CHF "+F(o.amount_chf)+"</div><div class='activityStatus "+cls+"'>"+E(offerStatusLabel(o.status))+"</div>"+(o.status==="pending"?"<div class='actions' style='margin-top:8px'><button class='btn primary' data-sale-offer='"+o.id+"' data-accept='1'>Annehmen</button><button class='btn' data-sale-offer='"+o.id+"' data-accept='0'>Ablehnen</button></div>":"")+"</div>"}).join(""):"<div class='empty'>Keine Preisvorschläge.</div>";
 let payLabel=s=>({open:"Direktzahlung offen",paid:"Zahlung erhalten",refunded:"Rückerstattet",not_applicable:"Keine Zahlung nötig"}[s]||s||"");
 let fulfillLabel=s=>({pending:"Abwicklung offen",shipping:"Versand wird vorbereitet",shipped:"Versendet",ready_for_pickup:"Abholbereit",picked_up:"Abgeholt",completed:"Abgeschlossen"}[s]||s||"");
 function flowButtons(x){
  if(!x.transaction_id)return "";
  let a=[],sc=secondLatest[x.listing_id];
  if(x.payment_status==="open")a.push("<button class='btn primary' data-tx='"+x.transaction_id+"' data-pay='paid'>💰 Zahlung erhalten</button>");
  if(x.payment_status==="paid")a.push("<button class='btn' data-tx='"+x.transaction_id+"' data-pay='refunded'>↩ Rückerstattet</button>");
  if(x.fulfillment_status==="pending"){
    if(x.shipping_available)a.push("<button class='btn' data-tx='"+x.transaction_id+"' data-fulfill='shipping'>📦 Versand vorbereiten</button>");
    if(x.pickup_available)a.push("<button class='btn' data-tx='"+x.transaction_id+"' data-fulfill='ready_for_pickup'>📍 Abholbereit</button>");
    if(!x.shipping_available&&!x.pickup_available)a.push("<span class='mut'>Übergabe bitte direkt mit dem Käufer koordinieren.</span>");
  }else if(x.fulfillment_status==="shipping")a.push("<button class='btn primary' data-tx='"+x.transaction_id+"' data-fulfill='shipped'>🚚 Als versendet markieren</button>");
  else if(x.fulfillment_status==="ready_for_pickup")a.push("<button class='btn primary' data-tx='"+x.transaction_id+"' data-fulfill='picked_up'>✓ Als abgeholt markieren</button>");
  else if(x.fulfillment_status==="shipped"||x.fulfillment_status==="picked_up")a.push("<span class='mut'>Warte auf die Erhaltsbestätigung des Käufers.</span>");
  if(x.price_type==="auction"&&x.payment_status==="open"&&x.fulfillment_status==="pending"){
    if(sc?.status==="pending")a.push("<span class='badge auction' style='align-self:center'>🔁 Nachrücker-Angebot an "+E(sc.candidate_name||"Bieter")+" · CHF "+F(sc.amount_chf)+" · bis "+E(D(sc.expires_at))+"</span>");
    else a.push("<button class='btn' data-second-chance-listing='"+x.listing_id+"' data-second-title='"+E(x.title)+"'>🔁 2./3. Bieter als Nachrücker</button>");
  }
  return a.length?"<div class='actions' style='margin-top:10px;flex-wrap:wrap'>"+a.join("")+"</div>":"";
 }
 let soldHtml=sales.length?sales.map(x=>"<div class='activityCard'><div class='activityPic'>"+activityImage(imgs[x.listing_id])+"</div><div><b>"+E(x.title)+"</b><div class='activityStatus statusGood'>Verkauft · CHF "+F(x.price_chf)+"</div><div class='mut'><b>"+E(payLabel(x.payment_status))+"</b> · <b>"+E(fulfillLabel(x.fulfillment_status))+"</b></div><small class='mut'>"+E(D(x.sold_at))+" · Käufer: "+E(x.buyer_name||"Käufer")+"</small>"+flowButtons(x)+"</div><div class='actions'><a class='btn' href='#/listing/"+x.listing_id+"'>Details</a><button class='btn' data-sale-chat='"+x.listing_id+"'>Käufer kontaktieren</button></div></div>").join(""):"<div class='empty'>Noch keine abgeschlossenen Verkäufe.</div>";
 app.innerHTML="<div class='wrap formPage'><div class='head'><div><h1 style='margin:0'>Verkäufe</h1><p class='mut' style='margin:5px 0 0'>Verkauf, direkte Zahlung, Versand und Abholung an einem Ort.<br>💳 Zahlung erfolgt direkt zwischen Käufer und Verkäufer. KaufMich24 verwahrt kein Geld.</p></div><a class='btn' href='#/me'>Mein Konto</a></div><div class='marketSummary'><div class='marketStat'><span class='mut'>Aktive Inserate</span><b>"+active.length+"</b></div><div class='marketStat'><span class='mut'>Offene Angebote</span><b>"+offers.filter(x=>x.status==="pending").length+"</b></div><div class='marketStat'><span class='mut'>Verkauft</span><b>"+sales.length+"</b></div><div class='marketStat'><span class='mut'>Abgeschlossen</span><b>"+sales.filter(x=>x.fulfillment_status==="completed").length+"</b></div></div><section class='section'><h2>🤝 Preisvorschläge</h2><div class='manage'>"+offerHtml+"</div></section><section class='section'><h2>✓ Verkäufe & Abwicklung</h2><div class='manage'>"+soldHtml+"</div></section></div>";
 document.querySelectorAll("[data-sale-offer]").forEach(b=>b.onclick=async()=>{let r=await db.rpc("respond_offer",{p_offer_id:b.dataset.saleOffer,p_accept:b.dataset.accept==="1"});if(r.error)return alert(r.error.message);salesCenter()});
 document.querySelectorAll("[data-sale-chat]").forEach(b=>b.onclick=()=>startChat(b.dataset.saleChat));
 document.querySelectorAll("[data-second-chance-listing]").forEach(b=>b.onclick=()=>openAuctionSecondChance(b.dataset.secondChanceListing,b.dataset.secondTitle));
 document.querySelectorAll("[data-tx]").forEach(b=>b.onclick=async()=>{let payment=b.dataset.pay||null,fulfillment=b.dataset.fulfill||null;let question=payment==="paid"?"Zahlung wirklich als erhalten markieren?":payment==="refunded"?"Zahlung wirklich als zurückerstattet markieren?":fulfillment==="shipping"?"Versand als in Vorbereitung markieren?":fulfillment==="shipped"?"Artikel wirklich als versendet markieren?":fulfillment==="ready_for_pickup"?"Artikel als abholbereit markieren?":fulfillment==="picked_up"?"Artikel wirklich als abgeholt markieren?":"Verkauf wirklich abschliessen?";if(!confirm(question))return;b.disabled=true;let r=await db.rpc("update_sale_transaction",{p_transaction_id:b.dataset.tx,p_payment_status:payment,p_fulfillment_status:fulfillment});if(r.error){b.disabled=false;return alert(r.error.message)}salesCenter()});
}


async function transactionReviewPage(listingId){
 if(!user)return go("#/login?next=review&id="+encodeURIComponent(listingId));
 app.innerHTML='<div class="wrap formPage"><div class="empty">Bewertung wird geladen ...</div></div>';
 let tr=await db.rpc("my_reviewable_transactions");
 if(tr.error){app.innerHTML='<div class="wrap formPage"><div class="empty">Die Bewertung konnte nicht geladen werden.</div></div>';return}
 let tx=(tr.data||[]).find(x=>x.listing_id===listingId);
 if(!tx){app.innerHTML='<div class="wrap formPage"><div class="empty"><b>Transaktion nicht gefunden.</b><br><span class="mut">Diese Bewertung ist für dein Konto nicht verfügbar.</span><div class="actions" style="margin-top:14px"><a class="btn" href="#/buyer">Meine Käufe</a><a class="btn" href="#/sales">Meine Verkäufe</a></div></div></div>';return}
 let rr=await db.rpc("seller_reviews_public",{p_seller_id:user.id,p_limit:100,p_offset:0});
 let received=(rr.data||[]).find(x=>x.listing_id===listingId)||null;
 let role=tx.my_role==="seller"?"Käufer":"Verkäufer";
 let receivedHtml=received
   ?'<div class="panel"><div class="head" style="margin:0"><div><small class="mut">Erhaltene Bewertung</small><h2 style="margin:4px 0 0">'+E("★".repeat(Number(received.rating)||0)+"☆".repeat(Math.max(0,5-(Number(received.rating)||0))))+' <span class="mut" style="font-size:15px">'+E(received.rating)+'/5</span></h2></div><small class="mut">'+E(D(received.created_at))+'</small></div>'+(received.comment?'<p style="margin:14px 0 0">'+E(received.comment)+'</p>':'<p class="mut" style="margin:14px 0 0">Ohne Kommentar</p>')+'<small class="mut" style="display:block;margin-top:10px">Von '+E(received.reviewer_name||role)+'</small></div>'
   :'<div class="panel"><small class="mut">Erhaltene Bewertung</small><p style="margin-bottom:0">Für diese Transaktion wurde dir noch keine Bewertung abgegeben.</p></div>';
 let ownHtml=tx.already_reviewed
   ?'<div class="panel"><small class="mut">Deine Bewertung</small><h2 style="margin:6px 0">✓ '+E(tx.my_rating)+'/5 Sterne</h2>'+(tx.my_comment?'<p style="margin:0">'+E(tx.my_comment)+'</p>':'<p class="mut" style="margin:0">Ohne Kommentar</p>')+'</div>'
   :'<div class="panel"><small class="mut">Jetzt bewerten</small><h2 style="margin:6px 0 12px">'+E(role)+' bewerten</h2><label>Sterne</label><select id="transactionReviewRating" style="width:100%;margin:6px 0 12px"><option value="5">★★★★★ 5/5</option><option value="4">★★★★☆ 4/5</option><option value="3">★★★☆☆ 3/5</option><option value="2">★★☆☆☆ 2/5</option><option value="1">★☆☆☆☆ 1/5</option></select><label>Kommentar <span class="mut">(optional)</span></label><textarea id="transactionReviewComment" maxlength="1000" rows="4" placeholder="Wie war deine Erfahrung?"></textarea><div class="actions" style="margin-top:12px"><button class="btn primary" id="submitTransactionReview">Bewertung abgeben</button></div><div id="transactionReviewMsg" style="margin-top:10px"></div></div>';
 app.innerHTML='<div class="wrap formPage"><div class="head"><div><h1 style="margin:0">Bewertung zur Transaktion</h1><p class="mut" style="margin:5px 0 0">'+E(tx.listing_title||"Verkauf")+' · '+E(D(tx.sold_at))+'</p></div><a class="btn" href="#/profile/'+E(tx.counterpart_id)+'">Profil ansehen</a></div><div class="panel"><small class="mut">Transaktion</small><h2 style="margin:6px 0">'+E(tx.listing_title||"Verkauf")+'</h2><div>Gegenpartei: <b>'+E(tx.counterpart_name||role)+'</b></div><div class="mut" style="margin-top:4px">Abgeschlossen'+(tx.final_price_chf!=null?' · CHF '+F(tx.final_price_chf):'')+'</div></div>'+receivedHtml+ownHtml+'<div class="actions" style="margin-top:14px"><a class="btn" href="'+(tx.my_role==="seller"?'#/sales':'#/buyer')+'">Zur Abwicklung</a><a class="btn" href="#/notifications">Benachrichtigungen</a></div></div>';
 let b=document.getElementById("submitTransactionReview");
 if(b)b.onclick=async()=>{
   let rating=Number(document.getElementById("transactionReviewRating")?.value||5);
   let comment=(document.getElementById("transactionReviewComment")?.value||"").trim();
   let msg=document.getElementById("transactionReviewMsg");
   if(comment.length>1000){if(msg)msg.innerHTML=N("Der Kommentar darf höchstens 1000 Zeichen lang sein.",1);return}
   b.disabled=true;b.textContent="Wird gespeichert …";
   let r=await db.rpc("submit_transaction_review",{p_listing_id:listingId,p_rating:rating,p_comment:comment||null});
   if(r.error){b.disabled=false;b.textContent="Bewertung abgeben";if(msg)msg.innerHTML=N(r.error.message,1);return}
   transactionReviewPage(listingId)
 };
}
async function publicProfile(id){
 let [pr,lr,rr]=await Promise.all([
  db.rpc("seller_profile_public",{p_seller_id:id}),
  db.from("listings").select("*").eq("seller_id",id).eq("status","active").order("created_at",{ascending:false}),
  db.rpc("seller_reviews_public",{p_seller_id:id,p_limit:30,p_offset:0})
 ]);
 let p=(pr.data||[])[0];
 if(!p){app.innerHTML="<div class='wrap formPage'><div class='empty'>Profil nicht gefunden.</div></div>";return}
 let ls=lr.data||[],reviews=rr.data||[],imgs={},blocked=false;
 if(ls.length){
  let q=await db.from("listing_images").select("listing_id,storage_path,sort_order,focal_x,focal_y,fit_mode").in("listing_id",ls.map(x=>x.id)).order("sort_order");
  (q.data||[]).forEach(x=>{if(!imgs[x.listing_id])imgs[x.listing_id]=x})
 }
 let cardProfile={display_name:p.display_name,business_name:p.business_name,account_type:p.account_type,city:p.city,identity_verified_at:null};
 ls.forEach(x=>{x._img=imgs[x.id];x._p=cardProfile});
 let reviewable=null;
 if(user&&user.id!==id){
  let [q,bq]=await Promise.all([db.rpc("my_reviewable_transactions"),db.rpc("my_blocked_users")]);
  reviewable=(q.data||[]).find(x=>x.counterpart_id===id&&!x.already_reviewed)||null;
  blocked=(bq.data||[]).some(x=>x.user_id===id)
 }
 let member=p.member_since?new Intl.DateTimeFormat("de-CH",{year:"numeric",month:"long"}).format(new Date(p.member_since)):"–";
 let accountLabel=p.account_type==="dealer"||p.account_type==="business"?"🏪 Händler / Unternehmen":"👤 Privatperson";
 let web=p.website?"<div style='margin-top:8px'><a class='btn' href='"+E(p.website)+"' target='_blank' rel='noopener'>🌐 Webseite</a></div>":"";
 let reviewButton=reviewable?"<button class='btn primary' id='reviewUser' data-listing='"+reviewable.listing_id+"'>★ Verkäufer bewerten</button>":"";
 let safetyActions=user&&user.id!==id?"<div class='actions' style='margin-top:12px'><button class='btn' id='reportUser'>⚑ Nutzer melden</button><button class='btn "+(blocked?"primary":"")+"' id='blockUser'>"+(blocked?"Entblockieren":"🚫 Blockieren")+"</button></div>":"";
 app.innerHTML="<div class='wrap formPage'><div class='panel'><div class='head' style='align-items:flex-start'><div><span class='badge "+((p.account_type==="dealer"||p.account_type==="business")?"dealer":"")+"'>"+accountLabel+"</span> "+""+"<h1 style='margin-bottom:8px'>"+E(p.business_name||p.display_name||"Profil")+"</h1><div class='ratingStars'>"+(p.rating_count?"★ "+E(p.rating)+" / 5 · "+E(p.rating_count)+" Bewertung(en)":"Noch keine Bewertungen")+"</div></div>"+reviewButton+"</div><div class='specs' style='margin-top:14px'><div class='spec'><small>Mitglied seit</small><b>"+E(member)+"</b></div><div class='spec'><small>Aktive Inserate</small><b>"+E(p.active_listing_count||0)+"</b></div><div class='spec'><small>Verkauft</small><b>"+E(p.sold_listing_count||0)+"</b></div><div class='spec'><small>Standort</small><b>"+E([p.postal_code,p.city,p.canton].filter(Boolean).join(" ")||"Schweiz")+"</b></div></div>"+(p.bio?"<p style='margin-top:16px'>"+E(p.bio)+"</p>":"")+web+safetyActions+(blocked?"<div class='notice' style='margin-top:12px'>Dieser Nutzer ist blockiert. Neue Nachrichten und neue Käufe zwischen euch sind gesperrt.</div>":"")+"</div><section class='section'><h2>Aktive Inserate</h2><div class='grid'>"+(ls.length?ls.map(card).join(""):"<div class='empty' style='grid-column:1/-1'>Keine aktiven Inserate.</div>")+"</div></section><section class='section'><h2>Bewertungen</h2><div class='manage'>"+(reviews.length?reviews.map(r=>"<div class='adminCard'><div class='head' style='margin:0'><b>★ "+E(r.rating)+"/5</b><small class='mut'>"+E(D(r.created_at))+"</small></div>"+(r.comment?"<div style='margin-top:6px'>"+E(r.comment)+"</div>":"")+"<div class='mut' style='margin-top:6px'>"+E(r.reviewer_name||"Nutzer")+(r.listing_title?" · "+E(r.listing_title):"")+"</div></div>").join(""):"<div class='empty'>Noch keine Bewertungen.</div>")+"</div></section></div>";
 let rb=document.getElementById("reviewUser");
 if(rb)rb.onclick=async()=>{
  let rating=Number(prompt("Bewertung 1–5:","5"));
  if(!Number.isInteger(rating)||rating<1||rating>5)return;
  let comment=prompt("Kommentar (optional, max. 1000 Zeichen):","")||null;
  if(comment&&comment.length>1000)return alert("Der Kommentar darf höchstens 1000 Zeichen lang sein.");
  let r=await db.rpc("submit_transaction_review",{p_listing_id:rb.dataset.listing,p_rating:rating,p_comment:comment});
  if(r.error)alert(r.error.message);else publicProfile(id)
 };
 let ru=document.getElementById("reportUser");if(ru)ru.onclick=()=>reportUser(id);
 let bu=document.getElementById("blockUser");if(bu)bu.onclick=async()=>{let msg=blocked?"Nutzer wirklich entblockieren?":"Nutzer wirklich blockieren? Danach sind neue Nachrichten und neue Käufe zwischen euch gesperrt.";if(!confirm(msg))return;let r=await db.rpc(blocked?"unblock_user":"block_user",{p_user_id:id});if(r.error)alert(r.error.message);else publicProfile(id)}
}
async function reportListing(listingId,reportedUser){
 if(!user)return go("#/login");
 let reason=prompt("Grund der Meldung:","");
 if(!reason)return;
 let details=prompt("Weitere Details (optional):","")||null;
 let r=await db.rpc("submit_report",{p_listing_id:listingId,p_reported_user_id:reportedUser,p_reason:reason,p_details:details});
 if(r.error)alert(r.error.message);else alert("Meldung wurde an KaufMich24 übermittelt.")
}
async function reportUser(reportedUser){
 if(!user)return go("#/login");
 let reason=prompt("Warum möchtest du diesen Nutzer melden?","");
 if(!reason)return;
 let details=prompt("Weitere Details (optional):","")||null;
 let r=await db.rpc("submit_report",{p_listing_id:null,p_reported_user_id:reportedUser,p_reason:reason,p_details:details});
 if(r.error)alert(r.error.message);else alert("Nutzer wurde an KaufMich24 gemeldet.")
}
async function adminPage(){
 if(!user)return go("#/login");
 await loadProfile();
 if(!profile?.is_admin){app.innerHTML="<div class='wrap formPage'><div class='empty'>Kein Admin-Zugriff.</div></div>";return}

 let [rr,sr,ur,vr,dr,gr,kr,mr]=await Promise.all([
  db.from("reports").select("*").order("created_at",{ascending:false}).limit(100),
  db.from("support_requests").select("*").order("created_at",{ascending:false}).limit(100),
  db.rpc("admin_list_users"),
  Promise.resolve({data:[]}),
  Promise.resolve({data:[]}),
  db.rpc("admin_giveaway_participants",{p_campaign_id:"year_end_2026"}),
  db.rpc("admin_risk_events",{p_limit:50}),
  db.rpc("admin_moderation_log",{p_limit:40})
 ]);
 let reports=rr.data||[],supports=sr.data||[],users=ur.data||[],verifications=vr.data||[],details=dr.data||[],giveaway=gr?.data||[],risks=kr?.data||[],modlog=mr?.data||[],up={},dp={},listingTitles={};
 users.forEach(x=>up[x.id]=x);details.forEach(x=>dp[x.user_id]=x);
 let reportListingIds=[...new Set(reports.map(x=>x.listing_id).filter(Boolean))];
 if(reportListingIds.length){let q=await db.from("listings").select("id,title,status,seller_id").in("id",reportListingIds);(q.data||[]).forEach(x=>listingTitles[x.id]=x)}


 let userName=p=>p?(p.business_name||p.display_name||p.email||"Nutzer"):"Nutzer";
 let userCards=users.map(u=>{
   let suspended=u.account_status==="suspended",emailOk=!!u.email_confirmed,phoneOk=!!String(u.phone||"").trim(),addressOk=!!(String(u.postal_code||"").trim()&&String(u.city||"").trim());
   let search=[u.display_name,u.business_name,u.email,u.phone,u.city,u.postal_code].filter(Boolean).join(" ").toLowerCase();
   return "<div class='adminCard userAdminCard "+(suspended?"suspended":"")+"' data-search='"+E(search)+"'>"+
     "<div class='head' style='margin:0'><div><b>"+E(userName(u))+"</b><div class='adminMeta'>"+
       "<span class='badge "+(u.account_type==="dealer"?"dealer":"")+"'>"+(u.account_type==="dealer"?"🏪 Firma":"👤 Privat")+"</span>"+
       (emailOk?"<span class='badge'>✓ E-Mail</span>":"<span class='badge'>⚠ E-Mail offen</span>")+(phoneOk?"<span class='badge'>✓ Mobil hinterlegt</span>":"<span class='badge'>Mobil fehlt</span>")+(addressOk?"<span class='badge'>✓ Ort hinterlegt</span>":"<span class='badge'>Ort fehlt</span>")+
       "<span class='badge'><span class='statusDot "+(suspended?"statusSuspended":"statusActive")+"'></span>"+(suspended?"Gesperrt":"Aktiv")+"</span>"+
     "</div></div><small class='mut'>Mitglied seit "+E(D(u.created_at))+"</small></div>"+
     "<div class='adminSub'><div><b>E-Mail:</b> "+E(u.email||"–")+" · "+(emailOk?"bestätigt":"nicht bestätigt")+"</div><div><b>Mobil:</b> "+E(u.phone||"–")+" · "+(phoneOk?"hinterlegt":"nicht hinterlegt")+"</div><div><b>Ort:</b> "+E([u.postal_code,u.city].filter(Boolean).join(" ")||"–")+" · "+(addressOk?"hinterlegt":"unvollständig")+"</div><div><b>Aktive Inserate:</b> "+E(u.active_listing_count||0)+"</div>"+(suspended&&u.moderation_reason?"<div><b>Sperrgrund:</b> "+E(u.moderation_reason)+"</div>":"")+"</div>"+
     "<div class='actions' style='margin-top:10px'><a class='btn' href='#/profile/"+u.id+"'>Profil</a><button class='btn' data-user-address='"+u.id+"'>Adresse ändern</button>"+
     (u.is_admin?"<span class='badge'>Admin</span>":suspended?"<button class='btn primary' data-user-status='"+u.id+"' data-status='active'>Freischalten</button>":"<button class='btn' data-user-status='"+u.id+"' data-status='suspended'>Sperren</button>")+
     "</div></div>";
 }).join("");

 let reportCards=reports.length?reports.map(r=>{
   let reporter=up[r.reporter_id]||{},reported=up[r.reported_user_id]||{},l=r.listing_id?listingTitles[r.listing_id]:null,open=r.status!=="closed";
   return "<div class='adminCard'><div class='head' style='margin:0'><div><b>"+E(r.reason)+"</b><div class='adminMeta'><span class='badge "+(open?"auction":"")+"'>"+(open?"Offen":"Geschlossen")+"</span></div></div><small class='mut'>"+E(D(r.created_at))+"</small></div>"+
   (r.details?"<div>"+E(r.details)+"</div>":"")+
   "<div class='adminSub'><div><b>Gemeldet von:</b> "+E(userName(reporter))+"</div><div><b>Gemeldeter Nutzer:</b> "+E(r.reported_user_id?userName(reported):"–")+"</div><div><b>Inserat:</b> "+E(l?l.title:(r.listing_id?"nicht mehr verfügbar":"–"))+"</div>"+(r.admin_note?"<div><b>Admin-Notiz:</b> "+E(r.admin_note)+"</div>":"")+"</div>"+
   "<div class='actions' style='margin-top:10px'>"+(r.listing_id?"<a class='btn' href='#/listing/"+r.listing_id+"'>Inserat ansehen</a>"+(l&&l.status==="inactive"?"<button class='btn primary' data-listing-action='"+r.listing_id+"' data-action='restore'>Wieder freischalten</button>":"<button class='btn' data-listing-action='"+r.listing_id+"' data-action='pause'>Inserat pausieren</button>"):"")+(r.reported_user_id&&!reported.is_admin?"<button class='btn' data-user-status='"+r.reported_user_id+"' data-status='suspended'>Nutzer sperren</button>":"")+(open?"<button class='btn primary' data-report='"+r.id+"' data-report-status='closed'>Schliessen</button>":"<button class='btn' data-report='"+r.id+"' data-report-status='open'>Wieder öffnen</button>")+"</div></div>";
 }).join(""):"<div class='empty'>Keine Meldungen.</div>";

 
let riskCards=risks.length?risks.map(x=>"<div class='adminCard'><div class='head' style='margin:0'><div><b>"+E(x.summary)+"</b><div class='adminMeta'><span class='badge "+(x.severity==="high"?"auction":"")+"'>"+E(x.severity==="high"?"Hoch":x.severity==="medium"?"Mittel":"Niedrig")+"</span><span class='badge'>"+E(x.status)+"</span></div></div><small class='mut'>"+E(D(x.created_at))+"</small></div><div class='adminSub'><div><b>Nutzer:</b> "+E(x.user_name||"–")+"</div><div><b>Typ:</b> "+E(x.event_type)+"</div></div>"+(x.status==="open"?"<div class='actions' style='margin-top:10px'><button class='btn primary' data-risk='"+x.id+"' data-risk-status='reviewed'>Geprüft</button><button class='btn' data-risk='"+x.id+"' data-risk-status='dismissed'>Verwerfen</button><button class='btn' data-risk='"+x.id+"' data-risk-status='actioned'>Massnahme erfolgt</button></div>":"")+"</div>").join(""):"<div class='empty'>Keine offenen Sicherheitsfälle.</div>";
let modCards=modlog.length?modlog.map(x=>"<div class='adminCard adminAuditCard'><div class='head' style='margin:0'><b>"+E(({listing_paused:"Inserat pausiert",listing_restored:"Inserat freigeschaltet",user_suspended:"Nutzer gesperrt",user_reactivated:"Nutzer freigeschaltet",report_closed:"Meldung geschlossen",report_reopened:"Meldung wieder geöffnet"})[x.action_type]||x.action_type)+"</b><small class='mut'>"+E(D(x.created_at))+"</small></div><div class='adminSub'><div><b>Admin:</b> "+E(x.admin_name||"–")+"</div><div><b>Nutzer:</b> "+E(x.target_name||"–")+"</div>"+(x.listing_id?"<div><b>Inserat:</b> "+E(x.listing_title||"–")+"</div>":"")+(x.reason?"<div><b>Grund:</b> "+E(x.reason)+"</div>":"")+"</div></div>").join(""):"<div class='empty'>Noch keine Moderationsaktionen.</div>";

let supportCards=supports.length?supports.map(s=>{
   let p=s.user_id?up[s.user_id]:null,open=s.status!=="closed",mail=s.email||p?.email||"";
   return "<div class='adminCard'><div class='head' style='margin:0'><div><b>"+E(s.subject)+"</b><div class='adminMeta'><span class='badge "+(open?"auction":"")+"'>"+(open?"Offen":"Geschlossen")+"</span><span class='badge'>"+E(supportCategoryLabel(s.category))+"</span></div></div><small class='mut'>"+E(D(s.created_at))+"</small></div><div>"+E(s.message)+"</div><div class='adminSub'><div><b>Von:</b> "+E(p?userName(p):"Gast")+"</div><div><b>E-Mail:</b> "+E(mail||"–")+"</div>"+(s.public_reply?"<div><b>Antwort an Nutzer:</b> "+E(s.public_reply)+"</div>":"")+(s.admin_note?"<div><b>Admin-Notiz:</b> "+E(s.admin_note)+"</div>":"")+"</div><div class='actions' style='margin-top:10px'><button class='btn primary' data-support-reply='"+s.id+"'>Antworten</button>"+(mail?"<a class='btn' href='mailto:"+E(mail)+"?subject="+encodeURIComponent("KaufMich24 Support: "+s.subject)+"'>E-Mail</a>":"")+(open?"<button class='btn' data-support='"+s.id+"' data-support-status='closed'>Schliessen</button>":"<button class='btn' data-support='"+s.id+"' data-support-status='open'>Wieder öffnen</button>")+"</div></div>";
 }).join(""):"<div class='empty'>Keine Supportanfragen.</div>";

 let openReports=reports.filter(x=>x.status!=="closed").length,
     openSupport=supports.filter(x=>x.status!=="closed").length,
     openRisk=risks.filter(x=>x.status==="open").length,
     eligibleGiveaway=giveaway.filter(x=>x.eligible).length;

 app.innerHTML="<div class='wrap formPage km24AdminPage'>"+
 "<div class='km24AdminHeader'><a class='btn km24AdminBack' href='#/me'>← Konto</a><div class='adminHero'><span class='km24AccountKicker'>ADMINBEREICH</span><h1>KaufMich24 verwalten</h1><p class='mut'>Nur die Bereiche, die du im Alltag wirklich brauchst.</p></div></div>"+
 "<nav class='km24AdminTabs' aria-label='Admin Navigation'>"+
 "<button type='button' data-admin-tab='overview'>🏠 <span>Übersicht</span></button>"+
 "<button type='button' data-admin-tab='support'>🛟 <span>Support</span><b>"+openSupport+"</b></button>"+
 "<button type='button' data-admin-tab='reports'>🚩 <span>Meldungen</span><b>"+openReports+"</b></button>"+
 "<button type='button' data-admin-tab='users'>👥 <span>Nutzer</span></button>"+
 "<button type='button' data-admin-tab='security'>🛡️ <span>Sicherheit</span><b>"+openRisk+"</b></button>"+
 "<button type='button' data-admin-tab='giveaway'>🎁 <span>Gewinnspiel</span></button>"+
 "</nav>"+
 "<div class='km24AdminPanels'>"+
 "<section class='km24AdminPanel' data-admin-panel='overview'>"+
   "<div class='km24AdminSectionHead'><div><span>ÜBERSICHT</span><h2>Offene Aufgaben</h2></div></div>"+
   "<div class='km24AdminTaskGrid km24AdminTaskGridSimple'>"+
     "<button type='button' data-admin-open='support' class='"+(openSupport?"needsAttention":"")+"'><span class='km24AdminTaskIcon'>🛟</span><span><b>"+openSupport+"</b><small>Support offen</small></span><i>›</i></button>"+
     "<button type='button' data-admin-open='reports' class='"+(openReports?"needsAttention":"")+"'><span class='km24AdminTaskIcon'>🚩</span><span><b>"+openReports+"</b><small>Offene Meldungen</small></span><i>›</i></button>"+
     "<button type='button' data-admin-open='security' class='"+(openRisk?"needsAttention":"")+"'><span class='km24AdminTaskIcon'>🛡️</span><span><b>"+openRisk+"</b><small>Offene Sicherheitsfälle</small></span><i>›</i></button>"+
   "</div>"+
   "<div class='adminCard km24AdminCleanupCard'><b>Foto-Import – Admin-Werkzeug</b><p class='mut'>Nur eigene inaktive Testartikel und Bilder prüfen und bei Bedarf bereinigen.</p><a class='btn' href='/?km24_cleanup_admin=1#/foto-massenimport'>🧹 Testartikel prüfen</a></div>"+
   "<div class='km24AdminOverviewHint'>Alles Technische läuft im Hintergrund. Hier siehst du nur Aufgaben, bei denen du selbst etwas bearbeiten musst.</div>"+
 "</section>"+
 "<section class='km24AdminPanel' data-admin-panel='support'>"+
   "<section class='section adminSection' id='admin-support'><div class='km24AdminSectionHead'><div><span>KUNDENSERVICE</span><h2>🛟 Support</h2></div><b class='km24AdminCount'>"+openSupport+" offen</b></div><div class='manage'>"+supportCards+"</div></section>"+
 "</section>"+
 "<section class='km24AdminPanel' data-admin-panel='reports'>"+
   "<section class='section adminSection' id='admin-reports'><div class='km24AdminSectionHead'><div><span>MODERATION</span><h2>🚩 Meldungen</h2></div><b class='km24AdminCount'>"+openReports+" offen</b></div><div class='manage'>"+reportCards+"</div></section>"+
 "</section>"+
 "<section class='km24AdminPanel' data-admin-panel='users'>"+
   "<section class='section adminSection' id='admin-users'><div class='km24AdminSectionHead'><div><span>KONTEN</span><h2>👥 Nutzer</h2></div><b class='km24AdminCount'>"+users.length+" Konten</b></div><div class='adminToolbar'><input class='adminSearch' id='adminUserSearch' placeholder='Name, E-Mail, Telefon oder Ort suchen'></div><div class='manage' id='adminUsers'>"+(userCards||"<div class='empty'>Keine Nutzer.</div>")+"</div></section>"+
 "</section>"+
 "<section class='km24AdminPanel' data-admin-panel='security'>"+
   "<section class='section adminSection' id='admin-security'><div class='km24AdminSectionHead'><div><span>SICHERHEIT</span><h2>🛡️ Sicherheitsfälle</h2></div><b class='km24AdminCount'>"+openRisk+" offen</b></div><div class='manage'>"+riskCards+"</div></section>"+
   "<section class='section adminSection'><div class='km24AdminSectionHead'><div><span>PROTOKOLL</span><h2>Moderationsverlauf</h2></div></div><div class='manage'>"+modCards+"</div></section>"+
 "</section>"+
 "<section class='km24AdminPanel' data-admin-panel='giveaway'>"+
   "<section class='section adminSection' id='admin-giveaway'><div class='km24AdminSectionHead'><div><span>AKTION</span><h2>🎁 Gewinnspiel 2026</h2></div><b class='km24AdminCount'>"+eligibleGiveaway+" dabei</b></div><div class='manage'>"+(giveaway.length?giveaway.map(g=>"<div class='adminCard'><div class='head' style='margin:0'><div><b>"+E(g.business_name||g.display_name||g.email||"Nutzer")+"</b><div class='adminMeta'><span class='badge "+(g.eligible?"":"auction")+"'>"+(g.eligible?"✓ Teilnahme aktiv":g.excluded?"Ausgeschlossen":"Nicht teilnahmeberechtigt")+"</span></div></div><small class='mut'>Registriert: "+E(D(g.registered_at))+"</small></div><div class='adminSub'><div>"+E(g.email||"–")+"</div>"+(g.exclusion_reason?"<div><b>Grund:</b> "+E(g.exclusion_reason)+"</div>":"")+"</div><div class='actions' style='margin-top:10px'>"+(g.excluded?"<button class='btn primary' data-giveaway-user='"+g.user_id+"' data-giveaway-excluded='0'>Wieder zulassen</button>":"<button class='btn' data-giveaway-user='"+g.user_id+"' data-giveaway-excluded='1'>Ausschliessen</button>")+"</div></div>").join(""):"<div class='empty'>Noch keine Konten.</div>")+"</div></section>"+
 "</section>"+
 "</div></div>";

 const adminTabs=["overview","support","reports","users","security","giveaway"];
 function showAdminTab(tab,scrollTop){
   if(!adminTabs.includes(tab))tab="overview";
   window.__km24AdminActiveTab=tab;
   document.querySelectorAll("[data-admin-panel]").forEach(p=>p.classList.toggle("active",p.dataset.adminPanel===tab));
   document.querySelectorAll("[data-admin-tab]").forEach(b=>{
     const active=b.dataset.adminTab===tab;
     b.classList.toggle("active",active);
     b.setAttribute("aria-selected",active?"true":"false");
   });
   if(scrollTop)document.querySelector(".km24AdminTabs")?.scrollIntoView({behavior:"smooth",block:"start"});
 }
 document.querySelectorAll("[data-admin-tab]").forEach(b=>b.onclick=()=>showAdminTab(b.dataset.adminTab,true));
 document.querySelectorAll("[data-admin-open]").forEach(b=>b.onclick=()=>showAdminTab(b.dataset.adminOpen,true));
 showAdminTab(adminTabs.includes(window.__km24AdminActiveTab)?window.__km24AdminActiveTab:"overview",false);
 let search=document.getElementById("adminUserSearch");if(search)search.oninput=()=>{let q=search.value.trim().toLowerCase();document.querySelectorAll(".userAdminCard").forEach(c=>c.style.display=!q||c.dataset.search.includes(q)?"":"none")};

 document.querySelectorAll("[data-giveaway-user]").forEach(b=>b.onclick=async()=>{let excluded=b.dataset.giveawayExcluded==="1",reason=null;if(excluded){reason=prompt("Grund für den Ausschluss:","Mehrfachkonto, Spam oder ungültige Inserate.");if(reason===null)return;if(!reason.trim())return alert("Bitte einen Grund eingeben.")}let r=await db.rpc("admin_set_giveaway_exclusion",{p_user_id:b.dataset.giveawayUser,p_excluded:excluded,p_reason:reason,p_campaign_id:"year_end_2026"});if(r.error)return alert(r.error.message);adminPage()});
 document.querySelectorAll("[data-user-status]").forEach(b=>b.onclick=async()=>{
   let target=b.dataset.userStatus,status=b.dataset.status,reason=null;
   if(status==="suspended"){reason=prompt("Grund für die Sperrung:","Verstoss gegen die Plattformregeln.");if(reason===null)return;if(!reason.trim())return alert("Bitte einen Sperrgrund eingeben.");if(!confirm("Nutzer wirklich sperren? Aktive Inserate werden pausiert."))return}
   else if(!confirm("Nutzer wieder freischalten? Pausierte Inserate bleiben vorerst pausiert."))return;
   let r=await db.rpc("set_account_status",{p_user_id:target,p_status:status,p_reason:reason});
   if(r.error)return alert(r.error.message);adminPage();
 });

 document.querySelectorAll("[data-user-address]").forEach(b=>b.onclick=async()=>{
   let target=b.dataset.userAddress,g=await db.rpc("admin_get_user_address",{p_user_id:target});
   if(g.error)return alert(g.error.message);
   let a=g.data||{},street=prompt("Strasse & Hausnummer:",a.street_address||"");
   if(street===null)return;
   let postal=prompt("PLZ:",a.postal_code||"");if(postal===null)return;
   let city=prompt("Ort:",a.city||"");if(city===null)return;
   let canton=prompt("Kanton (optional):",a.canton||"");if(canton===null)return;
   if(!street.trim()||!postal.trim()||!city.trim())return alert("Bitte Strasse, PLZ und Ort vollständig angeben.");
   if(!confirm("Wohnadresse dieses Nutzers wirklich ändern und bestätigen?"))return;
   let r=await db.rpc("admin_update_user_address",{p_user_id:target,p_street_address:street.trim(),p_postal_code:postal.trim(),p_city:city.trim(),p_canton:canton.trim().toUpperCase()||null});
   if(r.error)return alert(r.error.message);
   alert("Wohnadresse wurde aktualisiert.");
   adminPage();
 });

 document.querySelectorAll("[data-risk]").forEach(b=>b.onclick=async()=>{if(!confirm("Sicherheitsfall markieren?"))return;let r=await db.rpc("admin_update_risk_event",{p_event_id:b.dataset.risk,p_status:b.dataset.riskStatus});if(r.error)return alert(r.error.message);adminPage()});
 document.querySelectorAll("[data-report]").forEach(b=>b.onclick=async()=>{
   let status=b.dataset.reportStatus,note=status==="closed"?(prompt("Admin-Notiz (optional):","Bearbeitet und geschlossen.")||null):null;
   let r=await db.rpc("admin_update_report",{p_report_id:b.dataset.report,p_status:status,p_note:note});if(r.error)return alert(r.error.message);adminPage();
 });

 
document.querySelectorAll("[data-support-reply]").forEach(b=>b.onclick=async()=>{
   let s=supports.find(x=>x.id===b.dataset.supportReply);if(!s)return;
   let reply=prompt("Antwort an den Nutzer:",s.public_reply||"");
   if(reply===null||!reply.trim())return;
   let close=confirm("Anfrage nach dem Antworten als erledigt markieren?");
   let r=await db.rpc("admin_update_support",{p_support_id:s.id,p_status:close?"closed":"open",p_note:null,p_reply:reply.trim()});
   if(r.error)return alert(r.error.message);
   alert(s.user_id?"Antwort gespeichert. Der Nutzer erhält eine Benachrichtigung und E-Mail.":"Antwort gespeichert. Die Antwort wird automatisch per E-Mail gesendet.");
   adminPage()
 });

 document.querySelectorAll("[data-support]").forEach(b=>b.onclick=async()=>{
   let status=b.dataset.supportStatus,note=status==="closed"?(prompt("Interne Notiz (optional):","Bearbeitet.")||null):null;
   let r=await db.rpc("admin_update_support",{p_support_id:b.dataset.support,p_status:status,p_note:note,p_reply:null});if(r.error)return alert(r.error.message);adminPage();
 });

 document.querySelectorAll("[data-listing-action]").forEach(b=>b.onclick=async()=>{let action=b.dataset.action,reason=null;if(action==="pause"){reason=prompt("Grund für das Pausieren:","Verstoss gegen die Plattformregeln.");if(reason===null)return;if(!reason.trim())return alert("Bitte einen Grund eingeben.");if(!confirm("Inserat wirklich pausieren? Der Verkäufer wird informiert."))return}else if(!confirm("Inserat wieder freischalten?"))return;let r=await db.rpc("admin_moderate_listing",{p_listing_id:b.dataset.listingAction,p_action:action,p_reason:reason});if(r.error)return alert(r.error.message);adminPage()});


}
init();
