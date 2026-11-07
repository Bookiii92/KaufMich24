
(function(){
  if(window.__km24IOSCategoryVisualOnlyV2)return;
  window.__km24IOSCategoryVisualOnlyV2=true;
  function sync(){
    try{
      var h=(location.hash||'').split('?')[0];
      if(document.body)document.body.classList.toggle('km24CategoryRoute',h.indexOf('#/category/')===0);
    }catch(_){}
  }
  addEventListener('hashchange',function(){setTimeout(sync,0)},{passive:true});
  addEventListener('pageshow',function(){setTimeout(sync,0)},{passive:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();
})();
