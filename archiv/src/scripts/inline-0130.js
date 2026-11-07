
(function(){
  if(window.__km24BuyerCompactV1)return;
  window.__km24BuyerCompactV1=true;

  function onBuyer(){return (location.hash||'').split('?')[0]==='#/buyer'}
  function cleanText(s){return String(s||'').replace(/\s+/g,' ').trim()}

  function polish(){
    try{document.body&&document.body.classList.toggle('km24BuyerCompactRoute',onBuyer())}catch(_){}
    if(!onBuyer())return;

    document.querySelectorAll('.activityCard [data-purchase-chat]').forEach(function(chat){
      var card=chat.closest('.activityCard');if(!card)return;
      card.classList.add('km24BuyerPurchaseCard');
      var actions=chat.closest('.actions');
      var main=actions&&actions.previousElementSibling;
      if(!main)return;

      var steps=main.querySelector('.txSteps');
      var spans=steps?Array.from(steps.children):[];
      var completed=!!(spans.length&&spans[spans.length-1].classList.contains('done'));

      main.querySelectorAll('.notice').forEach(function(n){
        if(/Dieser Kauf ist abgeschlossen/i.test(cleanText(n.textContent)))n.remove();
      });

      var extras=card.querySelector('.km24TxFlowExtras');
      var summary=extras&&extras.querySelector('.km24TxSummary');
      var buyType='';
      if(summary){
        summary.querySelectorAll('.km24TxSummaryGrid>div').forEach(function(cell){
          var label=cleanText(cell.querySelector('small')&&cell.querySelector('small').textContent);
          if(label==='Art'||label==='Kaufart')buyType=cleanText(cell.querySelector('b')&&cell.querySelector('b').textContent);
        });
        summary.remove();
      }

      var meta=main.querySelector('small.mut');
      if(meta&&buyType&&!meta.dataset.km24BuyType){
        meta.dataset.km24BuyType='1';
        meta.textContent=cleanText(meta.textContent)+' · Kaufart: '+buyType;
      }

      if(completed){
        var badge=main.querySelector('span.badge');
        if(badge&&badge.parentElement&&badge.parentElement!==main)badge.parentElement.remove();
      }

      var reviewDone=main.querySelector('.km24ReviewDone');
      if(reviewDone){
        var m=cleanText(reviewDone.textContent).match(/([1-5](?:[\.,]\d+)?)\s*\/\s*5/);
        reviewDone.textContent='✓ Bewertung'+(m?' · '+m[1]+'/5 ★':' abgegeben');
      }

      var allExtras=Array.from(card.querySelectorAll('.km24TxFlowExtras'));
      extras=Array.from(main.children).find(function(el){return el.classList&&el.classList.contains('km24TxFlowExtras')})||allExtras[0]||null;
      if(extras&&extras.parentElement!==main)main.appendChild(extras);
      allExtras.forEach(function(el){if(el!==extras)el.remove()});

      if(extras){
        var txActions=extras.querySelector('.km24TxActions');
        if(txActions){
          var explore=txActions.querySelector('a.btn');
          var problem=txActions.querySelector('.km24ProblemBtn');
          if(explore){explore.textContent='Weitere Inserate entdecken';txActions.appendChild(explore)}
          if(problem){problem.textContent='⚑ Problem melden';txActions.appendChild(problem)}
        }
      }

      if(actions){
        chat.classList.add('primary');
        chat.textContent='💬 Verkäufer kontaktieren';
        actions.insertBefore(chat,actions.firstChild);
        var detail=actions.querySelector('a.btn');
        if(detail)detail.textContent='Inserat ansehen';
      }
    });
  }

  function queue(){setTimeout(polish,70);setTimeout(polish,430)}
  try{
    if(typeof buyerCenter==='function'){
      var baseBuyerCompact=buyerCenter;
      buyerCenter=async function(){var out=await baseBuyerCompact.apply(this,arguments);queue();return out};
      window.buyerCenter=buyerCenter;
    }
  }catch(_){}
  addEventListener('hashchange',queue);
  addEventListener('pageshow',queue);
  queue();
})();
