
(function(){
 "use strict";
 if(window.__km24ThreeWorldsV1)return;
 window.__km24ThreeWorldsV1=true;
 var t=0;
 function base(){return (location.hash||"#/").split("?")[0]||"#/"}
 function home(){return base()==="#/"||base()==="#"}
 function services(){return base().indexOf("#/services")===0}
 function homeTabs(){
  if(!home())return;
  var nav=document.querySelector("#km24AreaBarSection .km24AreaSwitch");
  if(!nav||nav.querySelector('[data-km24-world="services"]'))return;
  var a=document.createElement("a");
  a.href="#/services";
  a.setAttribute("data-km24-world","services");
  a.setAttribute("aria-label","Dienstleistungen entdecken und Aufträge ausschreiben");
  a.innerHTML='<span class="km24WorldEmoji" aria-hidden="true">🛠️</span><span class="km24WorldLabel">Dienstleistungen</span>';
  nav.appendChild(a);
 }
 function serviceTabs(){
  if(!services())return;
  var app=document.getElementById("app");
  if(!app||!app.querySelector(".km24SvcHero")||app.querySelector("#km24ThreeWorldsServices"))return;
  var section=document.createElement("section");
  section.id="km24ThreeWorldsServices";
  section.setAttribute("aria-label","Bereiche von KaufMich24");
  section.innerHTML='<div class="wrap"><nav class="km24ThreeWorldsNav" aria-label="Bereich wählen">'+
   '<a href="#/?area=market"><span class="km24WorldEmoji" aria-hidden="true">🛍️</span><span class="km24WorldLabel">Marktplatz</span></a>'+
   '<a href="#/?area=jobs"><span class="km24WorldEmoji" aria-hidden="true">💼</span><span class="km24WorldLabel">Jobs</span></a>'+
   '<a href="#/services" aria-current="page"><span class="km24WorldEmoji" aria-hidden="true">🛠️</span><span class="km24WorldLabel">Dienstleistungen</span></a>'+
   '</nav></div>';
  app.insertBefore(section,app.firstChild);
 }
 function sync(){try{homeTabs();serviceTabs()}catch(e){console.warn("KM24 worlds",e)}}
 function schedule(){clearTimeout(t);t=setTimeout(sync,65)}
 addEventListener("hashchange",schedule);
 addEventListener("pageshow",schedule);
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});
 var app=document.getElementById("app");
 if(app)new MutationObserver(schedule).observe(app,{childList:true});
 schedule();
 setTimeout(sync,220);
})();
