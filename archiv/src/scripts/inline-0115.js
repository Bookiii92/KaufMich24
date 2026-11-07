
(function(){
  if(window.__km24FullsitePolishV1)return;window.__km24FullsitePolishV1=true;
  var queued=false;
  function syncRoute(){
    try{
      var h=(location.hash||'#/').split('?')[0];
      if(document.body)document.body.classList.toggle('km24AccountSettingsRoute',h==='#/me');
    }catch(_){}
  }
  function dedupeNotificationPrefs(){
    try{
      var items=document.querySelectorAll('#kmNotifyPrefs');
      if(items.length>1){for(var i=1;i<items.length;i++)items[i].remove()}
    }catch(_){}
  }
  function run(){queued=false;syncRoute();dedupeNotificationPrefs()}
  function queue(){if(queued)return;queued=true;(window.requestAnimationFrame||setTimeout)(run)}
  syncRoute();dedupeNotificationPrefs();
  addEventListener('hashchange',queue,{passive:true});addEventListener('pageshow',queue,{passive:true});
  try{var root=document.getElementById('app')||document.body;if(root)new MutationObserver(queue).observe(root,{childList:true,subtree:true})}catch(_){}
})();
