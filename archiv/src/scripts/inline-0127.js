
(function(){
 if(window.__km24DirectReviewV1)return;
 window.__km24DirectReviewV1=true;
 var reviewState=[];
 function esc(s){return String(s==null?'':s).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]})}
 function byListing(){var m={};reviewState.forEach(function(x){m[String(x.listing_id)]=x});return m}
 async function loadState(){try{if(typeof db==='undefined'||typeof user==='undefined'||!user)return[];var r=await db.rpc('my_reviewable_transactions');if(r.error)return[];reviewState=r.data||[];return reviewState}catch(_){return[]}}
 function openReview(x,refresh){
  var old=document.querySelector('.km24ReviewOverlay');if(old)old.remove();
  var rating=0;
  var ov=document.createElement('div');ov.className='km24ReviewOverlay';
  ov.innerHTML='<div class="km24ReviewModal" role="dialog" aria-modal="true"><h3>⭐ '+esc(x.counterpart_name||'Nutzer')+' bewerten</h3><p>Wie war deine Erfahrung bei diesem Kauf?</p><div class="km24ReviewStars" aria-label="Bewertung"><button type="button" data-r="1">★</button><button type="button" data-r="2">★</button><button type="button" data-r="3">★</button><button type="button" data-r="4">★</button><button type="button" data-r="5">★</button></div><textarea maxlength="1000" placeholder="Kommentar (optional)"></textarea><div class="actions"><button class="btn" type="button" data-cancel>Abbrechen</button><button class="btn primary" type="button" data-submit disabled>Bewertung senden</button></div></div>';
  document.body.appendChild(ov);
  var stars=Array.from(ov.querySelectorAll('[data-r]')),submit=ov.querySelector('[data-submit]'),ta=ov.querySelector('textarea');
  function paint(){stars.forEach(function(b){b.classList.toggle('on',Number(b.dataset.r)<=rating)});submit.disabled=!rating}
  stars.forEach(function(b){b.onclick=function(){rating=Number(b.dataset.r);paint()}});
  ov.querySelector('[data-cancel]').onclick=function(){ov.remove()};
  ov.addEventListener('click',function(e){if(e.target===ov)ov.remove()});
  submit.onclick=async function(){
   if(!rating||submit.disabled)return;submit.disabled=true;submit.textContent='Wird gesendet …';
   try{
    var r=await db.rpc('submit_transaction_review',{p_listing_id:x.listing_id,p_rating:rating,p_comment:(ta.value||'').trim()||null});
    if(r.error){submit.disabled=false;submit.textContent='Bewertung senden';alert(r.error.message);return}
    ov.remove();
    if(typeof refresh==='function')await refresh();
   }catch(err){submit.disabled=false;submit.textContent='Bewertung senden';alert('Bewertung konnte nicht gespeichert werden.')}
  };
 }
 async function enhanceCenter(kind){
  try{
   var state=await loadState(),map=byListing();
   var sel=kind==='buyer'?'[data-purchase-chat]':'[data-sale-chat]';
   document.querySelectorAll('.activityCard '+sel).forEach(function(chat){
    var card=chat.closest('.activityCard'),id=kind==='buyer'?chat.dataset.purchaseChat:chat.dataset.saleChat,x=map[String(id)];
    if(!card||!x)return;
    var old=card.querySelector('.km24ReviewAction');if(old)old.remove();
    var box=document.createElement('div');box.className='km24ReviewAction';
    if(x.already_reviewed){
      box.innerHTML='<span class="km24ReviewDone">✓ Bewertung abgegeben · '+esc(x.my_rating||'')+'/5 ★</span>';
    }else{
      var b=document.createElement('button');b.type='button';b.className='btn primary';b.textContent='⭐ '+(kind==='buyer'?'Verkäufer':'Käufer')+' bewerten';
      b.onclick=function(){openReview(x,function(){return kind==='buyer'?buyerCenter():salesCenter()})};box.appendChild(b);
    }
    var anchor=card.querySelector('.txSteps')||card.querySelector('.activityStatus');
    if(anchor&&anchor.parentNode)anchor.parentNode.appendChild(box);else card.appendChild(box);
   });
  }catch(_){ }
 }
 try{
  if(typeof buyerCenter==='function'){
    var baseBuyer=buyerCenter;buyerCenter=async function(){var out=await baseBuyer.apply(this,arguments);await enhanceCenter('buyer');return out};window.buyerCenter=buyerCenter;
  }
  if(typeof salesCenter==='function'){
    var baseSales=salesCenter;salesCenter=async function(){var out=await baseSales.apply(this,arguments);await enhanceCenter('seller');return out};window.salesCenter=salesCenter;
  }
 }catch(_){ }
 setTimeout(function(){enhanceCenter('buyer');enhanceCenter('seller')},100);
})();
