
(function(){
  if(window.__km24BidInputUxV1)return;
  window.__km24BidInputUxV1=true;

  function fixBidCount(box){
    box.querySelectorAll('small').forEach(function(s){
      var original=s.textContent||'';
      if(!/Gebot\(e\)/.test(original))return;
      var corrected=original.replace(/(\d+)\s+Gebot\(e\)/g,function(_,n){
        var count=Number(n);
        return count===0?'Noch keine Gebote':count===1?'1 Gebot':count+' Gebote';
      });
      if(corrected!==original)s.textContent=corrected;
    });
    var summary=Array.from(box.querySelectorAll('small')).find(function(s){
      return /Startpreis/i.test(s.textContent||'') && /Gebot(e|e\b)/i.test(s.textContent||'');
    });
    var countMatch=summary && (summary.textContent||'').match(/(\d+)\s+Gebote?\b/);
    var badge=box.querySelector('.km24AuctionDetailBidCount');
    if(badge&&countMatch){
      var count=Number(countMatch[1]);
      var label=count===1?'1 Gebot':count+' Gebote';
      if(badge.textContent!==label)badge.textContent=label;
    }
  }

  function enhanceForm(form){
    var input=form.querySelector('input#bid[type="number"]');
    if(!input)return;
    if(!input.closest('.km24BidAmountWrap')){
      var wrap=document.createElement('div');
      wrap.className='km24BidAmountWrap';
      input.parentNode.insertBefore(wrap,input);
      wrap.appendChild(input);
      var currency=document.createElement('span');
      currency.className='km24BidCurrency';
      currency.setAttribute('aria-hidden','true');
      currency.textContent='CHF';
      wrap.insertBefore(currency,input);
    }
    if(!input.getAttribute('aria-label'))input.setAttribute('aria-label','Gebotsbetrag in CHF');
    input.setAttribute('inputmode','decimal');
    if(form.querySelector('.km24QuickBidRow'))return;
    var row=document.createElement('div');
    row.className='km24QuickBidRow';
    row.setAttribute('role','group');
    row.setAttribute('aria-label','Schnellgebote: Betrag erhöhen');
    [1,5,10].forEach(function(amount){
      var button=document.createElement('button');
      button.type='button';
      button.className='km24QuickBid';
      button.textContent='+'+amount+' CHF';
      button.setAttribute('aria-label','Gebot um '+amount+' Schweizer Franken erhöhen');
      button.addEventListener('click',function(){
        var minimum=Number(input.min);
        var current=Number(input.value);
        var base=Number.isFinite(current)&&input.value!==''?current:0;
        if(Number.isFinite(minimum))base=Math.max(minimum,base);
        var updated=Math.round((base+amount)*100)/100;
        input.value=String(updated);
        input.dispatchEvent(new Event('input',{bubbles:true}));
        input.dispatchEvent(new Event('change',{bubbles:true}));
        /* Only prepare the amount; submitting remains the user's choice. */
      });
      row.appendChild(button);
    });
    var submit=form.querySelector('button[type="submit"],button.btn.primary,input[type="submit"]');
    if(submit)form.insertBefore(row,submit);
    else form.appendChild(row);
  }

  function update(){
    document.querySelectorAll('#app .detail .auctionbox').forEach(function(box){
      fixBidCount(box);
      box.querySelectorAll('form#bidf').forEach(enhanceForm);
    });
  }
  var queued=false;
  function schedule(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(function(){queued=false;update()});
  }
  function initialize(){
    var app=document.getElementById('app');
    if(app)new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
    schedule();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});
  else initialize();
  window.addEventListener('hashchange',schedule);
  window.addEventListener('pageshow',schedule);
})();
