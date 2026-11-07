
(()=>{
const KM={reg:null,mo:null};
const b64=s=>{const p='='.repeat((4-s.length%4)%4),v=(s+p).replace(/-/g,'+').replace(/_/g,'/'),raw=atob(v),a=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)a[i]=raw.charCodeAt(i);return a};
async function currentUser(){try{return (await db.auth.getUser()).data.user||null}catch(e){return null}}
function ios(){return /iphone|ipad|ipod/i.test(navigator.userAgent)}
function iosStandalone(){return !ios()||navigator.standalone===true||(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)}
async function registration(){
 if(!('serviceWorker'in navigator))throw new Error('Service Worker werden auf diesem Gerät nicht unterstützt.');
 if(ios()&&!iosStandalone())throw new Error('Auf dem iPhone KaufMich24 zuerst über Teilen → Zum Home-Bildschirm hinzufügen und danach von dort öffnen.');
 if(KM.reg&&KM.reg.active)return KM.reg;
 let reg=await navigator.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'});
 try{await reg.update()}catch(e){}
 try{KM.reg=await navigator.serviceWorker.ready}catch(e){KM.reg=reg}
 return KM.reg
}
async function state(){
 let u=await currentUser();
 if(!u)return{user:false,supported:true,permission:'Notification'in window?Notification.permission:'unsupported',sub:false,installRequired:false};
 if(!('Notification'in window)||!('PushManager'in window)||!('serviceWorker'in navigator))return{user:true,supported:false,permission:'unsupported',sub:false,installRequired:false};
 if(ios()&&!iosStandalone())return{user:true,supported:true,permission:Notification.permission,sub:false,installRequired:true};
 let r=await registration(),s=await r.pushManager.getSubscription();
 return{user:true,supported:true,permission:Notification.permission,sub:!!s,installRequired:false}
}
async function enable(ask=true){
 if(!('Notification'in window)||!('PushManager'in window)||!('serviceWorker'in navigator))throw new Error('Push wird auf diesem Browser nicht unterstützt.');
 if(ios()&&!iosStandalone())throw new Error('Auf dem iPhone KaufMich24 zuerst über Teilen → Zum Home-Bildschirm hinzufügen und danach von dort öffnen.');
 let u=await currentUser();if(!u)throw new Error('Bitte zuerst anmelden.');
 let r=await registration(),perm=Notification.permission;
 if(perm==='default'&&ask)perm=await Notification.requestPermission();
 if(perm!=='granted')return{permission:perm};
 let sub=await r.pushManager.getSubscription();
 if(!sub){
   let k=await db.rpc('push_public_key');
   if(k.error||!k.data)throw new Error(k.error?.message||'Push-Schlüssel fehlt.');
   sub=await r.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64(String(k.data))})
 }
 let j=sub.toJSON(),x=await db.rpc('register_push_subscription',{p_endpoint:sub.endpoint,p_p256dh:j.keys?.p256dh||'',p_auth:j.keys?.auth||'',p_user_agent:navigator.userAgent});
 if(x.error)throw x.error;
 return{permission:'granted',sub:true}
}
async function disable(){
 let u=await currentUser();if(!u)return;
 if(ios()&&!iosStandalone())return true;
 let r=await registration(),sub=await r.pushManager.getSubscription();
 if(sub){await db.rpc('unregister_push_subscription',{p_endpoint:sub.endpoint});await sub.unsubscribe()}
 return true
}
window.km24EnablePush=enable;
window.km24PushState=state;
window.km24DisablePush=disable;

