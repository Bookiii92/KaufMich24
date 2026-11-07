
(function(){
 if(window.__km24BuyerCompactV2)return;window.__km24BuyerCompactV2=true;
 function onBuyer(){return (location.hash||'').split('?')[0]==='#/buyer'}
 function apply(){
  try{document.body&&document.body.classList.toggle('km24BuyerCompactRoute',onBuyer())}catch(_){}
  if(!onBuyer())return;
  document.querySelectorAll('.activityCard [data-purchase-chat]').forEach(function(chat){
   var card=chat.closest('.activityCard');if(!card)return;
   card.classList.add('km24BuyerPurchaseCard');
   var actions=chat.closest('.actions');
   var main=card.querySelector('.activityPic')&&card.querySelector('.activityPic').nextElementSibling;
   if(actions){
    var detail=actions.querySelector('a.btn');
    chat.classList.add('primary');if(chat.textContent!=='💬 Verkäufer')chat.textContent='💬 Verkäufer';
    if(detail&&detail.textContent!=='Inserat')detail.textContent='Inserat';
   }
  });
 }
 function queue(){setTimeout(apply,60);setTimeout(apply,350)}
 try{if(typeof buyerCenter==='function'){var base=buyerCenter;buyerCenter=async function(){var out=await base.apply(this,arguments);queue();return out};window.buyerCenter=buyerCenter}}catch(_){}
 addEventListener('hashchange',queue);addEventListener('pageshow',queue);
 queue();
})();
