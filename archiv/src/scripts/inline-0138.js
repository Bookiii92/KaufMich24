
(function(){
 if(window.__km24JobsScrollSeparationV4)return;
 window.__km24JobsScrollSeparationV4=true;
 function tagResults(){
   try{
     var app=document.getElementById('app'),grid=document.getElementById('grid');
     if(!app||!grid)return;
     var node=grid;
     while(node&&node.parentElement&&node.parentElement!==app)node=node.parentElement;
     if(node&&node.parentElement===app)node.classList.add('km24JobsResultsSection');
   }catch(_){}
 }
 function sync(){
   tagResults();
   try{
     var bar=document.getElementById('km24AreaBarSection');
     if(bar){bar.style.setProperty('position','relative','important');bar.style.setProperty('top','auto','important')}
   }catch(_){}
 }
 addEventListener('hashchange',function(){setTimeout(sync,20);setTimeout(sync,160)});
 addEventListener('pageshow',function(){setTimeout(sync,40);setTimeout(sync,180)});
 document.addEventListener('click',function(e){
   if(e.target&&e.target.closest&&e.target.closest('[data-km24-area],[data-km24-job-kind]')){setTimeout(sync,0);setTimeout(sync,80);setTimeout(sync,240)}
 },true);
 try{var app=document.getElementById('app');if(app)new MutationObserver(function(){setTimeout(sync,25)}).observe(app,{childList:true})}catch(_){}
 setTimeout(sync,0);setTimeout(sync,120);setTimeout(sync,500);
})();
