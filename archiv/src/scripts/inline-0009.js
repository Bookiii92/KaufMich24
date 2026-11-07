
(function(){
  function syncCategoryRoute(){
    var on=(location.hash||'').indexOf('#/category/')===0;
    document.body&&document.body.classList.toggle('km24CategoryLightRoute',on);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',syncCategoryRoute,{once:true});
  else syncCategoryRoute();
  addEventListener('hashchange',function(){setTimeout(syncCategoryRoute,0)});
  addEventListener('pageshow',syncCategoryRoute);
})();
