
(()=>{if(window.__kmAiSupportLoaded)return;window.__kmAiSupportLoaded=true;const API="https://aaqqcnrnrvybboirrrtd.supabase.co/functions/v1/kaufmich-ai-support";let history=[],busy=false;
const sid=()=>{let x=localStorage.getItem("km_ai_support_session");if(!x){x=crypto.randomUUID?(window.crypto&&typeof crypto.randomUUID==='function'?crypto.randomUUID():('km24_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2))):"km_"+Date.now()+"_"+Math.random().toString(36).slice(2);localStorage.setItem("km_ai_support_session",x)}return x};
const E1=(t,c,s)=>{let x=document.createElement(t);if(c)x.className=c;if(s!==undefined)x.textContent=s;return x};
function msg(r,t,w){let b=document.getElementById("kmAiMsgs"),m=E1("div","kmAiMsg "+(r==="user"?"user":"bot")+(w?" wait":""),t);b.appendChild(m);b.scrollTop=b.scrollHeight;return m}
async function ask(q){
 q=String(q||"").trim();if(!q||busy)return;
 sessionStorage.setItem("km_ai_last_question",q);
 busy=true;
 let i=document.getElementById("kmAiInput"),s=document.getElementById("kmAiSend");
 i.value="";s.disabled=true;
 let prior=history.slice(-8);
 msg("user",q);
 history.push({role:"user",content:q});
 let w=msg("assistant","Antwort wird vorbereitet …",1);
 try{
   let r=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({session_id:sid(),message:q,history:prior})}),
       d=await r.json().catch(()=>({})),
       a=String(d.answer||d.error||"Der Hilfe-Assistent ist gerade nicht erreichbar. Bitte nutze den menschlichen Support.");
   w.classList.remove("wait");
   w.textContent=a;
   if(d.topic)sessionStorage.setItem("km_ai_last_topic",String(d.topic));
   if(d.language)sessionStorage.setItem("km_ai_last_language",String(d.language));
   let needs=!!d.escalated||String(d.topic||"")==="generic";
   if(needs){
     let link=document.createElement("a");
     link.className="kmAiEscalate";
     link.href="#/support";
     link.textContent=d.escalated?"👤 Support-Anfrage erstellen":"✉️ Frage an Support senden";
     link.onclick=()=>document.getElementById("kmAiPanel")?.classList.remove("open");
     w.appendChild(link)
   }
   history.push({role:"assistant",content:a});
   history=history.slice(-8)
 }catch(e){
   w.classList.remove("wait");
   w.textContent="Der Hilfe-Assistent ist gerade nicht erreichbar.";
   let link=document.createElement("a");
   link.className="kmAiEscalate";
   link.href="#/support";
   link.textContent="👤 Menschlichen Support öffnen";
   w.appendChild(link)
 }finally{busy=false;s.disabled=false}
}
function build(){if(document.getElementById("kmAiFab"))return;let f=E1("button","","✨ KI Hilfe");f.id="kmAiFab";let p=E1("section","");p.id="kmAiPanel";p.innerHTML='<div class="kmAiHead"><div class="kmAiTitle">KI Hilfe <span class="kmAiBadge">Cookie Joe</span></div><button id="kmAiClose">×</button></div><div id="kmAiMsgs"><div class="kmAiMsg bot">Hallo! Ich helfe dir bei Fragen zu KaufMich24. Für persönliche Konto- oder Streitfälle ist unser Support zuständig.</div></div><div class="kmAiQuick"><button>Wie funktioniert Sofortkauf?</button><button>Wie funktionieren Auktionen?</button><button>Auktion gewonnen – was jetzt?</button><button>Verkäufer antwortet nicht</button></div><div class="kmAiInputRow"><textarea id="kmAiInput" maxlength="1200" placeholder="Deine Frage …"></textarea><button id="kmAiSend">Senden</button></div><div class="kmAiFoot">KI-Antworten können Fehler enthalten. Keine Kontoeinsicht. Verbindlich sind AGB und Plattformangaben. <a href="#/support">Menschlicher Support</a> · <a href="mailto:support@kaufmich24.ch">E-Mail</a></div>';document.body.append(f,p);f.onclick=()=>p.classList.toggle("open");p.querySelector("#kmAiClose").onclick=()=>p.classList.remove("open");p.querySelectorAll(".kmAiQuick button").forEach(b=>b.onclick=()=>ask(b.textContent));p.querySelector("#kmAiSend").onclick=()=>ask(p.querySelector("#kmAiInput").value);p.querySelector("#kmAiInput").onkeydown=e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();ask(e.target.value)}};window.openKaufMichAiSupport=()=>p.classList.add("open")}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",build);else build()})();
