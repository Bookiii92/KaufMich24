
(function(){
 if(window.__km24GiveawayPositionV319)return;window.__km24GiveawayPositionV319=true;
 var timer=0;
 function isHome(){var h=(location.hash||'#/').split('?')[0];return h==='#/'||h==='#'||h===''}
 function place(){
   if(!isHome())return;
   try{
     var band=document.querySelector('.giveawayBand');
     if(!band)return;
     var target=document.querySelector('.km24LatestSection');
     if(!target){var grid=document.getElementById('grid');target=grid&&grid.closest?grid.closest('section'):null}
     if(!target)return;
     if(band.previousElementSibling!==target||band.parentNode!==target.parentNode)target.insertAdjacentElement('afterend',band);
   }catch(_){}
 }
 function schedule(ms){clearTimeout(timer);timer=setTimeout(place,ms||0)}
 addEventListener('hashchange',function(){schedule(80);setTimeout(place,350);setTimeout(place,1400)},{passive:true});
 addEventListener('pageshow',function(){schedule(80);setTimeout(place,450);setTimeout(place,1600)},{passive:true});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){schedule(80);setTimeout(place,500);setTimeout(place,1700)},{once:true});else{schedule(80);setTimeout(place,500);setTimeout(place,1700)}
 var app=document.getElementById('app');if(app)new MutationObserver(function(){schedule(60)}).observe(app,{childList:true,subtree:true});
})();
