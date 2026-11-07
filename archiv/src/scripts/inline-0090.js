
(function(){
  if(window.__km24IOSHeaderControlsV259)return;window.__km24IOSHeaderControlsV259=true;
  function isiOS(){try{return /iPhone|iPad|iPod/i.test(navigator.userAgent||'')||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}catch(e){return false}}
  if(!isiOS())return;
  function currentLang(){try{return window.km24Language?window.km24Language():(document.getElementById('km24LangSelect')||{}).value||'de'}catch(e){return 'de'}}
  function closeLang(){var m=document.getElementById('km24IOSLangMenu'),b=document.getElementById('km24IOSLangBtn');if(m)m.classList.remove('open');if(b)b.setAttribute('aria-expanded','false')}
  function paintLang(){var cur=currentLang(),b=document.getElementById('km24IOSLangBtn'),m=document.getElementById('km24IOSLangMenu');if(b)b.textContent=String(cur||'de').toUpperCase();if(m){var bs=m.querySelectorAll('button[data-lang]'),i;for(i=0;i<bs.length;i++)bs[i].classList.toggle('active',bs[i].getAttribute('data-lang')===cur)}}
  function ensureLang(){
    var picker=document.querySelector('header .km24LangPicker'),nativeSel=document.getElementById('km24LangSelect');if(!picker||!nativeSel)return;
    nativeSel.tabIndex=-1;nativeSel.setAttribute('aria-hidden','true');
    var b=document.getElementById('km24IOSLangBtn');
    if(!b){b=document.createElement('button');b.id='km24IOSLangBtn';b.type='button';b.setAttribute('aria-label','Sprache wählen');b.setAttribute('aria-haspopup','true');b.setAttribute('aria-expanded','false');picker.appendChild(b);b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();var m=document.getElementById('km24IOSLangMenu');if(!m)return;var open=!m.classList.contains('open');m.classList.toggle('open',open);b.setAttribute('aria-expanded',open?'true':'false')});}
    var m=document.getElementById('km24IOSLangMenu');
    if(!m){m=document.createElement('div');m.id='km24IOSLangMenu';m.setAttribute('role','menu');m.innerHTML='<button type="button" data-lang="de">DE</button><button type="button" data-lang="fr">FR</button><button type="button" data-lang="it">IT</button><button type="button" data-lang="en">EN</button>';document.body.appendChild(m);m.addEventListener('click',function(e){var t=e.target;while(t&&t!==m&&!t.getAttribute('data-lang'))t=t.parentNode;if(!t||t===m)return;var lang=t.getAttribute('data-lang');e.preventDefault();e.stopPropagation();try{if(window.km24SetLanguage)window.km24SetLanguage(lang);nativeSel.value=lang}catch(x){}paintLang();closeLang()});}
    paintLang();
  }
  function isCloseTarget(t){while(t&&t!==document){if(t.id==='kmAiClose')return true;t=t.parentNode}return false}
  function forceCloseAI(e){if(!isCloseTarget(e.target))return;try{e.preventDefault();e.stopPropagation()}catch(x){}var p=document.getElementById('kmAiPanel');if(p)p.classList.remove('open')}
  document.addEventListener('click',forceCloseAI,true);
  document.addEventListener('click',function(e){var p=document.querySelector('header .km24LangPicker'),m=document.getElementById('km24IOSLangMenu');if(!m||!m.classList.contains('open'))return;if((p&&p.contains(e.target))||m.contains(e.target))return;closeLang()},false);
  addEventListener('km24:language',paintLang);
  addEventListener('hashchange',function(){closeLang();setTimeout(ensureLang,30)});
  addEventListener('pageshow',function(){setTimeout(ensureLang,30)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureLang,{once:true});else ensureLang();
  setTimeout(ensureLang,150);setTimeout(ensureLang,700);
})();
