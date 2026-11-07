
(function(){
 if(window.__km24MacCompatV1)return;window.__km24MacCompatV1=true;
 var ua=navigator.userAgent||'';
 var mac=/Macintosh|Mac OS X/i.test(ua)&&!(navigator.maxTouchPoints>1&&/Macintosh/i.test(ua));
 if(!mac)return;
 var safari=/Safari/i.test(ua)&&!/Chrome|Chromium|CriOS|Edg|OPR|Firefox|FxiOS/i.test(ua);
 document.documentElement.classList.add('km24MacDesktop');
 if(safari)document.documentElement.classList.add('km24MacSafari');
 var sel='.buyOverlay,.imageLightbox,.km24PromoChoiceOverlay,.km24PostCreatePromoOverlay,.km24WatcherModalOverlay,.km24AddressPromptOverlay,.km24ReportOverlay,.km24PurposeOverlay,.km24ContactOverlay,.km24OfferOverlay';
 function hidden(el){
  if(!el)return true;
  if(el.hasAttribute('hidden')||el.getAttribute('aria-hidden')==='true'||el.classList.contains('hide'))return true;
  try{var s=getComputedStyle(el);return s.display==='none'||s.visibility==='hidden'||Number(s.opacity||1)===0}catch(e){return false}
 }
 function sync(){
  try{
   var list=document.querySelectorAll(sel),i,el;
   for(i=0;i<list.length;i++){el=list[i];if(hidden(el))el.style.pointerEvents='none';else if(el.style.pointerEvents==='none')el.style.removeProperty('pointer-events')}
   var ai=document.getElementById('kmAiPanel');if(ai){if(hidden(ai)||!ai.classList.contains('open'))ai.style.pointerEvents='none';else ai.style.removeProperty('pointer-events')}
   var lang=document.getElementById('km24LangSelect');if(lang){lang.disabled=false;lang.style.pointerEvents='auto'}
   var me=document.getElementById('meBtn');if(me)me.style.pointerEvents='auto';
   var pub=document.getElementById('km24PublishBtn')||document.getElementById('km24SellWizardPublish');if(pub)pub.style.pointerEvents='auto';
  }catch(e){}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){sync();setTimeout(sync,120)});else sync();
 addEventListener('hashchange',function(){setTimeout(sync,20);setTimeout(sync,180)});
 addEventListener('pageshow',function(e){setTimeout(function(){sync();if(e&&e.persisted&&typeof window.route==='function'){try{window.route()}catch(x){}}},30)});
 document.addEventListener('click',function(){setTimeout(sync,0)},true);
 try{var app=document.getElementById('app');if(app&&window.MutationObserver){var t=0;new MutationObserver(function(){clearTimeout(t);t=setTimeout(sync,40)}).observe(app,{childList:true,subtree:false})}}catch(e){}
})();
