
(function(){
 if(window.__km24MarketingTrackingV2)return;window.__km24MarketingTrackingV2=true;
 const KEY='km24_marketing_attr_v2',OLDKEY='km24_marketing_attr_v1',SID='km24_marketing_sid_v1',PIX='km24_marketing_pixel_sent_v2';
 function clean(v,n){v=String(v||'').trim();return v?v.slice(0,n||160):''}
 function queryParams(){
   const out=new URLSearchParams(location.search||'');
   try{
     const h=String(location.hash||''),i=h.indexOf('?');
     if(i>=0)new URLSearchParams(h.slice(i+1)).forEach((v,k)=>{if(!out.has(k))out.set(k,v)})
   }catch(_){}
   return out
 }
 function sessionId(){
   try{
     let s=sessionStorage.getItem(SID);
     if(!s){s=(crypto.randomUUID?(window.crypto&&typeof crypto.randomUUID==='function'?crypto.randomUUID():('km24_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2))):(Date.now()+'-'+Math.random().toString(16).slice(2)));sessionStorage.setItem(SID,s)}
     return s
   }catch(_){return 's-'+Date.now()+'-'+Math.random().toString(16).slice(2)}
 }
 function refSource(){
   try{
     if(!document.referrer)return ['direct','none'];
     const u=new URL(document.referrer),h=u.hostname.toLowerCase().replace(/^www\./,'');
     if(h===location.hostname.toLowerCase().replace(/^www\./,''))return ['direct','none'];
     if(h==='facebook.com'||h.endsWith('.facebook.com')||h==='instagram.com'||h.endsWith('.instagram.com')||h==='fb.com'||h.endsWith('.fb.com'))return ['meta','referral'];
     if(h==='tiktok.com'||h.endsWith('.tiktok.com'))return ['tiktok','referral'];
     if(h==='google.com'||h.endsWith('.google.com')||h.startsWith('google.'))return ['google','organic'];
     if(h==='bing.com'||h.endsWith('.bing.com'))return ['bing','organic'];
     return [h,'referral']
   }catch(_){return ['direct','none']}
 }
 function clickSource(q){
   if(q.get('fbclid'))return ['meta','paid_social'];
   if(q.get('ttclid'))return ['tiktok','paid_social'];
   if(q.get('gclid'))return ['google','paid_search'];
   if(q.get('msclkid'))return ['microsoft','paid_search'];
   return null
 }
 function hasSignal(q){
   return ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid','ttclid','gclid','msclkid'].some(k=>!!q.get(k))
 }
 function readOld(){
   try{return JSON.parse(sessionStorage.getItem(KEY)||sessionStorage.getItem(OLDKEY)||'null')}catch(_){return null}
 }
 function capture(){
   const q=queryParams(),old=readOld(),ref=refSource(),click=clickSource(q);
   const external=ref[0]!=='direct',freshSignal=hasSignal(q)||(external&&(!old||(old.source==='direct'&&old.medium==='none')));
   if(old&&!freshSignal)return old;
   const fallback=click||ref;
   const a={
     session_id:sessionId(),
     source:clean(q.get('utm_source')||fallback[0],100)||'direct',
     medium:clean(q.get('utm_medium')||fallback[1],100)||'none',
     campaign:clean(q.get('utm_campaign'),160),
     content:clean(q.get('utm_content'),160),
     term:clean(q.get('utm_term'),160),
     landing_path:clean(location.pathname+location.search+location.hash,300),
     referrer:clean(document.referrer,300)
   };
   try{sessionStorage.setItem(KEY,JSON.stringify(a));sessionStorage.setItem(OLDKEY,JSON.stringify(a))}catch(_){}
   return a
 }
 function meta(){
   const a=capture();
   return {
     marketing_session_id:a.session_id,
     marketing_source:a.source,
     marketing_medium:a.medium,
     marketing_campaign:a.campaign||null,
     marketing_content:a.content||null,
     marketing_term:a.term||null,
     marketing_landing_path:a.landing_path||null
   }
 }
 function pixelWasSent(name){
   try{const x=JSON.parse(sessionStorage.getItem(PIX)||'{}');return !!x[name]}catch(_){return false}
 }
 function markPixelSent(name){
   try{const x=JSON.parse(sessionStorage.getItem(PIX)||'{}');x[name]=Date.now();sessionStorage.setItem(PIX,JSON.stringify(x))}catch(_){}
 }
 async function track(name){
   if(!['landing_view','signup_start','signup_complete'].includes(name))return;
   const a=capture();
   try{
     await db.rpc('track_marketing_event',{
       p_event_name:name,p_session_id:a.session_id,
       p_path:(location.pathname+location.search+location.hash).slice(0,300),
       p_source:a.source,p_medium:a.medium,p_campaign:a.campaign||null,
       p_content:a.content||null,p_term:a.term||null,p_referrer:a.referrer||null
     })
   }catch(_){}
   if(pixelWasSent(name))return;
   markPixelSent(name);
   try{
     if(typeof window.fbq==='function'){
       const eid='km24-'+a.session_id+'-'+name;
       if(name==='signup_start')window.fbq('track','Lead',{content_name:'KaufMich24 Registrierung'},{eventID:eid});
       if(name==='signup_complete')window.fbq('track','CompleteRegistration',{content_name:'KaufMich24 Registrierung'},{eventID:eid});
     }
     if(window.ttq&&typeof window.ttq.track==='function'){
       if(name==='signup_start')window.ttq.track('ClickButton',{content_name:'signup_start'});
       if(name==='signup_complete')window.ttq.track('CompleteRegistration')
     }
   }catch(_){}
 }
 function shouldTrackLanding(){
   const q=queryParams(),h=location.hash||'';
   if(h.startsWith('#/start'))return true;
   if(hasSignal(q))return true;
   return refSource()[0]!=='direct'
 }
 window.km24MarketingMeta=meta;
 window.km24Track=track;
 capture();
 function routeEvent(){
   const h=location.hash||'';
   if(shouldTrackLanding())track('landing_view');
   if(h.startsWith('#/login')&&h.includes('signup=1'))track('signup_start')
 }
 addEventListener('hashchange',routeEvent,{passive:true});
 addEventListener('popstate',routeEvent,{passive:true});
 setTimeout(routeEvent,80)
})();
