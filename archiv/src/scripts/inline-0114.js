
(function(){
  if(window.__km24SellPlusNativeV2)return;
  window.__km24SellPlusNativeV2=true;
  var lastTap=0;

  function onSell(){return ((location.hash||'').split('?')[0]==='#/sell')}
  function getPlus(t){try{return t&&t.closest?t.closest('.km24WizardHeroBadge'):null}catch(_){return null}}

  function normalizePlus(){
    if(!onSell())return;
    var old=document.querySelector('.km24WizardHeroBadge');
    if(!old)return;
    if(old.tagName!=='BUTTON'){
      var b=document.createElement('button');
      b.type='button';
      b.className=old.className;
      b.innerHTML=old.innerHTML||'＋';
      b.setAttribute('aria-label','Fotos hinzufügen');
      b.dataset.km24Bound='1';
      b.dataset.km24NativePlus='1';
      try{old.replaceWith(b)}catch(_){return}
      old=b;
    }else{
      old.type='button';
      old.setAttribute('aria-label','Fotos hinzufügen');
      old.dataset.km24Bound='1';
      old.dataset.km24NativePlus='1';
    }
    old.onclick=null;
    old.onkeydown=function(e){
      if(e.key==='Enter'||e.key===' '){activate(e,old)}
    };
  }

  function activate(ev,known){
    var plus=known||getPlus(ev&&ev.target);
    if(!plus||!onSell())return;
    var now=Date.now();
    if(now-lastTap<650){
      try{ev.preventDefault();ev.stopImmediatePropagation()}catch(_){}
      return;
    }
    lastTap=now;
    try{ev.preventDefault();ev.stopImmediatePropagation()}catch(_){}

    var input=document.getElementById('photos');
    if(input){
      try{input.click();return}catch(_){}
    }
    var target=document.querySelector('#sf [data-sell-section="photos"] .photoAdd')||document.getElementById('catRoot');
    if(target){
      try{target.scrollIntoView({behavior:'smooth',block:'center'})}catch(_){try{target.scrollIntoView()}catch(__){}}
      try{target.focus({preventScroll:true})}catch(_){try{target.focus()}catch(__){}}
    }
  }

  function delegated(ev){
    var plus=getPlus(ev.target);
    if(plus)activate(ev,plus);
  }

  document.addEventListener('pointerup',delegated,true);
  document.addEventListener('touchend',delegated,{capture:true,passive:false});
  document.addEventListener('click',delegated,true);
  addEventListener('hashchange',function(){setTimeout(normalizePlus,40);setTimeout(normalizePlus,220)});
  addEventListener('pageshow',function(){setTimeout(normalizePlus,50)});
  document.addEventListener('DOMContentLoaded',function(){setTimeout(normalizePlus,0)},{once:true});
  setTimeout(normalizePlus,80);
  setTimeout(normalizePlus,350);
  setTimeout(normalizePlus,900);
})();
