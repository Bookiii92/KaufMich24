
(function(){
  "use strict";
  if(window.__km24ChatSafetyV1)return;
  window.__km24ChatSafetyV1=true;
  var copy={
    de:{introTitle:"⚠️ Sicherheit beim Kaufen und Verkaufen",intro:"Zahle nie im Voraus. Prüfe die Ware vor Ort und übergib Geld erst bei der Abholung. Bei Unsicherheit melde das Inserat.",ack:"Verstanden",report:"Inserat öffnen und melden",riskTitle:"⚠️ Vorsicht bei Zahlungsangaben",risk:"Im Chat kommen Begriffe wie Vorkasse, Western Union oder IBAN vor. Das ist nicht automatisch Betrug. Prüfe Zahlungsaufforderungen sorgfältig und überweise kein Geld an unbekannte Personen."},
    fr:{introTitle:"⚠️ Acheter et vendre en sécurité",intro:"Ne paie jamais à l’avance. Vérifie l’article sur place et remets l’argent lors de la remise. En cas de doute, signale l’annonce.",ack:"Compris",report:"Voir et signaler l’annonce",riskTitle:"⚠️ Attention aux demandes de paiement",risk:"Des termes comme paiement anticipé, Western Union ou IBAN apparaissent dans cette discussion. Ce n’est pas nécessairement une fraude. Vérifie soigneusement toute demande de paiement."},
    it:{introTitle:"⚠️ Acquisti e vendite sicuri",intro:"Non pagare mai in anticipo. Controlla l’articolo di persona e consegna il denaro al ritiro. In caso di dubbi segnala l’annuncio.",ack:"Ho capito",report:"Apri e segnala l’annuncio",riskTitle:"⚠️ Attenzione ai pagamenti",risk:"Nella chat compaiono termini come pagamento anticipato, Western Union o IBAN. Non significa necessariamente che ci sia una truffa. Verifica attentamente le richieste di pagamento."},
    en:{introTitle:"⚠️ Stay safe when buying and selling",intro:"Never pay in advance. Inspect the item in person and hand over the money on collection. Report the listing if something seems suspicious.",ack:"Got it",report:"Open and report listing",riskTitle:"⚠️ Check payment requests carefully",risk:"This chat mentions terms such as advance payment, Western Union or IBAN. That does not necessarily mean fraud. Check payment requests carefully and avoid sending money to strangers."}
  };
  function tr(){var lang="de";try{if(typeof window.km24Language==="function")lang=window.km24Language()}catch(e){}return copy[lang]||copy.de}
  function makeBanner(kind,id,listingHref){
    var t=tr(),box=document.createElement("aside");
    box.className="km24SafetyBanner";
    box.dataset.km24Safety=kind;
    box.setAttribute("role","note");
    var head=document.createElement("strong"),p=document.createElement("p"),actions=document.createElement("div");
    head.textContent=kind==="intro"?t.introTitle:t.riskTitle;
    p.textContent=kind==="intro"?t.intro:t.risk;
    actions.className="km24SafetyActions";
    if(kind==="intro"){
      var btn=document.createElement("button");
      btn.type="button";btn.textContent=t.ack;btn.dataset.km24SafetyAck=id;
      actions.appendChild(btn);
    }
    if(listingHref&&/^#\/listing\/[a-z0-9-]+$/i.test(listingHref)){
      var link=document.createElement("a");
      link.href=listingHref;link.textContent=t.report;
      actions.appendChild(link);
    }
    box.appendChild(head);box.appendChild(p);box.appendChild(actions);
    return box;
  }
  function render(){
    var page=document.querySelector("#app .km24MessagesPage");
    if(!page)return;
    var pane=page.querySelector(".km24ChatPane"),box=pane&&pane.querySelector("#chatMessages");
    var current=page.querySelector(".km24ConvItem.active[href^='#/messages/']");
    if(!box||!current)return;
    var href=current.getAttribute("href")||"",id=href.slice("#/messages/".length);
    if(!/^[a-z0-9-]{8,60}$/i.test(id))return;
    var listing=pane.querySelector(".km24ListingBtn"),listingHref=listing&&listing.getAttribute("href");
    var key="km24-chat-safety-seen-v1:"+id,seen=false;
    try{seen=localStorage.getItem(key)==="1"}catch(e){}
    var first=pane.querySelector('[data-km24-safety="intro"]');
    if(!seen&&!first)box.before(makeBanner("intro",id,listingHref));
    if(seen&&first)first.remove();
    var texts=Array.from(box.querySelectorAll(".km24MessageRow .km24BubbleText")).slice(-20).map(function(n){return n.textContent||""}).join(" ");
    var draft=pane.querySelector("#chatText");
    if(draft)texts+=" "+(draft.value||"");
    var risky=/(?:\bvorkasse\b|\bwestern[\s-]*union\b|\biban\b|\bpaypal[\s-]*(?:freunde|friends)\b|\bvorab[\s-]*(?:zahlen|überweisen)\b)/i.test(texts);
    var warning=pane.querySelector('[data-km24-safety="keywords"]');
    if(risky&&!warning)box.before(makeBanner("keywords",id,listingHref));
    if(!risky&&warning)warning.remove();
  }
  var pending=false;
  function schedule(){if(pending)return;pending=true;requestAnimationFrame(function(){pending=false;render()})}
  function init(){
    var app=document.getElementById("app");
    if(app)new MutationObserver(schedule).observe(app,{subtree:true,childList:true});
    document.addEventListener("input",function(e){if(e.target&&e.target.id==="chatText")schedule()});
    document.addEventListener("click",function(e){
      var btn=e.target&&e.target.closest&&e.target.closest("[data-km24-safety-ack]");
      if(!btn)return;
      var id=btn.dataset.km24SafetyAck;
      try{localStorage.setItem("km24-chat-safety-seen-v1:"+id,"1")}catch(err){}
      var box=btn.closest(".km24SafetyBanner");if(box)box.remove();
    });
    window.addEventListener("hashchange",schedule);
    window.addEventListener("pageshow",schedule);
    schedule();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
