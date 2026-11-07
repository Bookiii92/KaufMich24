
(function(){
  if(window.__km24AddressJumpHotfixV2)return;
  window.__km24AddressJumpHotfixV2=true;
  var lastHandled=0;

  function buttonFrom(target){
    try{return target&&target.closest&&target.closest("#km24AddressJumpBtn")}catch(_){return null}
  }

  function openAddress(ev){
    var btn=buttonFrom(ev&&ev.target);
    if(!btn)return;
    var now=Date.now();
    if(now-lastHandled<350){
      try{ev.preventDefault();ev.stopPropagation()}catch(_){}
      return;
    }
    lastHandled=now;
    try{ev.preventDefault();ev.stopPropagation()}catch(_){}

    function run(){
      var settings=document.querySelector(".km24ProfileSettings");
      var form=document.getElementById("profileForm");

      if(settings){
        try{settings.open=true}catch(_){}
        try{settings.setAttribute("open","")}catch(_){}
      }

      if(!form){
        try{
          if(typeof me==="function"){
            Promise.resolve(me()).then(function(){setTimeout(run,120)}).catch(function(){});
          }
        }catch(_){}
        return;
      }

      try{
        var el=settings||form;
        var top=el.getBoundingClientRect().top+(window.pageYOffset||document.documentElement.scrollTop||0)-78;
        window.scrollTo({top:Math.max(0,top),behavior:"auto"});
      }catch(_){
        try{(settings||form).scrollIntoView({behavior:"auto",block:"start"})}catch(__){}
      }

      setTimeout(function(){
        try{
          var street=document.getElementById("pstreet");
          var msg=document.getElementById("profileMsg");
          if(msg){
            var txt="Bitte prüfe deine Wohnadresse und ergänze Strasse und Hausnummer. Danach unten bestätigen und Profil speichern.";
            msg.innerHTML=typeof N==="function"?N(txt,false):txt;
          }
          if(street){
            try{street.scrollIntoView({behavior:"auto",block:"center"})}catch(_){}
            try{street.focus({preventScroll:true})}catch(_){try{street.focus()}catch(__){}}
          }
        }catch(_){}
      },80);
    }

    run();
  }

  document.addEventListener("pointerup",openAddress,true);
  document.addEventListener("click",openAddress,true);
  document.addEventListener("touchend",openAddress,{capture:true,passive:false});
})();
