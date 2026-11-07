
(function(){
 function sync(){
   try{
     var t=document.documentElement.getAttribute('data-km24-theme')||'light';
     var m=document.querySelector('meta[name="theme-color"]');
     if(m)m.setAttribute('content',t==='dark'?'#111315':'#ffffff');
     var s=document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
     if(s)s.setAttribute('content',t==='dark'?'black-translucent':'default');
   }catch(_){}
 }
 sync();
 new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['data-km24-theme']});
 addEventListener('pageshow',sync);
})();