function compactMarketplaceSearch(){
 const allHeads=[...document.querySelectorAll('#app h2')];
 const title=allHeads.find(x=>['Inserate suchen','Neueste Inserate'].includes((x.textContent||'').trim()));
 if(!title){if(document.body)document.body.classList.remove('km24IOSFilterOpen');return}
 title.textContent='Neueste Inserate';
 const head=title.closest('.head')||title.parentElement;
 if(head)head.classList.add('marketSearchCompactHead');
 const desc=head&&head.querySelector('p');if(desc)desc.style.display='none';
 const section=title.closest('.section')||(head&&head.parentElement)||title.parentElement;
 const panel=section&&section.querySelector('.marketSearchPanel');
 if(!panel){if(document.body)document.body.classList.remove('km24IOSFilterOpen');return}
 let toggle=section.querySelector('.marketFilterToggle');
 if(!toggle){
   toggle=document.createElement('button');
   toggle.type='button';
   toggle.className='marketFilterToggle';
   toggle.innerHTML='<span>🔎 Filter anzeigen</span><span class=marketFilterHint>optional</span>';
   panel.insertAdjacentElement('beforebegin',toggle);
   panel.classList.add('marketMobileCollapsed');
   panel.classList.remove('marketMobileOpen');
 }
 function setOpen(open){
   panel.classList.toggle('marketMobileOpen',open);
   panel.classList.toggle('marketMobileCollapsed',!open);
   const first=toggle.querySelector('span:first-child');
   const hint=toggle.querySelector('.marketFilterHint');
   if(first)first.textContent=open?'✕ Filter schliessen':'🔎 Filter anzeigen';
   if(hint)hint.textContent=open?'geöffnet':'optional';
   const isiOS=ios();
   if(document.body)document.body.classList.toggle('km24IOSFilterOpen',isiOS&&open);
   if(open){
     setTimeout(()=>{
       try{const top=panel.getBoundingClientRect().top+window.pageYOffset-82;window.scrollTo({top:Math.max(0,top),behavior:isiOS?'auto':'smooth'})}
       catch(_){panel.scrollIntoView({block:'start'})}
     },60);
   }
 }
 toggle.onclick=()=>setOpen(!panel.classList.contains('marketMobileOpen'));
 const mobile=!!(window.matchMedia&&window.matchMedia('(max-width:700px)').matches);
 setOpen(panel.classList.contains('marketMobileOpen'));
 const apply=panel.querySelector('#applySearch');
 if(apply&&!apply.dataset.km24MobileResultBound){
   apply.dataset.km24MobileResultBound='1';
   apply.addEventListener('click',()=>{
     setTimeout(()=>{
       setOpen(false);
       const result=document.querySelector('.searchResultHead')||document.getElementById('grid');
       if(result){try{const top=result.getBoundingClientRect().top+window.pageYOffset-82;window.scrollTo({top:Math.max(0,top),behavior:ios()?'auto':'smooth'})}catch(_){result.scrollIntoView({block:'start'})}}
     },220);
   });
 }
 const reset=panel.querySelector('#resetSearch');
 if(reset&&!reset.dataset.km24MobileResetBound){
   reset.dataset.km24MobileResetBound='1';
   reset.addEventListener('click',()=>setTimeout(()=>setOpen(false),120));
 }
}

