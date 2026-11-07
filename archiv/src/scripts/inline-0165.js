
(function(){
  if(window.__km24AuctionHeaderContrastV4)return;
  window.__km24AuctionHeaderContrastV4=true;
  function fix(){
    document.querySelectorAll('.detail .auctionbox,.detail .km24DetailActionBox.auctionbox').forEach(function(box){
      box.querySelectorAll('span,small,div,b,strong,em,label').forEach(function(el){
        if(el.closest('button,a,form'))return;
        var t=(el.textContent||'').replace(/\s+/g,' ').trim();
        if(!t||t.length>32)return;
        var noEmoji=t.replace(/^[^A-Za-zÄÖÜäöü]+/,'').trim();
        var auction=/^Auktion$/i.test(noEmoji);
        var count=/^\d+\s+Gebote$/i.test(t);
        if(!auction&&!count)return;
        var color=auction?'#783600':'#344054';
        el.style.setProperty('color',color,'important');
        el.style.setProperty('-webkit-text-fill-color',color,'important');
        el.style.setProperty('font-weight','850','important');
        el.style.setProperty('opacity','1','important');
        el.style.setProperty('filter','none','important');
        el.style.setProperty('text-shadow','none','important');
      });
    });
  }
  var queued=false;
  function queue(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;fix()})}
  document.addEventListener('DOMContentLoaded',queue,{once:true});
  window.addEventListener('hashchange',queue);
  window.addEventListener('pageshow',queue);
  var target=document.getElementById('app')||document.body;
  if(target)new MutationObserver(queue).observe(target,{childList:true,subtree:true});
  queue();
})();
