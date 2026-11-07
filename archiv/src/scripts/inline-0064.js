
(function(){
  if(window.__km24ConversionV1)return;
  window.__km24ConversionV1=true;

  try{
    if(typeof ptxt==='function'&&!window.__km24OriginalPtxt){
      window.__km24OriginalPtxt=ptxt;
      const base=ptxt;
      ptxt=function(l,s){
        
        return base(l,s);
      };
    }
  }catch(e){console.warn('KM24 conversion price wrapper',e)}

  let queued=false;
  function lockedText(el){
    if(!el)return;
    el.textContent='🔒 Preis für registrierte Nutzer sichtbar';
    el.classList.add('km24GuestLockedPrice');
    el.title='Kostenlos anmelden, um den Preis zu sehen';
  }
  function sync(){
    queued=false;
    try{
      const guest=typeof user==='undefined'||!user;
      const h=location.hash||'#/';
      document.body.classList.toggle('km24Guest',guest);

      if(h==='#/'&&guest){
        if(!document.getElementById('km24GuestConversion')){
          const hero=document.querySelector('.km24HomeHero');
          if(hero){
            const sec=document.createElement('section');
            sec.id='km24GuestConversion';
            sec.className='km24GuestConversion';
            sec.innerHTML=
              '<div class="wrap"><div class="km24GuestConversionBox">'+
                '<div class="km24GuestConversionCopy"><span class="km24GuestConversionIcon">＋</span><div><b>Kostenlos inserieren und direkt handeln</b><span>Preise und Inserate kannst du frei ansehen. Ein kostenloses Konto brauchst du erst zum Inserieren, Bieten oder Kontaktieren.</span></div></div>'+
                '<div class="km24GuestConversionActions"><a class="btn primary" href="#/login?signup=1">Kostenlos inserieren</a><a class="btn" href="#/login">Anmelden</a></div>'+
              '</div></div>';
            hero.insertAdjacentElement('afterend',sec);
            sec.querySelector('a[href="#/login?signup=1"]')?.addEventListener('click',()=>{try{window.km24Track&&window.km24Track('guest_price_signup_cta')}catch(_){}});
          }
        }
      }else{
        document.getElementById('km24GuestConversion')?.remove();
      }

      document.querySelectorAll('.km24GuestPriceFilter').forEach(x=>x.classList.remove('km24GuestPriceFilter'));

      const loginPage=h.startsWith('#/login');
      const signup=loginPage&&document.getElementById('at')?.textContent.trim()==='Konto erstellen';
      document.body.classList.toggle('km24SignupMode',!!signup);
      if(signup){
        const panel=document.querySelector('.auth .panel');
        const form=document.getElementById('af');
        const intro=document.getElementById('ai');
        if(intro)intro.textContent='Kostenlos registrieren – Benutzername, E-Mail und Passwort. Mobilnummer und Wohnadresse ergänzt du erst später, wenn du kaufen oder verkaufen möchtest.';
        if(false){
          const box=document.createElement('div');
          box.id='km24SignupAssist';
          box.className='km24SignupAssist';
          box.innerHTML='<b>In wenigen Schritten startklar</b><span>Wähle deinen Benutzernamen, gib E-Mail und Passwort ein und bestätige die rechtlichen Grundlagen.</span><div class="km24SignupSteps"><i>1 · Konto</i><i>2 · E-Mail bestätigen</i><i>3 · Loslegen</i></div>';
          form.insertAdjacentElement('beforebegin',box);
        }
        const btn=document.getElementById('as');
        if(btn)btn.textContent='Kostenlos registrieren →';
      }else{
        document.getElementById('km24SignupAssist')?.remove();
      }

      const submit=document.getElementById('as');
      if(submit&&!submit.dataset.km24TapSafe){
        submit.dataset.km24TapSafe='1';
        submit.setAttribute('type','submit');
      }
    }catch(e){console.warn('KM24 conversion sync',e)}
  }
  function schedule(){
    if(queued)return;
    queued=true;
    setTimeout(sync,40);
  }
  document.addEventListener('click',e=>{
    if(e.target&&e.target.closest&&e.target.closest('#sw'))setTimeout(sync,80);
  },true);
  addEventListener('hashchange',schedule);
  addEventListener('pageshow',schedule);
  const mo=new MutationObserver(schedule);
  mo.observe(document.body,{childList:true,subtree:true});
  setTimeout(sync,0);
})();
