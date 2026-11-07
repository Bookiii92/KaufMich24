
(function(){
 if(window.__km24SearchResultsVisibleV1)return;window.__km24SearchResultsVisibleV1=true;
 var timer=0;
 function home(){var h=((location.hash||'#/').split('?')[0]||'#/');return h==='#/'||h==='#'}
 function market(){return !document.body||!document.body.classList.contains('km24AreaJobs')}
 function apply(){
  try{
   if(!home()||!market())return;
   var grid=document.getElementById('grid');if(!grid)return;
   var sec=grid.closest('section');if(!sec)return;
   sec.id='latestSection';sec.classList.add('km24LatestSection');sec.classList.remove('km24MainSearchSection');
   var q=document.getElementById('q'),term=(q&&q.value||'').trim();
   var head=sec.querySelector('.head,.km24HomeSectionHead');
   var h=head&&head.querySelector('h1,h2,h3');if(h)h.textContent=term?'Suchergebnisse':'Verkaufsinserate';
   var p=head&&head.querySelector('p');if(p)p.textContent=term?('Passende Inserate für „'+term+'“.'):'Aktuelle Verkaufsangebote aus der ganzen Schweiz.';
   var dup=document.getElementById('km24SalesOverviewV9');if(dup&&dup!==sec)dup.remove();
  }catch(e){console.warn('KM24 search result bridge',e)}
 }
 function schedule(){clearTimeout(timer);timer=setTimeout(apply,20)}
 addEventListener('hashchange',schedule);addEventListener('pageshow',schedule);
 document.addEventListener('DOMContentLoaded',apply,{once:true});
 try{new MutationObserver(schedule).observe(document.getElementById('app')||document.body,{childList:true,subtree:true})}catch(_){}
 apply();setTimeout(apply,80);setTimeout(apply,300);setTimeout(apply,900);
})();
