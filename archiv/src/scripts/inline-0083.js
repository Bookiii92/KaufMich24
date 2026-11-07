
(function(){
  if(window.__km24WantedBadgeForceV3)return;
  window.__km24WantedBadgeForceV3=true;
  function fix(){
    ["#km24WantedHomeV2","#wantedSection","#wantedGrid"].forEach(function(sel){
      var scope=document.querySelector(sel);
      if(!scope)return;
      scope.querySelectorAll(".km24ListingCard,.card").forEach(function(c){
        c.classList.add("km24WantedCard");
        var pill=c.querySelector(".km24TypePill");
        if(pill){
          pill.textContent="Gesucht wird";
          pill.classList.add("wanted");
        }
      });
    });
  }
  var timer=0;
  function queue(){clearTimeout(timer);timer=setTimeout(fix,20)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",fix,{once:true});else fix();
  addEventListener("pageshow",queue);
  addEventListener("hashchange",queue);
  setTimeout(fix,100);
  setTimeout(fix,500);
  setTimeout(fix,1200);
  var root=document.getElementById("app")||document.body;
  if(root&&window.MutationObserver)new MutationObserver(queue).observe(root,{childList:true,subtree:true});
})();
