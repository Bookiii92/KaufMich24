
(function(){
 if(window.__km24JobsCreateV1)return;
 window.__km24JobsCreateV1=true;
 var ROOT='jobs_dienstleistungen',CHILD='jobs',KEY='km24CreateJobIntent';
 function baseHash(){return (location.hash||'').split('?')[0]||'#/' }
 function save(kind){try{sessionStorage.setItem(KEY,JSON.stringify({kind:kind,t:Date.now()}))}catch(_){}}
 function read(){var hs=location.hash||'';if(hs.indexOf('job=employer')>=0)return 'employer';if(hs.indexOf('job=seeker')>=0)return 'seeker';try{var x=JSON.parse(sessionStorage.getItem(KEY)||'null');if(x&&/^(employer|seeker)$/.test(x.kind)&&Date.now()-Number(x.t||0)<1800000)return x.kind;sessionStorage.removeItem(KEY)}catch(_){}return ''}
 function clear(){try{sessionStorage.removeItem(KEY)}catch(_){}}
 function textNode(label,text){try{if(!label)return;for(var i=0;i<label.childNodes.length;i++){if(label.childNodes[i].nodeType===3&&label.childNodes[i].textContent.trim()){label.childNodes[i].textContent=text;return}}}catch(_){}}
 function enhanceCreate(){
  if(baseHash()!=='#/create')return;
  var g=document.querySelector('.planGrid');if(!g||g.dataset.km24Jobs==='1')return;
  var kids=[].slice.call(g.children),sell=null,wanted=null,services=null,rest=[];
  kids.forEach(function(x){var h=x.querySelector&&x.querySelector('h2'),t=(h&&h.textContent||'').trim();if(t==='Ich verkaufe')sell=x;else if(t==='Ich suche')wanted=x;else if(t==='Dienstleistungen')services=x;else rest.push(x)});
  if(!sell||!wanted)return;
  var sec=document.createElement('section');sec.className='panel km24JobsCreateSection';sec.innerHTML='\
   <div class="km24JobsCreateHead"><div><div class="km24SectionKicker">💼 JOBS &amp; PERSONAL</div><h2>Jobs &amp; Personal</h2><p class="mut">Für Unternehmen und Arbeitssuchende – direkt den passenden Weg wählen.</p></div><div class="km24JobsCreateIcon">💼</div></div>\
   <div class="km24JobsCreateGrid">\
    <a class="plan km24CreateChoice km24JobChoice" data-km24-job-create="employer" href="#/sell?job=employer"><div style="font-size:38px">🏢</div><h3>Ich suche Mitarbeiter</h3><p>Stelle ausschreiben und passende Bewerber finden.</p><span class="btn primary">Stelleninserat erstellen</span></a>\
    <a class="plan km24CreateChoice km24JobChoice" data-km24-job-create="seeker" href="#/wanted/new"><div style="font-size:38px">👤</div><h3>Ich suche einen Job</h3><p>Zeige Arbeitgebern, was du suchst und was du kannst.</p><span class="btn primary">Stellengesuch erstellen</span></a>\
   </div><a class="km24JobsBrowse" href="#/category/jobs">Jobangebote ansehen →</a>';
  var wh=wanted.querySelector('h2');if(wh)wh.textContent='Artikel gesucht';
  var wp=wanted.querySelector('p');if(wp)wp.textContent='Du suchst einen bestimmten Artikel? Erstelle ein Gesuch und lass dich von passenden Verkäufern kontaktieren.';
  var wi=wanted.querySelector('div[style*="font-size"]');if(wi)wi.textContent='🔎';
  g.innerHTML='';g.appendChild(sell);g.appendChild(sec);g.appendChild(wanted);if(services)g.appendChild(services);rest.forEach(function(x){g.appendChild(x)});g.dataset.km24Jobs='1';
  var intro=document.querySelector('.formPage .head p.mut');if(intro)intro.textContent='Verkaufe, suche Artikel, finde Personal oder biete Dienstleistungen an.';
  var infos=[].slice.call(document.querySelectorAll('.formPage .panel b'));infos.forEach(function(b){if((b.textContent||'').indexOf('So funktionieren Gesuche')>=0)b.textContent='💡 So funktionieren Artikelgesuche'});
 }
 function employerForm(){
  if(baseHash()!=='#/sell'||read()!=='employer')return;
  var root=document.getElementById('catRoot'),sub=document.getElementById('cat');if(!root||!sub)return;
  document.body.classList.add('km24JobEmployerForm');
  var sc=document.getElementById('saleChoices'),sp=sc&&sc.closest('.panel');if(sp)sp.style.display='none';
  var pr=document.getElementById('price'),pp=pr&&pr.closest('.panel');if(pr)pr.required=false;if(pp)pp.style.display='none';
  var pro=document.querySelector('#sf .km24ProOptions');if(pro)pro.style.display='none';
  var cond=document.getElementById('cond');if(cond&&cond.closest('label'))cond.closest('label').style.display='none';
  var pickup=document.getElementById('pickup'),ship=document.getElementById('ship');if(pickup&&pickup.closest('label'))pickup.closest('label').style.display='none';if(ship&&ship.closest('label'))ship.closest('label').style.display='none';
  var loc=(document.getElementById('zip')&&document.getElementById('zip').closest('.panel'));if(loc){var lh=loc.querySelector('h3');if(lh)lh.textContent='Arbeitsort'}
  var pub=document.getElementById('km24SimplePublish');if(pub)pub.textContent='Stelleninserat veröffentlichen';
  var mob=document.getElementById('km24SellMobileBar');if(mob){var mb=mob.querySelector('b');if(mb)mb.textContent='Stelleninserat veröffentlichen';var mbtn=mob.querySelector('button');if(mbtn)mbtn.textContent='Veröffentlichen'}
  var h1=document.querySelector('.formPage .wrap>h1');if(h1)h1.textContent='Stelleninserat erstellen';
  var intro=h1&&h1.nextElementSibling;if(intro&&intro.classList.contains('mut'))intro.textContent='Kategorie Jobs ist bereits ausgewählt. Beschreibe deine offene Stelle so klar wie möglich.';
  var title=document.getElementById('title');if(title){textNode(title.closest('label'),'Stellentitel');title.placeholder='z. B. Automobil-Mechatroniker 80–100%'}
  var desc=document.getElementById('desc');if(desc)desc.placeholder='Aufgaben, Pensum, Arbeitsort, Anforderungen, Eintritt, Lohnangaben und Benefits ...';
  var article=title&&title.closest('.panel');if(article){var ah=article.querySelector('h3');if(ah)ah.textContent='Stelle';if(!article.querySelector('.km24JobFormHint')){var n=document.createElement('div');n.className='km24JobFormHint';n.innerHTML='<b>🏢 Stelleninserat</b><br><span class="mut">Die Job-Kategorie wird automatisch gesetzt. Nutze Titel und Beschreibung für alle wichtigen Angaben zur Stelle.</span>';article.insertBefore(n,article.children[1]||null)}}
  root.value=ROOT;root.dispatchEvent(new Event('change',{bubbles:true}));
  setTimeout(function(){var c=document.getElementById('cat');if(c){c.value=CHILD;c.dispatchEvent(new Event('change',{bubbles:true}));if(c.value===CHILD)clear()}},40);
 }
 function seekerForm(){
  if(baseHash()!=='#/wanted/new'||read()!=='seeker')return;
  var root=document.getElementById('wroot'),sub=document.getElementById('wcat');if(!root||!sub)return;
  var h1=document.querySelector('.formPage .head h1');if(h1)h1.textContent='Ich suche einen Job';
  var intro=document.querySelector('.formPage .head p.mut');if(intro)intro.textContent='Beschreibe, welche Stelle du suchst, was du kannst und wo du arbeiten möchtest.';
  var title=document.getElementById('wtitle');if(title){textNode(title.closest('label'),'Gesuchter Job');title.placeholder='z. B. Chauffeur Kat. C / CE, 100%'}
  var desc=document.getElementById('wdesc');if(desc)desc.placeholder='Berufserfahrung, Qualifikationen, gewünschtes Pensum, Region, Verfügbarkeit und weitere wichtige Angaben ...';
  var article=title&&title.closest('.panel');if(article&&!article.querySelector('.km24JobFormHint')){var n=document.createElement('div');n.className='km24JobFormHint';n.innerHTML='<b>👤 Stellengesuch</b><br><span class="mut">Die Job-Kategorie wird automatisch gesetzt. Arbeitgeber können dein Gesuch auf KaufMich24 finden.</span>';article.insertBefore(n,article.children[1]||null)}
  root.value=ROOT;root.dispatchEvent(new Event('change',{bubbles:true}));
  setTimeout(function(){var c=document.getElementById('wcat');if(c){c.value=CHILD;c.dispatchEvent(new Event('change',{bubbles:true}));if(c.value===CHILD)clear()}},40);
 }
 function apply(){enhanceCreate();employerForm();seekerForm()}
 document.addEventListener('click',function(e){
  var a=e.target&&e.target.closest&&e.target.closest('[data-km24-job-create]');
  if(a){save(a.getAttribute('data-km24-job-create'));return}
  var c=e.target&&e.target.closest&&e.target.closest('a,button');if(!c)return;
  var t=(c.textContent||'').replace(/\s+/g,' ').trim();
  if(/Mitarbeiter|Stelleninserat/i.test(t))save('employer');
  else if(/Job suchen|Stellengesuch/i.test(t))save('seeker');
 },true);
 addEventListener('hashchange',function(){var h=baseHash();if(!['#/create','#/sell','#/wanted/new','#/verification','#/buyer-activation'].some(function(x){return h===x||h.indexOf(x)===0})&&!h.startsWith('#/login'))clear();setTimeout(apply,30);setTimeout(apply,180);setTimeout(apply,420)});
 addEventListener('pageshow',function(){setTimeout(apply,80)});
 setTimeout(apply,120);setTimeout(apply,450);
})();
