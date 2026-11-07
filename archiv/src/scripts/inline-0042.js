(function(){
 if(window.__km24AccountGhostingHotfixV2)return;window.__km24AccountGhostingHotfixV2=true;
 function sync(){
   var samsung=/SamsungBrowser/i.test(navigator.userAgent||"");
   document.body.classList.toggle("km24AccountNoGhost",samsung&&(location.hash||"")==="#/me");
 }
 sync();addEventListener("hashchange",()=>setTimeout(sync,0));addEventListener("pageshow",sync);
})();