
(function(){
 if(window.__km24InboxSplitV1)return;window.__km24InboxSplitV1=true;
 function isChatNote(n){try{return notificationCategory(n.type)==='messages'}catch(_){return !!n.conversation_id}}
 function inboxTabs(active,counts){
   counts=counts||{};
   return '<div class="km24InboxTabs" role="tablist" aria-label="Nachrichtenbereiche">'+
     '<a href="#/messages" class="'+(active==='chat'?'on':'')+'" role="tab"><span>💬</span><b>Chats</b>'+(counts.chat?'<span class="km24InboxCount">'+counts.chat+'</span>':'')+'</a>'+
     '<a href="#/notifications" class="'+(active==='notifications'?'on':'')+'" role="tab"><span>🔔</span><b>Mitteilungen</b>'+(counts.notes?'<span class="km24InboxCount">'+counts.notes+'</span>':'')+'</a>'+
   '</div>';
 }
 async function separatedNotificationsPage(filterMode='all'){
   if(!user)return go('#/login');
   let r=await db.from('notifications').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(100),all=r.data||[],notes=all.filter(n=>!isChatNote(n));
   let unread=notes.filter(n=>!n.read_at).length;
   let shown=filterMode==='unread'?notes.filter(n=>!n.read_at):filterMode==='all'?notes:notes.filter(n=>notificationCategory(n.type)===filterMode);
   let filters=[['all','Alle'],['unread','Ungelesen'],['sales','🛍 Kaufen/Verkaufen'],['auctions','🔨 Auktionen'],['offers','🤝 Angebote'],['search','🔎 Suchaufträge']];
   let rows=shown.length?shown.map(n=>{let target=notificationTarget(n);return '<article class="km24NotificationCard '+(!n.read_at?'unread':'')+'"><div class="km24NotificationIcon">'+notificationIcon(n.type)+'</div><div class="km24NotificationBody"><h3>'+E(n.title)+'</h3>'+(n.body?'<p>'+E(n.body)+'</p>':'')+'<div class="km24NotificationMeta">'+E(D(n.created_at))+(n.read_at?' · gelesen':' · ungelesen')+'</div></div><div class="km24NotificationActions"><button class="btn primary" data-open-note="'+n.id+'" data-target="'+E(target)+'">Öffnen</button>'+(!n.read_at?'<button class="btn" data-read-note="'+n.id+'">Gelesen</button>':'')+'<button class="btn km24IconBtn" aria-label="Löschen" title="Löschen" data-delete-note="'+n.id+'">🗑</button></div></article>'}).join(''):'<div class="empty">Hier gibt es aktuell keine Mitteilungen.</div>';
   app.innerHTML='<div class="wrap formPage km24NotificationsPage">'+inboxTabs('notifications',{notes:unread})+'<div class="km24NotificationHero"><div><h1>Mitteilungen</h1><p class="mut">'+unread+' ungelesen · '+notes.length+' Mitteilungen</p></div><div class="km24NotificationTools"><button class="btn" id="markAllNotes">Alle gelesen</button><a class="btn" href="#/me">Konto</a></div></div><div class="km24NotificationHint">💬 Persönliche Nachrichten findest du getrennt unter <b>Chats</b>. Hier stehen nur Kauf-, Verkaufs-, Auktions- und Systemmeldungen.</div><div class="km24NotificationFilters">'+filters.map(x=>'<button class="btn '+(filterMode===x[0]?'on':'')+'" data-note-filter="'+x[0]+'">'+x[1]+'</button>').join('')+'</div><div class="km24NotificationList">'+rows+'</div></div>';
   document.querySelectorAll('[data-note-filter]').forEach(b=>b.onclick=()=>separatedNotificationsPage(b.dataset.noteFilter));
   document.querySelectorAll('[data-open-note]').forEach(b=>b.onclick=()=>openNotification(b.dataset.openNote,b.dataset.target));
   document.querySelectorAll('[data-read-note]').forEach(b=>b.onclick=async()=>{let q=await db.from('notifications').update({read_at:new Date().toISOString()}).eq('id',b.dataset.readNote).eq('user_id',user.id);if(q.error)alert(q.error.message);else{await refreshNotificationBadge();separatedNotificationsPage(filterMode)}});
   document.querySelectorAll('[data-delete-note]').forEach(b=>b.onclick=async()=>{if(!confirm('Diese Mitteilung wirklich löschen?'))return;let q=await db.from('notifications').delete().eq('id',b.dataset.deleteNote).eq('user_id',user.id);if(q.error)alert(q.error.message);else{await refreshNotificationBadge();separatedNotificationsPage(filterMode)}});
   let mark=document.getElementById('markAllNotes');if(mark)mark.onclick=async()=>{let ids=notes.filter(n=>!n.read_at).map(n=>n.id);if(!ids.length)return;if(ids.length){let q=await db.from('notifications').update({read_at:new Date().toISOString()}).eq('user_id',user.id).in('id',ids);if(q.error)return alert(q.error.message)}await refreshNotificationBadge();separatedNotificationsPage(filterMode)};
 }
 try{notificationsPage=separatedNotificationsPage;window.notificationsPage=separatedNotificationsPage}catch(_){}
 try{
   refreshNotificationBadge=async function(){
     let b=document.getElementById('notifyBadge');
     if(!b)return;
     if(!user){b.textContent='0';b.classList.remove('show');return}
     let r=await db.from('notifications').select('type,conversation_id').eq('user_id',user.id).is('read_at',null).limit(500),n=(r.data||[]).filter(x=>!isChatNote(x)).length;
     b.textContent=n>99?'99+':String(n);b.classList.toggle('show',n>0);
     if(window.refreshMessageBadge)await window.refreshMessageBadge(true)
   };
   window.refreshNotificationBadge=refreshNotificationBadge;
 }catch(_){}
 try{
   let baseMessagesPage=messagesPage;
   messagesPage=async function(){
     let out=await baseMessagesPage.apply(this,arguments);
     try{let page=document.querySelector('.km24MessagesPage');if(page&&!page.querySelector('.km24InboxTabs'))page.insertAdjacentHTML('afterbegin',inboxTabs('chat'))}catch(_){}
     return out
   };
   window.messagesPage=messagesPage;
 }catch(_){}
 function sync(){
   try{
     let h=(location.hash||'').split('?')[0];
     if(h==='#/messages'||h.indexOf('#/messages/')===0){let p=document.querySelector('.km24MessagesPage');if(p&&!p.querySelector('.km24InboxTabs'))p.insertAdjacentHTML('afterbegin',inboxTabs('chat'))}
   }catch(_){}
 }
 addEventListener('hashchange',()=>setTimeout(sync,80));addEventListener('pageshow',()=>setTimeout(sync,80));setTimeout(sync,250);
})();
