
(function(){
  if(window.__km24MessageNavBadgeV1)return;window.__km24MessageNavBadgeV1=true;
  let busy=false,lastRun=0,timer=null;
  function paint(n){
    n=Math.max(0,Number(n||0));
    document.querySelectorAll('.km24MessageNavBadge').forEach(function(b){
      b.textContent=n>99?'99+':String(n);
      b.classList.toggle('show',n>0);
      b.setAttribute('aria-label',n+' ungelesene Nachrichten');
    });
    document.querySelectorAll('.km24MessagesNavLink').forEach(function(a){a.classList.toggle('hasUnread',n>0)});
  }
  async function refresh(force){
    try{
      if(busy)return;
      if(typeof user==='undefined'||!user){paint(0);return}
      const now=Date.now();if(!force&&now-lastRun<2500)return;lastRun=now;busy=true;
      const r=await db.rpc('unread_message_count');
      if(!r.error)paint(Number(r.data||0));
    }catch(_){}finally{busy=false}
  }
  window.refreshMessageBadge=refresh;
  function schedule(ms){clearTimeout(timer);timer=setTimeout(function(){refresh(true)},ms||0)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){schedule(0)},{once:true});else schedule(0);
  addEventListener('pageshow',function(){schedule(40)});
  addEventListener('focus',function(){schedule(40)});
  addEventListener('hashchange',function(){schedule(180)});
  document.addEventListener('visibilitychange',function(){if(!document.hidden)schedule(40)});
  setInterval(function(){if(!document.hidden&&typeof user!=='undefined'&&user)refresh(false)},7000);
})();
