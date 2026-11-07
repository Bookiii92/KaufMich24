
(function(){
 if(window.__km24CookieJoeGuideV1)return;window.__km24CookieJoeGuideV1=true;
 const SVG='<svg viewBox="0 0 92 98" role="img" aria-label="Cookie Joe"><g class="km24JoeCostumeCape"><path d="M21 48Q12 59 16 78Q27 73 36 62L34 50Z" fill="#2a1737" stroke="#4b2a1a" stroke-width="2.2"/><path d="M68 48Q79 58 76 77Q66 72 58 62L60 50Z" fill="#2a1737" stroke="#4b2a1a" stroke-width="2.2"/></g><g class="km24JoeBody"><path d="M18 17c3-8 12-13 23-13h10c15 0 28 10 30 24 1 6-2 8-6 9 5 4 6 11 3 16 4 4 3 12-1 16-6 7-17 11-30 11H38C21 79 10 68 10 51c0-8 3-15 8-20-3-4-3-9 0-14Z" fill="#c98a52" stroke="#5b321d" stroke-width="4"/><circle cx="31" cy="24" r="4.2" fill="#6d3b22"/><circle cx="60" cy="21" r="4.5" fill="#6d3b22"/><circle cx="23" cy="48" r="3.8" fill="#6d3b22"/><circle cx="66" cy="52" r="4.2" fill="#6d3b22"/><circle cx="48" cy="67" r="3.4" fill="#6d3b22"/><g class="km24JoeEye"><ellipse cx="37" cy="39" rx="7.4" ry="10" fill="#3b241a" stroke="#4b2a1a" stroke-width="2.5"/><circle cx="38" cy="41" r="5.5" fill="#2b1a12"/><circle cx="40.1" cy="38.6" r="1.5" fill="#d8944f"/></g><g class="km24JoeEye"><ellipse cx="57" cy="38" rx="7.4" ry="10" fill="#3b241a" stroke="#4b2a1a" stroke-width="2.5"/><circle cx="56" cy="40" r="5.5" fill="#2b1a12"/><circle cx="58.1" cy="37.6" r="1.5" fill="#d8944f"/></g><path d="M36 55c6 7 16 7 22 0" fill="none" stroke="#4f2a19" stroke-width="3.2" stroke-linecap="round"/><path d="M41 58c3 3 9 3 12 0" fill="none" stroke="#ee7863" stroke-width="2.4" stroke-linecap="round"/><path d="M79 13c-4 0-7 3-7 7 0 3 2 5 5 6-3 1-5 4-5 7" fill="#fff7ea" stroke="#5b321d" stroke-width="3"/></g><g class="km24JoeArm"><path d="M73 52c7-3 10-8 12-14" fill="none" stroke="#5b321d" stroke-width="4" stroke-linecap="round"/><path d="M83 38c1-6 7-9 9-5 2 3-1 6-3 7 4 0 6 3 4 6-3 4-9 1-11-2" fill="#fff" stroke="#5b321d" stroke-width="3" stroke-linejoin="round"/></g><path d="M18 58c-7 0-10 5-13 10" fill="none" stroke="#5b321d" stroke-width="4" stroke-linecap="round"/><path d="M5 68c-2 4 1 8 5 7 3-1 4-4 4-6" fill="#fff" stroke="#5b321d" stroke-width="3"/><path d="M33 78v11M59 78v11" stroke="#5b321d" stroke-width="4" stroke-linecap="round"/><path d="M26 88c8-4 14-2 15 4-6 4-13 3-17 0Z" fill="#138a5b" stroke="#5b321d" stroke-width="3"/><path d="M53 90c7-4 14-2 16 3-5 4-13 4-18 1Z" fill="#138a5b" stroke="#5b321d" stroke-width="3"/><circle class="km24JoeCrumb c1" cx="84" cy="18" r="2.7" fill="#c98a52" stroke="#5b321d" stroke-width="1.3"/><circle class="km24JoeCrumb c2" cx="88" cy="26" r="2" fill="#c98a52" stroke="#5b321d" stroke-width="1.1"/><g class="km24JoeHalloween"><path d="M22 13Q46 -8 72 14L60 18H32Z" fill="#24132f" stroke="#4b2a1a" stroke-width="2.4"/><path d="M17 17Q46 10 76 18Q73 23 46 23Q20 23 17 17Z" fill="#2f183d" stroke="#4b2a1a" stroke-width="2.4"/><path d="M29 16H66L64 20H31Z" fill="#e4772f"/><rect x="82" y="56" width="13" height="13" rx="4" fill="#e57a2f" stroke="#5b321d" stroke-width="2"/><path d="M85 56Q88 51 92 56" fill="none" stroke="#5b321d" stroke-width="2"/><path d="M85.5 62l2.2-2 2.2 2 2.2-2" fill="none" stroke="#3b2015" stroke-width="1.4" stroke-linecap="round"/></g></svg>';
 let lastRoute="",timer=0,manualCollapsed=false,autoMode="auto";
 try{
   const savedMode=sessionStorage.getItem("km24CookieJoeAutoMode");
   if(savedMode==="manual"||savedMode==="auto")autoMode=savedMode;
 }catch(e){}
 manualCollapsed=autoMode==="manual";

 function routeInfo(){
   const h=(location.hash||"#/").split("?")[0];
   if(h==="#/"||h==="#")return["Willkommen bei KaufMich24","Starte mit der Suche oder wähle eine Kategorie. Mit + kannst du jederzeit ein Inserat erstellen."];
   if(h==="#/start")return["Schnell loslegen","Hier siehst du die wichtigsten Vorteile. Danach kannst du direkt stöbern oder dich registrieren."];
   if(h==="#/create")return["Was möchtest du erstellen?","Wähle Verkauf, Auktion, Gesuch oder Dienstleistung – danach siehst du nur die passenden Felder."];
   if(h==="#/sell"||h.startsWith("#/edit/"))return["Tipp fürs Inserat","Gute Fotos zuerst, dann Titel und Angaben prüfen. Pflichtfelder werden markiert – lieber klar als zu viel Text."];
   if(h.startsWith("#/listing/"))return["Vor dem Kauf kurz prüfen","Achte auf Preis, Zustand und Standort. Offene Fragen am besten zuerst über den KaufMich24-Chat klären."];
   if(h.startsWith("#/category/"))return["Schneller zum passenden Angebot","Nutze Filter nur so weit wie nötig. Zu viele Filter können gute Treffer ausblenden."];
   if(h==="#/wanted"||h.startsWith("#/wanted/"))return["Gesuch genauer beschreiben","Modell, Zustand, Budget und Region helfen anderen Nutzern, dir schneller das Richtige anzubieten."];
   if(h.startsWith("#/messages"))return["Sicher schreiben","Bleib für Absprachen möglichst im KaufMich24-Chat und kläre Übergabe sowie Zahlung eindeutig."];
   if(h==="#/notifications")return["Nichts Wichtiges verpassen","Tippe eine Benachrichtigung an, um direkt zur passenden Aktion oder zum Inserat zu springen."];
   if(h==="#/me")return["Dein KaufMich24-Konto","Hier findest du Inserate, Käufe, Verkäufe, Punkte, Feedback und Einstellungen an einem Ort."];
   if(h==="#/buyer")return["Deine Käufe im Blick","Hier siehst du deine Käufe und offenen Schritte. Bei Fragen kannst du direkt zum Verkäufer wechseln."];
   if(h==="#/sales")return["Deine Verkäufe im Blick","Halte Status und Nachrichten aktuell, damit Käufer sofort wissen, wie es weitergeht."];
   if(h.startsWith("#/saved-searches"))return["Suchaufträge sparen Zeit","Speichere eine Suche, wenn du etwas Bestimmtes suchst. So findest du neue passende Angebote schneller."];
   if(h.startsWith("#/services"))return["Services vergleichen","Achte auf Leistungsumfang, Preis, Einsatzgebiet und Bewertungen, bevor du einen Auftrag bestätigst."];
   if(h==="#/fees")return["Gebühren & Punkte","Hier siehst du transparent, welche Leistungen kostenlos sind und wofür Punkte oder Gebühren eingesetzt werden."];
   if(h==="#/giveaway")return["Gewinnspiel","Prüfe hier deinen Fortschritt und die Teilnahmebedingungen, damit dir kein notwendiger Schritt fehlt."];
   if(h.startsWith("#/verification"))return["Verifizierung","Fotografiere Dokumente hell, vollständig und scharf. Unleserliche Bilder führen meist zu einer manuellen Prüfung."];
   if(h.startsWith("#/login"))return["Willkommen","Mit einem Konto kannst du kaufen, verkaufen, Nachrichten schreiben und Suchaufträge speichern."];
   if(h==="#/support")return["Hilfe finden","Beschreibe dein Problem möglichst genau. So bekommst du schneller die passende Lösung."];
   if(h==="#/feedback")return["Deine Meinung hilft","Kurzes, konkretes Feedback ist am hilfreichsten – besonders wenn du sagst, auf welcher Seite etwas auffällt."];
   if(h==="#/admin")return["Admin-Tipp","Prüfe zuerst offene Meldungen, Freigaben und Fehlerhinweise. So bleiben Nutzerprobleme möglichst kurz offen."];
   if(h==="#/terms"||h==="#/privacy"||h==="#/imprint"||h==="#/account-delete")return["Gut zu wissen","Hier findest du die rechtlichen und Kontoinformationen. Wichtige Punkte sind bewusst übersichtlich gegliedert."];
   return["Cookie Joe Tipp","Du kannst jederzeit über Start, Suche, Verkaufen, Nachrichten oder Konto zur wichtigsten Funktion wechseln."];
 }

 function chooseAutoMode(w){
   if(document.getElementById("km24JoePrefBackdrop"))return;
   const lang=window.km24Language?window.km24Language():"de";
   const copy={
     de:["COOKIE JOE · EINSTELLUNG","Wie soll Cookie Joe sich verhalten?","Soll die Tipp-Blase auf einer neuen Seite automatisch wieder erscheinen?","Ja, automatisch öffnen","Nein, nur wenn ich Cookie Joe antippe"],
     fr:["COOKIE JOE · RÉGLAGE","Comment Cookie Joe doit-il se comporter ?","La bulle d'aide doit-elle réapparaître automatiquement sur une nouvelle page ?","Oui, l’ouvrir automatiquement","Non, seulement si je touche Cookie Joe"],
     it:["COOKIE JOE · IMPOSTAZIONE","Come deve comportarsi Cookie Joe?","Il fumetto dei suggerimenti deve riapparire automaticamente su una nuova pagina?","Sì, aprilo automaticamente","No, solo quando tocco Cookie Joe"],
     en:["COOKIE JOE · SETTING","How should Cookie Joe behave?","Should the tip bubble automatically appear again on a new page?","Yes, open automatically","No, only when I tap Cookie Joe"]
   }[lang]||null;
   const t=copy||["COOKIE JOE · EINSTELLUNG","Wie soll Cookie Joe sich verhalten?","Soll die Tipp-Blase auf einer neuen Seite automatisch wieder erscheinen?","Ja, automatisch öffnen","Nein, nur wenn ich Cookie Joe antippe"];
   const back=document.createElement("div");
   back.id="km24JoePrefBackdrop";
   back.innerHTML='<div id="km24JoePrefDialog" role="dialog" aria-modal="true"><small>'+t[0]+'</small><b>'+t[1]+'</b><p>'+t[2]+'</p><div class="km24JoePrefActions"><button type="button" class="km24JoePrefAuto">'+t[3]+'</button><button type="button" class="km24JoePrefManual">'+t[4]+'</button></div></div>';
   document.body.appendChild(back);
   const save=function(mode){
     autoMode=mode;
     manualCollapsed=true;
     /* Nur tab-bezogen speichern: bleibt beim Wechsel zwischen Start, Verkaufen usw. erhalten, ist nach Schliessen des Tabs wieder weg. */
     try{sessionStorage.setItem("km24CookieJoeAutoMode",mode)}catch(e){}
     w.classList.add("km24JoeCollapsed");
     back.remove();
   };
   const autoBtn=back.querySelector(".km24JoePrefAuto");
   const manualBtn=back.querySelector(".km24JoePrefManual");
   let picked=false;
   const pick=function(mode,e){
     if(picked)return;
     picked=true;
     if(e){try{e.preventDefault()}catch(_){}try{e.stopPropagation()}catch(_){}}
     save(mode);
   };
   const bindChoice=function(btn,mode){
     if(!btn)return;
     btn.onclick=function(e){pick(mode,e)};
   };
   bindChoice(autoBtn,"auto");
   bindChoice(manualBtn,"manual");
 }

 function ensure(){
   let w=document.getElementById("km24CookieJoeGuide");
   if(!w){
     w=document.createElement("aside");
     w.id="km24CookieJoeGuide";
     w.setAttribute("aria-label","Cookie Joe Tipp");
     w.innerHTML='<button type="button" class="km24JoeGuideMascot" aria-label="Cookie Joe Tipp anzeigen">'+SVG+'</button>'+
       '<div class="km24JoeGuideBubble"><button type="button" class="km24JoeGuideToggle" aria-label="'+(window.km24T?window.km24T("Tipp schließen"):"Tipp schließen")+'">×</button>'+
       '<small class="km24JoeGuideKicker">COOKIE JOE · TIPP</small><b class="km24JoeGuideTitle"></b><p class="km24JoeGuideText"></p></div>';
     document.body.appendChild(w);
     w.querySelector(".km24JoeGuideToggle").onclick=function(e){
       try{e.preventDefault();e.stopPropagation()}catch(_){}
       autoMode="manual";
       manualCollapsed=true;
       try{sessionStorage.setItem("km24CookieJoeAutoMode","manual")}catch(_){}
       w.classList.add("km24JoeCollapsed");
     };
     w.querySelector(".km24JoeGuideMascot").onclick=function(){
       manualCollapsed=false;
       w.classList.remove("km24JoeCollapsed","km24JoeRoutePulse");
       void w.offsetWidth;w.classList.add("km24JoeRoutePulse");
       setTimeout(()=>w.classList.remove("km24JoeRoutePulse"),500)
     };
     if(autoMode==="manual")w.classList.add("km24JoeCollapsed");
   }
   const route=(location.hash||"#/").split("?")[0]||"#/";
   const changed=route!==lastRoute;
   const info=routeInfo();
   w.querySelector(".km24JoeGuideTitle").textContent=info[0];
   w.querySelector(".km24JoeGuideText").textContent=info[1];
   if(changed){
     lastRoute=route;
     if(autoMode==="manual"){
       manualCollapsed=true;
       w.classList.add("km24JoeCollapsed");
       w.classList.remove("km24JoeRoutePulse");
     }else if(autoMode==="auto"){
       manualCollapsed=false;
       w.classList.remove("km24JoeCollapsed","km24JoeRoutePulse");
       void w.offsetWidth;w.classList.add("km24JoeRoutePulse");
       setTimeout(()=>w.classList.remove("km24JoeRoutePulse"),500);
     }else if(manualCollapsed){
       w.classList.add("km24JoeCollapsed");
       w.classList.remove("km24JoeRoutePulse");
     }else{
       w.classList.remove("km24JoeCollapsed","km24JoeRoutePulse");
       void w.offsetWidth;w.classList.add("km24JoeRoutePulse");
       setTimeout(()=>w.classList.remove("km24JoeRoutePulse"),500);
     }
   }else if(manualCollapsed)w.classList.add("km24JoeCollapsed");
 }

 function schedule(){clearTimeout(timer);timer=setTimeout(ensure,55)}
 addEventListener("hashchange",schedule);addEventListener("pageshow",schedule);
 
 setTimeout(ensure,50);setTimeout(ensure,250);setTimeout(ensure,900);
})();
