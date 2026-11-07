
(function(){
 if(window.__km24GrowthSuiteV1)return;window.__km24GrowthSuiteV1=true;
 const REC='km24RecentListingsV1';

 const I={
  de:{recent:'Zuletzt angesehen',recentSub:'Deine zuletzt geöffneten Inserate.',emptyRecent:'Noch keine zuletzt angesehenen Inserate.',clear:'Verlauf löschen',forYou:'Für dich',forYouSub:'Basierend auf dem, was du zuletzt angesehen hast.',near:'In deiner Nähe',nearSub:'Neue Angebote aus deiner Region.',cats:'Neu in deinen Kategorien',catsSub:'Neue Inserate aus Kategorien, die dich interessieren.',followed:'Von gefolgten Verkäufern',followedSub:'Neue Angebote von Verkäufern, denen du folgst.',quality:'Inserat-Qualität',qualityGreat:'Sehr gut – dein Inserat ist aussagekräftig.',qualityTips:'Noch verbessern:',first:'Dein erstes Inserat wartet',firstSub:'Konto fertig machen und dein erstes Angebot veröffentlichen.',verify:'Verkaufen aktivieren',create:'Erstes Inserat erstellen',refresh:'↻ Aktualisieren',refreshDone:'Inserat wurde aktualisiert und erscheint wieder weiter oben.',promo:'Promotion-Wirkung',promoSub:'Vergleich der Aufrufe pro Tag vor und während der Promotion. Aufrufe werden ab Aktivierung der Statistik exakt erfasst.',before:'Vorher / Tag',during:'Promotion / Tag',signupTitle:'Kostenlos starten – ohne Zahlungsdaten',signupSub:'Fürs Konto reichen Benutzername, Wohnsitz, E-Mail und Passwort. Mobilnummer und persönliche Angaben ergänzt du erst, wenn du kaufen oder verkaufen willst.',signup1:'1 · Konto anlegen',signup2:'2 · E-Mail bestätigen',signup3:'3 · Erstes Inserat',accountRecent:'Was du zuletzt angesehen hast',relist:'↻ Neu einstellen',relistDone:'Neues Inserat wurde veröffentlicht.',relistConfirm:'Dieses Inserat als neues Inserat erneut veröffentlichen?'},
  fr:{recent:'Vu récemment',recentSub:'Vos annonces récemment consultées.',emptyRecent:'Aucune annonce consultée récemment.',clear:'Effacer',forYou:'Pour vous',forYouSub:'Basé sur vos consultations récentes.',near:'Près de chez vous',nearSub:'Nouvelles offres de votre région.',cats:'Nouveau dans vos catégories',catsSub:'Nouvelles annonces dans vos catégories.',followed:'Vendeurs suivis',followedSub:'Nouvelles offres des vendeurs suivis.',quality:'Qualité de l’annonce',qualityGreat:'Très bien – votre annonce est complète.',qualityTips:'À améliorer :',first:'Votre première annonce vous attend',firstSub:'Finalisez votre compte et publiez votre première offre.',verify:'Activer la vente',create:'Créer la première annonce',refresh:'↻ Actualiser',refreshDone:'Annonce actualisée.',promo:'Impact des promotions',promoSub:'Comparaison des vues par jour avant et pendant la promotion.',before:'Avant / jour',during:'Promotion / jour',signupTitle:'Commencer gratuitement – sans carte',signupSub:'Pour créer le compte, il suffit du nom d’utilisateur, du domicile, de l’e-mail et du mot de passe. Le mobile et les données personnelles viennent plus tard.',signup1:'1 · Compte',signup2:'2 · E-mail',signup3:'3 · Première annonce',accountRecent:'Vos dernières consultations',relist:'↻ Republier',relistDone:'La nouvelle annonce a été publiée.',relistConfirm:'Republier cette annonce comme une nouvelle annonce ?'},
  it:{recent:'Visti di recente',recentSub:'Gli annunci aperti di recente.',emptyRecent:'Nessun annuncio visto di recente.',clear:'Cancella',forYou:'Per te',forYouSub:'Basato su ciò che hai visto di recente.',near:'Vicino a te',nearSub:'Nuove offerte nella tua regione.',cats:'Novità nelle tue categorie',catsSub:'Nuovi annunci nelle categorie che ti interessano.',followed:'Venditori seguiti',followedSub:'Nuove offerte dei venditori che segui.',quality:'Qualità annuncio',qualityGreat:'Molto bene – il tuo annuncio è completo.',qualityTips:'Da migliorare:',first:'Il tuo primo annuncio ti aspetta',firstSub:'Completa l’account e pubblica la prima offerta.',verify:'Attiva vendita',create:'Crea il primo annuncio',refresh:'↻ Aggiorna',refreshDone:'Annuncio aggiornato.',promo:'Effetto promozione',promoSub:'Confronto delle visualizzazioni al giorno prima e durante la promozione.',before:'Prima / giorno',during:'Promozione / giorno',signupTitle:'Inizia gratis – senza carta',signupSub:'Per creare il conto bastano username, domicilio, e-mail e password. Numero di cellulare e dati personali si aggiungono più tardi.',signup1:'1 · Conto',signup2:'2 · E-mail',signup3:'3 · Primo annuncio',accountRecent:'I tuoi ultimi annunci',relist:'↻ Ripubblica',relistDone:'Il nuovo annuncio è stato pubblicato.',relistConfirm:'Ripubblicare questo annuncio come nuovo annuncio?'},
  en:{recent:'Recently viewed',recentSub:'Listings you opened recently.',emptyRecent:'No recently viewed listings yet.',clear:'Clear history',forYou:'For you',forYouSub:'Based on what you viewed recently.',near:'Near you',nearSub:'New offers from your region.',cats:'New in your categories',catsSub:'Fresh listings in categories you care about.',followed:'From followed sellers',followedSub:'New offers from sellers you follow.',quality:'Listing quality',qualityGreat:'Very good – your listing is informative.',qualityTips:'Improve:',first:'Your first listing is waiting',firstSub:'Finish your account and publish your first offer.',verify:'Enable selling',create:'Create first listing',refresh:'↻ Refresh',refreshDone:'Listing refreshed.',promo:'Promotion impact',promoSub:'Views per day before vs during the promotion.',before:'Before / day',during:'Promotion / day',signupTitle:'Start free – no payment details',signupSub:'Create the account with username, residence, email and password. Add your mobile number and personal details later when you want to buy or sell.',signup1:'1 · Account',signup2:'2 · Email',signup3:'3 · First listing',accountRecent:'What you viewed recently',relist:'↻ Relist',relistDone:'The new listing has been published.',relistConfirm:'Publish this listing again as a new listing?'}
 };
 function t(){let l='de';try{l=window.km24Language?window.km24Language():'de'}catch(_){}return I[l]||I.de}
 function recent(){try{const x=JSON.parse(localStorage.getItem(REC)||'[]');return Array.isArray(x)?x:[]}catch(_){return []}}
 function putRecent(x){try{let a=recent().filter(v=>v.id!==x.id);a.unshift(x);localStorage.setItem(REC,JSON.stringify(a.slice(0,30)))}catch(_){}}
 async function clearRecent(){try{localStorage.removeItem(REC)}catch(_){}if(user){try{await db.from('recently_viewed_listings').delete().eq('user_id',user.id)}catch(_){}}}
 async function recentMerged(){
  let a=recent(),map={};a.forEach(v=>{if(v&&v.id)map[v.id]=v});
  if(user){
   try{
    const r=await db.from('recently_viewed_listings').select('listing_id,viewed_at').eq('user_id',user.id).order('viewed_at',{ascending:false}).limit(30);
    (r.data||[]).forEach(v=>{const old=map[v.listing_id],ts=v.viewed_at||new Date(0).toISOString();if(!old||new Date(ts)>new Date(old.seen_at||0))map[v.listing_id]={...(old||{}),id:v.listing_id,seen_at:ts}})
   }catch(_){}
  }
  let out=Object.values(map).sort((a,b)=>new Date(b.seen_at||0)-new Date(a.seen_at||0)).slice(0,30);
  const missing=out.filter(v=>!v.title||!v.category_slug||!v.seller_id).map(v=>v.id);
  if(missing.length){
   try{
    const r=await db.from('listings').select('id,title,category_slug,seller_id').in('id',missing),lm={};(r.data||[]).forEach(v=>lm[v.id]=v);
    out=out.map(v=>({...v,...(lm[v.id]||{})}))
   }catch(_){}
  }
  try{localStorage.setItem(REC,JSON.stringify(out))}catch(_){}
  return out
 }
 async function remember(id){
  try{
   const r=await db.from('listings').select('id,title,category_slug,status,listing_intent,seller_id').eq('id',id).maybeSingle(),l=r.data;
   if(!l||l.listing_intent!=='offer'||!['active','reserved'].includes(l.status))return;
   const seen=new Date().toISOString();putRecent({id:l.id,title:l.title||'',category_slug:l.category_slug||'',seller_id:l.seller_id||null,seen_at:seen});
   if(user){try{await db.from('recently_viewed_listings').upsert({user_id:user.id,listing_id:l.id,viewed_at:seen},{onConflict:'user_id,listing_id'})}catch(_){}}
  }catch(_){}
 }
 async function hydrate(arr){
  arr=(arr||[]).filter(Boolean);if(!arr.length)return [];
  const ids=arr.map(x=>x.id),sellers=[...new Set(arr.map(x=>x.seller_id).filter(Boolean))];
  const [ir,pr]=await Promise.all([
   db.from('listing_images').select('listing_id,storage_path,sort_order,focal_x,focal_y,fit_mode').in('listing_id',ids).order('sort_order'),
   sellers.length?db.rpc('seller_cards_public',{p_seller_ids:sellers}):Promise.resolve({data:[]})
  ]);
  const im={},pm={};(ir.data||[]).forEach(x=>{if(!im[x.listing_id])im[x.listing_id]=x});(pr.data||[]).forEach(x=>pm[x.seller_id]=x);
  arr.forEach(x=>{x._img=im[x.id]||null;x._p=pm[x.seller_id]||{}});
  return arr
 }
 async function listingsByIds(ids){
  if(!ids.length)return [];
  const r=await db.from('listings').select('*').in('id',ids).in('status',['active','reserved']).eq('listing_intent','offer').eq('listing_visibility','public');
  const m={};(r.data||[]).forEach(x=>m[x.id]=x);return hydrate(ids.map(id=>m[id]).filter(Boolean))
 }
 function section(title,sub,arr,link){
  if(!arr.length)return null;const s=document.createElement('section');s.className='km24PersonalSection';s.innerHTML='<div class="wrap"><div class="km24PersonalBox"><div class="km24PersonalHead"><div><span class="km24SectionKicker">✨ PERSONALISIERT</span><h2>'+title+'</h2><p>'+sub+'</p></div>'+(link?'<a class="btn" href="'+link+'">Alle ansehen</a>':'')+'</div><div class="km24PersonalGrid">'+arr.slice(0,4).map(card).join('')+'</div></div></div>';return s
 }
 async function recentPage(){
  const x=t(),hist=await recentMerged();app.innerHTML='<div class="wrap km24RecentPage"><div class="km24RecentHero"><div><span class="km24SectionKicker">🕘 VERLAUF</span><h1>'+x.recent+'</h1><p>'+x.recentSub+'</p></div>'+(hist.length?'<button class="btn" id="km24ClearRecent">'+x.clear+'</button>':'')+'</div><div id="km24RecentGrid" class="grid"><div class="empty">Wird geladen ...</div></div></div>';
  if(!hist.length){document.getElementById('km24RecentGrid').innerHTML='<div class="empty" style="grid-column:1/-1">'+x.emptyRecent+'</div>';return}
  const arr=await listingsByIds(hist.map(v=>v.id)),g=document.getElementById('km24RecentGrid');g.innerHTML=arr.length?arr.map(card).join(''):'<div class="empty" style="grid-column:1/-1">'+x.emptyRecent+'</div>';
  const b=document.getElementById('km24ClearRecent');if(b)b.onclick=async()=>{await clearRecent();recentPage()}
 }
 async function personalizedHome(){
  if((location.hash||'#/')!=='#/'||document.getElementById('km24PersonalizedHome'))return;
  const anchor=document.getElementById('grid')?.closest('section')||document.querySelector('.km24QuickSection');if(!anchor)return;
  const root=document.createElement('div');root.id='km24PersonalizedHome';anchor.parentNode.insertBefore(root,anchor);
  const x=t(),hist=await recentMerged(),recentIds=hist.map(v=>v.id).slice(0,8),cats=[...new Set(hist.map(v=>v.category_slug).filter(Boolean))].slice(0,4),used=new Set();
  try{
   if(recentIds.length){const a=await listingsByIds(recentIds);a.forEach(v=>used.add(v.id));const s=section(x.recent,x.recentSub,a,'#/recent');if(s)root.appendChild(s)}
   if(cats.length){
    const r=await db.from('listings').select('*').in('category_slug',cats).eq('status','active').eq('listing_intent','offer').eq('listing_visibility','public').neq('price_type','auction').order('favorite_count',{ascending:false}).limit(12);
    let a=(await hydrate(r.data||[])).filter(v=>!used.has(v.id));a.forEach(v=>used.add(v.id));const s=section(x.forYou,x.forYouSub,a);if(s)root.appendChild(s)

   }
   if(user){
    const fr=await db.from('seller_follows').select('seller_id').eq('follower_id',user.id).limit(30),sellerIds=(fr.data||[]).map(v=>v.seller_id);
    if(sellerIds.length){const r=await db.from('listings').select('*').in('seller_id',sellerIds).eq('status','active').eq('listing_intent','offer').eq('listing_visibility','public').neq('price_type','auction').order('published_at',{ascending:false}).limit(12);const a=(await hydrate(r.data||[])).filter(v=>!used.has(v.id));a.forEach(v=>used.add(v.id));const s=section(x.followed,x.followedSub,a,'#/following');if(s)root.appendChild(s)}
    if(profile?.canton||profile?.city){
      let q=db.from('listings').select('*').eq('status','active').eq('listing_intent','offer').eq('listing_visibility','public').neq('price_type','auction').neq('seller_id',user.id);
      q=profile?.canton?q.eq('canton',profile.canton):q.eq('city',profile.city);const r=await q.order('published_at',{ascending:false}).limit(12);const a=(await hydrate(r.data||[])).filter(v=>!used.has(v.id));const s=section(x.near,x.nearSub,a);if(s)root.appendChild(s)
    }
   }
  }catch(e){console.warn('KM24 personalized home',e)}
  if(!root.children.length)root.remove()
 }

 function qLabels(){let l='de';try{l=window.km24Language?window.km24Language():'de'}catch(_){};return ({
  de:{title:'Titel',desc:'Beschreibung',cat:'Kategorie',pics:'mind. 3 gute Fotos',price:'Preis',location:'Standort',handover:'Übergabe',details:'passende Details'},
  fr:{title:'titre',desc:'description',cat:'catégorie',pics:'au moins 3 bonnes photos',price:'prix',location:'lieu',handover:'remise / livraison',details:'détails adaptés'},
  it:{title:'titolo',desc:'descrizione',cat:'categoria',pics:'almeno 3 buone foto',price:'prezzo',location:'località',handover:'consegna / ritiro',details:'dettagli pertinenti'},
  en:{title:'title',desc:'description',cat:'category',pics:'at least 3 good photos',price:'price',location:'location',handover:'pickup / shipping',details:'relevant details'}
 }[l]||{title:'Titel',desc:'Beschreibung',cat:'Kategorie',pics:'mind. 3 gute Fotos',price:'Preis',location:'Standort',handover:'Übergabe',details:'passende Details'})}
 function qualityScore(){
  const title=(document.getElementById('title')?.value||'').trim(),desc=(document.getElementById('desc')?.value||'').trim(),cat=document.getElementById('cat')?.value||'',zip=(document.getElementById('zip')?.value||'').trim(),city=(document.getElementById('city')?.value||'').trim(),pics=document.querySelectorAll('#photoManager img').length,pick=!!document.getElementById('pickup')?.checked,ship=!!document.getElementById('ship')?.checked;
  const price=Number(document.getElementById('price')?.value||document.getElementById('start')?.value||0),free=!document.getElementById('freenote')?.classList.contains('hide');
  const extra=[...document.querySelectorAll('.catDetails:not(.hide) input,.catDetails:not(.hide) select,.catDetails:not(.hide) textarea')].some(v=>String(v.value||'').trim());
  const ql=qLabels();let s=0,miss=[];
  if(title.length>=30)s+=15;else if(title.length>=15)s+=10;else if(title.length)s+=5;else miss.push(ql.title);
  if(desc.length>=150)s+=20;else if(desc.length>=70)s+=14;else if(desc.length>=20)s+=8;else miss.push(ql.desc);
  if(cat)s+=10;else miss.push(ql.cat);
  if(pics>=3)s+=20;else if(pics===2)s+=14;else if(pics===1)s+=8;else miss.push(ql.pics);
  if(price>0||free)s+=10;else miss.push(ql.price);
  if(zip&&city)s+=10;else miss.push(ql.location);
  if(pick||ship)s+=5;else miss.push(ql.handover);
  if(extra)s+=10;else miss.push(ql.details);
  return{score:Math.min(100,s),miss}
 }
 function enhanceQuality(){
  const form=document.getElementById('sf');if(!form||document.getElementById('km24QualityBox'))return;const x=t(),box=document.createElement('div');box.id='km24QualityBox';box.className='km24QualityBox';box.innerHTML='<div class="km24QualityTop"><b>✨ '+x.quality+'</b><strong>0%</strong></div><div class="km24QualityBar"><span></span></div><div class="km24QualityTips"></div>';form.parentNode.insertBefore(box,form);
  const update=()=>{const q=qualityScore();box.querySelector('strong').textContent=q.score+'%';box.querySelector('.km24QualityBar span').style.width=q.score+'%';box.querySelector('.km24QualityTips').textContent=q.score>=90?x.qualityGreat:x.qualityTips+' '+q.miss.slice(0,3).join(' · ')};
  form.addEventListener('input',update,{passive:true});form.addEventListener('change',update,{passive:true});const pm=document.getElementById('photoManager');if(pm)new MutationObserver(update).observe(pm,{childList:true,subtree:true});update()
 }

 function enhanceSignup(){
  const form=document.getElementById('af'),title=document.getElementById('at');if(!form||!title||document.getElementById('acc')?.classList.contains('hide'))return;const x=t();let b=document.getElementById('km24SignupFast');if(!b){b=document.createElement('div');b.id='km24SignupFast';b.className='km24SignupFast';form.parentNode.insertBefore(b,form)}b.innerHTML='<b>✓ '+x.signupTitle+'</b><p>'+x.signupSub+'</p><div class="km24SignupSteps"><span>'+x.signup1+'</span><span>'+x.signup2+'</span><span>'+x.signup3+'</span></div>'
 }
 async function onboarding(){
  if(!user||(location.hash||'').split('?')[0]!=='#/me'||document.getElementById('km24FirstListing'))return;
  const r=await db.from('listings').select('id',{count:'exact',head:true}).eq('seller_id',user.id).eq('listing_intent','offer').neq('status','deleted');if(r.error||Number(r.count||0)>0)return;
  const host=document.querySelector('.km24AccountHero')||document.querySelector('.km24AccountPage'),x=t();if(!host)return;const ready=typeof sellerReady==='function'&&sellerReady(),href=ready?'#/sell':'#/verification?next=sell',label=ready?x.create:x.verify,b=document.createElement('div');b.id='km24FirstListing';b.className='km24FirstListing';b.innerHTML='<div class="km24FirstListingIcon">🚀</div><div><b>'+x.first+'</b><small>'+x.firstSub+'</small></div><a class="btn primary" href="'+href+'">'+label+'</a>';host.insertAdjacentElement('afterend',b)
 }
 async function refreshButtons(){
  if(!user||(location.hash||'').split('?')[0]!=='#/me')return;const x=t(),cut=Date.now()-14*86400000;
  const r=await db.from('listings').select('id,status,listing_intent,price_type,published_at,created_at').eq('seller_id',user.id).eq('status','active').eq('listing_intent','offer').neq('price_type','auction');
  (r.data||[]).forEach(l=>{const since=new Date(l.published_at||l.created_at).getTime();if(!since||since>cut)return;const edit=document.querySelector('a[href="#/edit/'+l.id+'"]'),cardEl=edit?.closest('.km24MyListingCard'),menu=cardEl?.querySelector('.km24ListingMoreMenu')||cardEl?.querySelector('.km24MyListingActions');if(!menu||menu.querySelector('[data-refresh-listing="'+l.id+'"]'))return;const b=document.createElement('button');b.type='button';b.className='btn km24CompactBtn km24RefreshBtn';b.dataset.refreshListing=l.id;b.textContent=x.refresh;b.onclick=async()=>{if(!confirm('Dieses Inserat jetzt aktualisieren?'))return;b.disabled=true;const q=await db.rpc('refresh_listing',{p_listing_id:l.id});if(q.error){b.disabled=false;return alert(q.error.message)}alert(x.refreshDone);if(typeof me==='function')me()};menu.prepend(b)})
 }
 async function relistButtons(){
  if(!user||(location.hash||'').split('?')[0]!=='#/me')return;const x=t();
  const r=await db.from('listings').select('id,status,listing_intent').eq('seller_id',user.id).eq('listing_intent','offer').eq('status','sold');
  (r.data||[]).forEach(l=>{
   const edit=document.querySelector('a[href="#/edit/'+l.id+'"]'),open=document.querySelector('a[href="#/listing/'+l.id+'"]'),cardEl=edit?.closest('.km24MyListingCard')||open?.closest('.km24MyListingCard');
   const menu=cardEl?.querySelector('.km24ListingMoreMenu')||cardEl?.querySelector('.km24MyListingActions');if(!menu||menu.querySelector('[data-relist-listing="'+l.id+'"]'))return;
   const b=document.createElement('button');b.type='button';b.className='btn km24CompactBtn km24RefreshBtn';b.dataset.relistListing=l.id;b.textContent=x.relist;
   b.onclick=async()=>{if(!confirm(x.relistConfirm))return;b.disabled=true;const q=await db.rpc('copy_listing',{p_listing_id:l.id,p_mode:'relist'});if(q.error){b.disabled=false;return alert(q.error.message)}alert(x.relistDone);go('#/listing/'+q.data)};
   menu.prepend(b)
  })
 }

 function day(v){return new Date(v).toISOString().slice(0,10)}
 function dateAdd(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}
 async function promotionImpact(){
  const h=(location.hash||'').split('?')[0],m=h.match(/^#\/analytics\/([0-9a-f-]{36})$/i);if(!m||!user||document.getElementById('km24PromoPerf'))return;const id=m[1],page=document.querySelector('.km24AnalyticsPage');if(!page)return;
  try{
   const pr=await db.from('promotions').select('id,promotion_type,amount_chf,status,starts_at,ends_at,created_at').eq('listing_id',id).eq('seller_id',user.id).order('created_at',{ascending:false}).limit(10),p=(pr.data||[]).filter(v=>v.starts_at);
   if(!p.length)return;
   let min=new Date(p[p.length-1].starts_at);min.setDate(min.getDate()-8);const dr=await db.from('listing_analytics_daily').select('analytics_day,views').eq('listing_id',id).gte('analytics_day',day(min)).order('analytics_day'),rows=dr.data||[],map={};rows.forEach(r=>map[r.analytics_day]=Number(r.views||0));const sum=(a,b)=>{let d=new Date(a),e=new Date(b),s=0,n=0;while(d<=e){s+=map[day(d)]||0;n++;d=dateAdd(d,1)}return{sum:s,days:Math.max(1,n),rate:s/Math.max(1,n)}};
   const x=t(),box=document.createElement('section');box.id='km24PromoPerf';box.className='km24PromoPerf';box.innerHTML='<span class="km24SectionKicker">🚀 PROMOTION</span><h2>'+x.promo+'</h2><p>'+x.promoSub+'</p><div class="km24PromoPerfList"></div>';const list=box.querySelector('.km24PromoPerfList'),today=new Date();
   list.innerHTML=p.map(v=>{const start=new Date(v.starts_at),end=v.ends_at?new Date(v.ends_at):dateAdd(start,6),actualEnd=end<today?end:today,dur=Math.max(1,Math.round((end-start)/86400000)+1),befEnd=dateAdd(start,-1),befStart=dateAdd(start,-dur),a=sum(befStart,befEnd),b=sum(start,actualEnd),delta=a.rate>0?Math.round((b.rate/a.rate-1)*100):(b.rate>0?100:0),cl=delta>0?'up':delta<0?'down':'',name=String(v.promotion_type||'Promotion').toLowerCase().includes('home')?'🔥 Startseiten-Boost':'⭐ Top-Inserat';return '<div class="km24PromoPerfRow"><div><b>'+name+'</b><small>'+new Date(v.starts_at).toLocaleDateString(window.km24Locale?window.km24Locale():'de-CH')+' · '+E(v.status||'')+'</small></div><div class="km24PromoPerfVal"><strong>'+a.rate.toFixed(1)+'</strong><small>'+x.before+'</small></div><div class="km24PromoPerfVal"><strong>'+b.rate.toFixed(1)+'</strong><small>'+x.during+'</small></div><span class="km24PromoDelta '+cl+'">'+(delta>0?'+':'')+delta+'%</span></div>'}).join('');
   const actions=page.querySelector('.km24AnalyticsActions');actions?page.insertBefore(box,actions):page.appendChild(box)
  }catch(e){console.warn('KM24 promo analytics',e)}
 }

 function enhanceAccount(){
  const grid=document.querySelector('.km24AccountQuickGrid');if(grid&&!grid.querySelector('[data-km24-recent-link]')){const x=t(),a=document.createElement('a');a.href='#/recent';a.dataset.km24RecentLink='1';a.innerHTML='<span>🕘</span><div><b>'+x.recent+'</b><small>'+x.accountRecent+'</small></div><i>›</i>';grid.appendChild(a)}
  onboarding();refreshButtons();relistButtons()
 }

 try{const oldDetail=detail;detail=async function(id){await oldDetail(id);remember(id)}}catch(_){}
 try{window.__km24HomeHooks=window.__km24HomeHooks||[];window.__km24HomeHooks.push(async function(){await personalizedHome()})}catch(_){}
 try{const oldMe=me;me=async function(){await oldMe();enhanceAccount()}}catch(_){}
 try{const oldRoute=route;route=function(){const h=(location.hash||'').split('?')[0];if(h==='#/recent')return recentPage();return oldRoute()}}catch(_){}
 try{const oi=window.notificationIcon||notificationIcon;window.notificationIcon=function(v){return v==='listing_activity_reminder'?'📈':oi(v)};notificationIcon=window.notificationIcon}catch(_){}
 try{const ot=window.notificationTarget||notificationTarget;window.notificationTarget=function(v){if(v?.type==='listing_activity_reminder'&&v.listing_id)return '#/analytics/'+v.listing_id;return ot(v)};notificationTarget=window.notificationTarget}catch(_){}

 let timer=0;function run(){clearTimeout(timer);timer=setTimeout(()=>{enhanceQuality();enhanceSignup();const h=(location.hash||'').split('?')[0];if(h==='#/me')enhanceAccount();if(h.startsWith('#/analytics/'))promotionImpact();if(h==='#'){}},80)}
 addEventListener('hashchange',run);addEventListener('pageshow',run);addEventListener('km24:language',function(){try{document.getElementById('km24PersonalizedHome')?.remove()}catch(_){};run()});const appNode=document.getElementById('app');if(appNode)new MutationObserver(run).observe(appNode,{childList:true,subtree:true});run()
})();
