
(function(){
  if(window.__km24MobileReadabilityV3)return;
  window.__km24MobileReadabilityV3=true;
  function syncLanguageLabel(){
    try{
      var picker=document.querySelector('.km24LangPicker');
      var sel=document.getElementById('km24LangSelect');
      if(!picker||!sel)return;
      var label=picker.querySelector(':scope > span');
      if(!label){label=document.createElement('span');picker.insertBefore(label,sel)}
      label.textContent=String(sel.value||'de').toUpperCase();
      label.setAttribute('aria-hidden','true');
    }catch(_){}
  }
  document.addEventListener('change',function(e){if(e.target&&e.target.id==='km24LangSelect')setTimeout(syncLanguageLabel,0)},true);
  addEventListener('km24:language',syncLanguageLabel);
  addEventListener('pageshow',syncLanguageLabel,{passive:true});
  addEventListener('hashchange',function(){setTimeout(syncLanguageLabel,30)},{passive:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',syncLanguageLabel,{once:true});else syncLanguageLabel();
  setTimeout(syncLanguageLabel,250);
})();
