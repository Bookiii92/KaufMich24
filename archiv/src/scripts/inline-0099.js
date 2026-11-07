
(function(){
 if(window.__km24FounderFunnelV321)return;window.__km24FounderFunnelV321=true;
 var KEY='km24_founder_funnel_v1',CAMPAIGN='founder_program_2026',routeTimer=0;
 function routeKey(){return (location.hash||'#/').split('?')[0]}
 function read(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(_){return null}}
 function write(p){try{var x=read()||{};Object.keys(p||{}).forEach(function(k){x[k]=p[k]});localStorage.setItem(KEY,JSON.stringify(x));return x}catch(_){return p||{}}}
 function intent(){
   try{
     if((location.hash||'').indexOf('founder=1')>=0)return true;
     var x=read();if(x&&x.active!==false)return true;
     var m=(typeof user!=='undefined'&&user&&user.user_metadata)||{};
     return !!(m.founder_funnel&&!m.founder_funnel_completed)
   }catch(_){return false}
 }
 window.km24FounderIntent=intent;
 function sid(){
   try{var m=window.km24MarketingMeta?window.km24MarketingMeta():{},s=m&&m.marketing_session_id;if(s)return s}catch(_){}
   var x=read()||{};if(x.session_id)return x.session_id;
   var s='founder_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2);write({session_id:s});return s
 }
 async function track(name){
   try{
     var m=window.km24MarketingMeta?window.km24MarketingMeta():{};
     await db.rpc('track_marketing_event',{
       p_event_name:name,p_session_id:sid(),p_path:(location.pathname+location.search+location.hash).slice(0,300),
       p_source:(m&&m.marketing_source)||'onsite',p_medium:(m&&m.marketing_medium)||'founder',p_campaign:CAMPAIGN,
       p_content:'founder_funnel',p_term:(m&&m.marketing_term)||null,p_referrer:document.referrer||null
     })
   }catch(_){}
 }
 window.km24FounderTrack=track;
 function startIntent(){var x=read()||{};write({active:true,started_at:x.started_at||Date.now()});track('founder_cta_click')}
 async function founderStatus(){try{if(typeof user==='undefined'||!user)return null;var r=await db.rpc('my_founder_seller_status'),s=(r.data||[])[0]||null;return s}catch(_){return null}}
 async function markComplete(id,s){
   write({active:false,completed_at:Date.now(),listing_id:id||null,status:s&&s.status||'candidate'});
   try{await db.auth.updateUser({data:{founder_funnel:true,founder_funnel_completed:true}})}catch(_){}
 }
 async function afterListing(id){
   if(!intent())return false;
   try{
     var s=await founderStatus();
     try{sessionStorage.setItem('km24FounderListingJustCreated',JSON.stringify({id:id,status:s&&s.status||'not_started',at:Date.now()}))}catch(_){}
     if(s&&s.status==='qualified'){await track('founder_qualified');await markComplete(id,s)}
     else if(s&&s.status==='candidate'){await track('founder_candidate');await markComplete(id,s)}
     else write({last_listing_id:id,last_listing_at:Date.now()});
     if(typeof go==='function')go('#/founder');else location.hash='#/founder';
     return true
   }catch(_){return false}
 }
 window.km24FounderAfterListing=afterListing;
 async function renderFounderNotice(){
   if(routeKey()!=='#/founder')return;
   var main=document.querySelector('.km24FounderPage .wrap'),hero=document.querySelector('.km24FounderHero');if(!main||!hero)return;
   var old=document.getElementById('km24FounderFlowNotice');if(old)old.remove();
   var raw=null;try{raw=JSON.parse(sessionStorage.getItem('km24FounderListingJustCreated')||'null')}catch(_){}
   var s=await founderStatus();
   if(s&&s.status==='qualified')track('founder_qualified');
   else if(s&&s.status==='candidate')track('founder_candidate');
   if(!raw)return;
   var box=document.createElement('div');box.id='km24FounderFlowNotice';box.className='km24FounderFlowNotice';
   if(s&&s.status==='qualified')box.innerHTML='<div><b>🏆 Dein Gründer-Status ist aktiv.</b><span>Das Inserat wurde veröffentlicht und deine Gründer-Vorteile sind freigeschaltet.</span></div><a class="btn" href="#/listing/'+String(raw.id).replace(/[^a-zA-Z0-9-]/g,'')+'">Inserat ansehen →</a>';
   else if(s&&s.status==='candidate')box.innerHTML='<div><b>✅ Inserat veröffentlicht – du bist Gründer-Kandidat.</b><span>Deine Qualifikationszeit läuft jetzt. Den aktuellen Stand siehst du jederzeit hier.</span></div><a class="btn" href="#/listing/'+String(raw.id).replace(/[^a-zA-Z0-9-]/g,'')+'">Inserat ansehen →</a>';
   else box.innerHTML='<div><b>Inserat veröffentlicht.</b><span>Dieses Inserat erfüllt die Gründer-Bedingungen noch nicht. Für die Aktion muss es ein echtes öffentliches Verkaufsinserat sein.</span></div><a class="btn" href="#/listing/'+String(raw.id).replace(/[^a-zA-Z0-9-]/g,'')+'">Inserat prüfen →</a>';
   hero.insertAdjacentElement('afterend',box)
 }
 function decorateOnboarding(){
   if(routeKey()!=='#/verification'||!intent())return;
   var panel=document.querySelector('#app .formPage .panel');if(!panel||document.getElementById('km24FounderOnboardingHint'))return;
   var d=document.createElement('div');d.id='km24FounderOnboardingHint';d.className='km24FounderOnboardingHint';d.innerHTML='<b>🚀 Gründer-Aktion:</b> Ergänze Mobilnummer und Wohnadresse. Sobald alles vollständig ist, geht es direkt weiter zum ersten Inserat.';
   panel.insertBefore(d,panel.children[2]||panel.firstChild)
 }
 async function continueFlow(){
   if(!intent()||typeof user==='undefined'||!user||!user.email_confirmed_at)return;
   await track('founder_email_confirmed');
   var h=routeKey(),s=await founderStatus();
   if(s&&(s.status==='candidate'||s.status==='qualified')){write({active:false,status:s.status});return}
   if(h==='#/founder'||h==='#/sell')return;
   if(typeof sellerReady==='function'&&!sellerReady()){
     if(h==='#/verification')await track('founder_onboarding_view');
     return
   }
   if(h==='#/verification'){await track('founder_onboarding_complete');if(typeof go==='function')go('#/sell?founder=1');return}
 }
 async function adminPanel(){
   if(routeKey()!=='#/admin'||typeof profile==='undefined'||!profile||!profile.is_admin)return;
   var host=document.getElementById('km24MarketingPanel');if(!host)return;
   var box=document.getElementById('km24FounderAdminFunnel');if(!box){box=document.createElement('section');box.id='km24FounderAdminFunnel';box.className='panel';host.insertAdjacentElement('afterend',box)}
   var r=await db.rpc('admin_founder_funnel',{p_days:30});if(r.error)return;var x=r.data||{};
   box.innerHTML='<div class="head"><div><span class="km24SectionKicker">🚀 GRÜNDER-FUNNEL</span><h2 style="margin:5px 0">Gründer-Aktion · 30 Tage</h2><p class="mut">Vom Aufruf der Gründer-Seite bis zum echten Gründer-Kandidaten.</p></div><span class="badge">Live</span></div><div class="km24FounderAdminGrid"><div><b>'+Number(x.views||0)+'</b><small>Seitenaufrufe</small></div><div><b>'+Number(x.cta_clicks||0)+'</b><small>CTA-Klicks</small></div><div><b>'+Number(x.signup_completes||0)+'</b><small>Registrierungen</small></div><div><b>'+Number(x.email_confirmed||0)+'</b><small>E-Mail bestätigt</small></div><div><b>'+Number(x.onboarding_views||0)+'</b><small>Profil-Freigabe</small></div><div><b>'+Number(x.listing_starts||0)+'</b><small>Inserat gestartet</small></div><div><b>'+Number(x.candidates||0)+'</b><small>Kandidaten</small></div><div><b>'+Number(x.qualified_total_period||0)+'</b><small>Qualifiziert</small></div></div>'
 }
 function routeWork(){
   var h=location.hash||'',rk=routeKey();
   if(h.indexOf('founder=1')>=0)write({active:true,started_at:(read()||{}).started_at||Date.now()});
   if(rk==='#/founder'){track('founder_view');setTimeout(renderFounderNotice,120);setTimeout(renderFounderNotice,500);setTimeout(renderFounderNotice,1200)}
   if(rk==='#/verification'&&intent()){track('founder_onboarding_view');setTimeout(decorateOnboarding,120);setTimeout(decorateOnboarding,500);setTimeout(decorateOnboarding,1200)}
   if(rk==='#/sell'&&intent())track('founder_listing_start');
   clearTimeout(routeTimer);routeTimer=setTimeout(continueFlow,450);
   setTimeout(adminPanel,500);setTimeout(adminPanel,1200);setTimeout(adminPanel,2500)
 }
 document.addEventListener('click',function(e){
   try{
     var a=e.target&&e.target.closest&&e.target.closest('.km24FounderHome,.km24FounderHeroActions .btn.primary,.km24FounderFinal .btn.primary');
     if(a){startIntent();return}
     var c=e.target&&e.target.closest&&e.target.closest('#verifyContinue');if(c&&intent())track('founder_onboarding_complete')
   }catch(_){}
 },true);
 try{db.auth.onAuthStateChange(function(){setTimeout(routeWork,250);setTimeout(continueFlow,700)})}catch(_){}
 addEventListener('hashchange',routeWork,{passive:true});addEventListener('pageshow',routeWork,{passive:true});addEventListener('focus',function(){setTimeout(continueFlow,250)},{passive:true});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(routeWork,120)},{once:true});else setTimeout(routeWork,120)
})();