function modernizeNotifications(){
 const filters=document.querySelector('#app .notificationFilters');if(!filters)return null;
 const page=filters.closest('.formPage');if(!page)return null;
 page.classList.add('notifyModern');
 const head=page.querySelector(':scope > .head');if(head){
   head.classList.add('notifyPageHeader');
   const actions=head.querySelector(':scope > .actions');
   if(actions){
     const mark=actions.querySelector('#markAllNotes');if(mark)mark.textContent='✓ Alle gelesen';
     const account=actions.querySelector('a[href="#/me"]');if(account)account.textContent='👤 Mein Konto';
   }
 }
 let mount=page.querySelector('#pushMountV47');
 if(!mount){mount=document.createElement('div');mount.id='pushMountV47';filters.insertAdjacentElement('beforebegin',mount)}
 return mount
}
async function render(){
 compactMarketplaceSearch();
 let u=await currentUser(),mount=modernizeNotifications(),old=document.getElementById('pushSettingsV45');
 if(!u){if(old)old.remove();return}
 let h=[...document.querySelectorAll('#app h1')].find(x=>/Benachrichtigungen|Konto|Account/i.test(x.textContent||''));if(!h)return;
 if(old){if(mount&&old.parentElement!==mount)mount.appendChild(old);return refresh(old)}
 let box=document.createElement('div');box.id='pushSettingsV45';box.className='panel';
 box.innerHTML='<div class="pushTop"><div class="pushIcon">🔔</div><div class="pushCopy"><b>Push-Benachrichtigungen</b><div class="mut" id="pushStateText">Status wird geprüft …</div></div><span class="pushPill" id="pushStatusPill">Prüfen</span></div><div class="pushActions"><button class="btn primary" id="pushEnableBtn">Push aktivieren</button><button class="btn" id="pushDisableBtn">Push deaktivieren</button></div>'+(ios()?'<div class="mut" style="margin-top:9px;font-size:12.5px">iPhone/iPad: KaufMich24 zuerst zum Home-Bildschirm hinzufügen und von dort öffnen.</div>':'');
 if(mount)mount.appendChild(box);else{let pageHead=h.closest('.head');if(pageHead)pageHead.insertAdjacentElement('afterend',box);else h.insertAdjacentElement('afterend',box)}
 box.querySelector('#pushEnableBtn').onclick=async()=>{let t=box.querySelector('#pushStateText');t.textContent='Push wird aktiviert …';try{await enable(true)}catch(e){t.textContent=e.message||'Aktivierung fehlgeschlagen.'}await refresh(box)};
 box.querySelector('#pushDisableBtn').onclick=async()=>{let t=box.querySelector('#pushStateText');t.textContent='Push wird deaktiviert …';try{await disable()}catch(e){t.textContent=e.message||'Deaktivierung fehlgeschlagen.'}await refresh(box)};
 await refresh(box)
}
async function refresh(box){
 try{
   let s=await state(),t=box.querySelector('#pushStateText'),pill=box.querySelector('#pushStatusPill'),on=box.querySelector('#pushEnableBtn'),off=box.querySelector('#pushDisableBtn');
   pill.className='pushPill';
   if(!s.supported){t.textContent='Auf diesem Browser nicht verfügbar.';pill.textContent='Nicht verfügbar';on.hidden=true;off.hidden=true;return}
   if(s.installRequired){t.textContent='iPhone: KaufMich24 zuerst über Teilen → Zum Home-Bildschirm hinzufügen, dann von dort öffnen und Push aktivieren.';pill.textContent='Installation nötig';pill.classList.add('blocked');on.hidden=false;off.hidden=true;return}
   if(s.permission==='denied'){t.textContent='Push ist auf diesem Gerät blockiert. Bitte in den iPhone-Mitteilungseinstellungen für KaufMich24 wieder erlauben.';pill.textContent='Blockiert';pill.classList.add('blocked');on.hidden=true;off.hidden=true;return}
   if(s.permission==='granted'&&s.sub){t.textContent='Push ist auf diesem Gerät aktiv – auch für neue Chat-Nachrichten.';pill.textContent='Aktiv';pill.classList.add('active');on.hidden=true;off.hidden=false}
   else{t.textContent='Erhalte Chat-Nachrichten, Angebote, Gebote, Verkäufe und wichtige Updates sofort.';pill.textContent='Aus';on.hidden=false;off.hidden=true}
 }catch(e){
   let t=box.querySelector('#pushStateText'),pill=box.querySelector('#pushStatusPill');
   if(t)t.textContent=e?.message||'Push-Status konnte nicht geprüft werden.';
   if(pill){pill.textContent='Prüfen';pill.className='pushPill blocked'}
 }
}
new MutationObserver(()=>{clearTimeout(KM.mo);KM.mo=setTimeout(()=>{compactMarketplaceSearch();modernizeNotifications();render()},90)}).observe(document.getElementById('app'),{childList:true});
window.addEventListener('hashchange',()=>setTimeout(()=>{compactMarketplaceSearch();modernizeNotifications();render()},120));
window.addEventListener('load',async()=>{try{if('Notification'in window&&Notification.permission==='granted')await enable(false)}catch(e){}setTimeout(()=>{compactMarketplaceSearch();modernizeNotifications();render()},250)});
try{db.auth.onAuthStateChange(()=>setTimeout(async()=>{try{if('Notification'in window&&Notification.permission==='granted')await enable(false)}catch(e){}compactMarketplaceSearch();modernizeNotifications();render()},250))}catch(e){}
window.KaufMichPush={enable,disable,state};
})();
