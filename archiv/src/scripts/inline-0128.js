
(function(){
 if(window.__km24TxFlowV2)return;window.__km24TxFlowV2=true;
 var busy=false;
 function fmt(v){if(!v)return '';try{return new Intl.DateTimeFormat('de-CH',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(v))}catch(_){return ''}}
 function money(v){try{return Number(v||0).toLocaleString('de-CH',{minimumFractionDigits:2,maximumFractionDigits:2})}catch(_){return String(v||'0')}}
 function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
 function eventLabel(e){return ({purchase_confirmed:'✓ Kauf bestätigt',payment_confirmed:'💰 Zahlung bestätigt',payment_not_applicable:'💰 Keine Zahlung nötig',payment_refunded:'↩ Zahlung zurückerstattet',shipping_started:'📦 Versand wird vorbereitet',shipped:'🚚 Versendet',pickup_ready:'📍 Abholbereit',picked_up:'🤝 Übergabe erfolgt',completed:'✓ Kauf abgeschlossen',cancellation_requested:'↩ Stornierung angefragt',cancellation_rejected:'✕ Stornierung abgelehnt',cancelled:'↩ Kauf storniert',problem_reported:'⚑ Problem gemeldet'}[e]||'Status aktualisiert')}
 function byType(events,type){var a=(events||[]).filter(function(e){return e.event_type===type});return a.length?a[a.length-1]:null}
 function stepTimes(card,x,events){
  var s=Array.from(card.querySelectorAll('.txSteps>span'));if(s.length<4)return;
  s.forEach(function(el){var old=el.querySelector('.km24TxStepTime');if(old)old.remove()});
  var e1=byType(events,'purchase_confirmed'),e2=byType(events,'payment_confirmed')||byType(events,'payment_not_applicable');
  var e3=byType(events,'picked_up')||byType(events,'shipped'),e4=byType(events,'completed');
  [[s[0],e1&&e1.created_at],[s[1],e2&&e2.created_at],[s[2],e3&&e3.created_at],[s[3],e4&&e4.created_at]].forEach(function(p){if(p[1]){var sm=document.createElement('small');sm.className='km24TxStepTime';sm.textContent=fmt(p[1]);p[0].appendChild(sm)}})
 }
 function timelineHtml(events){
  var use=(events||[]).filter(function(e){return ['purchase_confirmed','payment_confirmed','payment_not_applicable','payment_refunded','shipping_started','shipped','pickup_ready','picked_up','completed','cancellation_requested','cancellation_rejected','cancelled','problem_reported'].includes(e.event_type)});
  if(!use.length)return '';
  return '<details class="km24TxTimeline"><summary>🕘 Verlauf & Zeitstempel</summary><div class="km24TxTimelineRows">'+use.map(function(e){return '<div class="km24TxTimelineRow"><span>'+esc(eventLabel(e.event_type))+'</span><time>'+esc(fmt(e.created_at))+'</time></div>'}).join('')+'</div></details>';
 }
 function handoverLabel(events,x){if(byType(events,'picked_up'))return 'Abholung / Übergabe';if(byType(events,'shipped'))return 'Versand';if(x.fulfillment_status==='completed')return 'Abgeschlossen';return 'Offen'}
 function paymentLabel(s){return ({open:'Offen',paid:'Bestätigt',refunded:'Zurückerstattet',not_applicable:'Keine Zahlung nötig'}[s]||s||'–')}
 function methodLabel(s){return ({buy_now:'Direktkauf',offer:'Preisvorschlag',auction:'Auktion',manual:'Manueller Verkauf'}[s]||'Verkauf')}
 function summaryHtml(x,events){if(x.fulfillment_status!=='completed')return '';
  return '<div class="km24TxSummary"><div class="km24TxSummaryTitle">✓ Kauf vollständig abgeschlossen</div><div class="km24TxSummaryGrid">'+
   '<div><small>Artikel</small><b>'+esc(x.listing_title||'Artikel')+'</b></div><div><small>Preis</small><b>CHF '+money(x.amount_chf)+'</b></div>'+
   '<div><small>'+(x.my_role==='buyer'?'Verkäufer':'Käufer')+'</small><b>'+esc(x.counterpart_name||'Nutzer')+'</b></div><div><small>Art</small><b>'+esc(methodLabel(x.method))+'</b></div>'+
   '<div><small>Zahlung</small><b>'+esc(paymentLabel(x.payment_status))+'</b></div><div><small>Übergabe</small><b>'+esc(handoverLabel(events,x))+'</b></div>'+
   '<div><small>Abgeschlossen</small><b>'+esc(fmt(x.completed_at)||'✓')+'</b></div><div><small>Status</small><b>Erledigt</b></div></div></div>';
 }
 function cancelHtml(x){
  if(x.cancellation_status==='pending'){
   if(x.cancellation_requested_by_me)return '<div class="km24CancelState">↩ Stornierung angefragt · wartet auf Zustimmung der anderen Partei</div>';
   return '<div class="km24CancelState">↩ Die andere Partei möchte diesen Kauf stornieren.<div class="km24TxActions" style="margin-top:7px"><button class="btn primary" data-km24-cancel-accept="'+x.cancellation_request_id+'">Stornierung zustimmen</button><button class="btn" data-km24-cancel-reject="'+x.cancellation_request_id+'">Ablehnen</button></div></div>';
  }
  if(x.deal_status!=='confirmed'||x.fulfillment_status==='completed')return '';
  if(x.payment_status==='paid'||['shipped','picked_up'].includes(x.fulfillment_status))return '';
  return '<button class="btn" data-km24-cancel-request="'+x.transaction_id+'">↩ Stornierung anfragen</button>';
 }
 function actionsHtml(x){
  var cancel=cancelHtml(x);
  var explore=x.fulfillment_status==='completed'?(x.my_role==='buyer'?'<a class="btn" href="#/">Weitere Inserate ansehen</a>':'<a class="btn" href="#/sell">Ähnliches verkaufen</a>'):'';
  return '<div class="km24TxActions">'+cancel+'<button class="btn km24ProblemBtn" data-km24-problem="'+x.transaction_id+'">⚑ Problem melden</button>'+explore+'</div>';
 }
 async function enhance(){
  if(busy||typeof db==='undefined'||typeof user==='undefined'||!user)return;busy=true;
  try{
   var rr=await Promise.all([db.rpc('my_transaction_details_v2'),db.rpc('my_transaction_events')]);
   if(rr[0].error||rr[1].error)return;
   var details=rr[0].data||[],evs=rr[1].data||[],byListing={},byTx={};
   details.forEach(function(x){byListing[String(x.listing_id)]=x});evs.forEach(function(e){(byTx[String(e.transaction_id)]||(byTx[String(e.transaction_id)]=[])).push(e)});
   document.querySelectorAll('.activityCard [data-purchase-chat],.activityCard [data-sale-chat]').forEach(function(chat){
    var card=chat.closest('.activityCard'),lid=chat.dataset.purchaseChat||chat.dataset.saleChat,x=byListing[String(lid)];if(!card||!x)return;
    var events=byTx[String(x.transaction_id)]||[];stepTimes(card,x,events);
    var content=card.querySelector('.txSteps');content=content&&content.parentElement;if(!content)return;
    var old=content.querySelector('.km24TxFlowExtras');if(old)old.remove();
    var box=document.createElement('div');box.className='km24TxFlowExtras';box.dataset.txid=x.transaction_id;
    box.innerHTML=summaryHtml(x,events)+timelineHtml(events)+actionsHtml(x);content.appendChild(box);
   });
  }catch(_){ }finally{busy=false}
 }
 function refresh(){setTimeout(enhance,30);setTimeout(enhance,350)}
 async function problem(tx){
  var row=(await db.rpc('my_transaction_details_v2')).data||[];var x=row.find(function(v){return String(v.transaction_id)===String(tx)});if(!x)return alert('Transaktion nicht gefunden.');
  var opts=x.my_role==='buyer'?['Artikel nicht erhalten','Artikel entspricht nicht der Beschreibung','Verkäufer meldet sich nicht','Zahlungsproblem','Sonstiges']:['Zahlung nicht erhalten','Käufer meldet sich nicht','Problem bei Übergabe oder Versand','Sonstiges'];
  var txt='Was ist das Problem?\n'+opts.map(function(v,i){return (i+1)+' = '+v}).join('\n');var n=Number(prompt(txt,'1'));if(!Number.isInteger(n)||n<1||n>opts.length)return;
  var d=prompt('Weitere Details (optional):','')||null;var r=await db.rpc('submit_transaction_problem',{p_transaction_id:tx,p_reason:opts[n-1],p_details:d});if(r.error)return alert(r.error.message);alert('✓ Problem wurde gemeldet. Unser Team kann den Vorgang jetzt eindeutig zuordnen.');refresh();
 }
 async function requestCancel(tx){
  var reason=prompt('Warum soll der Kauf storniert werden?','');if(!reason||reason.trim().length<5)return;
  var rows=(await db.rpc('my_transaction_details_v2')).data||[],x=rows.find(function(v){return String(v.transaction_id)===String(tx)});if(!x)return;
  var relist=true;if(x.my_role==='seller')relist=confirm('Inserat nach erfolgreicher Stornierung automatisch wieder aktivieren?\n\nOK = Ja\nAbbrechen = Nein');
  if(!confirm('Stornierungsanfrage wirklich senden?\n\nDie andere Partei muss zustimmen. Der ursprüngliche Kauf- und Stornoverlauf bleibt aus Sicherheitsgründen gespeichert und kann nicht durch Löschen des Inserats entfernt werden.'))return;
  var r=await db.rpc('request_transaction_cancellation',{p_transaction_id:tx,p_reason:reason.trim(),p_relist_on_accept:relist});if(r.error)return alert(r.error.message);alert('✓ Stornierungsanfrage gesendet. Der Kauf wird erst storniert, wenn die andere Partei zustimmt.');refresh();
 }
 async function respondCancel(id,accept){
  if(!confirm(accept?'Stornierung wirklich bestätigen?\n\nMit deiner Zustimmung bestätigst du, dass dieser Kauf nicht durchgeführt wurde bzw. nicht mehr durchgeführt wird. Der Vorgang bleibt aus Sicherheitsgründen protokolliert.':'Stornierungsanfrage wirklich ablehnen?'))return;
  var r=await db.rpc('respond_transaction_cancellation',{p_request_id:id,p_accept:accept});if(r.error)return alert(r.error.message);
  if(accept){var st=r.data&&r.data.listing_status;alert(st==='active'?'✓ Kauf storniert. Das Inserat ist wieder aktiv.':'✓ Kauf storniert. Das Inserat wurde beendet. Bei einer Auktion kann der Verkäufer es mit neuer Laufzeit reaktivieren.')}else alert('Stornierungsanfrage abgelehnt.');
  try{var h=location.hash||'';if(h.indexOf('buy')>=0&&typeof buyerCenter==='function')return buyerCenter();if(h.indexOf('sale')>=0&&typeof salesCenter==='function')return salesCenter()}catch(_){}refresh();
 }
 document.addEventListener('click',function(e){
  var b=e.target&&e.target.closest?e.target.closest('[data-km24-problem],[data-km24-cancel-request],[data-km24-cancel-accept],[data-km24-cancel-reject]'):null;if(!b)return;e.preventDefault();e.stopPropagation();
  if(b.dataset.km24Problem)return problem(b.dataset.km24Problem);
  if(b.dataset.km24CancelRequest)return requestCancel(b.dataset.km24CancelRequest);
  if(b.dataset.km24CancelAccept)return respondCancel(b.dataset.km24CancelAccept,true);
  if(b.dataset.km24CancelReject)return respondCancel(b.dataset.km24CancelReject,false);
 },true);
 try{
  if(typeof buyerCenter==='function'){var bb=buyerCenter;buyerCenter=async function(){var r=await bb.apply(this,arguments);refresh();return r};window.buyerCenter=buyerCenter}
  if(typeof salesCenter==='function'){var ss=salesCenter;salesCenter=async function(){var r=await ss.apply(this,arguments);refresh();return r};window.salesCenter=salesCenter}
 }catch(_){ }
 addEventListener('hashchange',refresh);addEventListener('pageshow',refresh);setTimeout(enhance,150);setTimeout(enhance,800);
})();
