
(function(){
 if(window.__km24AdminMinimalRouteV1)return;window.__km24AdminMinimalRouteV1=true;
 function sync(){document.body?.classList.toggle('km24AdminMode',(location.hash||'').split('?')[0]==='#/admin')}
 addEventListener('hashchange',sync);addEventListener('pageshow',sync);sync();
})();
