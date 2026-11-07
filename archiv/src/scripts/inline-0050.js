
(function(){
 if(window.__km24DetailForceCompactV2)return;window.__km24DetailForceCompactV2=true;
 function enhance(){
   const root=document.querySelector('.detail');if(!root)return;
   const panel=[...root.querySelectorAll('.panel')].find(p=>p.querySelector(':scope > .detailprice')&&p.querySelector(':scope > h1'));
   if(!panel)return;

   const groups=panel.querySelectorAll(':scope > .specs');
   groups.forEach((g,i)=>{
     g.classList.add('km24DetailSpecs');
     if(i===0)g.classList.add('km24DetailOverview');
     g.querySelectorAll(':scope > .spec').forEach(x=>x.classList.add('km24DetailSpec'));
   });

   if(!panel.querySelector('.km24DetailQuick')){
     const wanted=['Jahrgang','Kilometer','Treibstoff','Getriebe','Leistung'];
     const values=[];
     panel.querySelectorAll('.spec').forEach(s=>{
       const label=(s.querySelector('small')?.textContent||'').trim();
       const value=(s.querySelector('b')?.textContent||'').trim();
       if(wanted.includes(label)&&value)values.push([label,value]);
     });
     if(values.length){
       const icons={Jahrgang:'📅',Kilometer:'🛣️',Treibstoff:'⛽',Getriebe:'⚙️',Leistung:'⚡'};
       const q=document.createElement('div');q.className='km24DetailQuick';
       q.innerHTML=values.slice(0,5).map(([k,v])=>'<span class="km24DetailQuickChip"><i>'+icons[k]+'</i>'+String(v).replace(/</g,'&lt;')+'</span>').join('');
       panel.querySelector('.detailprice')?.insertAdjacentElement('afterend',q);
     }
   }
 }
 let t=0;function run(){clearTimeout(t);t=setTimeout(enhance,30)}
 addEventListener('hashchange',run);
 addEventListener('pageshow',run);
 const app=document.getElementById('app');if(app)new MutationObserver(run).observe(app,{childList:true,subtree:false});
 setTimeout(enhance,80);
})();
