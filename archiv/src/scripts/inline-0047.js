
(function(){
  if(window.__km24PerfV1)return;window.__km24PerfV1=true;
  // Avoid needless duplicate route renders when the same hash is assigned repeatedly.
  let lastHash=location.hash;
  addEventListener('hashchange',()=>{lastHash=location.hash},{passive:true});
  window.km24SameRoute=function(next){return String(next||'')===String(lastHash||'')}
})();
