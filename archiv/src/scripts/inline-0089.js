
(function(){
 if(window.__km24HeaderCanonicalV1)return;window.__km24HeaderCanonicalV1=true;
 var watcher=null,watchTimer=0;
 function placeAi(){
  try{
   var fab=document.getElementById('kmAiFab'),lang=document.querySelector('.km24LangPicker'),nav=lang&&lang.parentElement;
   if(!fab||!nav)return false;
   if(fab.parentElement!==nav||fab.previousElementSibling!==lang)lang.insertAdjacentElement('afterend',fab);
   fab.type='button';fab.classList.add('km24AiTopButton');
   fab.innerHTML='<span class="km24AiTopIcon" aria-hidden="true">✨</span><span class="km24AiTopLabel">KI Hilfe</span>';
   fab.setAttribute('aria-label','KI Hilfe öffnen');fab.setAttribute('title','KI Hilfe');
   return true;
  }catch(_){return false}
 }
 function sellFeedback(){
  try{
   var form=document.getElementById('sf');if(!form)return;
   var btn=form.querySelector('.livePreview .btn.primary');if(btn){btn.id='km24PublishBtn';btn.type='submit'}
   if(form.dataset.km24PublishFeedback==='1')return;form.dataset.km24PublishFeedback='1';
   form.addEventListener('invalid',function(ev){
    try{var m=document.getElementById('sm'),txt='Bitte prüfe die markierten Pflichtfelder und versuche es nochmals.';
     if(m)m.innerHTML=typeof N==='function'?N(txt,1):'<div class="err">'+txt+'</div>';
     var el=ev.target;setTimeout(function(){try{el.scrollIntoView({behavior:'smooth',block:'center'});el.focus({preventScroll:true})}catch(_){try{el.focus()}catch(__){}}},30);
    }catch(_){}
   },true);
  }catch(_){}
 }
 function sync(){placeAi();sellFeedback()}
 function watchBriefly(){
  try{if(watcher)watcher.disconnect();clearTimeout(watchTimer);if(placeAi())return;
   watcher=new MutationObserver(function(){if(placeAi()){watcher.disconnect();watcher=null}});
   watcher.observe(document.body||document.documentElement,{childList:true,subtree:true});
   watchTimer=setTimeout(function(){if(watcher){watcher.disconnect();watcher=null}},3000);
  }catch(_){}
 }
 function run(){sync();watchBriefly();setTimeout(sync,120);setTimeout(sync,450)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
 addEventListener('hashchange',function(){setTimeout(run,30)});addEventListener('pageshow',function(){setTimeout(run,30)});
})();
