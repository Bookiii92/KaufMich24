
(function(){
 if(window.__km24IOSEmergencyTapRecoveryV1)return;window.__km24IOSEmergencyTapRecoveryV1=true;
 function ios(){try{return /iPhone|iPad|iPod/i.test(navigator.userAgent||"")||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1)}catch(_){return false}}
 if(!ios())return;
 var known=".buyOverlay,.imageLightbox,.km24PromoChoiceOverlay,.km24PostCreatePromoOverlay,.km24WatcherModalOverlay,.km24AddressPromptOverlay,.km24ReportOverlay,.km24PurposeOverlay,.km24ContactOverlay,.km24OfferOverlay,#km24JoePrefBackdrop";
 function routeSafe(){var h=(location.hash||"#/").split("?")[0];return h==="#/"||h==="#"||h===""||h==="#/start"||h.indexOf("#/category/")===0}
 function clearBlockers(){
  try{
   if(document.documentElement){document.documentElement.style.pointerEvents="auto"}
   if(document.body){document.body.style.pointerEvents="auto";document.body.classList.remove("km24IOSHasBlockingOverlay");if(!document.activeElement||!/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName||""))document.body.classList.remove("km24KeyboardOpen")}
   var joe=document.getElementById("km24JoePrefBackdrop");if(joe)joe.remove();
   if(!routeSafe())return;
   document.querySelectorAll(known).forEach(function(el){try{el.remove()}catch(_){}});
   var vw=Math.max(document.documentElement.clientWidth||0,innerWidth||0),vh=Math.max(document.documentElement.clientHeight||0,innerHeight||0);
   document.body&&document.body.querySelectorAll("*").forEach(function(el){
    try{var s=getComputedStyle(el),z=parseInt(s.zIndex||"0",10)||0;if(s.position!=="fixed"||z<5000)return;var r=el.getBoundingClientRect();if(r.width<vw*.85||r.height<vh*.75)return;if(el.classList.contains("km24BottomNav")||el.id==="kmAiPanel"||el.id==="km24IOSLangMenu")return;el.style.setProperty("pointer-events","none","important")}catch(_){}
   });
  }catch(_){}
 }
 clearBlockers();
 [80,250,700,1400,2600].forEach(function(ms){setTimeout(clearBlockers,ms)});
 addEventListener("pageshow",function(){clearBlockers();setTimeout(clearBlockers,120)},{passive:true});
 addEventListener("hashchange",function(){clearBlockers();setTimeout(clearBlockers,120)},{passive:true});
})();
