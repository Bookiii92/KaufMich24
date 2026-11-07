
(function(){
 if(window.__km24ListingAnalyticsV1)return;window.__km24ListingAnalyticsV1=true;

 const T={
  de:{title:'Inserat-Statistiken',sub:'Sieh, wie deine Inserate wirklich performen.',views:'Aufrufe',favorites:'Gemerkte Nutzer',messages:'Nachrichten',chats:'Chats gestartet',offers:'Preisangebote',followers:'Neue Follower',details:'Details',back:'Alle Statistiken',days7:'Letzte 7 Tage',days30:'Letzte 30 Tage',chart:'Aufrufe · letzte 30 Tage',vs:'vs. vorherige 7 Tage',no:'Noch keine Statistikdaten.',hintOffer:'Interessenten aktivieren',hintOfferSub:'Mehrere Nutzer haben dein Inserat gemerkt. Sende ihnen direkt einen exklusiven Sonderpreis.',hintOfferBtn:'Sonderangebot senden',hintPrice:'Viele Aufrufe, wenig Reaktion',hintPriceSub:'Das Inserat wird gesehen, führt aber kaum zu Kontakt. Prüfe Preis, Titel und Beschreibung.',edit:'Inserat bearbeiten',hintPhotos:'Aufmerksamkeit ohne Merker',hintPhotosSub:'Nutzer öffnen das Inserat, merken es aber selten. Prüfe Hauptbild, Titel und Preis.',hintVisibility:'Mehr Sichtbarkeit holen',hintVisibilitySub:'Das Inserat ist schon einige Tage online und wird wenig gesehen. Eine Promotion kann helfen.',promote:'Promotion buchen',hintGood:'Das Inserat sammelt Aktivität',hintGoodSub:'Beobachte die Entwicklung weiter. Bei mehreren Merkern kannst du gezielt ein Sonderangebot senden.',overview:'Übersicht',accountSub:'Aufrufe, Merker, Nachrichten & Angebote',history:'Der Tagesverlauf der Aufrufe wird ab Aktivierung dieser Statistik exakt erfasst.'},
  fr:{title:'Statistiques des annonces',sub:'Découvrez les performances réelles de vos annonces.',views:'Vues',favorites:'Enregistrements',messages:'Messages',chats:'Discussions',offers:'Offres',followers:'Nouveaux abonnés',details:'Détails',back:'Toutes les statistiques',days7:'7 derniers jours',days30:'30 derniers jours',chart:'Vues · 30 derniers jours',vs:'vs. 7 jours précédents',no:'Pas encore de statistiques.',hintOffer:'Activer les intéressés',hintOfferSub:'Plusieurs personnes ont enregistré votre annonce. Envoyez-leur un prix spécial.',hintOfferBtn:'Envoyer une offre',hintPrice:'Beaucoup de vues, peu de réactions',hintPriceSub:'Vérifiez le prix, le titre et la description.',edit:'Modifier l’annonce',hintPhotos:'Vues sans enregistrement',hintPhotosSub:'Vérifiez la photo principale, le titre et le prix.',hintVisibility:'Gagner en visibilité',hintVisibilitySub:'Une promotion peut aider cette annonce à être davantage vue.',promote:'Promouvoir',hintGood:'L’annonce reçoit de l’activité',hintGoodSub:'Continuez à suivre son évolution.',overview:'Aperçu',accountSub:'Vues, favoris, messages et offres',history:'La courbe quotidienne des vues est mesurée précisément à partir de l’activation des statistiques.'},
  it:{title:'Statistiche annunci',sub:'Scopri come stanno andando davvero i tuoi annunci.',views:'Visualizzazioni',favorites:'Salvati',messages:'Messaggi',chats:'Chat avviate',offers:'Offerte',followers:'Nuovi follower',details:'Dettagli',back:'Tutte le statistiche',days7:'Ultimi 7 giorni',days30:'Ultimi 30 giorni',chart:'Visualizzazioni · ultimi 30 giorni',vs:'vs. 7 giorni precedenti',no:'Ancora nessun dato statistico.',hintOffer:'Attiva gli interessati',hintOfferSub:'Più utenti hanno salvato l’annuncio. Invia loro un prezzo speciale.',hintOfferBtn:'Invia offerta',hintPrice:'Molte visualizzazioni, poche reazioni',hintPriceSub:'Controlla prezzo, titolo e descrizione.',edit:'Modifica annuncio',hintPhotos:'Visualizzazioni senza salvataggi',hintPhotosSub:'Controlla foto principale, titolo e prezzo.',hintVisibility:'Ottieni più visibilità',hintVisibilitySub:'Una promozione può aumentare la visibilità.',promote:'Promuovi',hintGood:'L’annuncio riceve attività',hintGoodSub:'Continua a monitorare lo sviluppo.',overview:'Panoramica',accountSub:'Visualizzazioni, salvati, messaggi e offerte',history:'L’andamento giornaliero delle visualizzazioni viene misurato con precisione da quando le statistiche sono attive.'},
  en:{title:'Listing analytics',sub:'See how your listings are really performing.',views:'Views',favorites:'Saves',messages:'Messages',chats:'Chats started',offers:'Offers',followers:'New followers',details:'Details',back:'All analytics',days7:'Last 7 days',days30:'Last 30 days',chart:'Views · last 30 days',vs:'vs. previous 7 days',no:'No analytics data yet.',hintOffer:'Activate interested buyers',hintOfferSub:'Several users saved your listing. Send them an exclusive special price.',hintOfferBtn:'Send special offer',hintPrice:'Many views, little response',hintPriceSub:'Check the price, title and description.',edit:'Edit listing',hintPhotos:'Views without saves',hintPhotosSub:'Check the main photo, title and price.',hintVisibility:'Get more visibility',hintVisibilitySub:'A promotion can help this listing get seen.',promote:'Promote',hintGood:'The listing is getting activity',hintGoodSub:'Keep watching the trend.',overview:'Overview',accountSub:'Views, saves, messages & offers',history:'Daily view history is measured precisely from the time analytics was enabled.'}
 };
 function tx(){let l='de';try{l=window.km24Language?window.km24Language():'de'}catch(_){}return T[l]||T.de}
 function n(v){return Number(v||0).toLocaleString(window.km24Locale?window.km24Locale():'de-CH')}
 function dateKey(d){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return y+'-'+m+'-'+day}
 function sum(rows,key,from,to){return rows.filter(r=>r.analytics_day>=from&&r.analytics_day<=to).reduce((a,r)=>a+Number(r[key]||0),0)}
 function trend(cur,prev){if(prev===0)return cur>0?100:0;return Math.round(((cur-prev)/prev)*100)}
 function trendHtml(cur,prev){const t=trend(cur,prev),c=t>0?'up':t<0?'down':'';return '<span class="km24AnalyticsTrend '+c+'">'+(t>0?'↑ +':t<0?'↓ ':'')+t+'% · '+tx().vs+'</span>'}
 function sessionId(){
  const k='km24ListingViewSessionV1';try{let v=localStorage.getItem(k);if(v&&/^[A-Za-z0-9_-]{16,80}$/.test(v))return v;v=crypto.randomUUID?(window.crypto&&typeof crypto.randomUUID==='function'?crypto.randomUUID():('km24_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2))):(Date.now().toString(36)+'_'+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2));localStorage.setItem(k,v);return v}catch(_){return 's_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)}
 }
 async function trackView(id){
  try{await db.rpc('track_listing_view',{p_listing_id:id,p_session_id:sessionId()})}catch(_){}
 }
 async function ownListings(){
  const r=await db.from('listings').select('id,title,status,price_chf,price_type,published_at,created_at,favorite_count,view_count,listing_intent').eq('seller_id',user.id).eq('listing_intent','offer').neq('status','deleted').order('created_at',{ascending:false});
  return r.data||[]
 }
 async function overview(){
  if(!user)return go('#/login');const x=tx();
  app.innerHTML='<div class="wrap km24AnalyticsPage"><div class="km24AnalyticsHero"><div><span class="km24SectionKicker">📊 ANALYTICS</span><h1>'+x.title+'</h1><p>'+x.sub+'</p></div><a class="btn" href="#/me">← '+x.overview+'</a></div><div id="km24AnalyticsOverview"><div class="empty">Wird geladen ...</div></div></div>';
  const ls=await ownListings(),ids=ls.map(v=>v.id),box=document.getElementById('km24AnalyticsOverview');
  if(!ids.length){box.innerHTML='<div class="empty">'+x.no+'</div>';return}
  const sr=await db.from('listing_analytics_summary').select('*').in('listing_id',ids),sm={};(sr.data||[]).forEach(v=>sm[v.listing_id]=v);
  const total={views:0,favorites:0,messages:0,offers:0,followers:0};ids.forEach(id=>{const s=sm[id]||{};total.views+=Number(s.views||0);total.favorites+=Number(s.favorites_current||0);total.messages+=Number(s.messages_received_total||0);total.offers+=Number(s.offers_total||0);total.followers+=Number(s.followers_from_listing_total||0)});
  box.innerHTML='<div class="km24AnalyticsGrid">'+
   metric('👁',x.views,total.views)+metric('❤️',x.favorites,total.favorites)+metric('💬',x.messages,total.messages)+metric('🤝',x.offers,total.offers)+metric('👥',x.followers,total.followers)+
   '</div><div class="km24AnalyticsListings">'+ls.map(l=>{const s=sm[l.id]||{};return '<div class="km24AnalyticsListing"><div class="km24AnalyticsListingHead"><div><h3>'+E(l.title)+'</h3><div class="mut">'+E(statusText(l.status))+' · CHF '+F(l.price_chf)+'</div></div><a class="btn km24AnalyticsBtn" href="#/analytics/'+l.id+'">📊 '+x.details+'</a></div><div class="km24AnalyticsMini">'+mini(x.views,s.views)+mini(x.favorites,s.favorites_current)+mini(x.messages,s.messages_received_total)+mini(x.offers,s.offers_total)+mini(x.followers,s.followers_from_listing_total)+'</div></div>'}).join('')+'</div>'
 }
 function metric(icon,label,val,sub){return '<div class="km24AnalyticsMetric"><small>'+icon+' '+label+'</small><b>'+n(val)+'</b>'+(sub?'<span>'+sub+'</span>':'')+'</div>'}
 function mini(label,val){return '<div><b>'+n(val)+'</b><small>'+label+'</small></div>'}
 function makeHint(icon,title,sub,action,label){return '<div class="km24AnalyticsHint"><div class="km24AnalyticsHintIcon">'+icon+'</div><div><b>'+title+'</b><small>'+sub+'</small></div>'+(action?'<button type="button" class="btn" data-analytics-action="'+action+'">'+label+'</button>':'')+'</div>'}
 async function detailPage(id){
  if(!user)return go('#/login');const x=tx();
  const lr=await db.from('listings').select('id,title,status,price_chf,price_type,published_at,created_at,favorite_count,view_count,listing_intent').eq('id',id).eq('seller_id',user.id).maybeSingle();
  const l=lr.data;if(!l){app.innerHTML='<div class="wrap formPage"><div class="empty">Inserat nicht gefunden.</div></div>';return}
  const start=new Date();start.setDate(start.getDate()-29);const startKey=dateKey(start);
  const [sr,dr]=await Promise.all([
    db.from('listing_analytics_summary').select('*').eq('listing_id',id).maybeSingle(),
    db.from('listing_analytics_daily').select('*').eq('listing_id',id).gte('analytics_day',startKey).order('analytics_day',{ascending:true})
  ]);
  const s=sr.data||{},rows=dr.data||[];
  const today=new Date(),d7=new Date(today);d7.setDate(today.getDate()-6);const d14=new Date(today);d14.setDate(today.getDate()-13),d8=new Date(today);d8.setDate(today.getDate()-7);
  const k0=dateKey(today),k7=dateKey(d7),k14=dateKey(d14),k8=dateKey(d8);
  const v7=sum(rows,'views',k7,k0),pv7=sum(rows,'views',k14,k8),f7=sum(rows,'favorites_added',k7,k0),m7=sum(rows,'messages_received',k7,k0),o7=sum(rows,'offers_received',k7,k0),fo7=sum(rows,'followers_from_listing',k7,k0);
  const v30=sum(rows,'views',startKey,k0),f30=sum(rows,'favorites_added',startKey,k0),m30=sum(rows,'messages_received',startKey,k0),o30=sum(rows,'offers_received',startKey,k0),fo30=sum(rows,'followers_from_listing',startKey,k0);
  const map={};rows.forEach(r=>map[r.analytics_day]=r);const days=[];for(let i=29;i>=0;i--){const d=new Date(today);d.setDate(today.getDate()-i);const k=dateKey(d);days.push({k,v:Number(map[k]?.views||0)})}const max=Math.max(1,...days.map(v=>v.v));
  const ageDays=Math.max(0,Math.floor((Date.now()-new Date(l.published_at||l.created_at).getTime())/86400000)),views=Number(s.views||l.view_count||0),fav=Number(s.favorites_current||l.favorite_count||0),inq=Number(s.inquiries_total||0),offers=Number(s.offers_total||0);
  let hints='';
  if(fav>=3 && l.status==='active' && ['fixed','negotiable'].includes(l.price_type))hints+=makeHint('💌',x.hintOffer,x.hintOfferSub,'offer',x.hintOfferBtn);
  if(views>=20 && inq===0 && offers===0)hints+=makeHint('💡',x.hintPrice,x.hintPriceSub,'edit',x.edit);
  else if(views>=10 && fav===0)hints+=makeHint('🖼️',x.hintPhotos,x.hintPhotosSub,'edit',x.edit);
  if(ageDays>=7 && views<10 && l.status==='active')hints+=makeHint('🚀',x.hintVisibility,x.hintVisibilitySub,'promote',x.promote);
  if(!hints)hints=makeHint('✅',x.hintGood,x.hintGoodSub,'', '');
  app.innerHTML='<div class="wrap km24AnalyticsPage"><div class="km24AnalyticsHero"><div><span class="km24SectionKicker">📊 '+x.title.toUpperCase()+'</span><h1>'+E(l.title)+'</h1><p>'+E(statusText(l.status))+' · CHF '+F(l.price_chf)+'</p></div><a class="btn" href="#/analytics">← '+x.back+'</a></div>'+
   '<div class="km24AnalyticsGrid">'+metric('👁',x.views,s.views||l.view_count||0)+metric('❤️',x.favorites,s.favorites_current||l.favorite_count||0)+metric('💬',x.messages,s.messages_received_total||0)+metric('🗨️',x.chats,s.inquiries_total||0)+metric('🤝',x.offers,s.offers_total||0)+metric('👥',x.followers,s.followers_from_listing_total||0)+'</div>'+
   '<h2 style="margin:22px 0 8px">'+x.days7+'</h2><div class="km24AnalyticsPeriod">'+mini(x.views,v7)+mini(x.favorites,f7)+mini(x.messages,m7)+mini(x.offers,o7)+mini(x.followers,fo7)+'</div>'+trendHtml(v7,pv7)+
   '<h2 style="margin:22px 0 8px">'+x.days30+'</h2><div class="km24AnalyticsPeriod">'+mini(x.views,v30)+mini(x.favorites,f30)+mini(x.messages,m30)+mini(x.offers,o30)+mini(x.followers,fo30)+'</div>'+
   '<div class="km24AnalyticsChart"><b>'+x.chart+'</b><div class="km24AnalyticsChartBars">'+days.map(d=>'<div class="km24AnalyticsBar" data-tip="'+d.k+' · '+d.v+'" style="height:'+Math.max(d.v?4:1,Math.round((d.v/max)*100))+'%"></div>').join('')+'</div><div class="mut" style="margin-top:9px;font-size:10px">'+x.history+'</div></div>'+
   '<h2 style="margin:22px 0 8px">💡 Tipps</h2><div class="km24AnalyticsHints">'+hints+'</div>'+
   '<div class="km24AnalyticsActions"><a class="btn" href="#/listing/'+id+'">Inserat ansehen</a><a class="btn" href="#/edit/'+id+'">'+x.edit+'</a></div></div>';
  document.querySelectorAll('[data-analytics-action]').forEach(b=>b.onclick=()=>{
    const a=b.dataset.analyticsAction;
    if(a==='edit')return go('#/edit/'+id);
    if(a==='promote'&&typeof window.__km24OpenPromoChooser==='function')return window.__km24OpenPromoChooser(id,'top');
    if(a==='offer'&&typeof window.__km24OpenWatcherOffer==='function')return window.__km24OpenWatcherOffer(l,fav);
  })
 }
 function enhanceAccount(){
  const grid=document.querySelector('.km24AccountQuickGrid');
  if(grid&&!grid.querySelector('[data-km24-analytics-link]')){const x=tx(),a=document.createElement('a');a.href='#/analytics';a.dataset.km24AnalyticsLink='1';a.innerHTML='<span>📊</span><div><b>'+x.title+'</b><small>'+x.accountSub+'</small></div><i>›</i>';grid.appendChild(a)}
  document.querySelectorAll('a[href^="#/edit/"]').forEach(e=>{
    const id=(e.getAttribute('href')||'').split('/')[2],card=e.closest('.km24MyListingCard');if(!id||!card||card.querySelector('[data-km24-analytics-btn]'))return;
    const menu=card.querySelector('.km24ListingMoreMenu')||card.querySelector('.km24MyListingActions')||card.querySelector('.actions')||card,b=document.createElement('a');b.href='#/analytics/'+id;b.className='btn km24CompactBtn km24AnalyticsBtn';b.dataset.km24AnalyticsBtn='1';b.textContent='📊 '+tx().details;menu.appendChild(b)
  })
 }

 try{const oldDetail=detail;detail=async function(id){await oldDetail(id);trackView(id)}}catch(_){}
 try{const oldMe=me;me=async function(){await oldMe();enhanceAccount()}}catch(_){}
 try{const oldRoute=route;route=function(){const h=(location.hash||'').split('?')[0];if(h==='#/analytics')return overview();if(h.startsWith('#/analytics/'))return detailPage(h.split('/')[2]);return oldRoute()}}catch(_){}
 window.km24AnalyticsPage=overview;window.km24AnalyticsDetail=detailPage;
 addEventListener('hashchange',()=>setTimeout(()=>{const h=(location.hash||'').split('?')[0];if(h==='#/me')enhanceAccount()},120));
 setTimeout(()=>{if((location.hash||'').split('?')[0]==='#/me')enhanceAccount()},250)
})();
