(function(){
 function sync(){
   var samsung=/SamsungBrowser/i.test(navigator.userAgent||"");
   document.documentElement.classList.toggle("km24AccountPreNoGhost",samsung&&(location.hash||"")==="#/me");
 }
 sync();addEventListener("hashchange",sync);addEventListener("pageshow",sync);
})();