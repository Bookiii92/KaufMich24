
(function(){
 if(window.__km24WatcherOffersV1)return;window.__km24WatcherOffersV1=true;

 const copy={
  de:{send:'Angebot an Interessenten',active:'Sonderangebot aktiv',title:'Sonderangebot senden',lead:'Sende allen Nutzern, die dieses Inserat gemerkt haben, einen persönlichen Sonderpreis.',price:'Sonderpreis in CHF',duration:'Gültigkeit',h24:'24 Stunden',h48:'48 Stunden',h72:'72 Stunden',hint:'Nur aktuelle Merker erhalten dieses Angebot. Der Sonderpreis ist nicht öffentlich sichtbar. Pro Inserat kann höchstens alle 12 Stunden ein neues Angebot gesendet werden.',cancel:'Abbrechen',submit:'💌 Angebot senden',sent:'Sonderangebot wurde an {n} Interessenten gesendet.',buyerKicker:'💌 EXKLUSIV FÜR DICH',buyerTitle:'Der Verkäufer macht dir ein Sonderangebot',expires:'Gültig bis {d}.',buy:'Für CHF {p} verbindlich kaufen',confirm:'Sonderangebot für CHF {p} verbindlich annehmen?',bought:'Sonderangebot angenommen. Der Kauf wurde bestätigt.'},
  fr:{send:'Offre aux intéressés',active:'Offre spéciale active',title:'Envoyer une offre spéciale',lead:'Envoyez un prix spécial à tous les utilisateurs qui ont enregistré cette annonce.',price:'Prix spécial en CHF',duration:'Validité',h24:'24 heures',h48:'48 heures',h72:'72 heures',hint:"Seuls les utilisateurs qui ont actuellement enregistré l'annonce reçoivent l'offre. Le prix spécial n'est pas public. Une nouvelle offre peut être envoyée au maximum toutes les 12 heures.",cancel:'Annuler',submit:'💌 Envoyer l’offre',sent:'Offre envoyée à {n} personnes intéressées.',buyerKicker:'💌 EXCLUSIF POUR VOUS',buyerTitle:'Le vendeur vous fait une offre spéciale',expires:"Valable jusqu'au {d}.",buy:'Acheter fermement pour CHF {p}',confirm:'Accepter définitivement cette offre pour CHF {p} ?',bought:'Offre acceptée. Achat confirmé.'},
  it:{send:'Offerta agli interessati',active:'Offerta speciale attiva',title:'Invia offerta speciale',lead:'Invia un prezzo speciale a tutti gli utenti che hanno salvato questo annuncio.',price:'Prezzo speciale in CHF',duration:'Validità',h24:'24 ore',h48:'48 ore',h72:'72 ore',hint:"Solo chi ha attualmente salvato l'annuncio riceve l'offerta. Il prezzo speciale non è pubblico. È possibile inviare una nuova offerta al massimo ogni 12 ore.",cancel:'Annulla',submit:'💌 Invia offerta',sent:'Offerta inviata a {n} interessati.',buyerKicker:'💌 ESCLUSIVO PER TE',buyerTitle:'Il venditore ti fa un’offerta speciale',expires:'Valida fino al {d}.',buy:'Acquista per CHF {p}',confirm:'Accettare definitivamente l’offerta per CHF {p}?',bought:'Offerta accettata. Acquisto confermato.'},
  en:{send:'Offer to interested buyers',active:'Special offer active',title:'Send special offer',lead:'Send a personal special price to everyone who saved this listing.',price:'Special price in CHF',duration:'Validity',h24:'24 hours',h48:'48 hours',h72:'72 hours',hint:'Only current watchers receive this offer. The special price is not public. A new offer can be sent for the same listing at most once every 12 hours.',cancel:'Cancel',submit:'💌 Send offer',sent:'Special offer sent to {n} interested buyers.',buyerKicker:'💌 EXCLUSIVE FOR YOU',buyerTitle:'The seller sent you a special offer',expires:'Valid until {d}.',buy:'Buy for CHF {p}',confirm:'Accept this offer for CHF {p}?',bought:'Special offer accepted. Purchase confirmed.'}
 };
 function t(){let l='de';try{l=window.km24Language?window.km24Language():'de'}catch(_){}return copy[l]||copy.de}
 function money(v){return Number(v||0).toLocaleString(window.km24Locale?window.km24Locale():'de-CH',{minimumFractionDigits:2,maximumFractionDigits:2})}
 function close(){document.querySelector('.km24WatcherModalOverlay')?.remove()}

 function openSellerModal(l,count){
  close();const c=t(),suggested=Math.max(.01,Math.round(Number(l.price_chf)*.9*100)/100),ov=document.createElement('div');
  ov.className='km24WatcherModalOverlay';
  ov.innerHTML='<div class="km24WatcherModal" role="dialog" aria-modal="true">'+
   '<button type="button" class="km24WatcherModalClose" aria-label="Schliessen">×</button>'+
   '<h2>'+c.title+'</h2><p>'+c.lead+'</p>'+
   '<form class="km24WatcherForm">'+
    '<div class="km24WatcherHint"><b>'+count+' '+(count===1?'Interessent':'Interessenten')+'</b> · '+c.hint+'</div>'+
    '<label>'+c.price+'<input id="km24WatcherPrice" type="number" min="0.01" step="0.01" max="'+Math.max(.01,Number(l.price_chf)-.01)+'" value="'+suggested.toFixed(2)+'"></label>'+
    '<label>'+c.duration+'<select id="km24WatcherHours"><option value="24">'+c.h24+'</option><option value="48" selected>'+c.h48+'</option><option value="72">'+c.h72+'</option></select></label>'+
    '<div class="km24WatcherActions"><button class="btn primary" type="submit">'+c.submit+'</button><button class="btn" type="button" data-cancel>'+c.cancel+'</button></div>'+
    '<div id="km24WatcherMsg"></div>'+
   '</form>'+
  '</div>';
  ov.onclick=e=>{if(e.target===ov)close()};ov.querySelector('.km24WatcherModalClose').onclick=close;ov.querySelector('[data-cancel]').onclick=close;
  ov.querySelector('form').onsubmit=async e=>{
   e.preventDefault();
   const btn=ov.querySelector('button[type="submit"]'),msg=ov.querySelector('#km24WatcherMsg'),amount=Number(ov.querySelector('#km24WatcherPrice').value),hours=Number(ov.querySelector('#km24WatcherHours').value);
   if(!Number.isFinite(amount)||amount<=0||amount>=Number(l.price_chf)){msg.innerHTML=N('Der Sonderpreis muss unter CHF '+money(l.price_chf)+' liegen.',1);return}
   btn.disabled=true;
   let r=await db.rpc('send_offer_to_favoriters',{p_listing_id:l.id,p_amount_chf:amount,p_hours:hours});
   if(r.error){btn.disabled=false;msg.innerHTML=N(r.error.message,1);return}
   const n=Number(r.data?.recipient_count||count||0);close();alert(c.sent.replace('{n}',n));if(typeof me==='function')me();
  };
  document.body.appendChild(ov)
 }

 window.__km24OpenWatcherOffer=function(l,count){return openSellerModal(l,count)};

 async function enhanceOwner(){
  try{
   if(!user||(location.hash||'').split('?')[0]!=='#/me')return;
   const [lr,sr]=await Promise.all([
    db.from('listings').select('id,title,price_chf,price_type,status,favorite_count,listing_intent').eq('seller_id',user.id).eq('status','active').eq('listing_intent','offer').in('price_type',['fixed','negotiable']).gt('favorite_count',0),
    db.rpc('my_watcher_offer_summaries')
   ]);
   const sm={};(sr.data||[]).forEach(x=>{if(!sm[x.listing_id])sm[x.listing_id]=x});
   (lr.data||[]).forEach(l=>{
    const edit=document.querySelector('a[href="#/edit/'+l.id+'"]'),card=edit?.closest('.km24MyListingCard');if(!card||card.querySelector('[data-watcher-offer-btn],.km24WatcherOfferActive'))return;
    const count=Number(l.favorite_count||0),active=sm[l.id],actions=card.querySelector('.actions')||card.querySelector('.km24MyListingActions')||card;
    if(active){
     const s=document.createElement('div');s.className='km24WatcherOfferActive';s.dataset.watcherOfferActive=l.id;s.textContent='💌 '+t().active+' · CHF '+money(active.amount_chf)+' · '+window.km24CompatDate(active.expires_at,'short');actions.appendChild(s);return
    }
    const b=document.createElement('button');b.type='button';b.className='btn km24WatcherOfferBtn';b.dataset.watcherOfferBtn=l.id;b.textContent='💌 '+t().send+' ('+count+')';b.onclick=()=>openSellerModal(l,count);actions.appendChild(b);
   })
  }catch(e){console.warn('KM24 watcher owner',e)}
 }

 async function enhanceBuyer(id){
  try{
   if(!user)return;
   const r=await db.rpc('my_active_watcher_offer',{p_listing_id:id});if(r.error)return;
   const o=(r.data||[])[0];if(!o||document.querySelector('.km24WatcherBuyerBox'))return;
   const c=t(),side=document.querySelector('.detailgrid .side')||document.querySelector('.detail .side');if(!side)return;
   const box=document.createElement('div');box.className='panel km24WatcherBuyerBox';
   const expiry=window.km24CompatDate(o.expires_at,'medium');
   box.innerHTML='<div class="km24WatcherBuyerKicker">'+c.buyerKicker+'</div><h3>'+c.buyerTitle+'</h3>'+
    '<div class="km24WatcherBuyerPrice"><strong>CHF '+money(o.amount_chf)+'</strong><del>CHF '+money(o.current_price_chf)+'</del></div>'+
    '<p>'+c.expires.replace('{d}',expiry)+'</p>'+
    '<button type="button" class="btn primary">💌 '+c.buy.replace('{p}',money(o.amount_chf))+'</button><div class="km24WatcherBuyMsg"></div>';
   box.querySelector('button').onclick=async()=>{
    if(!contactReady())return go('#/verification?next=listing%2F'+id);
    if(!buyerReady())return go('#/buyer-activation');
    if(!confirm(c.confirm.replace('{p}',money(o.amount_chf))))return;
    const b=box.querySelector('button'),msg=box.querySelector('.km24WatcherBuyMsg');b.disabled=true;
    const a=await db.rpc('accept_watcher_offer',{p_offer_id:o.offer_id});
    if(a.error){b.disabled=false;msg.innerHTML=N(a.error.message,1);return}
    alert(c.bought);go('#/buyer');
   };
   side.prepend(box)
  }catch(e){console.warn('KM24 watcher buyer',e)}
 }

 function install(){
  try{
   if(typeof me==='function'&&!me.__km24WatcherWrapped){const oldMe=me;const wrapped=async function(){await oldMe();await enhanceOwner()};wrapped.__km24WatcherWrapped=true;me=wrapped}
   if(typeof detail==='function'&&!detail.__km24WatcherWrapped){const oldDetail=detail;const wrapped=async function(id){await oldDetail(id);await enhanceBuyer(id)};wrapped.__km24WatcherWrapped=true;detail=wrapped}
   const h=(location.hash||'').split('?')[0];if(h==='#/me')enhanceOwner();else if(h.startsWith('#/listing/'))enhanceBuyer(h.split('/')[2]);
  }catch(e){console.warn('KM24 watcher install',e)}
 }
 setTimeout(install,0);
 addEventListener('pageshow',()=>setTimeout(install,40));
 addEventListener('hashchange',()=>setTimeout(()=>{const h=(location.hash||'').split('?')[0];if(h==='#/me')enhanceOwner();else if(h.startsWith('#/listing/'))enhanceBuyer(h.split('/')[2])},120));
})();
