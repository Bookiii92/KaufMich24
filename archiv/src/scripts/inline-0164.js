
(function(){
  if(window.__km24RegisterCleanup20261107)return;
  window.__km24RegisterCleanup20261107=true;
  function sync(){
    var f=document.getElementById('af');if(!f)return;
    var t=document.getElementById('at');var signup=!!t&&t.textContent.trim()==='Konto erstellen';
    var email=document.getElementById('email');
    if(email){if(email.autocomplete!=='email')email.autocomplete='email';if(email.getAttribute('autocapitalize')!=='none')email.setAttribute('autocapitalize','none')}
    var pw=document.getElementById('pw');
    if(pw){
      var mode=signup?'signup':'login';
      if(pw.dataset.km24AuthMode!==mode){pw.type='password';pw.dataset.km24AuthMode=mode;var prev=pw.parentElement.querySelector('.km24PassReveal');if(prev){prev.textContent='Anzeigen';prev.setAttribute('aria-pressed','false')}}
      var ac=signup?'new-password':'current-password';if(pw.autocomplete!==ac)pw.autocomplete=ac;
      if(!pw.parentElement.querySelector('.km24PassReveal')){
        var button=document.createElement('button');button.type='button';button.className='km24PassReveal';button.textContent='Anzeigen';button.setAttribute('aria-label','Passwort anzeigen');button.setAttribute('aria-pressed','false');
        button.onclick=function(){var visible=pw.type==='text';pw.type=visible?'password':'text';button.textContent=visible?'Anzeigen':'Verbergen';button.setAttribute('aria-label',visible?'Passwort anzeigen':'Passwort verbergen');button.setAttribute('aria-pressed',String(!visible))};
        pw.insertAdjacentElement('afterend',button)
      }
    }
    var original=document.getElementById('legalr'),newConsent=document.getElementById('km24SignupLegal');
    if(original)original.classList.toggle('km24RegisterOriginalLegalHidden',!!signup&&!!newConsent&&f.contains(newConsent));
  }
  var pending=false;function queue(){if(pending)return;pending=true;setTimeout(function(){pending=false;sync()},0)}
  var root=document.getElementById('app');if(root)new MutationObserver(queue).observe(root,{childList:true,subtree:true});
  document.addEventListener('click',function(e){if(e.target&&e.target.closest&&e.target.closest('#sw,[data-a]'))setTimeout(sync,70)},true);
  addEventListener('hashchange',queue);addEventListener('pageshow',queue);sync();
})();
