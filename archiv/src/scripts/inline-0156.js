
(function(){
  if(window.__km24DetailMobileOrderV1)return;
  window.__km24DetailMobileOrderV1=true;
  var mq=window.matchMedia('(max-width: 900px)');
  function sync(){
    try{
      var grid=document.querySelector('.detailgrid');
      if(!grid)return;
      var main=grid.querySelector('.km24DetailMainPanel');
      var side=grid.querySelector(':scope > aside.side');
      if(!main||!side)return;
      var action=document.querySelector('.km24DetailActionBox');
      if(!action){
        action=side.firstElementChild;
        if(!action)return;
        action.classList.add('km24DetailActionBox');
      }
      if(mq.matches){
        if(action.parentElement!==main){
          var price=main.querySelector('.detailprice');
          var anchor=main.querySelector('.km24DetailQuick,.km24DetailOverview,.km24DetailSectionTitle');
          if(anchor)main.insertBefore(action,anchor);
          else if(price&&price.nextSibling)main.insertBefore(action,price.nextSibling);
          else main.appendChild(action);
        }
      }else{
        if(action.parentElement!==side)side.insertBefore(action,side.firstChild);
      }
    }catch(e){}
  }
  var queued=false;
  function queue(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;sync()})}
  new MutationObserver(queue).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
  if(mq.addEventListener)mq.addEventListener('change',queue);else if(mq.addListener)mq.addListener(queue);
  addEventListener('hashchange',queue);addEventListener('pageshow',queue);addEventListener('resize',queue);
  queue();
})();
