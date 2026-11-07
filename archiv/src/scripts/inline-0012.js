
(function(){
  if(window.__km24SamsungForceLightV1)return;
  window.__km24SamsungForceLightV1=true;
  var r=document.documentElement;
  var samsung=/SamsungBrowser/i.test(navigator.userAgent||'');
  function sync(){
    try{
      var light=r.getAttribute('data-km24-theme')==='light';
      r.classList.toggle('km24SamsungLight',!!(samsung&&light));
      if(samsung&&light){
        r.style.setProperty('color-scheme','only light','important');
        var m=document.querySelector('meta[name="color-scheme"]');
        if(!m){m=document.createElement('meta');m.name='color-scheme';document.head.appendChild(m)}
        m.setAttribute('content','only light');
        var sm=document.querySelector('meta[name="supported-color-schemes"]');
        if(!sm){sm=document.createElement('meta');sm.name='supported-color-schemes';document.head.appendChild(sm)}
        sm.setAttribute('content','light');
      }
    }catch(e){}
  }
  sync();
  try{new MutationObserver(sync).observe(r,{attributes:true,attributeFilter:['data-km24-theme']})}catch(e){}
  addEventListener('pageshow',sync);
})();
