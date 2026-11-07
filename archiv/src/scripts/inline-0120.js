
(function(){
 if(window.__km24SellSimpleV3)return;window.__km24SellSimpleV3=true;
 var retry=0,saveTimer=0,lastWasSell=false;
 function isSell(){var h=(location.hash||'').split('?')[0];return h==='#/sell'||h==='#/verkaufen'}
 function byId(id){return document.getElementById(id)}
 function val(id){var e=byId(id);return e?String(e.value||'').trim():''}
 function userKey(){try{return (typeof user!=='undefined'&&user&&user.id)?user.id:'signed-user'}catch(_){return 'signed-user'}}
 function draftKey(){return 'km24-sell-simple-v3-'+userKey()}
 function labelBox(el){if(!el)return null;return el.closest('label')||el.parentElement}
 function setText(el,text){if(el)el.textContent=text}
 function clearOldWizard(form){
  try{document.body.classList.remove('km24SellWizardPage')}catch(_){}
  try{form.classList.remove('km24SellWizardActive')}catch(_){}
  try{form.dataset.km24Wizard='0'}catch(_){}
  document.querySelectorAll('.km24SellWizardHead,.km24SellWizardNav').forEach(function(x){x.remove()});
  form.querySelectorAll('.km24SellStep').forEach(function(x){x.classList.add('km24SellStepActive')});
 }
 function saveDraft(form){
  clearTimeout(saveTimer);saveTimer=setTimeout(function(){
   try{
    var data={};['title','catRoot','cat','price','start','auctionTime','zip','city','desc','cond'].forEach(function(id){var e=byId(id);if(e)data[id]=e.value});
    data.pickup=!!(byId('pickup')&&byId('pickup').checked);data.ship=!!(byId('ship')&&byId('ship').checked);
    localStorage.setItem(draftKey(),JSON.stringify(data));
   }catch(_){}
  },180);
 }
 function restoreDraft(form){
  if(form.dataset.km24SimpleRestored==='1')return;form.dataset.km24SimpleRestored='1';
  try{
   var raw=localStorage.getItem(draftKey());if(!raw)return;var data=JSON.parse(raw)||{};
   ['title','catRoot','cat','price','start','auctionTime','zip','city','desc','cond'].forEach(function(id){var e=byId(id);if(e&&!String(e.value||'').trim()&&data[id]!=null&&String(data[id]).trim()){e.value=data[id];e.dispatchEvent(new Event('change',{bubbles:true}));}});
   ['pickup','ship'].forEach(function(id){var e=byId(id);if(e&&data[id]===true&&!e.checked){e.checked=true;e.dispatchEvent(new Event('change',{bubbles:true}));}});
  }catch(_){}
 }
 function requiredMissing(form){
  var sale=document.body.classList.contains('km24JobEmployerMode')?'on_request':'fixed';try{var b=form.querySelector('#saleChoices [data-s].on');if(b&&b.dataset&&b.dataset.s)sale=b.dataset.s}catch(_){}
  var ids=['catRoot','cat','title','zip','city'];
  if(sale==='fixed'||sale==='negotiable')ids.push('price');
  if(sale==='auction'){ids.push('start');ids.push('auctionTime')}
  return ids.map(byId).filter(function(e){return e&&!e.disabled&&!String(e.value||'').trim()});
 }
 function locationSync(form){
  var panel=form.querySelector('.km24SellLocationPanel'),btn=byId('km24SimpleLocationSummary');if(!panel||!btn)return;
  var zip=val('zip'),city=val('city'),ok=/^[0-9]{4}$/.test(zip)&&!!city;
  if(ok&&panel.dataset.km24ForcedOpen!=='1'){
   panel.classList.add('km24SimpleLocationCollapsed');btn.classList.add('show');
   btn.innerHTML='<span><b>📍 '+zip+' '+city+'</b><small>Standort aus deinem Profil übernommen</small></span><span>Ändern</span>';
  }else{panel.classList.remove('km24SimpleLocationCollapsed');btn.classList.toggle('show',ok)}
 }
 function status(form){
  var miss=requiredMissing(form),st=byId('km24SimpleStatus'),mobile=byId('km24SellMobileState');
  var text=miss.length?('Noch '+miss.length+' Angabe'+(miss.length===1?'':'n')+' nötig'):'Bereit zum Veröffentlichen';
  if(st){st.textContent=text;st.classList.toggle('good',!miss.length);st.classList.toggle('warn',!!miss.length)}
  if(mobile)mobile.textContent=text;
  locationSync(form);
 }
 function showMissing(form,el){
  var more=el&&el.closest('.km24SimpleMore');if(more)more.open=true;
  var loc=el&&el.closest('.km24SellLocationPanel');if(loc){loc.dataset.km24ForcedOpen='1';loc.classList.remove('km24SimpleLocationCollapsed')}
  try{el.focus({preventScroll:true})}catch(_){try{el.focus()}catch(__){}}
  try{el.scrollIntoView({behavior:'smooth',block:'center'})}catch(_){}
 }
 function publish(form){
  status(form);var miss=requiredMissing(form);if(miss.length){showMissing(form,miss[0]);return}
  try{if(typeof window.km24RequestSubmit==='function')window.km24RequestSubmit(form);else if(form.requestSubmit)form.requestSubmit();else form.submit()}catch(_){try{form.requestSubmit()}catch(__){}}
 }
 function buildMore(form,main){
  if(byId('km24SimpleMore'))return;
  var d=document.createElement('details');d.id='km24SimpleMore';d.className='km24SimpleMore';d.innerHTML='<summary>Weitere Angaben <small style="color:var(--mut);font-weight:700">optional</small></summary><div class="km24SimpleMoreBody"></div>';
  var body=d.querySelector('.km24SimpleMoreBody');
  ['desc','cond'].forEach(function(id){var e=labelBox(byId(id));if(e&&main.contains(e))body.appendChild(e)});
  Array.from(main.children).forEach(function(x){
   if(x===d||x.classList.contains('km24SellPhotoPanel')||x.classList.contains('km24SellArticlePanel')||x.classList.contains('km24SellSalePanel')||x.classList.contains('km24SellPricePanel'))return;
   if(x.classList.contains('km24SellOptional')||x.classList.contains('km24ProOptions')||x.classList.contains('km24SellDetailPanel'))body.appendChild(x);
  });
  main.appendChild(d);
 }
 function buildLocation(form,side,main){
  var loc=form.querySelector('.km24SellLocationPanel');if(!loc)return;
  if(!byId('km24SimpleLocationSummary')){
   var b=document.createElement('button');b.type='button';b.id='km24SimpleLocationSummary';b.className='km24SimpleLocationSummary';
   b.onclick=function(){loc.dataset.km24ForcedOpen='1';loc.classList.remove('km24SimpleLocationCollapsed');b.classList.remove('show');setTimeout(function(){try{byId('zip').focus()}catch(_){}},30)};
   main.appendChild(b);
  }
  main.appendChild(loc);
 }
 function buildPreview(form,side,main){
  var preview=side.querySelector('.livePreview')||form.querySelector('.livePreview');if(!preview)return;
  var d=byId('km24SimplePreview');
  if(!d){d=document.createElement('details');d.id='km24SimplePreview';d.className='km24SimplePreview';d.innerHTML='<summary>Vorschau ansehen <small style="color:var(--mut);font-weight:700">optional</small></summary><div class="km24SimplePreviewBody"></div>';main.appendChild(d)}
  var body=d.querySelector('.km24SimplePreviewBody');if(preview.parentElement!==body)body.appendChild(preview);
 }
 function buildPublish(form,main){
  if(!byId('km24SimplePublish')){
   var b=document.createElement('button');b.type='button';b.id='km24SimplePublish';b.className='btn primary km24SimplePublish';b.textContent='Inserat veröffentlichen';b.onclick=function(){publish(form)};main.appendChild(b);
   var s=document.createElement('div');s.id='km24SimpleStatus';s.className='km24SimpleStatus';main.appendChild(s);
  }
  var bar=byId('km24SellMobileBar');if(bar){
   var bb=bar.querySelector('b');if(bb)bb.textContent=(document.body.classList.contains('km24JobEmployerMode')||((location.hash||'').indexOf('job=employer')>=0))?'Stelleninserat veröffentlichen':'Inserat veröffentlichen';
   var btn=bar.querySelector('button');if(btn){btn.textContent='Veröffentlichen';btn.onclick=function(){publish(form)}}
  }
 }
 function polishPanels(form){
  var photo=form.querySelector('.km24SellPhotoPanel'),article=form.querySelector('.km24SellArticlePanel'),sale=form.querySelector('.km24SellSalePanel'),price=form.querySelector('.km24SellPricePanel');
  if(photo){var h=photo.querySelector(':scope > h3');setText(h,'Fotos hinzufügen');var p=photo.querySelector('.km24SellPanelHint');setText(p,'Fotos hochladen – auf Wunsch erstellt die Bilder-KI danach Titel und Beschreibung.')}
  if(article){var h2=article.querySelector(':scope > h3');setText(h2,document.body.classList.contains('km24JobEmployerMode')?'Stelle':'Was verkaufst du?');var p2=article.querySelector('.km24SellPanelHint');setText(p2,document.body.classList.contains('km24JobEmployerMode')?'Beschreibe die offene Stelle kurz und verständlich.':'Kategorie wählen, kurzen Titel eingeben – fertig.')}
  if(sale){var h3=sale.querySelector(':scope > h3');setText(h3,'Wie möchtest du verkaufen?');var p3=sale.querySelector('.km24SellPanelHint');if(p3)p3.remove()}
  if(price){var h4=price.querySelector(':scope > h3');setText(h4,'Preis');}
 }
 function setup(){
  if(!isSell()){
   if(lastWasSell)document.body.classList.remove('km24SellSimplePage');lastWasSell=false;return;
  }
  lastWasSell=true;document.body.classList.add('km24SellSimplePage');
  var form=byId('sf');if(!form){if(retry++<30)setTimeout(setup,100);return}retry=0;
  clearOldWizard(form);form.classList.add('km24SellSimple');
  var main=form.querySelector(':scope > .main'),side=form.querySelector(':scope > .side');if(!main||!side){setTimeout(setup,80);return}
  var intro=document.querySelector('.km24SellIntro');
  if(intro){var h=intro.querySelector('h1'),p=intro.querySelector('p'),badge=intro.querySelector('.km24SellIntroBadge');setText(h,'Inserat erstellen');setText(p,'Fotos, Titel und Preis – den Rest kannst du nur bei Bedarf ergänzen.');setText(badge,'✓ Schnell & unkompliziert')}
  polishPanels(form);restoreDraft(form);buildMore(form,main);buildLocation(form,side,main);buildPreview(form,side,main);buildPublish(form,main);
  if(form.dataset.km24SimpleBound!=='1'){
   form.dataset.km24SimpleBound='1';
   form.addEventListener('input',function(){saveDraft(form);status(form)});
   form.addEventListener('change',function(){saveDraft(form);setTimeout(function(){status(form)},0)});
   form.addEventListener('submit',function(){status(form)},true);
  }
  status(form);
 }
 var timer=0;function schedule(){clearTimeout(timer);timer=setTimeout(setup,70)}
 addEventListener('hashchange',function(){schedule();if(!isSell()&&lastWasSell){try{localStorage.removeItem(draftKey())}catch(_){}}});
 addEventListener('pageshow',schedule);
 var app=document.getElementById('app');if(app)new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
 setTimeout(setup,80);setTimeout(setup,350);
})();
