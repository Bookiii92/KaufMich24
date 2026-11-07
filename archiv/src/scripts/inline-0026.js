
(function(){
if(window.__km24ChatPurposeV2)return;window.__km24ChatPurposeV2=true;

let st=document.createElement("style");st.id="km24-chat-purpose-style-v2";st.textContent=
".km24PurposeOverlay{position:fixed;inset:0;background:#0009;z-index:10050;display:grid;place-items:center;padding:16px}.km24PurposeModal{width:min(680px,100%);background:#1f1e1a;border:1px solid #514b43;border-radius:20px;padding:24px;position:relative;box-shadow:0 30px 80px #0008}.km24PurposeModal h2{font-size:30px;margin:5px 0 6px}.km24PurposeClose{position:absolute;right:12px;top:10px;width:40px;height:40px;border:0;border-radius:50%;background:#2c2924;color:#fff;font-size:26px}.km24PurposeChoices{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px}.km24PurposeChoice{border:1px solid #575149;background:#292722;color:#eef3ef;border-radius:16px;padding:18px;text-align:left;min-height:160px}.km24PurposeChoice:hover{border-color:#138a5b}.km24PurposeChoice>span{font-size:34px;display:block;margin-bottom:9px}.km24PurposeChoice b{font-size:18px;display:block;margin-bottom:6px}.km24PurposeChoice small{color:#aab3ad;line-height:1.45}.km24ChatPolicy{margin:10px 12px 0;padding:12px 14px;border:1px solid #514b43;border-radius:13px;background:#27251f}.km24ChatPolicy.locked{border-color:#725a34;background:#2d271b}.km24ChatPolicy.unlocked{border-color:#285f46;background:#183629}.km24ChatPolicy h4{margin:0 0 7px;font-size:17px}.km24ChatPolicy p{margin:0;color:#c3cbc6}.km24PolicyExplain{display:grid;gap:3px;padding:9px 10px;border-radius:10px;background:#211e18;border:1px solid #4d4233;color:#c9c4ba;font-size:13px;line-height:1.45}.km24PolicyExplain b{color:#f3eee5}.km24ContactLockedHint{font-size:11px;color:#c6a977;margin-top:6px}.km24VisitGroup{margin-top:10px;padding:10px;border:1px solid #5a5145;border-radius:12px;background:#211f1b}.km24VisitGroupHead{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:8px}.km24VisitGroupHead b{font-size:14px}.km24VisitList{display:grid;gap:7px}.km24VisitOption{display:grid;grid-template-columns:30px minmax(0,1fr) auto;gap:9px;align-items:center;padding:9px;border:1px solid #49443d;border-radius:10px;background:#292722}.km24VisitNo{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#17382b;color:#b8efd5;font-weight:900;font-size:12px}.km24VisitTime{font-weight:850;color:#f1f4f2;font-size:14px}.km24VisitNote{font-size:12px;color:#aab3ad;margin-top:2px}.km24VisitOption .btn{min-height:38px;padding:7px 10px;font-size:12px}.km24VisitActions{display:flex;gap:8px;flex-wrap:wrap;margin-top:9px}.km24VisitForm{display:grid;gap:9px;margin-top:10px;padding:10px;border:1px solid #514b43;border-radius:11px;background:#211f1b}.km24SlotList{display:grid;gap:7px}.km24SlotRow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px;align-items:end}.km24SlotRow label{font-size:12px;font-weight:800;color:#d9dedb}.km24SlotRow input,.km24VisitForm textarea{width:100%;margin-top:4px;background:#2a2925;color:#f1f5f2;border:1px solid #575149;border-radius:10px;padding:10px}.km24RemoveSlot{width:42px;height:42px;border:1px solid #62584e;border-radius:10px;background:#332b26;color:#e8d6c6;font-size:18px}.km24AddSlot{justify-self:start;min-height:38px!important;padding:7px 10px!important;font-size:12px!important}.km24VisitFormActions{display:flex;gap:8px;flex-wrap:wrap}.km24VisitMsg:not(:empty){margin-top:4px;padding:9px 10px;border-radius:10px;background:#2b211b;border:1px solid #6b4d3f;color:#f0d3c5;font-size:12px}.km24ChatPolicyMsg{margin:0 12px 8px}.km24WaitingLine{font-size:12px;color:#aab3ad;margin-top:8px}.km24ResponseDeadline{margin-top:9px;padding:9px 10px;border:1px solid #5c513c;border-radius:10px;background:#292419;color:#d9c79b;font-size:12px;line-height:1.45}.km24ResponseDeadline strong{color:#fff0bf}.km24MessageRuleIcon{font-size:18px;margin-right:4px}@media(max-width:640px){.km24PurposeChoices{grid-template-columns:1fr}.km24PurposeModal{padding:20px}.km24PurposeChoice{min-height:0}.km24ChatPolicy{margin:8px 8px 0;padding:11px}.km24VisitOption{grid-template-columns:28px 1fr}.km24VisitOption .btn{grid-column:1/-1;width:100%}.km24VisitActions{display:grid;grid-template-columns:1fr}.km24VisitActions .btn{width:100%}.km24VisitFormActions{display:grid;grid-template-columns:1fr}.km24VisitFormActions .btn{width:100%}.km24SlotRow{grid-template-columns:minmax(0,1fr) 42px}.km24ChatPane.km24VisitFormOpen{overflow:hidden!important}.km24ChatPane.km24VisitFormOpen .km24ChatPolicy{flex:1 1 auto;min-height:0;overflow-y:auto!important;-webkit-overflow-scrolling:touch;padding-bottom:18px!important}.km24ChatPane.km24VisitFormOpen .km24ChatMessages,.km24ChatPane.km24VisitFormOpen .km24ChatComposer,.km24ChatPane.km24VisitFormOpen .km24ChatPolicyMsg{display:none!important}.km24ChatPane.km24VisitFormOpen .km24VisitFormActions{position:sticky;bottom:0;z-index:5;margin:8px -2px 0;padding:9px 2px 2px;background:linear-gradient(180deg,rgba(33,31,27,0),#211f1b 28%)}.km24ChatPane.km24VisitFormOpen .km24VisitFormActions .btn{min-height:50px!important;font-size:15px!important}.km24ChatPane.km24VisitFormOpen .km24VisitMsg{padding-bottom:6px}}";
document.head.appendChild(st);

function visitFmt(v){
 try{return new Intl.DateTimeFormat("de-CH",{dateStyle:"medium",timeStyle:"short"}).format(new Date(v))}catch{return String(v||"")}
}
function inputMin(){
 let d=new Date(Date.now()+15*60000);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,16)
}
function inputMax(){
 let d=new Date(Date.now()+365*24*60*60000);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,16)
}
function looksLikeContact(v){
 v=String(v||"");
 return /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(v)
   ||/(https?:\/\/|www\.|wa\.me|t\.me|whatsapp|telegram|signal|viber|snapchat|instagram|facebook|messenger)/i.test(v)
   ||/(^|[^0-9])(\+|00)[0-9][0-9 ()/.\-]{6,}[0-9]([^0-9]|$)/.test(v)
   ||/(^|[^0-9])0(7[5-9]|1[5-7])[0-9 ()/.\-]{6,}[0-9]([^0-9]|$)/.test(v)
   ||/(telefonnummer|handynummer|mobilnummer)/i.test(v)
}
function visitFormHtml(id,mode){
 let submit=mode==="counter"?"Gegenvorschläge senden":"Termine vorschlagen";
 return "<form id='"+id+"' class='km24VisitForm hide'>"+
   "<div class='km24SlotList'><div class='km24SlotRow'><label>Termin 1<input class='km24SlotInput' type='datetime-local' min='"+E(inputMin())+"' max='"+E(inputMax())+"' required></label><span></span></div></div>"+
   "<button class='btn km24AddSlot' type='button'>＋ Weiteren Termin hinzufügen</button>"+
   "<label>Hinweis <small class='mut'>(optional)</small><textarea class='km24VisitNoteInput' maxlength='500' rows='2' placeholder='z. B. Treffpunkt oder kurze Info'></textarea></label>"+
   "<div class='km24VisitMsg' aria-live='polite'></div>"+
   "<div class='km24VisitFormActions'><button class='btn primary' type='submit'>"+E(submit)+"</button></div></form>"
}
function bindVisitForm(formId,convId,mode){
 let form=document.getElementById(formId);if(!form)return;
 let list=form.querySelector(".km24SlotList"),add=form.querySelector(".km24AddSlot");
 function renumber(){
   let rows=[...list.querySelectorAll(".km24SlotRow")];
   rows.forEach((row,i)=>{
     let lab=row.querySelector("label");if(lab)lab.childNodes[0].nodeValue="Termin "+(i+1);
     let holder=row.lastElementChild;
     if(i===0){holder.innerHTML=""}
     else holder.innerHTML="<button type='button' class='km24RemoveSlot' aria-label='Termin entfernen'>×</button>"
   });
   add.disabled=rows.length>=3;
   add.textContent=rows.length>=3?"Maximal 3 Termine":"＋ Weiteren Termin hinzufügen"
 }
 add.onclick=()=>{
   if(list.querySelectorAll(".km24SlotRow").length>=3)return;
   let row=document.createElement("div");row.className="km24SlotRow";
   row.innerHTML="<label>Termin<input class='km24SlotInput' type='datetime-local' min='"+E(inputMin())+"' max='"+E(inputMax())+"' required></label><span></span>";
   list.appendChild(row);renumber()
 };
 list.addEventListener("click",e=>{
   let b=e.target.closest(".km24RemoveSlot");if(!b)return;
   b.closest(".km24SlotRow")?.remove();renumber()
 });
 renumber();
 form.onsubmit=async e=>{
   e.preventDefault();
   let msg=form.querySelector(".km24VisitMsg"),vals=[...form.querySelectorAll(".km24SlotInput")].map(x=>x.value).filter(Boolean);
   if(vals.length<1||vals.length>3)return msg.innerHTML=N("Bitte wähle zwischen 1 und 3 Terminen.",1);
   if(new Set(vals).size!==vals.length)return msg.innerHTML=N("Bitte wähle unterschiedliche Termine.",1);
   let dates=vals.map(v=>new Date(v));
   if(dates.some(d=>isNaN(d.getTime())))return msg.innerHTML=N("Mindestens ein Termin ist ungültig.",1);
   let btn=form.querySelector("button[type='submit']");btn.disabled=true;msg.innerHTML=N("Termine werden gesendet …");
   let note=form.querySelector(".km24VisitNoteInput").value.trim()||null;
   let rpc=mode==="counter"?"counter_viewing_appointments":"propose_viewing_appointments";
   let r=await db.rpc(rpc,{p_conversation_id:convId,p_proposed_at:dates.map(d=>d.toISOString()),p_note:note});
   if(r.error){btn.disabled=false;msg.innerHTML=N(r.error.message,1)}else messagesPage(convId)
 }
}
function renderVisitGroup(items,mine,c){
 let sorted=items.slice().sort((a,b)=>new Date(a.proposed_at)-new Date(b.proposed_at));
 let fromSeller=sorted[0]&&sorted[0].proposer_id===c.seller_id;
 let createdTimes=sorted.map(x=>new Date(x.created_at).getTime()).filter(x=>Number.isFinite(x));
 let deadline=createdTimes.length?new Date(Math.min(...createdTimes)+24*60*60*1000):null;
 let title=mine?(fromSeller?"Deine Gegenvorschläge":"Deine Terminvorschläge"):(fromSeller?"Gegenvorschläge des Verkäufers":"Terminvorschläge des Käufers");
 let out="<div class='km24VisitGroup'><div class='km24VisitGroupHead'><b>📅 "+E(title)+"</b><span class='mut'>"+sorted.length+" / 3</span></div><div class='km24VisitList'>";
 sorted.forEach((a,i)=>{
   out+="<div class='km24VisitOption'><span class='km24VisitNo'>"+(i+1)+"</span><div><div class='km24VisitTime'>"+E(visitFmt(a.proposed_at))+"</div>"+(a.note?"<div class='km24VisitNote'>"+E(a.note)+"</div>":"")+"</div>";
   if(!mine)out+="<button class='btn primary km24ConfirmSlot' data-appt='"+E(a.id)+"'>Bestätigen</button>";
   out+="</div>"
 });
 out+="</div>";
 if(mine){
   if(!fromSeller)out+="<div class='km24ResponseDeadline'>⏱ Der Verkäufer hat <strong>24 Stunden</strong> Zeit zu reagieren."+(deadline?" Frist: <strong>"+E(visitFmt(deadline))+"</strong>.":"")+" Nach 12 Stunden erhält er automatisch eine Erinnerung.</div>";
   else out+="<div class='km24WaitingLine'>Warte auf die Antwort der anderen Person.</div>";
   out+="<div class='km24VisitActions'><button class='btn' id='cancelVisitGroupBtn'>Vorschläge zurückziehen</button></div>"
 }else{
   if(!fromSeller)out+="<div class='km24ResponseDeadline'>⏱ Du hast <strong>24 Stunden</strong> Zeit, auf diese Termine zu reagieren."+(deadline?" Frist: <strong>"+E(visitFmt(deadline))+"</strong>.":"")+" Nach 12 Stunden bekommst du automatisch eine Erinnerung.</div>";
   out+="<div class='km24VisitActions'><button class='btn' id='openCounterForm'>Andere Termine vorschlagen</button></div>"+visitFormHtml("counterVisitForm","counter")
 }
 out+="</div>";
 return out
}
async function enhanceChatPolicy(selectedId){
 let convId=selectedId;
 if(!convId){
   let a=document.querySelector(".km24ConvItem.active");if(a)convId=(a.getAttribute("href")||"").split("/").pop()
 }
 if(!convId||!document.getElementById("chatForm"))return;

 let [cr,ar]=await Promise.all([
   db.from("conversations").select("id,listing_id,buyer_id,seller_id,contact_purpose,contact_exchange_unlocked_at,contact_unlock_reason").eq("id",convId).maybeSingle(),
   db.from("viewing_appointments").select("*").eq("conversation_id",convId).order("created_at",{ascending:false}).limit(30)
 ]);
 let c=cr.data;if(!c)return;
 let appts=ar.data||[],pending=appts.filter(x=>x.status==="pending"),latest=appts[0]||null,confirmed=appts.find(x=>x.status==="confirmed")||null;
 let pendingMine=pending.filter(x=>x.proposer_id===user.id),pendingTheirs=pending.filter(x=>x.proposer_id!==user.id);
 let lr=c.listing_id?await db.from("listings").select("id,category_slug,title,status,sold_to").eq("id",c.listing_id).maybeSingle():{data:null},
     l=lr.data||{},vehicle=typeof rootCategoryOf==="function"&&rootCategoryOf(l.category_slug)==="fahrzeuge",
     visitLabel=vehicle?"Besichtigung / Probefahrt":"Besichtigung / Abholung",
     unlocked=!!c.contact_exchange_unlocked_at||(l.status==="sold"&&l.sold_to===c.buyer_id);

 let header=document.querySelector(".km24ChatHeader"),messages=document.getElementById("chatMessages");
 if(!header||!messages)return;
 document.getElementById("km24ChatPolicy")?.remove();

 let box=document.createElement("div");box.id="km24ChatPolicy";box.className="km24ChatPolicy "+(unlocked?"unlocked":"locked");
 if(unlocked){
   let confirmedText=c.contact_unlock_reason==="inspection_confirmed"?(confirmed?"Der Termin wurde bestätigt:<br><strong>📅 "+E(visitFmt(confirmed.proposed_at))+"</strong><br>":"Der Termin wurde bestätigt. "):"Für dieses Geschäft ist der direkte Kontaktaustausch freigegeben. ";
   box.innerHTML="<h4>✅ Kontaktdaten freigegeben</h4><p>"+confirmedText+"Telefonnummern, E-Mail-Adressen und Messenger-Kontakte dürfen jetzt ausgetauscht werden.</p>"
 }else{
   let title=c.contact_purpose==="inspection"?"📅 "+visitLabel:"💬 Allgemeine Frage";
   box.innerHTML="<h4>"+title+"</h4><div class='km24PolicyExplain'><b>So funktioniert die Besichtigung</b><span>Der Käufer kann bis zu 3 Termine vorschlagen. Der Verkäufer hat 24 Stunden Zeit zu reagieren und erhält nach 12 Stunden automatisch eine Erinnerung. Danach laufen unbeantwortete Vorschläge ab. Kontaktdaten werden erst nach bestätigtem Termin freigegeben.</span></div><div class='km24ContactLockedHint'>🔒 Nachrichten werden automatisch auf typische Kontaktdaten geprüft.</div>";

   if(pendingMine.length){
     box.innerHTML+=renderVisitGroup(pendingMine,true,c)
   }else if(pendingTheirs.length){
     box.innerHTML+=renderVisitGroup(pendingTheirs,false,c)
   }else if(user.id===c.buyer_id){
     if(latest&&latest.status==="declined")box.innerHTML+="<div class='km24WaitingLine'>Die letzten Vorschläge haben nicht gepasst. Du kannst neue Termine senden.</div>";
     if(latest&&latest.status==="expired")box.innerHTML+="<div class='km24ResponseDeadline'>⏱ Der Verkäufer hat innerhalb von 24 Stunden nicht reagiert. Die Vorschläge sind abgelaufen – du kannst jetzt neue Termine senden.</div>";
     if(latest&&latest.status==="expired")box.innerHTML+="<div class='km24ResponseDeadline'>⏱ Der Verkäufer hat innerhalb von 24 Stunden nicht reagiert. Die Vorschläge sind abgelaufen – du kannst jetzt neue Termine senden.</div>";
     box.innerHTML+="<div class='km24VisitActions'><button class='btn primary' id='openVisitForm'>📅 Bis zu 3 Termine vorschlagen</button></div>"+visitFormHtml("visitForm","propose")
   }else{
     box.innerHTML+="<div class='km24WaitingLine'>Der Käufer hat noch keine Termine vorgeschlagen.</div>"
   }
 }
 header.after(box);

 function toggleVisitForm(formId){
   let target=document.getElementById(formId);if(!target)return;
   let willOpen=target.classList.contains("hide");
   document.querySelectorAll(".km24VisitForm").forEach(f=>{if(f!==target)f.classList.add("hide")});
   target.classList.toggle("hide",!willOpen);
   let pane=document.querySelector(".km24ChatPane");
   if(pane)pane.classList.toggle("km24VisitFormOpen",willOpen);
   if(willOpen)setTimeout(()=>{try{let policy=document.querySelector(".km24ChatPolicy");if(policy)policy.scrollTop=Math.max(0,target.offsetTop-12);target.scrollIntoView({behavior:"smooth",block:"nearest"})}catch(e){}},60);
 }
 let open=document.getElementById("openVisitForm");if(open)open.onclick=()=>toggleVisitForm("visitForm");
 let counter=document.getElementById("openCounterForm");if(counter)counter.onclick=()=>toggleVisitForm("counterVisitForm");
 bindVisitForm("visitForm",convId,"propose");
 bindVisitForm("counterVisitForm",convId,"counter");

 document.querySelectorAll(".km24ConfirmSlot").forEach(b=>b.onclick=async()=>{
   let r=await db.rpc("respond_viewing_appointment",{p_appointment_id:b.dataset.appt,p_accept:true});
   if(r.error)alert(r.error.message);else messagesPage(convId)
 });
 let cancel=document.getElementById("cancelVisitGroupBtn");if(cancel)cancel.onclick=async()=>{
   let r=await db.rpc("cancel_viewing_appointments",{p_conversation_id:convId});
   if(r.error)alert(r.error.message);else messagesPage(convId)
 };

 let form=document.getElementById("chatForm"),area=document.getElementById("chatText");
 document.getElementById("chatPolicyMsg")?.remove();
 let pm=document.createElement("div");pm.id="chatPolicyMsg";pm.className="km24ChatPolicyMsg";form.after(pm);
 form.onsubmit=async e=>{
   e.preventDefault();
   if(!contactReady())return go("#/verification?next=messages");
   let body=area.value.trim();if(!body)return;
   pm.innerHTML="";
   if(!unlocked&&looksLikeContact(body)){
     pm.innerHTML=N("Zu deiner Sicherheit sind Kontaktdaten noch geschützt. Bitte vereinbart zuerst einen Besichtigungstermin über KaufMich24. Nach der Bestätigung werden direkte Kontaktdaten automatisch freigegeben. So bleibt der Kontakt bis dahin sicher und geschützt.",1);return
   }
   let btn=form.querySelector("button");btn.disabled=true;
   let r=await db.from("messages").insert({conversation_id:convId,sender_id:user.id,body});
   if(r.error){btn.disabled=false;pm.innerHTML=N(r.error.message,1)}
   else messagesPage(convId)
 }
}

const baseMessagesPage=messagesPage;
messagesPage=async function(selectedId){
 await baseMessagesPage(selectedId);
 await enhanceChatPolicy(selectedId)
};

setTimeout(()=>{if((location.hash||"").startsWith("#/messages/"))enhanceChatPolicy((location.hash.split("/")[2]||"").split("?")[0])},450);
})();
