
(function(){
 if(window.__km24LightRuntimeV6)return;window.__km24LightRuntimeV6=true;
 function imp(el,p,v){try{el&&el.style.setProperty(p,v,'important')}catch(_){}}
 function apply(){
  try{
   if(document.documentElement.getAttribute('data-km24-theme')!=='light')return;
   document.querySelectorAll('.km24QuickFilter').forEach(function(b){
    var on=b.classList.contains('active');
    imp(b,'color',on?'#0b6845':'#374151');imp(b,'-webkit-text-fill-color',on?'#0b6845':'#374151');
    imp(b,'background',on?'#e7f4ed':'#ffffff');imp(b,'background-image','none');
    imp(b,'border-color',on?'#8fc9ad':'#d1d5db');imp(b,'opacity','1');imp(b,'text-shadow','none');
   });
   document.querySelectorAll('.km24MiniBtn').forEach(function(b){
    imp(b,'background','#ffffff');imp(b,'background-image','none');imp(b,'border-color','#d1d5db');
    imp(b,'color','#111827');imp(b,'-webkit-text-fill-color','#111827');imp(b,'opacity','1');imp(b,'text-shadow','none');
    imp(b,'box-shadow','0 2px 8px rgba(15,23,42,.06)');
    b.querySelectorAll('*').forEach(function(x){imp(x,'color','#111827');imp(x,'-webkit-text-fill-color','#111827');imp(x,'opacity','1');imp(x,'text-shadow','none')});
    var a=b.querySelector('.km24MiniArrow');if(a){imp(a,'color','#64748b');imp(a,'-webkit-text-fill-color','#64748b')}
   });
  }catch(_){}
 }
 var t=0;function q(){clearTimeout(t);t=setTimeout(apply,20)}
 apply();setTimeout(apply,120);setTimeout(apply,500);setTimeout(apply,1200);
 document.addEventListener('click',function(){setTimeout(apply,0);setTimeout(apply,100)},true);
 document.addEventListener('change',function(){setTimeout(apply,0);setTimeout(apply,100)},true);
 addEventListener('hashchange',q,{passive:true});addEventListener('pageshow',q,{passive:true});addEventListener('km24:language',q);
 try{var a=document.getElementById('app');if(a)new MutationObserver(q).observe(a,{childList:true,subtree:true})}catch(_){}
 try{new MutationObserver(q).observe(document.documentElement,{attributes:true,attributeFilter:['data-km24-theme']})}catch(_){}
})();
