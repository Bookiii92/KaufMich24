
(function(){
  if(window.__km24DesktopCleanV1)return;
  window.__km24DesktopCleanV1=true;
  function desktop(){return window.matchMedia&&window.matchMedia('(min-width:701px)').matches}
  function filters(){
    function v(id){var e=document.getElementById(id);return e?String(e.value||''):''}
    return {q:v('q').trim(),cat:v('scat'),sub:v('ssub'),min:v('smin'),max:v('smax'),cond:v('scond'),canton:v('scanton'),seller:v('sseller'),price:v('sprice'),sort:v('ssort')||'newest'}
  }
  function sync(){
    try{
      var sell=document.querySelector('.sellNav .sellFull');
      if(sell&&desktop())sell.textContent='＋ Inserat erstellen';
      var latest=document.getElementById('latestSection');
      if(!latest||!desktop())return;
      var h=latest.querySelector('.km24HomeSectionHead h2');
      var p=latest.querySelector('.km24HomeSectionHead p');
      if(!h||!p)return;
      var f=filters();
      var active=!!(f.q||f.cat||f.sub||f.min||f.max||f.cond||f.canton||f.seller||f.price||(f.sort&&f.sort!=='newest'));
      var auction=f.price==='auction'&&!f.q&&!f.cat&&!f.sub&&!f.min&&!f.max&&!f.cond&&!f.canton&&!f.seller;
      h.textContent=auction?'Laufende Auktionen':(active?'Suchergebnisse':'Neueste Inserate');
      p.textContent=auction?'Alle laufenden Auktionen – bald endende zuerst.':(active?'Passende Inserate zu deiner aktuellen Suche und deinen Filtern.':'Frisch eingestellte Angebote aus der ganzen Schweiz.');
    }catch(_){}
  }
  document.addEventListener('click',function(){setTimeout(sync,0);setTimeout(sync,180)},true);
  document.addEventListener('keydown',function(e){if(e.key==='Enter'){setTimeout(sync,0);setTimeout(sync,180)}},true);
  addEventListener('hashchange',function(){setTimeout(sync,0);setTimeout(sync,120)});
  addEventListener('pageshow',function(){setTimeout(sync,0)});
  addEventListener('resize',function(){setTimeout(sync,80)},{passive:true});
  setTimeout(sync,0);setTimeout(sync,350);
})();
