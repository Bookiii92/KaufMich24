
(function(){
 if(window.__km24WantedVisibleV1)return;window.__km24WantedVisibleV1=true;
 function home(){return (location.hash||'#/').split('?')[0]==='#/'}
 function apply(){
   if(!home())return;
   var wanted=document.getElementById('wantedSection');
   var latest=document.getElementById('latestSection');
   var cats=document.querySelector('.km24CategorySection');
   if(wanted){
     if(cats && wanted.previousElementSibling!==cats){
       cats.insertAdjacentElement('afterend',wanted);
     }else if(!cats && latest && wanted.nextElementSibling!==latest){
       latest.parentNode.insertBefore(wanted,latest);
     }
   }
   var explore=document.getElementById('km24ExploreV5');
   if(explore){
     var wb=explore.querySelector('[data-v5explore="wanted"]');
     var wp=explore.querySelector('[data-v5panel="wanted"]');
     if(wb)wb.style.display='none';
     if(wp)wp.style.display='none';
     var ab=explore.querySelector('[data-v5explore="auction"]');
     var ap=explore.querySelector('[data-v5panel="auction"]');
     if(ab)ab.classList.add('active');
     if(ap)ap.classList.add('active');
   }
   if(!document.getElementById('km24WantedQuickAccess')){
     var anchor=document.querySelector('.km24CategorySection');
     if(anchor){
       var q=document.createElement('div');
       q.id='km24WantedQuickAccess';
       q.innerHTML='<a href="#/wanted"><span><b>🔎 Gesuche entdecken</b><small>Sieh, was andere Nutzer aktuell suchen.</small></span><span class="arr">›</span></a>';
       anchor.insertAdjacentElement('afterend',q);
     }
   }
 }
 var t=0;function queue(){clearTimeout(t);t=setTimeout(apply,60)}
 addEventListener('hashchange',queue);addEventListener('pageshow',queue);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
 setTimeout(apply,200);setTimeout(apply,700);setTimeout(apply,1500);
 var app=document.getElementById('app')||document.body;
 
})();
