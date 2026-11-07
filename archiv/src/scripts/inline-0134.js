
(function(){
  if(window.__km24SellCtaAnchorV3)return;
  window.__km24SellCtaAnchorV3=true;
  var timer=0;
  function onSell(){return ((location.hash||'').split('?')[0])==='#/sell'}
  function sync(){
    try{
      var nav=document.querySelector('.km24SellWizardNav');
      var bottom=document.querySelector('.km24BottomNav');
      var form=document.getElementById('sf');
      if(!onSell()){
        if(nav&&nav.parentElement===bottom)nav.remove();
        return;
      }
      if(!nav||!bottom||!window.matchMedia('(max-width:700px)').matches)return;
      if(nav.parentElement!==bottom)bottom.appendChild(nav);
      nav.classList.add('km24AnchoredToBottomNav');
      var pub=document.getElementById('km24SellWizardPublish');
      if(pub&&form){if(!form.id)form.id='sf';pub.setAttribute('form',form.id)}
      var back=document.getElementById('km24SellWizardBack');
      nav.classList.toggle('km24OnlyNext',!!back&&back.classList.contains('km24WizardHidden'));
    }catch(_){}
  }
  function schedule(ms){clearTimeout(timer);timer=setTimeout(sync,ms||0)}
  addEventListener('hashchange',function(){schedule(30);setTimeout(sync,180);setTimeout(sync,700)});
  addEventListener('pageshow',function(){schedule(30);setTimeout(sync,250)});
  addEventListener('resize',function(){schedule(60)},{passive:true});
  if(window.visualViewport){visualViewport.addEventListener('resize',function(){schedule(30)},{passive:true});visualViewport.addEventListener('scroll',function(){schedule(30)},{passive:true})}
  document.addEventListener('click',function(){if(onSell()){setTimeout(sync,0);setTimeout(sync,120)}},true);
  setTimeout(sync,0);setTimeout(sync,150);setTimeout(sync,500);setTimeout(sync,1200);setTimeout(sync,2500);
})();
