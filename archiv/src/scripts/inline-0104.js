
(function(){
 if(window.__km24VehicleGridV4)return;window.__km24VehicleGridV4=true;
 function imp(el,p,v){try{el.style.setProperty(p,v,'important')}catch(_){}}
 function apply(){
   var root=document.querySelector('.detail');if(!root)return;
   var groups=root.querySelectorAll('.km24DetailOverview,.km24DetailSpecsExtra,.panel .specs');
   groups.forEach(function(g){
     imp(g,'display','grid');imp(g,'grid-template-columns','repeat(2,minmax(0,1fr))');imp(g,'gap','7px');imp(g,'width','100%');imp(g,'max-width','100%');
     g.querySelectorAll(':scope > .spec').forEach(function(s){
       imp(s,'display','block');imp(s,'grid-column','auto');imp(s,'width','auto');imp(s,'max-width','none');imp(s,'min-width','0');imp(s,'height','auto');imp(s,'min-height','0');imp(s,'margin','0');imp(s,'padding','9px 10px');imp(s,'box-sizing','border-box');
       var sm=s.querySelector('small'),b=s.querySelector('b');
       if(sm){imp(sm,'display','block');imp(sm,'margin','0 0 2px');imp(sm,'font-size','10px');imp(sm,'line-height','1.15')}
       if(b){imp(b,'display','block');imp(b,'margin','0');imp(b,'font-size','13.5px');imp(b,'line-height','1.2')}
     });
   });
 }
 var queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;apply()})}
 var app=document.getElementById('app');if(app&&window.MutationObserver)new MutationObserver(queue).observe(app,{childList:true,subtree:true});
 addEventListener('hashchange',function(){setTimeout(apply,20)});addEventListener('pageshow',function(){setTimeout(apply,20)});
 document.addEventListener('click',function(){setTimeout(apply,0)},true);
 setTimeout(apply,0);setTimeout(apply,100);setTimeout(apply,500);
})();
