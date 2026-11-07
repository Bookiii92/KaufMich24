
(function(){
 if(window.__km24SellerActivationFixV1)return;window.__km24SellerActivationFixV1=true;
 var lastHandled=0,scheduled=false,redirecting=false;
 var C={
  de:{activate:'Verkaufen aktivieren',create:'Erstes Inserat erstellen',need:'Mobilnummer und Wohnadresse ergänzen – danach kannst du sofort inserieren.',ready:'Dein Konto ist bereit. Jetzt dein erstes Inserat erstellen.',title:'Verkaufen aktivieren',note:'Zum Verkaufen brauchst du keine manuelle Freischaltung. Erforderlich sind eine bestätigte E-Mail, Mobilnummer und Wohnadresse.'},
  fr:{activate:'Activer la vente',create:'Créer la première annonce',need:'Ajoutez votre numéro de mobile et votre adresse, puis vous pourrez publier immédiatement.',ready:'Votre compte est prêt. Créez maintenant votre première annonce.',title:'Activer la vente',note:'Aucune validation manuelle ni vérification d’identité n’est nécessaire pour vendre. Il faut seulement un e-mail confirmé, un numéro de mobile et une adresse de domicile.'},
  it:{activate:'Attiva vendita',create:'Crea il primo annuncio',need:'Aggiungi numero di cellulare e indirizzo, poi potrai pubblicare subito.',ready:'Il tuo account è pronto. Crea ora il primo annuncio.',title:'Attiva vendita',note:'Per vendere non servono approvazione manuale né verifica del documento. Servono solo e-mail confermata, numero di cellulare e indirizzo di domicilio.'},
  en:{activate:'Enable selling',create:'Create first listing',need:'Add your mobile number and home address, then you can list immediately.',ready:'Your account is ready. Create your first listing now.',title:'Enable selling',note:'Selling does not require manual approval or ID verification. You only need a confirmed email, mobile number and home address.'}
 };
 function lang(){try{return typeof km24Language==='function'?km24Language():'de'}catch(_){return'de'}}
 function copy(){return C[lang()]||C.de}
 function isReady(){try{return typeof sellerReady==='function'&&sellerReady()}catch(_){return false}}
 function goTo(dest){try{if(typeof go==='function')return go(dest)}catch(_){}location.hash=dest}
 function polish(){
  try{
   var x=copy(),box=document.getElementById('km24FirstListing');
   if(box){
    var a=box.querySelector('.btn'),small=box.querySelector('small'),r=isReady();
    if(a){a.textContent=r?x.create:x.activate;a.setAttribute('href',r?'#/sell':'#/me');a.setAttribute('aria-label',a.textContent)}
    if(small)small.textContent=r?x.ready:x.need;
   }
   var h=location.hash||'';
   if(h.indexOf('#/verification?next=sell')===0){
    if(isReady()){
      if(!redirecting){redirecting=true;setTimeout(function(){goTo('#/sell')},120)}
      return;
    }
    var appEl=document.getElementById('app'),head=appEl&&appEl.querySelector('h1');
    if(head)head.textContent=x.title;
    if(appEl&&!document.getElementById('km24SellerActivationNotice')){
      var n=document.createElement('div');n.id='km24SellerActivationNotice';n.className='km24SellerActivationNotice';n.innerHTML='<b>'+x.title+'</b><span>'+x.note+'</span>';
      if(head)head.insertAdjacentElement('afterend',n);else appEl.prepend(n);
    }
   }else redirecting=false;
  }catch(_){}
 }
 function schedule(){if(scheduled)return;scheduled=true;(window.requestAnimationFrame||function(f){setTimeout(f,16)})(function(){scheduled=false;polish()})}
 function handle(ev){
  var a=null;try{a=ev.target&&ev.target.closest&&ev.target.closest('#km24FirstListing .btn')}catch(_){}
  if(!a)return;
  var now=Date.now();if(now-lastHandled<350){try{ev.preventDefault();ev.stopPropagation()}catch(_){}return}lastHandled=now;
  try{ev.preventDefault();ev.stopPropagation()}catch(_){}
  goTo(isReady()?'#/sell':'#/me');
 }
 document.addEventListener('click',handle,true);
 addEventListener('hashchange',function(){setTimeout(polish,40);setTimeout(polish,180)},{passive:true});
 addEventListener('pageshow',function(){setTimeout(polish,40)},{passive:true});
 addEventListener('km24:language',function(){setTimeout(polish,20)});
 var mo=new MutationObserver(schedule);if(document.body)mo.observe(document.body,{childList:true,subtree:true});
 polish();setTimeout(polish,250);
})();
