
(function(){
 if(window.__km24UxSimplifyV1)return;window.__km24UxSimplifyV1=true;
 let timer=0;
 function h(){return location.hash||"#/"}
 function el(tag,cls,html){const x=document.createElement(tag);if(cls)x.className=cls;if(html!=null)x.innerHTML=html;return x}
 function homeGuide(){
   if(h()!=="#/"||document.querySelector(".km24UxHomeGuide"))return;
   const hero=document.querySelector(".km24HomeHero");if(!hero)return;
   const sec=el("section","km24UxHomeGuide",
     '<div class="wrap"><div class="km24UxGuideBox"><div class="km24UxGuideHead"><div><span class="km24UxKicker">SCHNELL STARTEN</span><h2>Was möchtest du machen?</h2><p>Wähle einfach dein Ziel – KaufMich24 zeigt dir danach nur die passenden Schritte.</p></div></div>'+
     '<div class="km24UxTaskGrid">'+
       '<button type="button" class="km24UxTask" data-ux-scroll="latestSection"><span>🛍️</span><div><b>Etwas kaufen</b><small>Inserate ansehen & filtern</small></div></button>'+
       '<a class="km24UxTask" href="#/create"><span>＋</span><div><b>Etwas verkaufen</b><small>Inserat Schritt für Schritt erstellen</small></div></a>'+
       '<a class="km24UxTask" href="#/wanted"><span>🔎</span><div><b>Ich suche etwas</b><small>Gesuche ansehen oder erstellen</small></div></a>'+
       '<a class="km24UxTask" href="#/services"><span>🛠️</span><div><b>Dienstleistungen</b><small>Service anbieten oder Auftrag finden</small></div></a>'+
     '</div></div></div>');
   hero.insertAdjacentElement("afterend",sec);
   sec.querySelectorAll("[data-ux-scroll]").forEach(b=>b.addEventListener("click",()=>document.getElementById(b.dataset.uxScroll)?.scrollIntoView({behavior:"smooth",block:"start"})));
   try{
     const nav=document.querySelector(".km24CompactNav");
     if(nav&&typeof user!=="undefined"&&!user)nav.style.display="none";
   }catch(_){}
 }
 function createChoice(){
   if(h()!=="#/create")return;
   const grid=document.querySelector(".planGrid");if(!grid||grid.dataset.km24Ux==="1")return;grid.dataset.km24Ux="1";
   if(!grid.querySelector('a[href="#/services"]')){
     const a=el("a","plan km24CreateChoice",'<div style="font-size:42px">🛠️</div><h2>Dienstleistung</h2><p>Biete einen Service an oder erstelle einen Auftrag für Dienstleister.</p><span class="btn primary">Zu den Services</span>');
     a.href="#/services";grid.appendChild(a);
   }
   const info=el("div","km24UxCreateHelp","<b>Nicht sicher?</b> Für einen normalen Gegenstand nimm <b>„Ich verkaufe“</b>. Wenn du etwas Bestimmtes suchst, nimm <b>„Ich suche“</b>. Für Arbeiten und Services ist <b>„Dienstleistung“</b> richtig.");
   grid.insertAdjacentElement("afterend",info);
 }
 function sellGuide(){
   const form=document.getElementById("sf");if(!form||form.dataset.km24Ux==="1")return;form.dataset.km24Ux="1";
   const wrap=form.closest(".wrap");const intro=wrap?.querySelector(":scope > p.mut");
   if(intro)intro.textContent="Du musst nicht alles ausfüllen. Folge einfach den 5 Schritten; optionale Angaben kannst du überspringen.";
   const guide=el("div","km24UxSellGuide",
     '<div class="km24UxSellGuideTop"><b>In 5 einfachen Schritten zum Inserat</b><span>Pflicht zuerst · Extras später</span></div>'+
     '<div class="km24UxSteps">'+
      '<button type="button" class="km24UxStep" data-ux-step="photos"><strong>1 · Fotos</strong><small>Bilder hochladen</small></button>'+
      '<button type="button" class="km24UxStep" data-ux-step="article"><strong>2 · Artikel</strong><small>Titel & Beschreibung</small></button>'+
      '<button type="button" class="km24UxStep" data-ux-step="sale"><strong>3 · Verkaufsart</strong><small>Fixpreis oder Auktion</small></button>'+
      '<button type="button" class="km24UxStep" data-ux-step="price"><strong>4 · Preis</strong><small>Preis festlegen</small></button>'+
      '<button type="button" class="km24UxStep" data-ux-step="location"><strong>5 · Standort</strong><small>Abholung / Versand</small></button>'+
     '</div>');
   if(intro)intro.insertAdjacentElement("afterend",guide);else form.insertAdjacentElement("beforebegin",guide);
   guide.querySelectorAll("[data-ux-step]").forEach(b=>b.onclick=()=>form.querySelector('[data-sell-section="'+b.dataset.uxStep+'"]')?.scrollIntoView({behavior:"smooth",block:"start"}));
   const defs={
     photos:["Schritt 1","Lade zuerst gute Bilder hoch. Die KI kann danach Titel und Beschreibung vorschlagen."],
     article:["Schritt 2","Beschreibe kurz und ehrlich, was verkauft wird und in welchem Zustand es ist."],
     sale:["Schritt 3","Wähle Fixpreis, Verhandelbar, Auktion oder Verschenken."],
     price:["Schritt 4","Lege den Preis fest. Bei Auktionen bestimmst du zusätzlich Startpreis, Dauer und Endzeit."],
     location:["Schritt 5","PLZ und Ort sind Pflicht. Danach wählst du Abholung, Versand oder beides."],
     attachments:["Optional","Videos und Dokumente brauchst du nur, wenn sie für das Inserat wirklich hilfreich sind."]
   };
   Object.entries(defs).forEach(([key,val])=>{
     const p=form.querySelector('[data-sell-section="'+key+'"]');if(!p||p.querySelector(":scope > .km24UxSectionMeta"))return;
     p.prepend(el("div","km24UxSectionMeta","<span>"+val[0]+"</span><small>"+val[1]+"</small>"));
     if(key==="attachments")p.classList.add("km24UxOptionalPanel");
   });
   const pro=form.querySelector(".km24ProOptions");if(pro)pro.classList.add("km24UxOptionalPanel");
   const preview=form.querySelector(".livePreview");if(preview&&!preview.querySelector(".km24UxPreviewNote")){
     const n=el("p","mut km24UxPreviewNote","So sehen Käufer dein Inserat. Prüfe hier Titel, Preis und Bilder vor dem Veröffentlichen.");
     preview.querySelector("h3")?.insertAdjacentElement("afterend",n);
   }
 }
 function account(){
   if(!h().startsWith("#/me"))return;
   const grid=document.querySelector(".km24AccountQuickGrid");if(!grid||grid.dataset.km24Ux==="1")return;grid.dataset.km24Ux="1";
   const secondary=[
     grid.querySelector('a[href="#/fees"]'),
     grid.querySelector('a[href="#/support"]'),
     grid.querySelector('a[href="#/account-delete"]'),
     grid.querySelector('a[data-account-jump="settings"]')
   ].filter(Boolean);
   if(!secondary.length)return;
   const d=el("details","km24UxAccountMore",'<summary><span>⚙️ Weitere Einstellungen & Hilfe</span><small>Profil, Gebühren, Support</small></summary><div class="km24UxAccountMoreGrid"></div>');
   const box=d.querySelector(".km24UxAccountMoreGrid");secondary.forEach(x=>box.appendChild(x));
   grid.insertAdjacentElement("afterend",d);
   const head=document.querySelector(".km24AccountNavHead p");if(head)head.textContent="Hier sind nur die wichtigsten Bereiche. Weitere Einstellungen findest du gesammelt darunter.";
 }
 function detailGuide(){
   if(!h().startsWith("#/listing/")||document.querySelector(".km24UxTradeGuide"))return;
   const side=document.querySelector(".detail .side")||document.querySelector(".detailgrid .side");if(!side)return;
   const d=el("section","panel km24UxTradeGuide",'<h3>🛡️ Einfach & sicher handeln</h3><p>Klär zuerst offene Fragen, danach Übergabe und Zahlung. KaufMich24 verwahrt kein Geld.</p><div class="km24UxTradeSteps"><span>1 · Fragen klären</span><span>2 · Übergabe absprechen</span><span>3 · Kauf/Bid bestätigen</span></div>');
   side.prepend(d);
 }
 function run(){homeGuide();createChoice();sellGuide();account();detailGuide()}
 function schedule(){clearTimeout(timer);timer=setTimeout(run,45)}
 addEventListener("hashchange",schedule);addEventListener("pageshow",schedule);
 
 setTimeout(run,100);
})();
