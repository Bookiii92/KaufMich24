
(function(){
 "use strict";
 if(window.__km24TwoWorldsV3)return;
 window.__km24TwoWorldsV3=true;
 var ID="km24WorldsHubV3", timer=0;
 function route(){return ((location.hash||"#/").split("?")[0]||"#/")}
 function inScope(){var r=route();return r==="#/"||r==="#"||r.indexOf("#/services")===0}
 function area(){
   if(route().indexOf("#/services")===0)return "services";
   try{
     var params=new URLSearchParams((location.hash||"").split("?")[1]||"");
     var direct=params.get("area");
     if(direct==="jobs"||direct==="market")return direct;
     return sessionStorage.getItem("km24HomeAreaV1")==="jobs"||localStorage.getItem("km24HomeAreaV1")==="jobs"?"jobs":"market";
   }catch(_){return "market"}
 }
 function ensure(){
   var app=document.getElementById("app");
   if(!app||!app.parentNode)return null;
   var hub=document.getElementById(ID);
   if(!hub){
     hub=document.createElement("section");hub.id=ID;hub.setAttribute("aria-label","KaufMich24 Bereiche");
     hub.innerHTML='<nav class="km24WorldMainV3" aria-label="Hauptbereiche">'+
       '<a class="km24WorldMainLinkV3" data-km24-main-v3="market" data-km24-go-v3="market" href="#/?area=market"><span class="km24WorldIconV3" aria-hidden="true">🛍️</span><strong>Marktplatz</strong><small>Kaufen · Verkaufen · Auktionen</small></a>'+
       '<a class="km24WorldMainLinkV3" data-km24-main-v3="work" data-km24-go-v3="jobs" href="#/?area=jobs" aria-expanded="false" aria-controls="km24WorldSubV3"><span class="km24WorldIconV3" aria-hidden="true">🤝</span><strong>Jobs & Services</strong><small>Arbeit · Aufträge · Hilfe</small></a>'+
       '</nav>'+
       '<nav class="km24WorldSubV3" id="km24WorldSubV3" aria-label="Jobs und Dienstleistungen" hidden>'+
       '<a class="km24WorldSubLinkV3" data-km24-sub-v3="jobs" data-km24-go-v3="jobs" href="#/?area=jobs">💼 Jobs</a>'+
       '<a class="km24WorldSubLinkV3" data-km24-sub-v3="services" data-km24-go-v3="services" href="#/services">🛠️ Dienstleistungen</a></nav>';
     hub.addEventListener("click",function(event){
       var link=event.target&&event.target.closest&&event.target.closest("[data-km24-go-v3]");
       if(!link)return;
       var selected=link.getAttribute("data-km24-go-v3");
       if(selected==="market"||selected==="jobs"){
         try{sessionStorage.setItem("km24HomeAreaV1",selected);localStorage.setItem("km24HomeAreaV1",selected)}catch(_){}
       }
       setTimeout(sync,80);
     });
   }
   if(hub.parentNode!==app.parentNode||hub.nextElementSibling!==app)app.parentNode.insertBefore(hub,app);
   return hub;
 }
 function sync(){
   var hub=ensure();if(!hub)return;
   var visible=inScope();hub.hidden=!visible;if(!visible)return;
   var selected=area(),work=selected!=="market";
   var marketLink=hub.querySelector('[data-km24-main-v3="market"]');
   var workLink=hub.querySelector('[data-km24-main-v3="work"]');
   var subs=hub.querySelector("#km24WorldSubV3");
   if(marketLink){marketLink.classList.toggle("is-active",!work);if(!work)marketLink.setAttribute("aria-current","page");else marketLink.removeAttribute("aria-current")}
   if(workLink){workLink.classList.toggle("is-active",work);workLink.setAttribute("aria-expanded",work?"true":"false")}
   if(subs){subs.hidden=!work;subs.querySelectorAll("[data-km24-sub-v3]").forEach(function(link){var active=link.getAttribute("data-km24-sub-v3")===selected;link.classList.toggle("is-active",active);if(active)link.setAttribute("aria-current","page");else link.removeAttribute("aria-current")})}
 }
 function schedule(){clearTimeout(timer);timer=setTimeout(sync,70)}
 function start(){
   var app=document.getElementById("app");
   if(app)new MutationObserver(schedule).observe(app,{childList:true});
   sync();
 }
 addEventListener("hashchange",schedule);
 addEventListener("popstate",schedule);
 addEventListener("pageshow",schedule);
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
 setTimeout(sync,300);setTimeout(sync,900);
})();
