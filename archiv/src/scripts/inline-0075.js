
(function(){
  if(window.__km24ChatCompactMobileV2)return;
  window.__km24ChatCompactMobileV2=true;
  function mobile(){return window.matchMedia&&window.matchMedia('(max-width:900px)').matches}
  function apply(){
    if(!mobile())return;
    var page=document.querySelector('.km24MessagesPage.km24HasActive');
    if(!page)return;
    var policy=page.querySelector('.km24ChatPolicy');
    if(policy && !policy.querySelector('.km24PolicyToggle') && policy.querySelector('.km24PolicyExplain')){
      var btn=document.createElement('button');
      btn.type='button';btn.className='km24PolicyToggle';btn.textContent='ℹ️ So funktioniert es';
      var h=policy.querySelector('h4');
      if(h)h.insertAdjacentElement('afterend',btn);else policy.insertBefore(btn,policy.firstChild);
      btn.onclick=function(){
        var open=policy.classList.toggle('km24PolicyExpanded');
        btn.textContent=open?'Weniger anzeigen':'ℹ️ So funktioniert es';
        setTimeout(function(){var box=page.querySelector('#chatMessages');if(box)box.scrollTop=box.scrollHeight},60);
      };
    }
    var box=page.querySelector('#chatMessages');
    if(box && !box.dataset.km24CompactScrolled){
      box.dataset.km24CompactScrolled='1';
      requestAnimationFrame(function(){box.scrollTop=box.scrollHeight});
      setTimeout(function(){box.scrollTop=box.scrollHeight},120);
    }
  }
  var obs=new MutationObserver(function(){clearTimeout(window.__km24ChatCompactTimer);window.__km24ChatCompactTimer=setTimeout(apply,30)});
  function start(){apply();if(document.body)obs.observe(document.body,{childList:true,subtree:true})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  addEventListener('hashchange',function(){setTimeout(apply,40)});
  addEventListener('resize',function(){setTimeout(apply,80)},{passive:true});
})();
