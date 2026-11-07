
(function(){
 if(window.__km24LaunchPolishV1)return;window.__km24LaunchPolishV1=true;
 const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fmt=v=>new Intl.NumberFormat((window.km24Locale?window.km24Locale():'de-CH'),{maximumFractionDigits:2}).format(Number(v||0));
 const dt=v=>{if(!v)return '–';try{return new Intl.DateTimeFormat((window.km24Locale?window.km24Locale():'de-CH'),{dateStyle:'medium',timeStyle:'short'}).format(new Date(v))}catch(_){try{return new Intl.DateTimeFormat((window.km24Locale?window.km24Locale():'de-CH'),{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(v))}catch(__){return new Date(v).toLocaleString()}}};

 function serviceStatus(s){
   return ({active:'Aktiv',matched:'Vergeben',completed:'Abgeschlossen',paused:'Pausiert',pending:'Offen',accepted:'Angenommen',declined:'Nicht ausgewählt',withdrawn:'Zurückgezogen'}[s]||s||'–')
 }

 // Extend existing notification UI with dedicated Services category and deep links.
 try{
   window.notificationIcon=function(t){
     const m={service_message:'💬',service_inquiry:'🙋',service_quote:'🧾',service_quote_accepted:'✅',service_quote_declined:'↩️',service_match:'🛠️',service_completed:'✓',service_review_available:'⭐',service_review:'⭐'};
     if(m[t])return m[t];
     return ({message:'💬',offer:'🤝',offer_accepted:'✅',offer_rejected:'❌',bid:'🔨',outbid:'⚠️',auction_won:'🏆',auction_sold:'💰',auction_unsold:'⌛',auction_unsold_bidder:'⌛',auction_lost:'🔨',auction_second_chance:'🔁',auction_second_chance_sent:'🔁',auction_second_chance_declined:'↩️',auction_second_chance_accepted:'✅',auction_sale_reassigned:'↪️',listing_sold:'✓',account_moderation:'🛡️',review_available:'⭐',new_review:'⭐',search_match:'🔎',wanted_response:'🙋',inspection_proposed:'📅',inspection_confirmed:'✅',inspection_declined:'📅',inspection_cancelled:'↩️',inspection_followup:'📋',inspection_followup_conflict:'⚠️',inspection_sale_confirmed:'✅',inspection_no_sale:'✓',price_drop:'📉',wanted_match:'🎯',buy_now_bought:'🛍️',buy_now_sold:'💰',transaction_update:'📦'}[t]||'🔔')
   };
   notificationIcon=window.notificationIcon;

   const oldCategory=window.notificationCategory||notificationCategory;
   window.notificationCategory=function(t){
     if(['service_message','service_inquiry','service_quote','service_quote_accepted','service_quote_declined','service_match','service_completed','service_review_available','service_review'].includes(t))return 'services';
     return oldCategory(t)
   };notificationCategory=window.notificationCategory;

   const oldTarget=window.notificationTarget||notificationTarget;
   window.notificationTarget=function(n){
     if(n.service_thread_id)return '#/services/thread/'+n.service_thread_id;
     if(n.service_post_id)return '#/services/post/'+n.service_post_id;
     return oldTarget(n)
   };notificationTarget=window.notificationTarget;
 }catch(_){}

 function enhanceNotificationPage(){
   const f=document.querySelector('.notificationFilters');if(!f||f.querySelector('[data-note-filter="services"]'))return;
   const b=document.createElement('button');b.className='btn';b.dataset.noteFilter='services';b.textContent='🛠 Services';
   b.onclick=()=>notificationsPage('services');f.appendChild(b)
 }

 async function serviceRequestsPage(){
   if(!user)return go('#/login');
   let r=await db.from('service_posts').select('*').eq('user_id',user.id).eq('post_type','request').neq('status','deleted').order('created_at',{ascending:false});
   let arr=r.data||[];
   app.innerHTML='<div class="wrap formPage"><div class="head"><div><span class="km24SectionKicker">🛠 SERVICES</span><h1 style="margin:5px 0">Meine Aufträge</h1><p class="mut">Aufträge, die du ausgeschrieben hast.</p></div><a class="btn primary" href="#/services/request/new">＋ Auftrag erstellen</a></div><div class="km24SvcMiniNav"><a class="btn" href="#/services">Services</a><a class="btn" href="#/services/mine">Meine Einträge</a><a class="btn" href="#/services/quotes">Meine Offerten</a><a class="btn" href="#/services/inbox">Nachrichten</a></div><div class="manage">'+(arr.length?arr.map(x=>'<div class="manageRow" style="grid-template-columns:1fr auto"><div><b>'+esc(x.title)+'</b><div class="mut">📍 '+esc((x.postal_code||'')+' '+(x.city||''))+' · '+dt(x.created_at)+'</div><div style="margin-top:6px"><span class="km24SvcStatus '+esc(x.status)+'">'+esc(serviceStatus(x.status))+'</span></div></div><div class="actions"><a class="btn" href="#/services/post/'+x.id+'">Öffnen</a></div></div>').join(''):'<div class="empty">Du hast noch keinen Service-Auftrag erstellt.</div>')+'</div></div>'
 }

 async function serviceQuotesPage(){
   if(!user)return go('#/login');
   let q=await db.from('service_quotes').select('*').eq('provider_id',user.id).order('created_at',{ascending:false}),quotes=q.data||[],posts={};
   if(quotes.length){
     let r=await db.from('service_posts').select('id,title,city,postal_code,status').in('id',[...new Set(quotes.map(x=>x.request_id))]);
     (r.data||[]).forEach(x=>posts[x.id]=x)
   }
   app.innerHTML='<div class="wrap formPage"><div class="head"><div><span class="km24SectionKicker">🧾 MEINE OFFERTEN</span><h1 style="margin:5px 0">Gesendete Angebote</h1><p class="mut">Behalte offene und angenommene Service-Offerten im Blick.</p></div><a class="btn" href="#/services">Services</a></div><div class="km24SvcMiniNav"><a class="btn" href="#/services/requests">Meine Aufträge</a><a class="btn" href="#/services/mine">Meine Einträge</a><a class="btn" href="#/services/inbox">Nachrichten</a></div><div class="manage">'+(quotes.length?quotes.map(x=>{let p=posts[x.request_id]||{};return '<div class="manageRow" style="grid-template-columns:1fr auto"><div><b>'+esc(p.title||'Service-Auftrag')+'</b><div>Deine Offerte: <b>CHF '+fmt(x.price_chf)+'</b>'+(x.price_model==='hourly'?' / Std.':x.price_model==='from'?' ab':'')+'</div><div class="mut">📍 '+esc((p.postal_code||'')+' '+(p.city||''))+' · '+dt(x.created_at)+'</div><div style="margin-top:6px"><span class="km24SvcStatus '+esc(x.status)+'">'+esc(serviceStatus(x.status))+'</span></div></div><div class="actions"><a class="btn" href="#/services/post/'+x.request_id+'">Auftrag</a><a class="btn" href="#/services/thread/'+x.thread_id+'">Chat</a></div></div>'}).join(''):'<div class="empty">Du hast noch keine Offerten gesendet.</div>')+'</div></div>'
 }

 function enhanceServices(){
   if(!location.hash.startsWith('#/services'))return;
   const head=document.querySelector('.km24SvcHero + .wrap.section .head .actions');
   if(head&&!head.querySelector('[href="#/services/requests"]')){
     head.insertAdjacentHTML('afterbegin','<a class="btn" href="#/services/requests">Meine Aufträge</a><a class="btn" href="#/services/quotes">Meine Offerten</a>')
   }
   const mine=document.querySelector('.formPage .head');
   if(location.hash==='#/services/mine'&&mine&&!document.getElementById('km24SvcMiniNavMine')){
     let n=document.createElement('div');n.id='km24SvcMiniNavMine';n.className='km24SvcMiniNav';n.innerHTML='<a class="btn" href="#/services/requests">Meine Aufträge</a><a class="btn" href="#/services/quotes">Meine Offerten</a><a class="btn" href="#/services/inbox">Service-Nachrichten</a>';mine.insertAdjacentElement('afterend',n)
   }
 }

 function accountServiceShortcut(){
   if(location.hash!=='#/me'||document.getElementById('km24AccountServiceShortcut'))return;
   const grid=document.querySelector('.km24AccountQuickGrid');if(!grid)return;
   let a=document.createElement('a');a.id='km24AccountServiceShortcut';a.href='#/services';a.className='km24BillingShortcut';a.innerHTML='<span>🛠️</span><div><b>Services</b><small>Dienstleistungen, Aufträge & Offerten</small></div><i>›</i>';grid.appendChild(a)
 }

 function launchBadge(){
   document.getElementById('km24LaunchBadge')?.remove();
 }

 function routeExtras(){
   const h=location.hash||'';
   if(h==='#/services/requests'){serviceRequestsPage();return}
   if(h==='#/services/quotes'){serviceQuotesPage();return}
   setTimeout(()=>{enhanceNotificationPage();enhanceServices();accountServiceShortcut();launchBadge()},50)
 }
 window.addEventListener('hashchange',()=>setTimeout(routeExtras,80));
 const appNode=document.getElementById('app');if(appNode)new MutationObserver(()=>{clearTimeout(window.__km24PolishTimer);window.__km24PolishTimer=setTimeout(()=>{enhanceNotificationPage();enhanceServices();accountServiceShortcut();launchBadge()},80)}).observe(appNode,{childList:true,subtree:true});
 setTimeout(routeExtras,220);
})();
