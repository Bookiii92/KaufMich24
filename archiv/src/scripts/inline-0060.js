
(function(){
 if(window.__km24SamsungDetailWidthFixV1)return;
 window.__km24SamsungDetailWidthFixV1=true;
 function narrowSamsung(){
   try{
     if(!/SamsungBrowser/i.test(navigator.userAgent||""))return false;
     var vals=[
       window.innerWidth||9999,
       document.documentElement.clientWidth||9999,
       window.visualViewport&&visualViewport.width||9999,
       window.screen&&screen.width||9999
     ].filter(function(v){return Number(v)>0});
     return Math.min.apply(Math,vals)<=820;
   }catch(e){return false}
 }
 function sync(){
   var isDetail=(location.hash||"").indexOf("#/listing/")===0;
   var on=isDetail&&narrowSamsung();
   document.documentElement.classList.toggle("km24SamsungDetailFix",on);
   if(on){
     try{document.documentElement.scrollLeft=0;document.body.scrollLeft=0}catch(e){}
     setTimeout(function(){
       try{document.documentElement.scrollLeft=0;document.body.scrollLeft=0}catch(e){}
     },80);
   }
 }
 sync();
 addEventListener("hashchange",function(){setTimeout(sync,0)});
 addEventListener("pageshow",sync);
 addEventListener("resize",sync,{passive:true});
 if(window.visualViewport)visualViewport.addEventListener("resize",sync,{passive:true});
 var app=document.getElementById("app");
 if(app)new MutationObserver(function(){if((location.hash||"").indexOf("#/listing/")===0)setTimeout(sync,0)}).observe(app,{childList:true,subtree:false});
})();
