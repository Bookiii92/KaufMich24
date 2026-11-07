
(function(){
if(window.__km24ViewingFollowupV1)return;window.__km24ViewingFollowupV1=true;

let s=document.createElement("style");s.id="km24-viewing-followup-style";s.textContent=
".km24FollowupCard{margin:10px 12px 0;padding:14px;border:1px solid #4f5f56;border-radius:13px;background:#202923}.km24FollowupCard h4{margin:0 0 6px}.km24FollowupCard p{margin:0 0 10px;color:#c5cec8}.km24FollowupBtns{display:flex;gap:8px;flex-wrap:wrap}.km24FollowupBtns .btn{min-width:120px}.km24FollowupStep{margin-top:10px;padding-top:10px;border-top:1px solid #435049}.km24FollowupDone{border-color:#2f7656;background:#19382b}.km24FollowupWarn{border-color:#765c36;background:#332b1e}@media(max-width:640px){.km24FollowupBtns .btn{flex:1}}";
document.head.appendChild(s);

function followupText(x){
 if(x.resolution==="sold_confirmed")return {cls:"km24FollowupDone",title:"✅ Verkauf bestätigt",body:"Ihr habt beide den Verkauf bestätigt. Das Inserat wurde als verkauft markiert und die Bewertung ist freigeschaltet."};
 if(x.resolution==="no_sale")return {cls:"km24FollowupDone",title:"✓ Rückmeldung abgeschlossen",body:"Ihr habt beide bestätigt, dass kein Verkauf zustande kam. Das Inserat bleibt unverändert."};
 if(x.resolution==="conflict")return {cls:"km24FollowupWarn",title:"⚠ Angaben stimmen nicht überein",body:"Das Inserat wurde nicht automatisch geändert. Die abweichenden Rückmeldungen werden nur intern geprüft."};
 if(x.resolution==="already_sold")return {cls:"km24FollowupDone",title:"✓ Inserat bereits verkauft",body:"Der Verkauf war bereits in KaufMich24 erfasst."};
 if(x.my_feedback_submitted)return {cls:"",title:"⏳ Danke für deine Rückmeldung",body:"Wir warten noch auf die Rückmeldung der anderen Person."};
 return null
}

async function enhanceViewingFollowup(selectedId){
 if(!selectedId||!document.getElementById("chatMessages"))return;
 let r=await db.rpc("my_viewing_followups",{p_conversation_id:selectedId});
 if(r.error)return;
 let items=r.data||[];if(!items.length)return;
 let x=items[0],header=document.querySelector(".km24ChatHeader");
 if(!header)return;
 document.getElementById("km24ViewingFollowupCard")?.remove();
 let card=document.createElement("div");card.id="km24ViewingFollowupCard";card.className="km24FollowupCard";
 let state=followupText(x);
 if(state){
   card.className+=" "+state.cls;
   card.innerHTML="<h4>"+state.title+"</h4><p>"+state.body+"</p>";
   if(x.resolution==="sold_confirmed")card.innerHTML+="<div class='km24FollowupBtns'><button class='btn primary' id='followupReviewBtn'>⭐ Jetzt bewerten</button></div>";
 }else{
   card.innerHTML="<h4>📋 Wie war die Besichtigung?</h4><p>Hilf uns kurz, den Vorgang korrekt abzuschliessen. Deine Antwort wird nicht öffentlich angezeigt.</p><div id='km24AttendStep'><b>Hat die Besichtigung stattgefunden?</b><div class='km24FollowupBtns' style='margin-top:8px'><button class='btn primary' data-attended='1'>Ja</button><button class='btn' data-attended='0'>Nein</button></div></div><div id='km24SaleStep' class='km24FollowupStep hide'><b>Wurde der Artikel verkauft?</b><div class='km24FollowupBtns' style='margin-top:8px'><button class='btn primary' data-sold='1'>Ja, verkauft</button><button class='btn' data-sold='0'>Nein</button></div></div><div id='km24FollowupMsg' style='margin-top:8px'></div>";
 }
 let policy=document.getElementById("km24ChatPolicy");
 (policy||header).after(card);
 if(state){let rb=document.getElementById("followupReviewBtn");if(rb)rb.onclick=async()=>{let q=await db.from("conversations").select("buyer_id,seller_id").eq("id",selectedId).maybeSingle(),c=q.data;if(!c)return;let other=c.buyer_id===user.id?c.seller_id:c.buyer_id;go("#/profile/"+other)};return;}

 let attended=null,msg=card.querySelector("#km24FollowupMsg");
 card.querySelectorAll("[data-attended]").forEach(b=>b.onclick=async()=>{
   attended=b.dataset.attended==="1";
   if(!attended){
     card.querySelectorAll("button").forEach(x=>x.disabled=true);
     let q=await db.rpc("submit_viewing_feedback",{p_appointment_id:x.appointment_id,p_attended:false,p_deal_completed:false});
     if(q.error){card.querySelectorAll("button").forEach(x=>x.disabled=false);msg.innerHTML=N(q.error.message,1)}
     else messagesPage(selectedId)
   }else{
     card.querySelector("#km24AttendStep").classList.add("hide");
     card.querySelector("#km24SaleStep").classList.remove("hide")
   }
 });
 card.querySelectorAll("[data-sold]").forEach(b=>b.onclick=async()=>{
   card.querySelectorAll("button").forEach(x=>x.disabled=true);
   let sold=b.dataset.sold==="1";
   let q=await db.rpc("submit_viewing_feedback",{p_appointment_id:x.appointment_id,p_attended:true,p_deal_completed:sold});
   if(q.error){card.querySelectorAll("button").forEach(x=>x.disabled=false);msg.innerHTML=N(q.error.message,1)}
   else messagesPage(selectedId)
 })
}

const baseViewingMessagesPage=messagesPage;
messagesPage=async function(selectedId){
 await baseViewingMessagesPage(selectedId);
 await enhanceViewingFollowup(selectedId)
};

setTimeout(()=>{
 let h=location.hash||"";
 if(h.startsWith("#/messages/"))enhanceViewingFollowup((h.split("/")[2]||"").split("?")[0])
},600);
})();
