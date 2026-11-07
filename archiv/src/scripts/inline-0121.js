
(function(){
 if(window.__km24SellPublishFixV4)return;window.__km24SellPublishFixV4=true;
 var syncTimer=0,msgTimer=0,smObserved=null;
 function isSell(){var h=(location.hash||'').split('?')[0];return h==='#/sell'||h==='#/verkaufen'}
 function byId(id){return document.getElementById(id)}
 function saleType(form){try{var b=form.querySelector('#saleChoices [data-s].on');return b&&b.dataset?b.dataset.s:'fixed'}catch(_){return 'fixed'}}
 function ensureMsg(){var e=byId('km24PublishFixMsg');if(e)return e;e=document.createElement('div');e.id='km24PublishFixMsg';document.body.appendChild(e);return e}
 function showMsg(text,kind,stay){var e=ensureMsg();e.textContent=text||'';e.className=(text?'show ':'')+(kind||'');clearTimeout(msgTimer);if(text&&!stay)msgTimer=setTimeout(function(){e.className=''},4200)}
 function fieldValue(id){var e=byId(id);return e?String(e.value||'').trim():''}
 function reveal(el){if(!el)return;var more=el.closest&&el.closest('.km24SimpleMore');if(more)more.open=true;var loc=el.closest&&el.closest('.km24SellLocationPanel');if(loc){loc.dataset.km24ForcedOpen='1';loc.classList.remove('km24SimpleLocationCollapsed');var b=byId('km24SimpleLocationSummary');if(b)b.classList.remove('show')}try{el.focus({preventScroll:true})}catch(_){try{el.focus()}catch(__){}}try{el.scrollIntoView({behavior:'smooth',block:'center'})}catch(_){} }
 function missing(form){
  var checks=[
   ['catRoot','Bitte eine Hauptkategorie wählen.'],
   ['cat','Bitte eine Unterkategorie wählen.'],
   ['title','Bitte einen Titel eingeben.']
  ];
  var sale=saleType(form);
  if(sale==='fixed'||sale==='negotiable')checks.push(['price','Bitte einen Preis eingeben.']);
  if(sale==='auction'){checks.push(['start','Bitte einen Startpreis eingeben.']);checks.push(['auctionTime','Bitte eine Endzeit wählen.'])}
  checks.push(['zip','Bitte eine gültige 4-stellige PLZ eingeben.']);checks.push(['city','Bitte den Ort eingeben.']);
  for(var i=0;i<checks.length;i++){
   var id=checks[i][0],el=byId(id),v=fieldValue(id);
   if(!el)continue;
   if(id==='title'&&v.length<3)return{el:el,msg:'Bitte einen Titel mit mindestens 3 Zeichen eingeben.'};
   if(id==='zip'&&!/^\d{4}$/.test(v))return{el:el,msg:checks[i][1]};
   if((id==='price'||id==='start')&&(v===''||!isFinite(Number(v))||Number(v)<0))return{el:el,msg:checks[i][1]};
   if(!v)return{el:el,msg:checks[i][1]};
  }
  return null;
 }
 function directSubmit(form){
  var miss=missing(form);if(miss){showMsg(miss.msg,'warn',true);reveal(miss.el);return}
  showMsg('Inserat wird veröffentlicht …','good',true);
  try{
   var ev;
   try{ev=new Event('submit',{bubbles:true,cancelable:true})}
   catch(_){ev=document.createEvent('Event');ev.initEvent('submit',true,true)}
   if(typeof form.onsubmit==='function'){form.dispatchEvent(ev);return}
   form.noValidate=true;
   if(typeof form.requestSubmit==='function'){form.requestSubmit();return}
   if(typeof window.km24RequestSubmit==='function'){window.km24RequestSubmit(form);return}
  }catch(err){showMsg('Veröffentlichen konnte nicht gestartet werden. Bitte nochmals versuchen.','warn',true)}
 }
 function sync(){
  if(!isSell())return;
  var form=byId('sf');if(!form)return;
  var bar=byId('km24SellMobileBar');if(bar){
   var b=bar.querySelector('b');if(b)b.textContent='Inserat veröffentlichen';
   var small=byId('km24SellMobileState');if(small&&/Prüfen|Pflichtfeld/i.test(small.textContent||''))small.textContent='Bereit zum Veröffentlichen';
   var btn=bar.querySelector('button');if(btn){btn.textContent='Veröffentlichen';btn.style.pointerEvents='auto';btn.disabled=false}
  }
  var pub=byId('km24SimplePublish');if(pub){pub.textContent='Inserat veröffentlichen';pub.style.pointerEvents='auto'}
  var sm=byId('sm');if(sm&&smObserved!==sm){smObserved=sm;try{new MutationObserver(function(){var t=(sm.textContent||'').trim();if(!t)return;var low=t.toLowerCase();showMsg(t,(low.indexOf('erstellt')>=0||low.indexOf('veröff')>=0)?'good':'warn',low.indexOf('erstellt')<0)}).observe(sm,{childList:true,subtree:true,characterData:true})}catch(_){}}
 }
 document.addEventListener('click',function(e){
  if(!isSell())return;var btn=null;try{btn=e.target&&e.target.closest&&e.target.closest('#km24SellMobileBar button,#km24SimplePublish')}catch(_){}
  if(!btn)return;
  var form=byId('sf');if(!form)return;
  try{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}catch(_){}
  directSubmit(form);
 },true);
 function schedule(){clearTimeout(syncTimer);syncTimer=setTimeout(sync,35)}
 addEventListener('hashchange',schedule);addEventListener('pageshow',schedule);
 try{new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true})}catch(_){}
 setTimeout(sync,40);setTimeout(sync,180);setTimeout(sync,500);
})();
