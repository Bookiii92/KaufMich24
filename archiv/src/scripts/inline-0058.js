
(function(){
 if(window.__km24LaunchDeadlineV1)return;window.__km24LaunchDeadlineV1=true;
 const homeHtml='<b>🚀 Kostenlose Startphase</b>'+
   '<p>Die normalen Marketplace-Funktionen bleiben während der Startphase gebührenfrei. Optionale Promotions können weiterhin mit KaufMich24 Punkten oder – sofern angeboten – kostenpflichtig aktiviert werden.</p>'+
   '<p class="km24LaunchAfter">🎁 <strong>Frühstarter:</strong> Die ersten 500 registrierten Nutzer erhalten je nach Reihenfolge 3\'000, 1\'500 oder 1\'000 Punkte. Danach bleiben die regulären Gebühren bewusst tief – unser Ziel ist, dauerhaft zu den günstigsten Schweizer Marktplätzen zu gehören.</p>'+
   '<a href="#/fees">Spätere Tarife ansehen →</a>';
 const feesHtml='<b>🚀 Kostenlose Startphase ohne festes Enddatum</b>'+
   '<p>Für die normale Nutzung werden während der Startphase keine Gebühren erhoben. Das reguläre Gebührenmodell wird erst später aktiviert und rechtzeitig angekündigt. Optionale Promotions können kostenpflichtig sein.</p>'+
   '<div class="km24FeesLaunchFacts"><span><strong>Privat:</strong><br>Basis CHF 0 · Plus CHF 14.90 / 30 Tage · Max CHF 29.90 / 30 Tage</span><span><strong>Firmen & Händler:</strong><br>Starter CHF 0 · Basic CHF 69.90 · Pro CHF 149.90/Monat</span><span><strong>Business Unlimited:</strong><br>CHF 299.90/Monat · unbegrenzt · 0 % KaufMich24-Provision</span></div>'+
   '<p class="km24LaunchAfter"><strong>Unser Preisversprechen:</strong> KaufMich24 soll auch nach der Startphase dauerhaft sehr günstig bleiben und zu den günstigsten Schweizer Marktplätzen gehören.</p>';
 function sync(){
   const h=(location.hash||"#/").split("?")[0];
   if(h==="#/"||h===""){
     const target=document.querySelector(".km24StartBonus");
     if(target&&!document.getElementById("km24LaunchDeadlineHome")){
       const box=document.createElement("div");box.id="km24LaunchDeadlineHome";box.className="km24LaunchDeadline";box.innerHTML=homeHtml;target.appendChild(box);
     }
   }
   if(h==="#/fees"){
     const page=document.querySelector(".km24FeesPage");
     const first=page?.querySelector(":scope > .panel");
     if(first&&!document.getElementById("km24LaunchDeadlineFees")){
       const box=document.createElement("div");box.id="km24LaunchDeadlineFees";box.className="notice km24LaunchDeadline km24FeesLaunchPolicy";box.innerHTML=feesHtml;first.insertAdjacentElement("afterend",box);
     }
   }
 }
 let t=0;function queue(){clearTimeout(t);t=setTimeout(sync,60)}
 const app=document.getElementById("app");if(app)new MutationObserver(queue).observe(app,{childList:true,subtree:true});
 addEventListener("hashchange",queue);addEventListener("pageshow",queue);queue();
})();
