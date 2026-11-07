
(function(){
 if(window.__km24ThemeRuntimeV1)return;window.__km24ThemeRuntimeV1=true;
 var root=document.documentElement;
 var media=window.matchMedia?window.matchMedia('(prefers-color-scheme: dark)'):null;
 function pref(){try{var p=localStorage.getItem('km24Theme')||'light';return /^(light|dark|system)$/.test(p)?p:'light'}catch(e){return 'light'}}
 function actual(p){return p==='system'?(media&&media.matches?'dark':'light'):p}
 function apply(p,save){
  if(!/^(light|dark|system)$/.test(p))p='light';
  if(save){try{localStorage.setItem('km24Theme',p)}catch(e){}}
  var a=actual(p);
  root.setAttribute('data-km24-theme-pref',p);
  root.setAttribute('data-km24-theme',a);
  var icon=document.getElementById('km24ThemeIcon');if(icon)icon.textContent=p==='system'?'◐':(a==='dark'?'🌙':'☀️');
  var btn=document.getElementById('km24ThemeBtn');if(btn){btn.setAttribute('aria-label','Darstellung: '+(p==='light'?'Hell':p==='dark'?'Dunkel':'System'));btn.title='Darstellung: '+(p==='light'?'Hell':p==='dark'?'Dunkel':'System')}
  document.querySelectorAll('[data-theme-choice]').forEach(function(x){x.classList.toggle('active',x.getAttribute('data-theme-choice')===p)});
  var meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content',a==='dark'?'#111315':'#ffffff');
 }
 function bind(){
  var btn=document.getElementById('km24ThemeBtn'),menu=document.getElementById('km24ThemeMenu');if(!btn||!menu)return;
  if(btn.dataset.bound==='1'){apply(pref(),false);return}btn.dataset.bound='1';
  btn.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();menu.hidden=!menu.hidden;if(!menu.hidden)apply(pref(),false)});
  menu.addEventListener('click',function(e){var c=e.target.closest('[data-theme-choice]');if(!c)return;e.preventDefault();e.stopPropagation();apply(c.getAttribute('data-theme-choice'),true);menu.hidden=true});
  document.addEventListener('click',function(e){if(!e.target.closest('.km24ThemeWrap'))menu.hidden=true});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')menu.hidden=true});
  apply(pref(),false);
 }
 if(media){var onMedia=function(){if(pref()==='system')apply('system',false)};try{media.addEventListener('change',onMedia)}catch(e){try{media.addListener(onMedia)}catch(_){}}}
 bind();addEventListener('pageshow',bind);addEventListener('hashchange',function(){setTimeout(bind,30)});
})();
