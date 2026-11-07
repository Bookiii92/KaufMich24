
(function(){
 if(window.__km24ExistingAddressConfirmV1)return;
 window.__km24ExistingAddressConfirmV1=true;
 function missing(){try{return !!(user&&profile&&!profile.address_confirmed_at)}catch(_){return false}}
 function msg(text,bad){
   var m=document.getElementById("profileMsg");
   if(m)m.innerHTML=typeof N==="function"?N(text,!!bad):text;
 }
 function addToAccount(){
   if(!missing())return;
   var page=document.querySelector(".km24AccountPage"),form=document.getElementById("profileForm");
   if(!page||!form)return;
   if(!document.getElementById("km24AddressMissingNotice")){
     page.insertAdjacentHTML("afterbegin",
       '<div class="km24AddressMissingNotice" id="km24AddressMissingNotice"><div><b>📍 Wohnadresse einmalig bestätigen</b><small>Bitte prüfe deine Adresse unten und bestätige sie einmalig. Danach kann sie aus Sicherheitsgründen nur noch durch den KaufMich24-Admin geändert werden.</small></div><button type="button" class="btn primary" id="km24AddressJumpBtn">Adresse prüfen</button></div>');
     document.getElementById("km24AddressJumpBtn").onclick=function(e){
       if(e){e.preventDefault();e.stopPropagation()}
       try{
         var settings=form.closest("details")||document.querySelector(".km24ProfileSettings");
         if(settings)settings.open=true;
       }catch(_){}
       setTimeout(function(){
         try{form.scrollIntoView({behavior:"smooth",block:"start"})}catch(_){}
         setTimeout(function(){try{document.getElementById("pstreet")?.focus()}catch(_){}},180);
       },40)
     };
   }
   if(!document.getElementById("paddressconfirm")){
     var anchor=document.getElementById("profileMsg");
     var box='<label class="km24AddressConfirmBox"><input id="paddressconfirm" type="checkbox" required><span>Ich bestätige, dass die angegebene Wohn-/Firmenadresse korrekt ist. Nach dieser Bestätigung kann sie nur noch durch den KaufMich24-Admin geändert werden.</span></label>';
     if(anchor)anchor.insertAdjacentHTML("beforebegin",box);else form.insertAdjacentHTML("beforeend",box);
   }
   if(!form.dataset.km24AddressGuard){
     form.dataset.km24AddressGuard="1";
     form.addEventListener("submit",async function(ev){
       if(!missing()||form.dataset.km24AddressConfirmedNow==="1")return;
       ev.preventDefault();ev.stopImmediatePropagation();
       var check=document.getElementById("paddressconfirm");
       if(!check||!check.checked){msg("Bitte bestätige zuerst, dass deine Adresse korrekt ist.",true);return}
       var street=String(document.getElementById("pstreet")?.value||"").trim(),
           postal=String(document.getElementById("pzip")?.value||"").trim(),
           city=String(document.getElementById("pcity")?.value||"").trim(),
           canton=String(document.getElementById("pcanton")?.value||"").trim().toUpperCase();
       if(!street||!postal||!city){msg("Bitte Strasse, PLZ und Ort vollständig ausfüllen.",true);return}
       var submit=form.querySelector('button[type="submit"],input[type="submit"]');
       if(submit)submit.disabled=true;
       msg("Adresse wird bestätigt …");
       var rr=await db.rpc("confirm_my_address",{p_street_address:street,p_postal_code:postal,p_city:city,p_canton:canton||null});
       if(rr.error){if(submit)submit.disabled=false;msg(rr.error.message||"Adresse konnte nicht bestätigt werden.",true);return}
       await loadProfile();
       form.dataset.km24AddressConfirmedNow="1";
       msg("✓ Adresse bestätigt. Profil wird gespeichert.");
       if(submit)submit.disabled=false;
       setTimeout(function(){try{window.km24RequestSubmit(form)}catch(_){try{submit?.click()}catch(__){}}},80);
     },true);
   }
 }
 function closePrompt(){document.getElementById("km24AddressPromptOverlay")?.remove()}
 function showPrompt(){
   if(!missing()||document.getElementById("km24AddressPromptOverlay"))return;
   try{if(sessionStorage.getItem("km24AddressPromptShownV1")==="1")return;sessionStorage.setItem("km24AddressPromptShownV1","1")}catch(_){}
   var ov=document.createElement("div");
   ov.id="km24AddressPromptOverlay";ov.className="km24AddressPromptOverlay";
   ov.innerHTML='<div class="km24AddressPrompt" role="dialog" aria-modal="true"><h2 style="color:#172538!important;-webkit-text-fill-color:#172538!important;opacity:1!important">Adresse noch bestätigen</h2><p>Für Kauf- und Verkaufsfunktionen muss deine Wohnadresse einmalig bestätigt sein. Danach ist sie geschützt und kann nur noch durch den Admin geändert werden.</p><div class="actions"><button type="button" class="btn primary" id="km24AddressPromptNow">Jetzt bestätigen</button><button type="button" class="btn" id="km24AddressPromptLater">Später</button></div></div>';
   document.body.appendChild(ov);
   document.getElementById("km24AddressPromptNow").onclick=function(){closePrompt();go("#/me");setTimeout(addToAccount,160)};
   document.getElementById("km24AddressPromptLater").onclick=closePrompt;
 }
 try{
   if(typeof me==="function"){
     var baseMeAddress=me;
     me=async function(){var r=await baseMeAddress.apply(this,arguments);addToAccount();return r};
     window.me=me;
   }
 }catch(_){}
 addEventListener("hashchange",function(){setTimeout(function(){addToAccount();if(missing())showPrompt()},140)},{passive:true});
 addEventListener("pageshow",function(){setTimeout(function(){addToAccount();showPrompt()},350)},{passive:true});
 setTimeout(function(){addToAccount();showPrompt()},650);
})();
