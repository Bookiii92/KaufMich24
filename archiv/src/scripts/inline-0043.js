(function(){
 if(window.__km24AccountCompositorHotfixV3)return;window.__km24AccountCompositorHotfixV3=true;
 function sync(){
   var samsung=/SamsungBrowser/i.test(navigator.userAgent||"");
   var on=samsung&&(location.hash||"")==="#/me";
   document.documentElement.classList.toggle("km24AccountPreNoGhost",on);
   document.body.classList.toggle("km24AccountNoGhost",on);
 }
 sync();addEventListener("hashchange",()=>{sync();setTimeout(sync,0)});addEventListener("pageshow",sync);
})();