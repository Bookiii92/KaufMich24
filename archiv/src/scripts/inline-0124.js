
(function(){
 if(window.__km24JobFormFixV2)return;window.__km24JobFormFixV2=true;
 var KEY='km24JobFormModeV2';
 function route(){return (location.hash||'').split('?')[0]||'#/' }
 function setMode(v){try{sessionStorage.setItem(KEY,v)}catch(_){}}
 function getMode(){try{return sessionStorage.getItem(KEY)||''}catch(_){return ''}}
 function clearMode(){try{sessionStorage.removeItem(KEY)}catch(_){}}
 function panelByHeading(root,name){
  if(!root)return null;
  return [].slice.call(root.querySelectorAll('section.panel,details.panel')).find(function(x){var h=x.querySelector('h3');return h&&(h.textContent||'').trim()===name})||null;
 }
 function employer(){
  if(route()!=='#/sell'||getMode()!=='employer')return false;
  var form=document.getElementById('sf');if(!form)return false;
  document.body.classList.add('km24JobEmployerForm');document.body.classList.remove('km24JobSeekerForm');
  if(form.dataset.km24JobEmployerReady!=='1'){
   var choice=form.querySelector('#saleChoices [data-s="fixed"]')||form.querySelector('#saleChoices [data-s]');
   if(choice){choice.dataset.s='on_request';try{choice.click()}catch(_){} }
   form.dataset.km24JobEmployerReady='1';
  }
  var title=document.getElementById('title');if(title){title.placeholder='z. B. Automobil-Mechatroniker 80–100%';var lab=title.closest('label');if(lab&&lab.childNodes.length)for(var i=0;i<lab.childNodes.length;i++)if(lab.childNodes[i].nodeType===3&&lab.childNodes[i].textContent.trim()){lab.childNodes[i].textContent='Stellentitel';break}}
  var desc=document.getElementById('desc');if(desc)desc.placeholder='Aufgaben, Pensum, Arbeitsort, Anforderungen, Eintritt und Benefits ...';
  var article=title&&title.closest('section.panel');if(article){var h=article.querySelector('h3');if(h)h.textContent='Stelle beschreiben'}
  var loc=panelByHeading(form,'Standort & Übergabe')||form.querySelector('.km24SellLocationPanel');if(loc){var lh=loc.querySelector('h3');if(lh)lh.textContent='Arbeitsort'}
  var intro=document.querySelector('.km24SellIntro h1');if(intro)intro.textContent='Stelleninserat erstellen';
  var introP=document.querySelector('.km24SellIntro p');if(introP)introP.textContent='Stellentitel, Beschreibung und Arbeitsort – ohne Verkaufsart oder Preis.';
  var bottom=document.getElementById('km24SellMobileBar');if(bottom){var b=bottom.querySelector('b');if(b)b.textContent='Stelleninserat veröffentlichen';var btn=bottom.querySelector('button');if(btn)btn.textContent='Veröffentlichen'}
  var pub=document.getElementById('km24SimplePublish');if(pub)pub.textContent='Stelleninserat veröffentlichen';
  return true;
 }
 function seeker(){
  if(route()!=='#/wanted/new'||getMode()!=='seeker')return false;
  var form=document.getElementById('wantedForm');if(!form)return false;
  document.body.classList.add('km24JobSeekerForm');document.body.classList.remove('km24JobEmployerForm');
  var h=document.querySelector('.formPage .head h1');if(h)h.textContent='Stellengesuch erstellen';
  var p=document.querySelector('.formPage .head p.mut');if(p)p.textContent='Beschreibe deinen gewünschten Job, deine Erfahrung und deinen Arbeitsort.';
  var wt=document.getElementById('wtitle');if(wt)wt.placeholder='z. B. Chauffeur Kat. B, Verkäufer/in oder Lagermitarbeiter/in';
  var btn=form.querySelector('button.btn.primary');if(btn)btn.textContent='Stellengesuch veröffentlichen';
  return true;
 }
 function sync(){
  var r=route();
  if(r!=='#/sell'&&r!=='#/wanted/new'){document.body.classList.remove('km24JobEmployerForm','km24JobSeekerForm')}
  employer();seeker();
  if(!['#/create','#/sell','#/wanted/new','#/verification','#/buyer-activation'].some(function(x){return r===x||r.indexOf(x)===0})&&r.indexOf('#/login')!==0)clearMode();
 }
 document.addEventListener('click',function(e){
  var a=e.target&&e.target.closest&&e.target.closest('[data-km24-job-create]');
  if(a){setMode(a.getAttribute('data-km24-job-create'));return}
  var normal=e.target&&e.target.closest&&e.target.closest('.km24CreateChoice');
  if(normal&&!normal.hasAttribute('data-km24-job-create'))clearMode();
 },true);
 addEventListener('hashchange',function(){setTimeout(sync,20);setTimeout(sync,100);setTimeout(sync,350)});
 addEventListener('pageshow',function(){setTimeout(sync,30);setTimeout(sync,180)});
 try{new MutationObserver(function(){setTimeout(sync,25)}).observe(document.getElementById('app')||document.body,{childList:true,subtree:true})}catch(_){}
 setTimeout(sync,80);setTimeout(sync,400);
})();
