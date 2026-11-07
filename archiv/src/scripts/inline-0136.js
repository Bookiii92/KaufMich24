
(function(){
 if(window.__km24JobFormsV2)return;window.__km24JobFormsV2=true;
 var timer=0;
 function hash(){return location.hash||''}
 function base(){return hash().split('?')[0]||'#/' }
 function stored(){try{var x=JSON.parse(sessionStorage.getItem('km24CreateJobIntent')||'null');return x&&x.kind||''}catch(_){return ''}}
 function mode(){var h=hash();if(h.indexOf('job=employer')>=0)return'employer';if(h.indexOf('job=seeker')>=0)return'seeker';return stored()}
 function hide(el){if(el)el.classList.add('km24JobHide')}
 function setText(el,t){if(el&&el.textContent!==t)el.textContent=t}
 function employer(){
   var on=base()==='#/sell'&&mode()==='employer';document.body.classList.toggle('km24JobEmployerMode',on);if(!on)return;
   var f=document.getElementById('sf');if(!f)return;
   var intro=document.querySelector('.km24SellIntro');setText(intro&&intro.querySelector('h1'),'Stelleninserat erstellen');setText(intro&&intro.querySelector('p'),'Stellentitel, Beschreibung und Arbeitsort – mehr braucht es für den Start nicht.');setText(intro&&intro.querySelector('.km24SellIntroBadge'),'✓ Einfach & schnell');
   var sale=document.getElementById('saleChoices');hide(sale&&sale.closest('.panel'));
   var price=document.getElementById('price');hide(price&&price.closest('.panel'));if(price){price.required=false;price.value='0'}
   var start=document.getElementById('start');if(start)start.required=false;var at=document.getElementById('auctionTime');if(at)at.required=false;hide(f.querySelector('.km24ProOptions'));
   var title=document.getElementById('title');if(title){title.placeholder='z. B. Automobil-Mechatroniker 80–100%';var lab=title.closest('label');if(lab&&lab.firstChild&&lab.firstChild.nodeType===3)lab.firstChild.textContent='Stellentitel '}
   var article=title&&title.closest('.panel');setText(article&&article.querySelector(':scope > h3'),'Stelle');var desc=document.getElementById('desc');if(desc)desc.placeholder='Aufgaben, Pensum, Anforderungen, Eintritt, Benefits und weitere wichtige Angaben ...';
   var cat=document.getElementById('catRoot');hide(cat&&cat.closest('.two'));var cond=document.getElementById('cond');hide(cond&&cond.closest('label'));
   var pickup=document.getElementById('pickup');if(pickup){pickup.checked=false;hide(pickup.closest('label'))}var ship=document.getElementById('ship');if(ship){ship.checked=false;hide(ship.closest('label'))}
   var loc=(document.getElementById('zip')&&document.getElementById('zip').closest('.panel'))||f.querySelector('.km24SellLocationPanel');setText(loc&&loc.querySelector(':scope > h3'),'Arbeitsort');setText(loc&&loc.querySelector('.km24SellPanelHint'),'Wo befindet sich die Arbeitsstelle?');
   setText(document.getElementById('km24SimplePublish'),'Stelleninserat veröffentlichen');var bar=document.getElementById('km24SellMobileBar');setText(bar&&bar.querySelector('b'),'Stelleninserat veröffentlichen');setText(bar&&bar.querySelector('button'),'Veröffentlichen');
 }
 function seeker(){
   var on=base()==='#/wanted/new'&&mode()==='seeker';document.body.classList.toggle('km24JobSeekerMode',on);if(!on)return;
   var f=document.getElementById('wantedForm');if(!f)return;var head=document.querySelector('.formPage .head');setText(head&&head.querySelector('h1'),'Stellengesuch erstellen');setText(head&&head.querySelector('p.mut'),'Gesuchter Beruf, kurze Beschreibung und Arbeitsort – fertig.');setText(head&&head.querySelector('.km24SectionKicker'),'👤 JOBSUCHE');
   var title=document.getElementById('wtitle');if(title)title.placeholder='z. B. Chauffeur Kat. C / CE, 100%';var desc=document.getElementById('wdesc');if(desc)desc.placeholder='Berufserfahrung, Qualifikationen, gewünschtes Pensum, Region und Verfügbarkeit ...';
   var root=document.getElementById('wroot');hide(root&&root.closest('.two'));var cond=document.getElementById('wcond');hide(cond&&cond.closest('label'));var budget=document.getElementById('wbudget');hide(budget&&budget.closest('.panel'));if(budget)budget.value='0';
   var loc=document.getElementById('wzip')&&document.getElementById('wzip').closest('.panel');setText(loc&&loc.querySelector('h3'),'Arbeitsort');
   var notice=[].slice.call(f.querySelectorAll('.notice')).find(function(x){return (x.textContent||'').indexOf('Gesucht, nicht zu verkaufen')>=0});if(notice)notice.innerHTML='<b>👤 Stellengesuch</b><br>Arbeitgeber können dein Gesuch finden und dich über den KaufMich24-Chat kontaktieren.';
   setText(f.querySelector('button.btn.primary'),'Stellengesuch veröffentlichen');
 }
 function sync(){try{employer();seeker()}catch(e){console.warn('KM24 job forms v2',e)}}function schedule(){clearTimeout(timer);timer=setTimeout(sync,35)}
 addEventListener('hashchange',schedule);addEventListener('pageshow',schedule);document.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('[data-km24-job-create]');if(a)setTimeout(schedule,0)},true);var app=document.getElementById('app');if(app)new MutationObserver(schedule).observe(app,{childList:true,subtree:true});setTimeout(sync,40);setTimeout(sync,180);setTimeout(sync,500);
})();
