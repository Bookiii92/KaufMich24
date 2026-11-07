
(function(){
 if(window.__km24VehicleBodyTypeV1)return;window.__km24VehicleBodyTypeV1=true;
 const CAR=['','Limousine','Kombi','SUV / Geländewagen','Coupé','Cabriolet','Kleinwagen','Van / Bus','Pickup','Andere'];
 const MOTO=['','Naked Bike','Supersportler / Sport','Sporttourer','Tourer','Reiseenduro','Enduro','Motocross','Supermoto','Chopper / Cruiser','Café Racer / Scrambler','Trial','Gespann','Andere'];
 const ROLLER=['','Roller / Scooter','Maxi-Scooter','Mofa / Töffli','Elektro-Roller','Trike / Dreirad','Andere'];

 function setLabel(select,text){
   const label=select && select.closest('label'); if(!label)return;
   for(const n of label.childNodes){
     if(n.nodeType===3 && n.nodeValue.trim()){n.nodeValue=text;return}
   }
 }
 function apply(prefix){
   const cat=document.getElementById(prefix+'cat');
   const body=document.getElementById(prefix+'vbody');
   if(!cat||!body)return;
   const slug=cat.value||'';
   let list=CAR,label='Karosserie',kind='car';
   if(slug==='motorraeder'){list=MOTO;label='Motorrad-Typ';kind='moto'}
   else if(slug==='roller_mofas'){list=ROLLER;label='Roller-/Mofa-Typ';kind='roller'}
   if(body.dataset.km24BodyKind===kind)return;
   const current=body.value;
   const opts=list.map(v=>new Option(v||'Bitte wählen',v));
   if(typeof body.replaceChildren==='function')body.replaceChildren(...opts);else{while(body.firstChild)body.removeChild(body.firstChild);opts.forEach(o=>body.appendChild(o))}
   if(list.includes(current))body.value=current;else body.value='';
   body.dataset.km24BodyKind=kind;
   setLabel(body,label);
 }
 function sync(){apply('');apply('e')}
 let t=0;function queue(){clearTimeout(t);t=setTimeout(sync,0)}
 document.addEventListener('change',e=>{
   if(['cat','catRoot','ecat','ecatRoot'].includes(e.target && e.target.id))queue();
 },true);
 const app=document.getElementById('app');
 if(app)new MutationObserver(queue).observe(app,{childList:true,subtree:true});
 addEventListener('hashchange',queue);
 addEventListener('pageshow',queue);
 setTimeout(sync,40);
})();
