
(function(){
 if(window.__km24MessageRealtimeV315)return;window.__km24MessageRealtimeV315=true;
 var channel=null,uid='';
 async function connect(){
   try{
     var next=(typeof user!=='undefined'&&user&&user.id)?String(user.id):'';
     if(next===uid)return;
     if(channel){try{await db.removeChannel(channel)}catch(_){}channel=null}
     uid=next;if(!uid)return;
     channel=db.channel('km24-notifications-'+uid)
       .on('postgres_changes',{event:'INSERT',schema:'public',table:'notifications',filter:'user_id=eq.'+uid},function(payload){
         try{window.refreshMessageBadge&&window.refreshMessageBadge(true)}catch(_){}
         try{typeof refreshNotificationBadge==='function'&&refreshNotificationBadge()}catch(_){}
       }).subscribe();
   }catch(_){}
 }
 function schedule(){setTimeout(connect,80);setTimeout(connect,500)}
 addEventListener('pageshow',schedule,{passive:true});addEventListener('focus',schedule,{passive:true});addEventListener('hashchange',schedule,{passive:true});
 document.addEventListener('visibilitychange',function(){if(!document.hidden)schedule()},{passive:true});
 setInterval(connect,5000);schedule();
})();
