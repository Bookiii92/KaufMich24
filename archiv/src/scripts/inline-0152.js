
(function(){
 if(window.__km24HomeOrchestratorV1)return;window.__km24HomeOrchestratorV1=true;
 const baseHome=home;
 let generation=0;
 function onHome(){const h=(location.hash||'#/').split('?')[0];return h==='#/'||h==='#'}
 async function km24HomeOrchestrated(){
   const run=++generation;
   await baseHome();
   if(run!==generation||!onHome())return;
   const hooks=(window.__km24HomeHooks||[]).slice();
   for(const hook of hooks){
     if(run!==generation||!onHome())return;
     try{await hook()}catch(e){console.warn('KM24 home hook failed',e)}
   }
 }
 home=km24HomeOrchestrated;window.home=km24HomeOrchestrated;
 if(onHome())setTimeout(function(){km24HomeOrchestrated()},0);
})();
