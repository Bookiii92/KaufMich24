
(function(){
 if(window.__km24DeleteRestoreV1)return;window.__km24DeleteRestoreV1=true;
 function activeFilter(){
   return document.querySelector('.notificationFilters [data-note-filter].on')?.dataset.noteFilter||'all';
 }
 function restore(){
   if((location.hash||'').split('?')[0]!=='#/notifications')return;
   document.querySelectorAll('.notificationCard').forEach(card=>{
     let actions=card.querySelector('.notificationActions');
     let open=actions?.querySelector('[data-open-note]');
     if(!actions||!open||actions.querySelector('[data-delete-note]'))return;
     let id=open.dataset.openNote;
     if(!id)return;
     let b=document.createElement('button');
     b.className='btn';
     b.dataset.deleteNote=id;
     b.textContent='🗑 Löschen';
     b.onclick=async()=>{
       if(!confirm('Diese Benachrichtigung wirklich löschen?'))return;
       b.disabled=true;
       let q=await db.from('notifications').delete().eq('id',id).eq('user_id',user.id);
       if(q.error){b.disabled=false;alert(q.error.message);return}
       await refreshNotificationBadge();
       if(typeof notificationsPage==='function')notificationsPage(activeFilter());
     };
     actions.appendChild(b);
   });
 }
 let t=0,run=()=>{clearTimeout(t);t=setTimeout(restore,60)};
 window.addEventListener('hashchange',run);
 new MutationObserver(run).observe(document.getElementById('app'),{childList:true,subtree:true});
 setTimeout(restore,120);
})();
