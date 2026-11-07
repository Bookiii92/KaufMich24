
(function(){
 if(window.__km24IOSGlobalBlockerFixV1)return;window.__km24IOSGlobalBlockerFixV1=true;
 function isiOS(){try{return /iPhone|iPad|iPod/i.test(navigator.userAgent||"")||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1)}catch(_){return false}}
 if(!isiOS())return;
 try{sessionStorage.setItem("km24CookieJoeAutoMode","auto")}catch(_){}
 function clean(){
   try{var joe=document.getElementById("km24JoePrefBackdrop");if(joe)joe.remove()}catch(_){}
   try{document.body&&document.body.classList.remove("km24IOSHasBlockingOverlay")}catch(_){}
 }
 clean();
 if(document.body&&window.MutationObserver){new MutationObserver(function(){clean()}).observe(document.body,{childList:true,subtree:false})}
 addEventListener("pageshow",function(){setTimeout(clean,0)},{passive:true});
 addEventListener("hashchange",function(){setTimeout(clean,0)},{passive:true});
})();
