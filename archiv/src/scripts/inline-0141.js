
(function(){
 if(window.__km24DetailActionDedupeV1)return;
 window.__km24DetailActionDedupeV1=true;
 function clean(){
   try{
     var seller=document.querySelector('.detail .side .seller');
     var panel=seller&&seller.closest('.panel');
     if(!panel)return;
     var follows=Array.from(panel.querySelectorAll('[data-km24-follow-listing]'));
     follows.slice(1).forEach(function(x){x.remove()});
     var shares=Array.from(panel.querySelectorAll('#kmShareListing,[data-km24-share]'));
     if(shares.length>1){
       var keep=shares.find(function(x){return x.id==='kmShareListing'})||shares[0];
       shares.forEach(function(x){if(x!==keep)x.remove()});
     }
   }catch(_){}
 }
 var t=0;function queue(){clearTimeout(t);t=setTimeout(clean,20)}
 clean();setTimeout(clean,80);setTimeout(clean,300);
 try{new MutationObserver(queue).observe(document.getElementById('app')||document.body,{childList:true,subtree:true})}catch(_){}
 addEventListener('hashchange',queue,{passive:true});
 addEventListener('pageshow',queue,{passive:true});
})();
