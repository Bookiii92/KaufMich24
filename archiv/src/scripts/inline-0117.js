
(function(){
  if(window.__km24SellFixedNavV1)return;window.__km24SellFixedNavV1=true;
  var t=0;
  function onSell(){return ((location.hash||'').split('?')[0]==='#/sell')}
  function sync(){
    clearTimeout(t);
    t=setTimeout(function(){
      try{
        var bodyNav=document.querySelector('body>.km24SellWizardNav');
        if(!onSell()){
          if(bodyNav)bodyNav.remove();
          return;
        }
        var nav=bodyNav||document.querySelector('#sf .km24SellWizardNav');
        if(!nav)return;
        var form=document.getElementById('sf');
        var pub=nav.querySelector('#km24SellWizardPublish');
        if(pub&&form&&form.id)pub.setAttribute('form',form.id);
        if(nav.parentElement!==document.body)document.body.appendChild(nav);
      }catch(_){}
    },20);
  }
  addEventListener('hashchange',sync,{passive:true});
  addEventListener('pageshow',sync,{passive:true});
  addEventListener('scroll',sync,{passive:true});
  var app=document.getElementById('app');
  if(app&&window.MutationObserver)new MutationObserver(sync).observe(app,{childList:true,subtree:true});
  sync();setTimeout(sync,180);setTimeout(sync,600);
})();
