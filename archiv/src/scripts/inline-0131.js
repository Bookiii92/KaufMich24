
(function(){
  if(window.__km24QualityFinalV1)return;
  window.__km24QualityFinalV1=true;
  var timer=0;
  var TX={
    de:{skip:'Zum Inhalt springen',close:'Schliessen',theme:'Darstellung wählen',light:'Hell',dark:'Dunkel',system:'System'},
    fr:{skip:'Aller au contenu',close:'Fermer',theme:'Choisir l’affichage',light:'Clair',dark:'Sombre',system:'Système'},
    it:{skip:'Vai al contenuto',close:'Chiudi',theme:'Scegli aspetto',light:'Chiaro',dark:'Scuro',system:'Sistema'},
    en:{skip:'Skip to content',close:'Close',theme:'Choose appearance',light:'Light',dark:'Dark',system:'System'}
  };
  function lang(){try{return typeof km24Language==='function'?km24Language():(document.documentElement.lang||'de').slice(0,2)}catch(_){return'de'}}
  function text(){return TX[lang()]||TX.de}
  function ensureSkip(){
    var a=document.querySelector('.km24SkipLink');
    if(!a){a=document.createElement('a');a.className='km24SkipLink';a.href='#app';document.body.insertBefore(a,document.body.firstChild)}
    a.textContent=text().skip;
  }
  function shell(){
    var t=text(),theme=document.getElementById('km24ThemeBtn');
    if(theme){theme.setAttribute('aria-label',t.theme);theme.setAttribute('title',t.theme)}
    var menu=document.getElementById('km24ThemeMenu');
    if(menu){
      var l=menu.querySelector('[data-theme-choice="light"] b'),d=menu.querySelector('[data-theme-choice="dark"] b'),s=menu.querySelector('[data-theme-choice="system"] b');
      if(l)l.textContent=t.light;if(d)d.textContent=t.dark;if(s)s.textContent=t.system;
    }
    document.querySelectorAll('.km24CropClose').forEach(function(x){x.setAttribute('aria-label',t.close);x.setAttribute('title',t.close)});
  }
  function semantics(){
    document.querySelectorAll('a[target="_blank"]').forEach(function(a){
      var r=(a.getAttribute('rel')||'').split(/\s+/).filter(Boolean);
      if(r.indexOf('noopener')<0)r.push('noopener');if(r.indexOf('noreferrer')<0)r.push('noreferrer');a.setAttribute('rel',r.join(' '));
    });
    ['am','profileMsg','identityMsg','sellMsg','supportMsg','feedbackMsg'].forEach(function(id){var e=document.getElementById(id);if(e&&!e.hasAttribute('aria-live'))e.setAttribute('aria-live','polite')});
    document.querySelectorAll('img:not([alt])').forEach(function(img){img.setAttribute('alt','')});
  }
  function enhance(){ensureSkip();shell();semantics()}
  function queue(){clearTimeout(timer);timer=setTimeout(enhance,60)}
  addEventListener('km24:language',queue);addEventListener('hashchange',queue);addEventListener('pageshow',queue);
  var app=document.getElementById('app');if(app&&window.MutationObserver)new MutationObserver(queue).observe(app,{childList:true,subtree:true});
  enhance();setTimeout(enhance,250);
})();
