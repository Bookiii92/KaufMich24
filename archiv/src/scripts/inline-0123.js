
(function(){
 if(window.__km24SalesClearV1)return;
 window.__km24SalesClearV1=true;

 function saleState(x){
   if(x.fulfillment_status==="completed")return{tone:"done",title:"✅ Verkauf abgeschlossen",text:"Der Käufer hat den Erhalt bestätigt. Die Abwicklung ist fertig."};
   if(x.fulfillment_status==="shipped"||x.fulfillment_status==="picked_up")return{tone:"wait",title:"⏳ Du bist fertig – Käufer bestätigt noch",text:"Du musst nichts mehr tun. Wir warten jetzt auf die Erhaltsbestätigung des Käufers."};
   if(x.payment_status==="open")return{tone:"next",title:"💰 Nächster Schritt: Zahlung prüfen",text:"Bestätige die Zahlung erst, wenn du das Geld direkt vom Käufer erhalten hast."};
   if(x.fulfillment_status==="shipping")return{tone:"next",title:"🚚 Nächster Schritt: Versand bestätigen",text:"Markiere den Artikel als versendet, sobald er wirklich unterwegs ist."};
   if(x.fulfillment_status==="ready_for_pickup")return{tone:"next",title:"🤝 Nächster Schritt: Übergabe bestätigen",text:"Bestätige die Übergabe erst, wenn der Käufer den Artikel erhalten hat."};
   return{tone:"next",title:"📦 Nächster Schritt: Übergabe oder Versand",text:"Wähle jetzt, wie du den Artikel an den Käufer übergibst."};
 }

 function saleButtons(x){
   if(!x.transaction_id)return "";
   let a=[];
   if(x.payment_status==="open"){
     a.push("<button class='btn primary' data-tx='"+x.transaction_id+"' data-pay='paid'>✓ Zahlung erhalten</button>");
   }else if(x.fulfillment_status==="pending"){
     if(x.shipping_available)a.push("<button class='btn primary' data-tx='"+x.transaction_id+"' data-fulfill='shipping'>📦 Versand vorbereiten</button>");
     if(x.pickup_available)a.push("<button class='btn primary' data-tx='"+x.transaction_id+"' data-fulfill='ready_for_pickup'>📍 Abholung / Übergabe</button>");
     if(!x.shipping_available&&!x.pickup_available)a.push("<button class='btn primary' data-tx='"+x.transaction_id+"' data-fulfill='ready_for_pickup'>🤝 Übergabe vorbereiten</button>");
   }else if(x.fulfillment_status==="shipping"){
     a.push("<button class='btn primary' data-tx='"+x.transaction_id+"' data-fulfill='shipped'>✓ Als versendet markieren</button>");
   }else if(x.fulfillment_status==="ready_for_pickup"){
     a.push("<button class='btn primary' data-tx='"+x.transaction_id+"' data-fulfill='picked_up'>✓ Übergabe erfolgt</button>");
   }
   let main=a.length?"<div class='km24SaleNext'>"+a.join("")+"</div>":"";
   let more=x.payment_status==="paid"&&x.fulfillment_status!=="completed"
     ? "<details class='km24SaleMore'><summary>Weitere Option</summary><button class='btn' data-tx='"+x.transaction_id+"' data-pay='refunded'>↩ Zahlung zurückerstattet</button></details>"
     : "";
   return main+more;
 }

 async function clearSalesCenter(){
   if(!user)return go("#/login");
   let [lr,or,sr]=await Promise.all([
     db.from("listings").select("*").eq("seller_id",user.id).order("created_at",{ascending:false}),
     db.from("offers").select("*").eq("seller_id",user.id).order("created_at",{ascending:false}),
     db.rpc("my_sales")
   ]);
   let ls=lr.data||[],offers=or.data||[],sales=sr.data||[],ids=ls.map(x=>x.id),imgs=await loadActivityImages(ids),title={};
   ls.forEach(x=>title[x.id]=x.title);
   let active=ls.filter(x=>x.status==="active");
   let offerHtml=offers.length?offers.map(o=>{
     let cls=o.status==="accepted"?"statusGood":o.status==="rejected"?"statusBad":"statusWarn";
     return "<div class='adminCard'><b>"+E(title[o.listing_id]||"Inserat")+"</b><div>CHF "+F(o.amount_chf)+"</div><div class='activityStatus "+cls+"'>"+E(offerStatusLabel(o.status))+"</div>"+(o.status==="pending"?"<div class='actions' style='margin-top:8px'><button class='btn primary' data-sale-offer='"+o.id+"' data-accept='1'>Annehmen</button><button class='btn' data-sale-offer='"+o.id+"' data-accept='0'>Ablehnen</button></div>":"")+"</div>";
   }).join(""):"<div class='empty'>Keine Preisvorschläge.</div>";

   let soldHtml=sales.length?sales.map(x=>{
     let state=saleState(x);
     return "<div class='activityCard km24SaleCard'><div class='activityPic'>"+activityImage(imgs[x.listing_id])+"</div><div class='km24SaleMain'><span class='km24SaleBadge'>🎉 VERKAUFT ÜBER KAUFMICH24</span><b class='km24SaleTitle'>"+E(x.title)+"</b><div class='km24SaleAmount'>CHF "+F(x.price_chf)+"</div><div class='km24SaleState "+state.tone+"'><b>"+state.title+"</b><span>"+state.text+"</span></div><small class='mut'>Verkauft am "+E(D(x.sold_at))+" · Käufer: "+E(x.buyer_name||"Käufer")+"</small>"+saleButtons(x)+"</div><div class='actions km24SaleSide'><button class='btn' data-sale-chat='"+x.listing_id+"'>💬 Käufer kontaktieren</button><a class='btn' href='#/listing/"+x.listing_id+"'>Details</a></div></div>";
   }).join(""):"<div class='empty'>Noch keine Verkäufe über KaufMich24.</div>";

   app.innerHTML="<div class='wrap formPage'><div class='head'><div><h1 style='margin:0'>Verkäufe</h1><p class='mut' style='margin:5px 0 0'>Deine echten KaufMich24-Verkäufe und die nächsten Schritte auf einen Blick.</p></div><a class='btn' href='#/me'>Mein Konto</a></div><div class='km24SaleIntro'><b>🎉 Ein echter Verkauf wird dir deutlich gemeldet.</b><br>Hier erscheinen nur Verkäufe mit einem Käufer über KaufMich24. Ein Inserat, das du selbst nur als „verkauft“ markierst, bleibt bei „Meine Inserate“ und hat keine Kaufabwicklung.</div><div class='marketSummary'><div class='marketStat'><span class='mut'>Aktive Inserate</span><b>"+active.length+"</b></div><div class='marketStat'><span class='mut'>Offene Angebote</span><b>"+offers.filter(x=>x.status==="pending").length+"</b></div><div class='marketStat'><span class='mut'>Verkäufe</span><b>"+sales.length+"</b></div><div class='marketStat'><span class='mut'>Fertig</span><b>"+sales.filter(x=>x.fulfillment_status==="completed").length+"</b></div></div><section class='section'><h2>🤝 Preisvorschläge</h2><div class='manage'>"+offerHtml+"</div></section><section class='section'><h2>🎉 Verkäufe & Abwicklung</h2><div class='manage'>"+soldHtml+"</div></section></div>";

   document.querySelectorAll("[data-sale-offer]").forEach(b=>b.onclick=async()=>{let r=await db.rpc("respond_offer",{p_offer_id:b.dataset.saleOffer,p_accept:b.dataset.accept==="1"});if(r.error)return alert(r.error.message);clearSalesCenter()});
   document.querySelectorAll("[data-sale-chat]").forEach(b=>b.onclick=()=>startChat(b.dataset.saleChat));
   document.querySelectorAll("[data-tx]").forEach(b=>b.onclick=async()=>{
     let payment=b.dataset.pay||null,fulfillment=b.dataset.fulfill||null;
     let question=payment==="paid"?"Zahlung wirklich als erhalten markieren?":payment==="refunded"?"Zahlung wirklich als zurückerstattet markieren?":fulfillment==="shipping"?"Versand als in Vorbereitung markieren?":fulfillment==="shipped"?"Artikel wirklich als versendet markieren?":fulfillment==="ready_for_pickup"?"Artikel für Abholung / Übergabe vorbereiten?":"Übergabe wirklich als erfolgt markieren?";
     if(!confirm(question))return;
     b.disabled=true;
     let r=await db.rpc("update_sale_transaction",{p_transaction_id:b.dataset.tx,p_payment_status:payment,p_fulfillment_status:fulfillment});
     if(r.error){b.disabled=false;return alert(r.error.message)}
     clearSalesCenter();
   });
 }

 async function clearMarkSold(id){
   let ok=confirm("Dieses Inserat wirklich als verkauft markieren?\n\nDas ist nur für Verkäufe AUSSERHALB des KaufMich24-Kaufablaufs. Es wird dabei kein Käufer zugeordnet und keine Kaufabwicklung erstellt.\n\nBei einem Kauf über KaufMich24 wird der Verkauf automatisch erfasst und du wirst benachrichtigt.");
   if(!ok)return;
   let r=await db.rpc("mark_listing_sold",{p_listing_id:id,p_buyer_id:null});
   if(r.error)return alert(r.error.message);
   alert("✓ Inserat wurde als verkauft markiert.\n\nEs gibt dafür keine KaufMich24-Abwicklung, weil kein Käufer hinterlegt wurde.");
   me();
 }

 try{salesCenter=clearSalesCenter}catch(_){window.salesCenter=clearSalesCenter}
 window.salesCenter=clearSalesCenter;
 try{markSold=clearMarkSold}catch(_){window.markSold=clearMarkSold}
 window.markSold=clearMarkSold;
})();
