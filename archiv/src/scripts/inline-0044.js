(function(){
    if(window.__km24SamsungCompositorSafeV4)return;
    window.__km24SamsungCompositorSafeV4=true;
    function syncSafe(){
      try{
        var ua=navigator.userAgent||"";
        var affected=/SamsungBrowser/i.test(ua);
        document.documentElement.classList.toggle("km24SamsungSafe",affected);
        var motion=document.getElementById("km24AutumnMotion");
        if(motion)motion.style.display=affected?"none":"";
      }catch(e){}
    }
    syncSafe();
    addEventListener("pageshow",syncSafe);
    addEventListener("hashchange",function(){setTimeout(syncSafe,0)});
    addEventListener("resize",syncSafe,{passive:true});
  })();