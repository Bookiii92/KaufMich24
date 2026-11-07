
(function(){
 if(window.__km24AdminDeletionQueueV1)return;window.__km24AdminDeletionQueueV1=true;
 async function loadQueue(){
   if((location.hash||'').split('?')[0]!=='#/admin'||!user||!profile?.is_admin)return;
   const page=document.querySelector('#app .formPage')||document.querySelector('#app .wrap');
   if(!page)return;
   let box=document.getElementById('km24DeletionAdmin');
   if(!box){
     box=document.createElement('section');box.id='km24DeletionAdmin';box.className='panel km24DeletionAdmin';
     const head=page.querySelector(':scope > .head');
     if(head)head.insertAdjacentElement('afterend',box);else page.prepend(box)
   }
   box.innerHTML='<div class="km24DeletionAdminHead"><div><span class="km24AccountKicker">DATENSCHUTZ</span><h2 style="margin:5px 0 0">Kontolöschungs-Anfragen</h2><p class="mut" style="margin:5px 0 0">Offene Anfragen werden hier sichtbar, damit keine Löschanfrage übersehen wird.</p></div><span class="badge">Laden …</span></div>';
   const [rq,uq]=await Promise.all([
     db.from('account_deletion_requests').select('*').in('status',['pending','processing']).order('requested_at',{ascending:false}),
     db.rpc('admin_list_users')
   ]);
   if(rq.error){box.innerHTML+='<div class="notice err">'+E(rq.error.message)+'</div>';return}
   const users={};(uq.data||[]).forEach(x=>users[x.id]=x);
   const rows=rq.data||[];
   box.innerHTML='<div class="km24DeletionAdminHead"><div><span class="km24AccountKicker">DATENSCHUTZ</span><h2 style="margin:5px 0 0">Kontolöschungs-Anfragen</h2><p class="mut" style="margin:5px 0 0">Offene Anfragen werden hier sichtbar, damit keine Löschanfrage übersehen wird. Die endgültige Löschung bleibt bewusst ein geprüfter Admin-Vorgang.</p></div><span class="badge">'+rows.length+' offen</span></div>'+
     (rows.length?'<div class="km24DeletionAdminList">'+rows.map(r=>{
       const u=users[r.user_id]||{};
       const name=u.business_name||u.display_name||u.email||'Nutzer';
       const status=r.status==='processing'?'In Bearbeitung':'Neu';
       return '<article class="km24DeletionAdminItem"><div><b>'+E(name)+'</b><small>'+E(u.email||r.user_id)+' · '+E(D(r.requested_at))+' · '+status+'</small>'+(r.reason?'<div class="km24DeletionReason">'+E(r.reason)+'</div>':'')+'</div><div class="km24DeletionAdminActions">'+(r.status==='pending'?'<button class="btn" data-start-delete="'+r.id+'">In Bearbeitung setzen</button>':'<button class="btn km24DeletionReject" data-reject-delete="'+r.id+'">Ablehnen</button><button class="btn km24DeletionDelete" data-complete-delete="'+r.id+'">Endgültig löschen</button>')+'</div></article>'
     }).join('')+'</div>':'<div class="empty">Keine offenen Kontolöschungs-Anfragen.</div>');
   box.querySelectorAll('[data-start-delete]').forEach(b=>b.onclick=async()=>{
     if(!confirm('Diese Löschanfrage als in Bearbeitung markieren?'))return;
     b.disabled=true;
     const x=await db.rpc('admin_start_account_deletion',{p_request_id:b.dataset.startDelete});
     if(x.error){alert(x.error.message);b.disabled=false;return}
     loadQueue()
   });
   box.querySelectorAll('[data-reject-delete]').forEach(b=>b.onclick=async()=>{
     const note=prompt('Grund für die Ablehnung (optional):','')||'';
     if(!confirm('Diese Kontolöschungs-Anfrage wirklich ablehnen?'))return;
     b.disabled=true;
     const x=await db.rpc('admin_reject_account_deletion',{p_request_id:b.dataset.rejectDelete,p_note:note});
     if(x.error){alert(x.error.message);b.disabled=false;return}
     await loadQueue()
   });
   box.querySelectorAll('[data-complete-delete]').forEach(b=>b.onclick=async()=>{
     if(!confirm('ACHTUNG: Das Nutzerkonto wird endgültig gelöscht. Wirklich fortfahren?'))return;
     const check=prompt('Zur Sicherheit LÖSCHEN eingeben:','');
     if(check!=='LÖSCHEN')return;
     const note=prompt('Admin-Notiz (optional):','')||'';
     b.disabled=true;
     const x=await db.rpc('admin_complete_account_deletion',{p_request_id:b.dataset.completeDelete,p_note:note});
     if(x.error){alert(x.error.message);b.disabled=false;return}
     alert('Das Nutzerkonto wurde endgültig gelöscht.');
     await loadQueue()
   })
 }
 window.km24LoadDeletionQueue=loadQueue;
 let timer=0;function schedule(){
   clearTimeout(timer);
   timer=setTimeout(()=>{
     const onAdmin=(location.hash||'').split('?')[0]==='#/admin';
     if(onAdmin&&!document.getElementById('km24DeletionAdmin'))loadQueue();
   },90)
 }
 addEventListener('hashchange',()=>{
   clearTimeout(timer);
   if((location.hash||'').split('?')[0]==='#/admin')setTimeout(loadQueue,120)
 });
 addEventListener('pageshow',()=>{if((location.hash||'').split('?')[0]==='#/admin')setTimeout(loadQueue,120)});
 new MutationObserver(()=>schedule()).observe(document.body,{childList:true,subtree:true});
 setTimeout(loadQueue,300)
})();
