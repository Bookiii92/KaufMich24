
(function(){
 if(window.__km24UxTrustWantedV1)return;
 window.__km24UxTrustWantedV1=true;
 var signupStep=1;

 function signupMode(){
   var at=document.getElementById("at"),nr=document.getElementById("nr");
   return !!at && (at.textContent.trim()==="Konto erstellen" || (!!nr && !nr.classList.contains("hide")));
 }
 function elLabel(id){var x=document.getElementById(id);return x&&x.closest("label")}
 function setHidden(el,hidden){if(el)el.classList.toggle("km24WizardHidden",!!hidden)}
 function signupGroups(){
   return {
     acc:document.getElementById("acc"),
     nr:document.getElementById("nr"),
     br:document.getElementById("br"),
     company:document.getElementById("km24SignupCompanyToggle"),
     email:elLabel("email"),
     pw:elLabel("pw"),
     rr:document.getElementById("rr"),
     address:document.getElementById("signupAddressBlock"),
     phone:document.getElementById("phr"),
     legal:document.getElementById("km24SignupLegal"),
     submit:document.getElementById("as")
   };
 }
 function signupMessage(text){
   var m=document.getElementById("am");
   if(m)m.innerHTML=typeof N==="function"?N(text,1):"<div class='notice err'>"+text+"</div>";
 }
 function validStep1(){
   var name=document.getElementById("name"),email=document.getElementById("email"),pw=document.getElementById("pw");
   if(!name||!name.value.trim()){signupMessage("Bitte Benutzername eingeben.");return false}
   try{var u=km24UsernameRule(name.value.trim(),"","");if(!u.ok){signupMessage(u.message);return false}}catch(_){}
   var br=document.getElementById("br"),biz=document.getElementById("business");
   if(br&&!br.classList.contains("hide")&&biz&&!biz.value.trim()){signupMessage("Bitte Firmennamen eingeben.");return false}
   if(!email||!email.value.trim()||!email.checkValidity()){signupMessage("Bitte eine gültige E-Mail-Adresse eingeben.");return false}
   if(!pw||pw.value.length<8){signupMessage("Das Passwort muss mindestens 8 Zeichen lang sein.");return false}
   var m=document.getElementById("am");if(m)m.innerHTML="";
   return true
 }
 function validStep2(){
   var res=document.getElementById("signupResidency"),street=document.getElementById("signupStreet"),
       postal=document.getElementById("signupPostal"),city=document.getElementById("signupCity"),
       ac=document.getElementById("signupAddressConfirm"),ph=document.getElementById("signupPhone");
   if(!street||!street.value.trim()||!postal||!postal.value.trim()||!city||!city.value.trim()||!ac||!ac.checked){
     signupMessage("Bitte deine vollständige Wohnadresse angeben und bestätigen.");return false
   }
   if(res&&res.value==="CH"&&!/^\d{4}$/.test(postal.value.trim())){signupMessage("Bitte eine gültige 4-stellige Schweizer PLZ eingeben.");return false}
   if(res&&res.value==="FOREIGN"&&!/^[A-Za-z0-9][A-Za-z0-9 -]{1,11}$/.test(postal.value.trim())){signupMessage("Bitte eine gültige Postleitzahl eingeben.");return false}
   try{if(!normalizePhone(ph?ph.value:"",res?res.value:"CH")){signupMessage("Bitte eine gültige Mobilnummer eingeben.");return false}}catch(_){
     if(!ph||!ph.value.trim()){signupMessage("Bitte eine gültige Mobilnummer eingeben.");return false}
   }
   var m=document.getElementById("am");if(m)m.innerHTML="";
   return true
 }
 function renderSignupStep(step){
   if(!signupMode())return cleanupSignupUX();
   signupStep=Math.max(1,Math.min(2,step||1));
   var g=signupGroups(),steps=document.querySelectorAll(".km24SignupStep");
   steps.forEach(function(s,i){s.classList.toggle("active",i===signupStep-1);s.classList.toggle("done",i<signupStep-1)});
   [g.acc,g.nr,g.br,g.company,g.email,g.pw].forEach(function(x){setHidden(x,signupStep!==1)});
   [g.address,g.phone].forEach(function(x){setHidden(x,true)});if(g.rr){g.rr.classList.toggle("hide",signupStep!==2);setHidden(g.rr,signupStep!==2)};
   setHidden(g.legal,signupStep!==2);setHidden(g.submit,signupStep!==2);
   var back=document.getElementById("km24SignupBack"),next=document.getElementById("km24SignupNext");
   if(back){back.style.display=signupStep===1?"none":""}
   if(next){next.style.display=signupStep===2?"none":"";next.textContent="Weiter: Bestätigen →"}
   var hint=document.getElementById("km24SignupWizardHint");
   if(hint)hint.textContent=signupStep===1?"1 von 2 · Konto anlegen":"2 von 2 · Wohnsitz wählen und Bedingungen bestätigen";
 }
 function cleanupSignupUX(){
   document.querySelector(".km24SignupStepper")?.remove();
   document.querySelector(".km24SignupWizardActions")?.remove();
   document.getElementById("km24SignupWizardHint")?.remove();
   var g=signupGroups();Object.keys(g).forEach(function(k){if(g[k])g[k].classList.remove("km24WizardHidden")});
   signupStep=1;
 }
 function initSignupUX(){
   if(!document.getElementById("af"))return;
   if(!signupMode())return cleanupSignupUX();
   var panel=document.getElementById("af").closest(".panel");
   if(!document.querySelector(".km24SignupStepper")){
     signupStep=1;
     var ai=document.getElementById("ai");
     if(ai)ai.insertAdjacentHTML("afterend",
       '<div class="km24SignupStepper" aria-label="Registrierung in 2 Schritten">'+
       '<div class="km24SignupStep active"><b>1</b>Konto</div>'+
       '<div class="km24SignupStep"><b>2</b>Bestätigen</div>'+
       '</div>'+
       '<div class="km24SignupWizardHint" id="km24SignupWizardHint"></div>');
     var form=document.getElementById("af");
     form.insertAdjacentHTML("beforeend",
       '<div class="km24SignupWizardActions" id="km24SignupWizardActions">'+
       '<button type="button" class="btn" id="km24SignupBack">← Zurück</button>'+
       '<button type="button" class="btn primary" id="km24SignupNext">Weiter →</button></div>');
     document.getElementById("km24SignupBack").onclick=function(){renderSignupStep(signupStep-1)};
     document.getElementById("km24SignupNext").onclick=function(){
       if(signupStep===1&&!validStep1())return;
       
       renderSignupStep(signupStep+1);try{panel?.scrollIntoView({behavior:"smooth",block:"start"})}catch(_){}
     };
     if(!form.dataset.km24WizardGuard){
       form.dataset.km24WizardGuard="1";
       form.addEventListener("submit",function(ev){
         if(!signupMode())return;
         if(signupStep>=2){
           if(!validStep1()){ev.preventDefault();ev.stopImmediatePropagation();renderSignupStep(1);return}
           return;
         }
         ev.preventDefault();ev.stopImmediatePropagation();
         if(signupStep===1&&!validStep1())return;
         
         renderSignupStep(signupStep+1);
         try{panel?.scrollIntoView({behavior:"smooth",block:"start"})}catch(_){}
       },true);
     }
   }
   var signupForm=document.getElementById("af");
   if(!signupForm.dataset.km24SignupSubmitGuard){
     signupForm.dataset.km24SignupSubmitGuard="1";
     var baseSubmit=signupForm.onsubmit,pending=false;
     signupForm.onsubmit=async function(ev){
       ev.preventDefault();if(pending)return;
       pending=true;var button=document.getElementById("as");if(button)button.disabled=true;
       try{return await baseSubmit.call(this,ev)}
       catch(_){signupMessage("Die Registrierung konnte gerade nicht abgeschlossen werden. Bitte versuche es nochmals.")}
       finally{pending=false;if(button&&button.isConnected)button.disabled=false}
     };
   }
   renderSignupStep(signupStep||1);
 }
 function trustEnhance(){
   if(!user||!profile)return;
   var bar=document.querySelector(".km24SecurityBar");
   if(!bar||document.querySelector(".km24TrustStatusGrid"))return;
   var emailOk=!!(user.email_confirmed_at||user.confirmed_at),
       phoneOk=!!profile.phone,
       addressOk=!!profile.address_confirmed_at,
       ready=[emailOk,phoneOk,addressOk].filter(Boolean).length;
   var html='<div class="km24TrustStatusHeadline"><b>Dein Vertrauensstatus</b><small>'+ready+'/3 Grundbestätigungen</small></div>'+
     '<div class="km24TrustStatusGrid">'+
       '<div class="km24TrustStatusItem '+(emailOk?'ok':'')+'"><i>'+(emailOk?'✓':'○')+'</i><span>E-Mail '+(emailOk?'bestätigt':'offen')+'</span></div>'+
       '<div class="km24TrustStatusItem '+(phoneOk?'ok':'')+'"><i>'+(phoneOk?'✓':'○')+'</i><span>Mobilnummer '+(phoneOk?'hinterlegt':'offen')+'</span></div>'+
       '<div class="km24TrustStatusItem '+(addressOk?'ok':'')+'"><i>'+(addressOk?'✓':'○')+'</i><span>Adresse '+(addressOk?'bestätigt':'offen')+'</span></div>'+
     '</div>';
   bar.insertAdjacentHTML("afterend",html);
 }
 try{
   if(typeof login==="function"){
     var baseLogin=login;
     login=function(){var r=baseLogin.apply(this,arguments);setTimeout(initSignupUX,30);return r}
   }
 }catch(_){}
 try{
   if(typeof me==="function"){
     var baseMeTrust=me;
     me=async function(){var r=await baseMeTrust.apply(this,arguments);trustEnhance();return r}
   }
 }catch(_){}
 document.addEventListener("click",function(e){
   if(e.target&&e.target.closest&&e.target.closest("#sw"))setTimeout(function(){signupStep=1;initSignupUX()},20);
   if(e.target&&e.target.closest&&e.target.closest("[data-a]"))setTimeout(function(){if(signupMode())renderSignupStep(signupStep)},20);
 },false);
 addEventListener("hashchange",function(){setTimeout(function(){initSignupUX();trustEnhance()},80)},{passive:true});
 addEventListener("pageshow",function(){setTimeout(function(){initSignupUX();trustEnhance()},80)},{passive:true});
 setTimeout(function(){initSignupUX();trustEnhance()},120);
})();
