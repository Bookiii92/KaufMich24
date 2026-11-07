(function(){
 try{
  var ua=navigator.userAgent||"";
  var ios=/iPhone|iPad|iPod/i.test(ua)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
  var android=/Android/i.test(ua);
  var samsung=/SamsungBrowser/i.test(ua);
  document.documentElement.classList.toggle("km24IOS",ios);
  document.documentElement.classList.toggle("km24Android",android);
  document.documentElement.classList.toggle("km24SamsungSafe",samsung);
 }catch(e){}
})();