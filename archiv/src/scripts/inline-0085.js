
(function(){
  if(window.__km24AssistantUiCanonicalV2)return;
  window.__km24AssistantUiCanonicalV2=true;
  function sync(){
    try{
      var fab=document.getElementById('kmAiFab');
      if(fab){fab.setAttribute('aria-label','KI Hilfe öffnen');fab.setAttribute('title','KI Hilfe')}
      var title=document.querySelector('#kmAiPanel .kmAiTitle');
      if(title)title.innerHTML='KI Hilfe <span class="kmAiBadge">mit Cookie Joe</span>';
      var hello=document.querySelector('#kmAiMsgs .kmAiMsg.bot');
      if(hello && /Hallo!/.test(hello.textContent||''))hello.textContent='Hallo! Ich bin Cookie Joe und helfe dir bei Fragen zu KaufMich24. Was möchtest du wissen?';
    }catch(_){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();
  addEventListener('pageshow',sync);
  addEventListener('hashchange',function(){setTimeout(sync,60)});
})();
