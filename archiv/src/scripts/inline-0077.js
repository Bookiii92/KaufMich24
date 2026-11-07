
(function(){
 if(window.__km24PostCreatePromoV1)return;window.__km24PostCreatePromoV1=true;
 const KEY='km24PromoAfterCreateV1';
 function routeMatches(id,route){
   if(route==='#/listing/'+id)return true;
   if(route!=='#/founder')return false;
   try{const f=JSON.parse(sessionStorage.getItem('km24FounderListingJustCreated')||'null');return !!f&&String(f.id)===String(id)}
   catch(_){return false}
 }
 const copy={
  de:{title:'Dein Inserat ist online 🎉',lead:'Möchtest du deinem Inserat jetzt mehr Sichtbarkeit geben?',top:'⭐ Top-Inserat',topText:'Weiter oben in passenden Suchergebnissen erscheinen.',home:'🥇 Gold-Promotion',homeText:'Auf der Startseite präsentieren und in Kategorie und Suche bevorzugt anzeigen.',topPrice:'ab CHF 3.90 · 390 Punkte',homePrice:'ab CHF 8.90 · 890 Punkte',skip:'Nein danke – ohne Promotion weiter',note:'100 % freiwillig. Du kannst auch ohne Promotion weitermachen oder später eine buchen.'},
  fr:{title:'Votre annonce est en ligne 🎉',lead:'Souhaitez-vous maintenant la mettre davantage en avant ?',top:'⭐ Annonce Top',topText:'Apparaître plus haut dans les résultats de recherche pertinents.',home:'🥇 Promotion Gold',homeText:'Plus de visibilité dans la section des offres mises en avant.',topPrice:'dès CHF 3.90 · 390 points',homePrice:'dès CHF 8.90 · 890 points',skip:'Non merci – continuer sans promotion',note:'Facultatif. Vous pourrez aussi réserver une promotion plus tard depuis votre compte.'},
  it:{title:'Il tuo annuncio è online 🎉',lead:'Vuoi metterlo subito più in evidenza?',top:'⭐ Annuncio Top',topText:'Appari più in alto nei risultati di ricerca pertinenti.',home:'🥇 Promozione Gold',homeText:'Più visibilità nella sezione delle offerte in evidenza.',topPrice:'da CHF 3.90 · 390 punti',homePrice:'da CHF 8.90 · 890 punti',skip:'No grazie – continua senza promozione',note:'Facoltativo. Puoi prenotare una promozione anche più tardi dal tuo account.'},
  en:{title:'Your listing is live 🎉',lead:'Would you like to give it extra visibility now?',top:'⭐ Top listing',topText:'Appear higher in relevant search results.',home:'🥇 Gold promotion',homeText:'Extra visibility in the highlighted offers section.',topPrice:'from CHF 3.90 · 390 points',homePrice:'from CHF 8.90 · 890 points',skip:'No thanks – continue without promotion',note:'Optional. You can also book a promotion later from your account.'}
 };
 function lang(){try{return (window.km24Language&&window.km24Language())||'de'}catch(_){return 'de'}}
 function close(){document.querySelector('.km24PostCreatePromoOverlay')?.remove()}
 function show(id){
  if(!id)return false;
  if(!user)return false;
  close();
  const t=copy[lang()]||copy.de,ov=document.createElement('div');
  ov.className='km24PostCreatePromoOverlay';
  ov.innerHTML='<div class="km24PostCreatePromoModal" role="dialog" aria-modal="true" aria-labelledby="km24PostPromoTitle">'+
   '<button type="button" class="km24PostCreatePromoClose" aria-label="Schliessen">×</button>'+
   '<h2 id="km24PostPromoTitle">'+t.title+'</h2><p>'+t.lead+'</p>'+
   '<div class="km24PostCreatePromoChoices">'+
    '<button type="button" class="km24PostCreatePromoChoice" data-kind="top"><strong>'+t.top+'</strong><span>'+t.topText+'</span><b>'+t.topPrice+'</b></button>'+
    '<button type="button" class="km24PostCreatePromoChoice" data-kind="homepage"><strong>'+t.home+'</strong><span>'+t.homeText+'</span><b>'+t.homePrice+'</b></button>'+
   '</div>'+
   '<button type="button" class="km24PostCreatePromoSkip">'+t.skip+'</button>'+
   '<p class="km24PostCreatePromoNote">'+t.note+'</p>'+
  '</div>';
  ov.addEventListener('click',e=>{if(e.target===ov)close()});
  ov.querySelector('.km24PostCreatePromoClose').onclick=close;
  ov.querySelector('.km24PostCreatePromoSkip').onclick=close;
  ov.querySelectorAll('[data-kind]').forEach(b=>b.onclick=()=>{const k=b.dataset.kind;close();if(window.__km24OpenPromoChooser)window.__km24OpenPromoChooser(id,k)});
  document.body.appendChild(ov);
  return true;
 }
 let retryTimer=null;
 function maybe(){
  let id='';try{id=sessionStorage.getItem(KEY)||''}catch(_){}
  if(!id)return;
  const h=(location.hash||'').split('?')[0];
  if(!routeMatches(id,h))return;
  if(retryTimer)clearTimeout(retryTimer);
  let tries=0;
  const attempt=()=>{
    let current='';try{current=sessionStorage.getItem(KEY)||''}catch(_){}
    const route=(location.hash||'').split('?')[0];
    if(current!==id||!routeMatches(id,route)){retryTimer=null;return}
    if(show(id)){
      try{sessionStorage.removeItem(KEY)}catch(_){}
      retryTimer=null;
      return;
    }
    tries++;
    if(tries<120)retryTimer=setTimeout(attempt,400);
  };
  retryTimer=setTimeout(attempt,150);
 }
 window.__km24ShowPostCreatePromo=show;
 addEventListener('hashchange',maybe);
 addEventListener('pageshow',maybe);
 setTimeout(maybe,250);
})();
