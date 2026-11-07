
(function(){
  if(window.__km24PersonalReadabilityV7)return;
  window.__km24PersonalReadabilityV7=true;

  function isLight(){return document.documentElement.getAttribute('data-km24-theme')==='light'}
  function important(el,prop,val){try{el.style.setProperty(prop,val,'important')}catch(_){}}
  function clear(el,prop){try{el.style.removeProperty(prop)}catch(_){}}

  function patchButton(btn){
    if(!btn)return;
    var kids=[btn].concat(Array.from(btn.querySelectorAll('*')));
    if(isLight()){
      btn.dataset.km24PersonalV7='1';
      important(btn,'background','#ffffff');
      important(btn,'background-image','none');
      important(btn,'border-color','#cfd6dd');
      important(btn,'box-shadow','0 2px 8px rgba(15,23,42,.08)');
      important(btn,'color','#111827');
      important(btn,'-webkit-text-fill-color','#111827');
      important(btn,'opacity','1');
      kids.forEach(function(el){
        important(el,'color','#111827');
        important(el,'-webkit-text-fill-color','#111827');
        important(el,'text-shadow','none');
        important(el,'opacity','1');
      });
      var first=btn.querySelector('span:first-child');
      if(first){important(first,'font-weight','850')}
      var arrow=btn.querySelector('.km24MiniArrow');
      if(arrow){important(arrow,'color','#374151');important(arrow,'-webkit-text-fill-color','#374151')}
    }else if(btn.dataset.km24PersonalV7==='1'){
      ['background','background-image','border-color','box-shadow','color','-webkit-text-fill-color','opacity'].forEach(function(p){clear(btn,p)});
      kids.forEach(function(el){['color','-webkit-text-fill-color','text-shadow','opacity','font-weight'].forEach(function(p){clear(el,p)})});
      delete btn.dataset.km24PersonalV7;
    }
  }

  function run(){
    document.querySelectorAll('#km24PersonalizedHome .km24MiniBtn,.km24MiniBtn').forEach(patchButton);
  }

  var queued=0;
  function queue(){clearTimeout(queued);queued=setTimeout(run,20)}
  run();
  try{new MutationObserver(queue).observe(document.body,{childList:true,subtree:true})}catch(_){}
  try{new MutationObserver(queue).observe(document.documentElement,{attributes:true,attributeFilter:['data-km24-theme']})}catch(_){}
  addEventListener('hashchange',queue,{passive:true});
  addEventListener('pageshow',queue,{passive:true});
  setTimeout(run,80);setTimeout(run,300);setTimeout(run,1000);
})();
