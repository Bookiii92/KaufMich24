
(function(){
 if(window.__km24JobSalesSheetV1)return;window.__km24JobSalesSheetV1=true;
 function clean(s){return String(s==null?'':s).replace(/\s+/g,' ').trim()}
 function getListingId(root){
  var t=clean(root.querySelector('.km24SalesUrl')?.textContent||'');
  var m=t.match(/\/listing\/([0-9a-f-]{36})/i);return m?m[1]:'';
 }
 function locationText(root){
  return clean((root.querySelector('.km24SalesLoc')?.textContent||'').replace(/^[•●\s]+/,''));
 }
 function categoryFromSpecs(root){
  var specs=[].slice.call(root.querySelectorAll('.km24SalesSpec'));
  for(var i=0;i<specs.length;i++){
   var label=clean(specs[i].querySelector('span')?.textContent).toLowerCase();
   var value=clean(specs[i].querySelector('strong')?.textContent).toLowerCase();
   if(label==='kategorie')return value;
  }
  return '';
 }
 async function loadListing(root){
  var id=getListingId(root);if(!id)return null;
  try{
   if(typeof db==='undefined'||!db||!db.from)return null;
   var r=await db.from('listings').select('id,category_slug,title,postal_code,city,description,extra_fields').eq('id',id).maybeSingle();
   return r&&r.data?r.data:null;
  }catch(_){return null}
 }
 function first(obj,keys){
  obj=obj||{};for(var i=0;i<keys.length;i++){var v=obj[keys[i]];if(v!==undefined&&v!==null&&clean(v)!=='')return clean(v)}return'';
 }
 function addSpec(box,value,label){
  var d=document.createElement('div');d.className='km24SalesSpec';
  var s=document.createElement('strong');s.textContent=value||'—';
  var l=document.createElement('span');l.textContent=label;
  d.appendChild(s);d.appendChild(l);box.appendChild(d);
 }
 function renderJobSpecs(root,listing){
  var box=root.querySelector('.km24SalesSpecs');if(!box)return;
  var x=listing&&listing.extra_fields&&typeof listing.extra_fields==='object'?listing.extra_fields:{};
  var loc=listing?[listing.postal_code,listing.city].filter(Boolean).join(' '):locationText(root);
  var employment=first(x,['employment_type','job_type','anstellung','contract_type','employment']);
  var workload=first(x,['workload','workload_percent','pensum','employment_rate']);
  var start=first(x,['start_date','entry_date','eintritt','start']);
  var employer=first(x,['company_name','company','employer','arbeitgeber']);
  box.innerHTML='';
  addSpec(box,employment||'Stellenangebot','Anstellung');
  addSpec(box,workload||'—','Pensum');
  addSpec(box,start||'—','Eintritt');
  addSpec(box,loc||'—','Standort');
  addSpec(box,employer||'Im Inserat','Arbeitgeber');
  addSpec(box,'Jobs','Kategorie');
 }
 function transform(root,listing){
  if(root.classList.contains('km24JobSheet'))return;
  root.classList.add('km24JobSheet');
  var status=root.querySelector('.km24SalesStatus');if(status){status.classList.remove('sold');status.textContent='💼 STELLENANGEBOT'}
  var loc=listing?[listing.postal_code,listing.city].filter(Boolean).join(' '):locationText(root);
  var sub=root.querySelector('.km24SalesSub');if(sub)sub.textContent=['Jobs',loc].filter(Boolean).join(' · ');
  var price=root.querySelector('.km24SalesPrice');if(price)price.style.display='none';
  renderJobSpecs(root,listing);
  var hi=root.querySelector('.km24SalesHighlights');
  if(hi){
   var desc=clean(listing&&listing.description);var current=clean(hi.textContent);
   if(desc)hi.textContent=desc.length>210?desc.slice(0,207)+'…':desc;
   else if(!current||/Alle Details, Bilder und Kontaktmöglichkeiten/i.test(current))hi.textContent='Alle Details zur Stelle und Kontaktmöglichkeiten findest du direkt im Inserat auf KaufMich24.ch.';
  }
  var cta=root.querySelector('.km24SalesCta span:first-child');if(cta)cta.textContent='Jetzt Stelle auf KaufMich24.ch ansehen';
  var modal=root.closest('.km24SalesModal');
  if(modal){
   var h=modal.querySelector('.km24SalesModalHead h2');if(h)h.textContent='Jobbild erstellen';
   var p=modal.querySelector('.km24SalesModalHead p');if(p)p.textContent='Automatisch aus deinem KaufMich24-Jobinserat · bereit als PDF & JPG';
  }
 }
 async function inspect(root){
  if(!root||root.dataset.km24JobChecked==='1')return;
  root.dataset.km24JobChecked='1';
  var cat=categoryFromSpecs(root);
  if(cat==='jobs'||cat==='job'){transform(root,null);return}
  var listing=await loadListing(root);
  if(listing&&String(listing.category_slug||'').toLowerCase()==='jobs')transform(root,listing);
 }
 function scan(node){
  if(!node)return;
  if(node.nodeType===1&&node.matches&&node.matches('.km24SalesSheet'))inspect(node);
  if(node.querySelectorAll)[].forEach.call(node.querySelectorAll('.km24SalesSheet'),inspect);
 }
 new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){for(var j=0;j<ms[i].addedNodes.length;j++)scan(ms[i].addedNodes[j])}}).observe(document.documentElement,{childList:true,subtree:true});
 scan(document);
})();
