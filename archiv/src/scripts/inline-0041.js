
(function(){
 if(window.__km24RewardFeedbackV1)return;window.__km24RewardFeedbackV1=true;

 const statusLabel={open:"Offen",reviewed:"Geprüft",planned:"Geplant",done:"Umgesetzt",declined:"Nicht eingeplant"};
 const catLabel={idea:"Idee",problem:"Problem",design:"Design",feature:"Funktionswunsch",other:"Sonstiges"};
 const scopeLabel={all:"Alle Zahlungen",promotion:"Promotionen",subscription:"Abos",sale_fee:"Verkaufsgebühren",account_activation:"Käuferaktivierung"};
 const discountKey="km24ActiveDiscountCode";

 function activeDiscount(){try{return (localStorage.getItem(discountKey)||"").trim().toUpperCase()}catch(e){return""}}
 function setActiveDiscount(v){try{if(v)localStorage.setItem(discountKey,String(v).trim().toUpperCase());else localStorage.removeItem(discountKey)}catch(e){}}
 function stars(n){n=Number(n||0);return "★★★★★".split("").map((x,i)=>i<n?"★":"☆").join("")}

 const invokeBase=db.functions.invoke.bind(db.functions);
 db.functions.invoke=async function(name,opts){
   let next=opts||{};
   if(name==="kaufmich-billing-checkout"){
     let code=activeDiscount(),body=Object.assign({},next.body||{});
     if(code&&body.use_points!==true)body.discount_code=code;
     next=Object.assign({},next,{body:body});
   }
   return invokeBase(name,next)
 };

 async function renderCodePanel(){
   let page=app.querySelector(".formPage");if(!page||document.getElementById("km24CodePanel"))return;
   let head=page.querySelector(":scope > .head")||page.firstElementChild;
   let box=document.createElement("section");box.id="km24CodePanel";box.className="panel km24CodeBox";
   if(!user){
     box.innerHTML="<span class='km24SectionKicker'>🎁 GESCHENK- & RABATTCODES</span><h2>Code einlösen</h2><p class='mut'>Melde dich an, um Geschenkcodes gutzuschreiben oder einen Rabattcode für die nächste Zahlung zu aktivieren.</p><a class='btn primary' href='#/login'>Anmelden</a>";
     head?.insertAdjacentElement("afterend",box);return
   }
   box.innerHTML="<span class='km24SectionKicker'>🎁 GESCHENK- & RABATTCODES</span><h2 style='margin:6px 0'>Hast du einen Code?</h2><p class='mut'>Geschenkcodes schreiben dir KaufMich24-Punkte gut. Rabattcodes werden automatisch bei der nächsten passenden Zahlung angewendet.</p><div class='km24CodeRow'><input id='km24RewardCodeInput' maxlength='32' placeholder='CODE EINGEBEN' autocomplete='off'><button class='btn primary' id='km24RewardCodeBtn'>Code einlösen</button></div><div id='km24RewardCodeMsg'></div><div id='km24ActiveCodeMount'></div>";
   head?.insertAdjacentElement("afterend",box);

   async function showActive(){
     let mount=document.getElementById("km24ActiveCodeMount"),code=activeDiscount();if(!mount)return;
     if(!code){mount.innerHTML="";return}
     let pr=await db.rpc("reward_code_preview",{p_code:code});
     let x=(pr.data||[])[0];
     if(pr.error||!x?.valid||!String(x.kind||"").startsWith("discount_")){setActiveDiscount("");mount.innerHTML="";return}
     let val=x.kind==="discount_percent"?F(x.discount_percent)+" %":"CHF "+F(x.discount_chf);
     mount.innerHTML="<div class='km24ActiveCode'><div><b>Aktiver Rabattcode: "+E(x.code)+"</b><div class='mut'>"+E(val)+" · "+E(scopeLabel[x.scope]||x.scope)+"</div></div><button class='btn' id='km24RemoveDiscount'>Entfernen</button></div>";
     document.getElementById("km24RemoveDiscount").onclick=()=>{setActiveDiscount("");showActive()}
   }

   document.getElementById("km24RewardCodeBtn").onclick=async()=>{
     let input=document.getElementById("km24RewardCodeInput"),msg=document.getElementById("km24RewardCodeMsg"),btn=document.getElementById("km24RewardCodeBtn"),code=(input.value||"").trim().toUpperCase();
     if(!code){msg.innerHTML=N("Bitte einen Code eingeben.",1);return}
     btn.disabled=true;msg.innerHTML=N("Code wird geprüft …");
     let pr=await db.rpc("reward_code_preview",{p_code:code}),x=(pr.data||[])[0];
     if(pr.error||!x?.valid){msg.innerHTML=N(pr.error?.message||x?.message||"Code ist nicht gültig.",1);btn.disabled=false;return}
     if(x.kind==="gift_points"){
       let rr=await db.rpc("redeem_gift_code",{p_code:code}),v=(rr.data||[])[0];
       if(rr.error){msg.innerHTML=N(rr.error.message,1);btn.disabled=false;return}
       input.value="";msg.innerHTML=N("✓ Geschenkcode eingelöst: "+Number(v?.points_added||0)+" Punkte wurden gutgeschrieben.");
       setTimeout(()=>feesPage(),900);return
     }
     setActiveDiscount(code);input.value="";
     let val=x.kind==="discount_percent"?F(x.discount_percent)+" %":"CHF "+F(x.discount_chf);
     msg.innerHTML=N("✓ Rabattcode aktiviert: "+val+". Er wird bei der nächsten passenden Zahlung automatisch angewendet.");
     btn.disabled=false;showActive()
   };
   showActive()
 }

 window.userFeedbackPage=async function(){
   if(!user)return go("#/login?next=feedback");
   let q=await db.from("user_feedback").select("*").eq("user_id",user.id).order("created_at",{ascending:false}).limit(30),items=q.data||[];
   app.innerHTML="<div class='wrap formPage'><div class='head'><div><span class='km24SectionKicker'>NUTZERFEEDBACK</span><h1 style='margin:5px 0 0'>Hilf uns, KaufMich24 besser zu machen</h1><p class='mut'>Ideen, Probleme und Wünsche landen direkt beim KaufMich24-Team.</p></div><a class='btn' href='#/me'>Mein Konto</a></div><section class='panel km24FeedbackBox'><h2>Wie findest du KaufMich24?</h2><p class='mut'>Bewerte deine Erfahrung und sag uns, was wir verbessern sollen.</p><label>Kategorie<select id='km24FeedbackCat'><option value='idea'>Idee</option><option value='problem'>Problem</option><option value='design'>Design</option><option value='feature'>Funktionswunsch</option><option value='other'>Sonstiges</option></select></label><div style='margin-top:12px'><b>Bewertung</b><div class='km24StarRow' id='km24StarRow'>"+[1,2,3,4,5].map(n=>"<button type='button' class='km24StarBtn' data-star='"+n+"' aria-label='"+n+" Sterne'>★</button>").join("")+"</div></div><label>Dein Feedback<textarea id='km24FeedbackText' rows='6' maxlength='3000' placeholder='Was gefällt dir? Was fehlt? Was sollte einfacher werden?'></textarea></label><div class='actions' style='margin-top:12px'><button class='btn primary' id='km24FeedbackSend'>Feedback senden</button></div><div id='km24FeedbackMsg'></div></section><section class='section'><div class='head'><div><h2>Dein bisheriges Feedback</h2><p class='mut'>Du siehst hier auch Antworten und den Bearbeitungsstatus.</p></div></div><div class='km24FeedbackList'>"+(items.length?items.map(f=>"<div class='km24FeedbackItem'><div class='km24FeedbackHead'><div><b>"+E(catLabel[f.category]||f.category)+" · <span style='color:#f0aa42'>"+E(stars(f.rating))+"</span></b><div class='mut'>"+E(D(f.created_at))+"</div></div><span class='km24FeedbackStatus'>"+E(statusLabel[f.status]||f.status)+"</span></div><p style='white-space:pre-wrap;margin:10px 0 0'>"+E(f.message)+"</p>"+(f.public_reply?"<div class='km24FeedbackReply'><b>Antwort von KaufMich24</b><div style='white-space:pre-wrap;margin-top:4px'>"+E(f.public_reply)+"</div></div>":"")+"</div>").join(""):"<div class='empty'>Du hast noch kein Feedback gesendet.</div>")+"</div></section></div>";
   let rating=0,row=document.getElementById("km24StarRow");
   function paint(){row?.querySelectorAll("[data-star]").forEach(b=>b.classList.toggle("on",Number(b.dataset.star)<=rating))}
   row?.querySelectorAll("[data-star]").forEach(b=>b.onclick=()=>{rating=Number(b.dataset.star);paint()});
   document.getElementById("km24FeedbackSend").onclick=async()=>{
     let btn=document.getElementById("km24FeedbackSend"),msg=document.getElementById("km24FeedbackMsg"),body=(document.getElementById("km24FeedbackText").value||"").trim(),cat=document.getElementById("km24FeedbackCat").value;
     if(!rating){msg.innerHTML=N("Bitte 1 bis 5 Sterne wählen.",1);return}
     if(body.length<3){msg.innerHTML=N("Bitte beschreibe dein Feedback etwas genauer.",1);return}
     btn.disabled=true;btn.textContent="Wird gesendet …";
     let r=await db.rpc("submit_user_feedback",{p_category:cat,p_rating:rating,p_message:body,p_page_path:location.hash||"#/"});
     if(r.error){msg.innerHTML=N(r.error.message,1);btn.disabled=false;btn.textContent="Feedback senden";return}
     msg.innerHTML=N("✓ Danke! Dein Feedback wurde übermittelt.");
     setTimeout(()=>window.userFeedbackPage(),700)
   }
 };

 function addAccountExtras(){
   let page=app.querySelector(".formPage");if(!page||document.getElementById("km24AccountExtras"))return;
   let wrap=document.createElement("div");wrap.id="km24AccountExtras";wrap.className="km24AccountExtrasSplit";
   wrap.innerHTML="<section class='panel km24AccountExtraCard'><div class='head' style='margin:0 0 10px'><div><span class='km24SectionKicker'>GUTSCHEINE</span><h2 style='margin:5px 0 0'>Geschenk- & Rabattcodes</h2><p class='mut' style='margin:6px 0 0'>Hast du einen Code erhalten? Hier kannst du ihn einlösen.</p></div></div><a class='btn' style='width:100%' href='#/fees'>🎁 Geschenk- oder Rabattcode einlösen</a></section><section class='panel km24AccountExtraCard'><div class='head' style='margin:0 0 10px'><div><span class='km24SectionKicker'>DEINE MEINUNG</span><h2 style='margin:5px 0 0'>Feedback an KaufMich24</h2><p class='mut' style='margin:6px 0 0'>Sag uns, was dir gefällt oder was wir verbessern können.</p></div></div><a class='btn primary' style='width:100%' href='#/feedback'>💬 Feedback geben</a></section>";
   let lower=page.querySelector(".km24AccountAccordion");
   if(lower)lower.insertAdjacentElement("afterend",wrap);else page.appendChild(wrap)
 }

 async function renderAdminRewardCodes(){
   if(!profile?.is_admin)return;
   let host=app.querySelector(".formPage");if(!host||document.getElementById("km24AdminRewardCodes"))return;
   let [cr,rr]=await Promise.all([
     db.from("reward_codes").select("*").order("created_at",{ascending:false}).limit(100),
     db.from("reward_code_redemptions").select("code_id,status")
   ]);
   let codes=cr.data||[],counts={};
   (rr.data||[]).forEach(x=>{if(["reserved","used"].includes(x.status))counts[x.code_id]=(counts[x.code_id]||0)+1});
   let sec=document.createElement("section");sec.id="km24AdminRewardCodes";sec.className="section";
   sec.innerHTML="<div class='head'><div><span class='km24SectionKicker'>GUTSCHEINE</span><h2>Geschenk- & Rabattcodes</h2><p class='mut'>Geschenkcodes geben Punkte. Rabattcodes reduzieren passende Zahlungen.</p></div></div><div class='panel'><div class='km24AdminCodeForm'><label>Code <input id='kmCodeCode' maxlength='32' placeholder='leer = automatisch'></label><label>Titel <input id='kmCodeTitle' maxlength='120' placeholder='z. B. Herbstaktion'></label><label>Typ <select id='kmCodeKind'><option value='gift_points'>Geschenkcode – Punkte</option><option value='discount_percent'>Rabatt – Prozent</option><option value='discount_fixed'>Rabatt – CHF</option></select></label><label id='kmCodeValueLabel'>Punkte <input id='kmCodeValue' type='number' min='0' step='1' value='1000'></label><label>Gilt für <select id='kmCodeScope'><option value='all'>Alle Zahlungen</option><option value='promotion'>Promotionen</option><option value='subscription'>Abos</option><option value='sale_fee'>Verkaufsgebühren</option><option value='account_activation'>Käuferaktivierung</option></select></label><label>Max. Einlösungen <input id='kmCodeMax' type='number' min='1' placeholder='unbegrenzt'></label><label>Pro Nutzer <input id='kmCodePerUser' type='number' min='1' max='100' value='1'></label><label>Gültig bis <input id='kmCodeUntil' type='datetime-local'></label><label class='wide'>Beschreibung <input id='kmCodeDesc' maxlength='300' placeholder='optional'></label><div class='wide'><button class='btn primary' id='kmCodeCreate'>Code erstellen</button><span id='kmCodeCreateMsg' style='margin-left:8px'></span></div></div></div><div class='km24AdminCodeList'>"+(codes.length?codes.map(c=>{let val=c.kind==="gift_points"?Number(c.points)+" Punkte":c.kind==="discount_percent"?F(c.discount_percent)+" %":"CHF "+F(c.discount_chf),used=counts[c.id]||0;return "<div class='km24AdminMini'><div class='head' style='margin:0'><div><b style='font-size:17px'>"+E(c.code)+"</b><div class='mut'>"+E(c.title)+" · "+E(val)+" · "+E(scopeLabel[c.scope]||c.scope)+"</div></div><span class='badge "+(c.is_active?"":"auction")+"'>"+(c.is_active?"Aktiv":"Inaktiv")+"</span></div><div class='mut' style='margin-top:6px'>Einlösungen: "+used+(c.max_redemptions?" / "+c.max_redemptions:"")+" · Pro Nutzer: "+c.per_user_limit+(c.valid_until?" · bis "+E(D(c.valid_until)):"")+"</div><div class='actions' style='margin-top:8px'><button class='btn' data-code-copy='"+E(c.code)+"'>Code kopieren</button><button class='btn' data-code-toggle='"+c.id+"' data-active='"+(c.is_active?"1":"0")+"'>"+(c.is_active?"Deaktivieren":"Aktivieren")+"</button></div></div>"}).join(""):"<div class='empty'>Noch keine Codes erstellt.</div>")+"</div>";
   host.appendChild(sec);

   function updateValueLabel(){
     let k=document.getElementById("kmCodeKind").value,l=document.getElementById("kmCodeValueLabel");
     l.firstChild.textContent=k==="gift_points"?"Punkte ":k==="discount_percent"?"Rabatt in % ":"Rabatt in CHF ";
     let i=document.getElementById("kmCodeValue");i.step=k==="gift_points"?"1":"0.01";if(k==="discount_percent"&&Number(i.value)>100)i.value="10"
   }
   document.getElementById("kmCodeKind").onchange=updateValueLabel;updateValueLabel();
   document.getElementById("kmCodeCreate").onclick=async()=>{
     let kind=document.getElementById("kmCodeKind").value,val=Number(document.getElementById("kmCodeValue").value||0),until=document.getElementById("kmCodeUntil").value,msg=document.getElementById("kmCodeCreateMsg"),btn=document.getElementById("kmCodeCreate");
     btn.disabled=true;msg.textContent="Wird erstellt …";
     let x=await db.rpc("admin_create_reward_code",{
       p_code:document.getElementById("kmCodeCode").value||"",
       p_kind:kind,
       p_title:document.getElementById("kmCodeTitle").value||"",
       p_description:document.getElementById("kmCodeDesc").value||null,
       p_points:kind==="gift_points"?Math.round(val):0,
       p_discount_percent:kind==="discount_percent"?val:0,
       p_discount_chf:kind==="discount_fixed"?val:0,
       p_scope:document.getElementById("kmCodeScope").value,
       p_max_redemptions:document.getElementById("kmCodeMax").value?Number(document.getElementById("kmCodeMax").value):null,
       p_per_user_limit:Number(document.getElementById("kmCodePerUser").value||1),
       p_valid_until:until?new Date(until).toISOString():null
     });
     if(x.error){msg.textContent=x.error.message;btn.disabled=false;return}
     let made=(x.data||[])[0];msg.textContent="✓ "+(made?.code||"Code")+" erstellt";setTimeout(()=>adminPage(),650)
   };
   sec.querySelectorAll("[data-code-toggle]").forEach(b=>b.onclick=async()=>{b.disabled=true;let x=await db.rpc("admin_set_reward_code_active",{p_code_id:b.dataset.codeToggle,p_active:b.dataset.active!=="1"});if(x.error){alert(x.error.message);b.disabled=false}else adminPage()});
   sec.querySelectorAll("[data-code-copy]").forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(b.dataset.codeCopy);b.textContent="✓ Kopiert"}catch(e){prompt("Code kopieren:",b.dataset.codeCopy)}})
 }

 async function renderAdminFeedback(){
   if(!profile?.is_admin)return;
   let host=app.querySelector(".formPage");if(!host||document.getElementById("km24AdminFeedback"))return;
   let [fr,ur]=await Promise.all([
     db.from("user_feedback").select("*").order("created_at",{ascending:false}).limit(100),
     db.rpc("admin_list_users")
   ]);
   let rows=fr.data||[],users={};(ur.data||[]).forEach(u=>users[u.id]=u);
   let sec=document.createElement("section");sec.id="km24AdminFeedback";sec.className="section";
   sec.innerHTML="<div class='head'><div><span class='km24SectionKicker'>NUTZERSTIMME</span><h2>Nutzerfeedback</h2><p class='mut'>Ideen, Probleme und Wünsche direkt aus der Plattform.</p></div><span class='badge'>"+rows.length+" Einträge</span></div><div class='km24AdminFeedbackList'>"+(rows.length?rows.map(f=>{let u=users[f.user_id]||{},name=u.business_name||u.display_name||u.email||f.user_id;return "<div class='km24AdminMini' data-feedback-card='"+f.id+"'><div class='km24FeedbackHead'><div><b>"+E(name)+" · "+E(catLabel[f.category]||f.category)+" · <span style='color:#f0aa42'>"+E(stars(f.rating))+"</span></b><div class='mut'>"+E(D(f.created_at))+(u.email?" · "+E(u.email):"")+"</div></div><span class='km24FeedbackStatus'>"+E(statusLabel[f.status]||f.status)+"</span></div><p style='white-space:pre-wrap'>"+E(f.message)+"</p><div class='km24AdminFeedbackControls'><select data-f-status><option value='open'>Offen</option><option value='reviewed'>Geprüft</option><option value='planned'>Geplant</option><option value='done'>Umgesetzt</option><option value='declined'>Nicht eingeplant</option></select><input data-f-reply maxlength='3000' placeholder='Antwort an Nutzer' value='"+E(f.public_reply||"")+"'><input data-f-note maxlength='3000' placeholder='Interne Notiz' value='"+E(f.admin_note||"")+"'><button class='btn primary' data-f-save='"+f.id+"'>Speichern</button></div></div>"}).join(""):"<div class='empty'>Noch kein Nutzerfeedback.</div>")+"</div>";
   host.appendChild(sec);
   rows.forEach(f=>{let card=sec.querySelector("[data-feedback-card='"+f.id+"']"),sel=card?.querySelector("[data-f-status]");if(sel)sel.value=f.status});
   sec.querySelectorAll("[data-f-save]").forEach(b=>b.onclick=async()=>{let card=b.closest("[data-feedback-card]"),id=b.dataset.fSave,status=card.querySelector("[data-f-status]").value,reply=card.querySelector("[data-f-reply]").value,note=card.querySelector("[data-f-note]").value;b.disabled=true;let x=await db.rpc("admin_update_user_feedback",{p_feedback_id:id,p_status:status,p_public_reply:reply||null,p_admin_note:note||null});if(x.error){alert(x.error.message);b.disabled=false}else{b.textContent="✓ Gespeichert";setTimeout(()=>adminPage(),500)}})
 }

 const baseFees=feesPage;
 feesPage=async function(){await baseFees();await renderCodePanel()};

 const baseMe=me;
 me=async function(){await baseMe();addAccountExtras()};

 const baseAdmin=adminPage;
 adminPage=async function(){await baseAdmin();await renderAdminRewardCodes();await renderAdminFeedback()};

 if((location.hash||"")==="#/feedback")setTimeout(()=>window.userFeedbackPage(),80);
})();
