
(function(){
  if(window.__km24ListingMoreProfessionalV3)return;
  window.__km24ListingMoreProfessionalV3=true;
  var SEL='details.km24ListingMore';
  var touchX=null,touchY=null;
  var suppressUntil=0;

  function closeAll(except){
    try{
      document.querySelectorAll(SEL+'[open]').forEach(function(d){
        if(d!==except)d.removeAttribute('open');
      });
    }catch(_){}
  }

  function navSafeTop(){
    try{
      var nav=document.querySelector('.km24BottomNav');
      if(nav){
        var r=nav.getBoundingClientRect();
        if(r.height>0)return r.top-14;
      }
    }catch(_){}
    return (window.innerHeight||document.documentElement.clientHeight||0)-18;
  }

  function ensureVisible(d){
    if(!d||!d.open)return;
    suppressUntil=Date.now()+750;
    var run=function(){
      try{
        var menu=d.querySelector('.km24ListingMoreMenu');
        if(!menu)return;
        var r=menu.getBoundingClientRect();
        var safe=navSafeTop();
        if(r.bottom>safe){
          var delta=r.bottom-safe+18;
          window.scrollBy({top:delta,behavior:'smooth'});
        }
      }catch(_){}
    };
    if(window.requestAnimationFrame)requestAnimationFrame(function(){requestAnimationFrame(run)});
    else setTimeout(run,30);
  }

  document.addEventListener('toggle',function(e){
    try{
      var d=e.target;
      if(!d||!d.matches||!d.matches(SEL)||!d.open)return;
      closeAll(d);
      ensureVisible(d);
    }catch(_){}
  },true);

  document.addEventListener('pointerdown',function(e){
    try{
      if(!(e.target&&e.target.closest&&e.target.closest(SEL)))closeAll(null);
    }catch(_){}
  },true);

  document.addEventListener('touchstart',function(e){
    try{
      var t=e.touches&&e.touches[0];
      touchX=t?t.clientX:null;
      touchY=t?t.clientY:null;
    }catch(_){}
  },{passive:true,capture:true});

  document.addEventListener('touchmove',function(e){
    try{
      if(Date.now()<suppressUntil)return;
      var t=e.touches&&e.touches[0];
      if(!t||touchX===null||touchY===null)return;
      if(Math.abs(t.clientY-touchY)>8||Math.abs(t.clientX-touchX)>8)closeAll(null);
    }catch(_){}
  },{passive:true,capture:true});

  window.addEventListener('wheel',function(){
    if(Date.now()>=suppressUntil)closeAll(null);
  },{passive:true});
  window.addEventListener('orientationchange',function(){closeAll(null)},{passive:true});
  window.addEventListener('hashchange',function(){closeAll(null)});
})();
