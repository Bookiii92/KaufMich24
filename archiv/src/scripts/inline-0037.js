
(function(){
 if(window.__km24ServicesV1)return;window.__km24ServicesV1=true;
 let svcCatsCache=null;
 const svcEsc=window.E||function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
 const svcFmt=window.F||function(v){return Number(v||0).toLocaleString('de-CH')};
 function svcGo(h){if(location.hash===h){setTimeout(km24ServiceRoute,0);return}location.hash=h;setTimeout(km24ServiceRoute,20)}
 function svcPrice(p){
   if(!p)return '';
   if(p.price_model==='on_request')return 'Preis auf Anfrage';
   let n=p.price_chf==null?'':('CHF '+svcFmt(p.price_chf));
   if(p.price_model==='hourly')return n+' / Std.';
   if(p.price_model==='from')return 'ab '+n;
   if(p.price_model==='budget')return 'Budget '+n;
   return n||'Preis auf Anfrage'
 }
 async function svcCategories(){
   if(svcCatsCache)return svcCatsCache;
   let r=await db.from('service_categories').select('*').eq('is_active',true).order('sort_order');
   svcCatsCache=r.data||[];return svcCatsCache
 }
 async function svcCards(ids){
   ids=[...new Set((ids||[]).filter(Boolean))];if(!ids.length)return {};
   let r=await db.rpc('seller_cards_public',{p_seller_ids:ids}),m={};
   (r.data||[]).forEach(function(x){m[x.seller_id]=x});return m
 }
 async function svcImages(ids){
   ids=[...new Set((ids||[]).filter(Boolean))];if(!ids.length)return {};
   let r=await db.from('service_images').select('*').in('post_id',ids).order('sort_order'),m={};
   (r.data||[]).forEach(function(x){(m[x.post_id]||(m[x.post_id]=[])).push(x)});return m
 }
 function svcCardHtml(p,im,person,cat){
   let image=(im&&im[0])?'<img src="'+svcEsc(IMG(im[0].storage_path))+'" alt="">':'<span class="km24SvcNoPic">'+(p.post_type==='request'?'🔎':'🛠️')+'</span>';
   let name=(person&&(person.business_name||person.display_name||person.seller_name))||'Mitglied';
   return '<article class="km24SvcCard" onclick="km24ServiceGo(\'#/services/post/'+p.id+'\')"><div class="km24SvcPic">'+image+'<span class="km24SvcPill '+(p.post_type==='request'?'request':'')+'">'+(p.post_type==='request'?'AUFTRAG GESUCHT':'DIENSTLEISTUNG')+'</span></div><div class="km24SvcBody"><div class="mut" style="font-size:11px">'+svcEsc((cat&&cat.icon?cat.icon+' ':'')+(cat?cat.name_de:''))+'</div><h3>'+svcEsc(p.title)+'</h3><div class="km24SvcPrice">'+svcEsc(svcPrice(p))+'</div><div class="km24SvcTrust">'+((person&&person.account_type&&person.account_type!=='private')?'<span>🏢 Gewerbe</span>':'')+'</div><div class="km24SvcMeta"><span>📍 '+svcEsc((p.postal_code||'')+' '+(p.city||''))+'</span><span>'+svcEsc(p.nationwide?'Ganze Schweiz':(p.radius_km+' km'))+'</span></div><div class="mut" style="font-size:11px;margin-top:8px">'+svcEsc(name)+'</div></div></article>'
 }
 async function servicesPage(){
   let cats=await svcCategories(),opts=cats.map(function(c){return '<option value="'+svcEsc(c.slug)+'">'+svcEsc(c.icon+' '+c.name_de)+'</option>'}).join('');
   app.innerHTML='<section class="km24SvcHero"><div class="wrap"><span class="km24SectionKicker">KAUFMICH24 SERVICES</span><h1>Dienstleistungen finden oder Aufträge erhalten.</h1><p>Handwerker, Transporte, Reinigung, Fahrzeugservice, IT und vieles mehr – mit strukturierten Angeboten und geschütztem Kontakt.</p><div class="km24SvcActions"><a class="km24SvcAction" href="#/services/offer/new"><span>🛠️</span><b>Dienstleistung anbieten</b><small>Zeige, was du kannst, dein Einsatzgebiet und deine Preise.</small></a><a class="km24SvcAction" href="#/services/request/new"><span>🔎</span><b>Auftrag erstellen</b><small>Beschreibe deinen Auftrag und erhalte Angebote von passenden Anbietern.</small></a></div></div></section><div class="wrap section"><div class="head"><div><h2 style="margin:0">Services & offene Aufträge</h2><p class="mut" style="margin:4px 0 0">Angebote vergleichen oder neue Kunden finden.</p></div><div class="actions">'+(user?'<button class="btn" id="svcMine">Meine Services</button><button class="btn" id="svcJobs">Meine Aufträge</button><button class="btn" id="svcQuotes">Meine Offerten</button><button class="btn" id="svcInbox">Nachrichten</button>':'')+'</div></div><div class="km24SvcToolbar"><input id="svcQ" placeholder="Was suchst du?"><select id="svcType"><option value="">Alles</option><option value="offer">Dienstleistungen</option><option value="request">Offene Aufträge</option></select><select id="svcCat"><option value="">Alle Kategorien</option>'+opts+'</select><select id="svcCanton"><option value="">Ganze Schweiz</option>'+['AG','AI','AR','BE','BL','BS','FR','GE','GL','GR','JU','LU','NE','NW','OW','SG','SH','SO','SZ','TG','TI','UR','VD','VS','ZG','ZH'].map(function(x){return '<option>'+x+'</option>'}).join('')+'</select></div><div id="svcStatus" class="mut" style="margin:8px 0 14px"></div><div id="svcGrid" class="km24SvcGrid"></div></div>';
   if(user){document.getElementById('svcMine').onclick=function(){svcGo('#/services/mine')};document.getElementById('svcJobs').onclick=function(){svcGo('#/services/jobs')};document.getElementById('svcQuotes').onclick=function(){svcGo('#/services/quotes')};document.getElementById('svcInbox').onclick=function(){svcGo('#/services/inbox')}}
   async function load(){
     let st=document.getElementById('svcStatus'),g=document.getElementById('svcGrid');if(!g)return;
     st.textContent='Services werden geladen …';g.innerHTML='<div class="empty" style="grid-column:1/-1">Laden …</div>';
     let q=(document.getElementById('svcQ').value||'').trim(),
         typ=document.getElementById('svcType').value||null,
         cat=document.getElementById('svcCat').value||null,
         can=document.getElementById('svcCanton').value||null;
     let r=await db.rpc('search_services_v1',{
       p_query:q||null,p_type:typ,p_category_slug:cat,p_canton:can,p_limit:120,p_offset:0
     });
     if(r.error){st.innerHTML=N(r.error.message,1);g.innerHTML='';return}
     let arr=r.data||[];
     let [ims,people]=await Promise.all([svcImages(arr.map(function(x){return x.id})),svcCards(arr.map(function(x){return x.user_id}))]),cm={};cats.forEach(function(c){cm[c.slug]=c});
     st.textContent=arr.length+(arr.length===1?' Eintrag':' Einträge')+(arr.length===120?' · weitere Treffer möglich':'');
     g.innerHTML=arr.length?arr.map(function(x){return svcCardHtml(x,ims[x.id],people[x.user_id],cm[x.category_slug])}).join(''):'<div class="empty" style="grid-column:1/-1">Keine passenden Services gefunden.</div>'
   }
   let svcSearchTimer=0;
   ['svcType','svcCat','svcCanton'].forEach(function(id){document.getElementById(id).onchange=load});
   document.getElementById('svcQ').oninput=function(){clearTimeout(svcSearchTimer);svcSearchTimer=setTimeout(load,320)};
   document.getElementById('svcQ').onkeydown=function(e){if(e.key==='Enter'){clearTimeout(svcSearchTimer);load()}};
   load()
 }
 async function serviceForm(type){
   if(!user){location.hash='#/login?next=services/'+type+'/new';return}
   await loadProfile();
   if(type==='offer'&&!sellerReady()){location.hash='#/verification?next=services/offer/new';return}
   if(type==='request'&&!contactReady()){location.hash='#/verification?next=services/request/new';return}
   if(type==='request'&&!buyerReady()){location.hash='#/buyer-activation';return}
   let cats=await svcCategories(),opts=cats.map(function(c){return '<option value="'+svcEsc(c.slug)+'">'+svcEsc(c.icon+' '+c.name_de)+'</option>'}).join('');
   app.innerHTML='<div class="wrap formPage"><a class="btn" href="#/services">← Services</a><div class="head" style="margin-top:18px"><div><span class="km24SectionKicker">'+(type==='offer'?'DIENSTLEISTUNG ANBIETEN':'AUFTRAG ERSTELLEN')+'</span><h1 style="margin:5px 0">'+(type==='offer'?'Was bietest du an?':'Was soll erledigt werden?')+'</h1><p class="mut">'+(type==='offer'?'Beschreibe Leistung, Gebiet, Preis und Verfügbarkeit.':'Passende Anbieter können dir danach ein strukturiertes Angebot senden.')+'</p></div></div><form id="svcForm" class="formgrid"><div class="main"><section class="panel stack"><label>Kategorie<select id="sfCat" required><option value="">Kategorie wählen</option>'+opts+'</select></label><label>Titel<input id="sfTitle" required maxlength="120" placeholder="'+(type==='offer'?'z. B. Autotransport ganze Schweiz':'z. B. Umzug von Luzern nach Sursee')+'"></label><label>Beschreibung<textarea id="sfDesc" rows="8" maxlength="5000" required placeholder="Beschreibe möglichst genau, was angeboten bzw. gesucht wird."></textarea></label><div class="two"><label>PLZ<input id="sfZip" required maxlength="10" value="'+svcEsc(profile?.postal_code||'')+'"></label><label>Ort<input id="sfCity" required maxlength="80" value="'+svcEsc(profile?.city||'')+'"></label></div><div class="two"><label>Kanton<select id="sfCanton"><option value="">–</option>'+['AG','AI','AR','BE','BL','BS','FR','GE','GL','GR','JU','LU','NE','NW','OW','SG','SH','SO','SZ','TG','TI','UR','VD','VS','ZG','ZH'].map(function(x){return '<option '+(profile?.canton===x?'selected':'')+'>'+x+'</option>'}).join('')+'</select></label><label>Einsatzradius<select id="sfRadius"><option value="10">10 km</option><option value="25" selected>25 km</option><option value="50">50 km</option><option value="100">100 km</option><option value="250">250 km</option><option value="500">500 km</option></select></label></div><label style="display:flex;gap:9px;align-items:center"><input id="sfNationwide" type="checkbox" style="width:auto"> Ganze Schweiz / ortsunabhängig</label></section><section class="panel stack"><h3>Preis & Termin</h3><div class="two"><label>Preismodell<select id="sfPriceModel">'+(type==='request'?'<option value="budget">Budget</option>':'')+'<option value="fixed">Fixpreis</option><option value="hourly">Pro Stunde</option><option value="from">Ab-Preis</option><option value="on_request">Preis auf Anfrage</option></select></label><label>Preis / Budget CHF<input id="sfPrice" type="number" min="0" step=".05"></label></div>'+(type==='request'?'<label>Wunschtermin <small class="mut">(optional)</small><input id="sfDate" type="date"></label>':'<label>Verfügbarkeit <small class="mut">(optional)</small><input id="sfAvail" maxlength="160" placeholder="z. B. Mo–Sa, kurzfristig möglich"></label>')+'</section><section class="panel stack"><h3>Referenzbilder <small class="mut">(optional)</small></h3><p class="mut">Bis zu 6 Bilder, je maximal 8 MB.</p><input id="sfPhotos" type="file" accept="image/jpeg,image/png,image/webp" multiple><div id="sfPhotoNames" class="mut"></div></section></div><aside class="side"><section class="panel"><h3>'+((type==='offer')?'Dein Service':'Dein Auftrag')+'</h3><p class="mut">Kontaktdaten werden nicht offen angezeigt. Der Austausch läuft zuerst geschützt über KaufMich24.</p><button class="btn primary" style="width:100%">'+(type==='offer'?'Dienstleistung veröffentlichen':'Auftrag veröffentlichen')+'</button><div id="sfMsg"></div></section></aside></form></div>';
   let photos=[];document.getElementById('sfPhotos').onchange=function(e){photos=[...e.target.files].filter(function(f){return /^image\/(jpeg|png|webp)$/.test(f.type)&&f.size<=8*1024*1024}).slice(0,6);document.getElementById('sfPhotoNames').textContent=photos.length?photos.map(function(f){return f.name}).join(' · '):''};
   function priceToggle(){let m=document.getElementById('sfPriceModel').value,inp=document.getElementById('sfPrice');inp.disabled=m==='on_request';if(inp.disabled)inp.value=''}document.getElementById('sfPriceModel').onchange=priceToggle;priceToggle();
   document.getElementById('svcForm').onsubmit=async function(e){
     e.preventDefault();let msg=document.getElementById('sfMsg'),model=document.getElementById('sfPriceModel').value,price=model==='on_request'?null:Number(document.getElementById('sfPrice').value||0);
     if(model!=='on_request'&&price<0)return msg.innerHTML=N('Bitte einen gültigen Preis eingeben.',1);
     msg.innerHTML=N('Wird veröffentlicht …');
     let payload={user_id:user.id,post_type:type,category_slug:document.getElementById('sfCat').value,title:document.getElementById('sfTitle').value.trim(),description:document.getElementById('sfDesc').value.trim(),postal_code:document.getElementById('sfZip').value.trim(),city:document.getElementById('sfCity').value.trim(),canton:document.getElementById('sfCanton').value||null,radius_km:Number(document.getElementById('sfRadius').value),nationwide:document.getElementById('sfNationwide').checked,price_model:model,price_chf:price,desired_date:type==='request'?(document.getElementById('sfDate').value||null):null,availability:type==='offer'?(document.getElementById('sfAvail').value.trim()||null):null,status:'active'};
     let r=await db.from('service_posts').insert(payload).select('id').single();if(r.error){msg.innerHTML=N(r.error.message,1);return}let id=r.data.id;
     for(let i=0;i<photos.length;i++){let f=photos[i],ext=f.type==='image/png'?'png':f.type==='image/webp'?'webp':'jpg',path=user.id+'/services/'+id+'/'+(window.crypto&&typeof crypto.randomUUID==='function'?crypto.randomUUID():('km24_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)))+'.'+ext,up=await db.storage.from('listing-images').upload(path,f,{contentType:f.type});if(!up.error)await db.from('service_images').insert({post_id:id,storage_path:path,sort_order:i})}
     svcGo('#/services/post/'+id)
   }
 }
 async function serviceDetail(id){
   let pr=await db.from('service_posts').select('*').eq('id',id).maybeSingle();if(!pr.data){app.innerHTML='<div class="wrap formPage"><div class="empty">Service nicht gefunden.</div></div>';return}
   let p=pr.data,cats=await svcCategories(),cat=cats.find(function(x){return x.slug===p.category_slug}),[im,people,revs]=await Promise.all([db.from('service_images').select('*').eq('post_id',id).order('sort_order'),svcCards([p.user_id,p.assigned_provider_id]),db.from('service_reviews').select('*').eq('reviewee_id',p.post_type==='offer'?p.user_id:(p.assigned_provider_id||p.user_id)).order('created_at',{ascending:false}).limit(50)]);
   let imgs=im.data||[],person=people[p.user_id]||{},reviewRows=revs.data||[],avg=reviewRows.length?(reviewRows.reduce(function(a,x){return a+(x.quality+x.reliability+x.communication+x.value_rating)/4},0)/reviewRows.length):0,own=!!user&&user.id===p.user_id,assigned=!!user&&user.id===p.assigned_provider_id;
   let gallery=imgs.length?'<div class="km24SvcGallery">'+imgs.slice(0,5).map(function(x){return '<img src="'+svcEsc(IMG(x.storage_path))+'" alt="">'}).join('')+'</div>':'';
   let name=person.business_name||person.display_name||'Mitglied';
   app.innerHTML='<div class="wrap km24SvcDetail"><a class="btn" href="#/services">← Services</a><div class="km24SvcDetailGrid" style="margin-top:15px"><main class="main">'+gallery+'<section class="panel"><span class="badge '+(p.post_type==='request'?'auction':'')+'">'+(p.post_type==='request'?'🔎 Auftrag gesucht':'🛠️ Dienstleistung')+'</span><h1>'+svcEsc(p.title)+'</h1><div class="detailprice">'+svcEsc(svcPrice(p))+'</div><div class="km24SvcMeta"><span>📍 '+svcEsc(p.postal_code+' '+p.city+(p.canton?' · '+p.canton:''))+'</span><span>'+svcEsc(p.nationwide?'Ganze Schweiz':('Radius '+p.radius_km+' km'))+'</span></div><hr style="border:0;border-top:1px solid #514b43;margin:18px 0"><div class="desc">'+svcEsc(p.description)+'</div>'+(p.desired_date?'<p><b>Wunschtermin:</b> '+svcEsc(new Date(p.desired_date+'T12:00:00').toLocaleDateString((window.km24Locale?window.km24Locale():'de-CH')))+'</p>':'')+(p.availability?'<p><b>Verfügbarkeit:</b> '+svcEsc(p.availability)+'</p>':'')+'</section><section class="panel"><h3>Bewertungen</h3>'+(reviewRows.length?'<div class="km24SvcStars">★ '+avg.toFixed(1)+' / 5</div><p class="mut">'+reviewRows.length+' Service-Bewertung(en)</p>':'<p class="mut">Noch keine Service-Bewertungen.</p>')+'</section><div id="svcReviewBox"></div></main><aside class="side"><section class="panel"><small class="mut">'+(p.post_type==='offer'?'Anbieter':'Auftraggeber')+'</small><div class="seller">'+svcEsc(name)+'</div><div class="km24SvcTrust">'+((person.account_type&&person.account_type!=='private')?'<span>🏢 Gewerbe</span>':'')+'</div><p class="mut">📍 '+svcEsc(person.city||p.city||'Schweiz')+'</p></section><div id="svcActionBox"></div></aside></div></div>';
   let action=document.getElementById('svcActionBox');
   if(p.post_type==='offer'){
     if(own){
       action.innerHTML='<section class="panel"><h3>Dein Angebot</h3><p class="mut">Status: '+svcEsc(p.status)+'</p><div class="actions"><button class="btn" id="svcPause">'+(p.status==='active'?'Pausieren':'Aktivieren')+'</button><button class="btn" id="svcMineLink">Meine Services</button></div></section>';
       document.getElementById('svcPause').onclick=async function(){let activate=p.status!=='active',r=await db.rpc('set_service_post_active',{p_post_id:p.id,p_active:activate});if(r.error)return alert(r.error.message);serviceDetail(id)};
       document.getElementById('svcMineLink').onclick=function(){svcGo('#/services/mine')}
     }else{
       action.innerHTML='<section class="panel stack"><h3>Anfrage senden</h3><p class="mut">Deine Kontaktdaten bleiben zunächst geschützt. Ihr könnt sie später gegenseitig freigeben.</p><textarea id="svcInquiry" rows="5" placeholder="Beschreibe kurz deinen Bedarf."></textarea><button class="btn primary" id="svcInquiryBtn">Anbieter kontaktieren</button><div id="svcInquiryMsg"></div></section>';
       document.getElementById('svcInquiryBtn').onclick=async function(){if(!user){location.hash='#/login?next=services/post/'+id;return}let m=document.getElementById('svcInquiry').value.trim();if(!m)return;let r=await db.rpc('start_service_inquiry',{p_post_id:id,p_message:m});if(r.error)return document.getElementById('svcInquiryMsg').innerHTML=N(r.error.message,1);svcGo('#/services/thread/'+r.data)}
     }
   }else{
     if(own){
       let qr=await db.from('service_quotes').select('*').eq('request_id',id).order('created_at',{ascending:false}),quotes=qr.data||[],qPeople=await svcCards(quotes.map(function(x){return x.provider_id}));
       action.innerHTML='<section class="panel"><h3>Angebote erhalten</h3><p class="mut">'+quotes.length+' Angebot(e)</p><div id="svcQuotes">'+(quotes.length?quotes.map(function(q){let n=qPeople[q.provider_id]?.business_name||qPeople[q.provider_id]?.display_name||'Anbieter';return '<div class="km24SvcQuote '+(q.status==='accepted'?'accepted':'')+'"><b>'+svcEsc(n)+'</b><div class="big">'+svcEsc((q.price_model==='hourly'?'CHF '+svcFmt(q.price_chf)+' / Std.':q.price_model==='from'?'ab CHF '+svcFmt(q.price_chf):'CHF '+svcFmt(q.price_chf)))+'</div>'+(q.proposed_date?'<div class="mut">Termin: '+svcEsc(new Date(q.proposed_date+'T12:00:00').toLocaleDateString((window.km24Locale?window.km24Locale():'de-CH')))+'</div>':'')+'<p>'+svcEsc(q.message||'')+'</p><div class="actions">'+(q.status==='pending'&&p.status==='active'?'<button class="btn primary" data-accept="'+q.id+'">Annehmen</button>':'<span class="badge">'+svcEsc(q.status)+'</span>')+'<button class="btn" data-thread="'+q.thread_id+'">Nachrichten</button></div></div>'}).join(''):'<div class="mut">Noch keine Angebote.</div>')+'</div></section>';
       action.querySelectorAll('[data-accept]').forEach(function(b){b.onclick=async function(){if(!confirm('Dieses Angebot annehmen? Die anderen offenen Angebote werden abgelehnt.'))return;let r=await db.rpc('accept_service_quote',{p_quote_id:b.dataset.accept});if(r.error)return alert(r.error.message);serviceDetail(id)}});
       action.querySelectorAll('[data-thread]').forEach(function(b){b.onclick=function(){svcGo('#/services/thread/'+b.dataset.thread)}})
     }else if(p.status==='active'){
       let existing=null;if(user){let qr=await db.from('service_quotes').select('*').eq('request_id',id).eq('provider_id',user.id).maybeSingle();existing=qr.data||null}
       action.innerHTML='<section class="panel stack"><h3>'+(existing?'Angebot aktualisieren':'Angebot senden')+'</h3><div class="two"><label>Preis CHF<input id="sqPrice" type="number" min="0" step=".05" value="'+svcEsc(existing?.price_chf||'')+'"></label><label>Modell<select id="sqModel"><option value="fixed">Fixpreis</option><option value="hourly">Pro Stunde</option><option value="from">Ab-Preis</option></select></label></div><label>Möglicher Termin<input id="sqDate" type="date" value="'+svcEsc(existing?.proposed_date||'')+'"></label><label>Gültig bis<input id="sqValid" type="date" value="'+svcEsc(existing?.valid_until||'')+'"></label><textarea id="sqMsg" rows="5" placeholder="Was ist im Preis enthalten?">'+svcEsc(existing?.message||'')+'</textarea><button class="btn primary" id="sqSend">'+(existing?'Angebot aktualisieren':'Angebot senden')+'</button><div id="sqStatus"></div></section>';
       if(existing)document.getElementById('sqModel').value=existing.price_model;
       document.getElementById('sqSend').onclick=async function(){if(!user){location.hash='#/login?next=services/post/'+id;return}await loadProfile();if(!sellerReady()){location.hash='#/verification?next=services/post/'+id;return}let price=Number(document.getElementById('sqPrice').value||-1);if(price<0)return document.getElementById('sqStatus').innerHTML=N('Bitte Preis angeben.',1);let r=await db.rpc('submit_service_quote',{p_request_id:id,p_price_chf:price,p_price_model:document.getElementById('sqModel').value,p_proposed_date:document.getElementById('sqDate').value||null,p_message:document.getElementById('sqMsg').value.trim(),p_valid_until:document.getElementById('sqValid').value||null});if(r.error)return document.getElementById('sqStatus').innerHTML=N(r.error.message,1);let q=await db.from('service_quotes').select('thread_id').eq('id',r.data).single();svcGo('#/services/thread/'+q.data.thread_id)}
     }else{
       action.innerHTML='<section class="panel"><h3>Auftrag vergeben</h3><p class="mut">Dieser Auftrag nimmt keine neuen Angebote mehr an.</p></section>'
     }
   }
   if((p.status==='matched')&&(own||assigned)){
     action.insertAdjacentHTML('beforeend','<section class="panel"><h3>Auftrag läuft</h3><p class="mut">Wenn die Dienstleistung erledigt ist, könnt ihr den Auftrag abschliessen und euch bewerten.</p><button class="btn primary" id="svcComplete">✓ Auftrag abgeschlossen</button></section>');
     document.getElementById('svcComplete').onclick=async function(){let r=await db.rpc('complete_service_post',{p_post_id:id});if(r.error)return alert(r.error.message);serviceDetail(id)}
   }
   if(p.status==='completed'&&(own||assigned)&&p.assigned_provider_id){
     let rr=await db.from('service_reviews').select('id').eq('post_id',id).eq('reviewer_id',user.id).maybeSingle();
     if(!rr.data){
       let box=document.getElementById('svcReviewBox');box.innerHTML='<section class="panel stack"><h3>Auftrag bewerten</h3><div class="km24SvcReviewGrid">'+[['srQ','Qualität'],['srR','Zuverlässigkeit'],['srC','Kommunikation'],['srV','Preis-Leistung']].map(function(x){return '<label>'+x[1]+'<select id="'+x[0]+'"><option value="5">5 – Sehr gut</option><option value="4">4 – Gut</option><option value="3">3 – Okay</option><option value="2">2 – Schwach</option><option value="1">1 – Schlecht</option></select></label>'}).join('')+'</div><textarea id="srComment" rows="4" placeholder="Optionaler Kommentar"></textarea><button class="btn primary" id="srSend">Bewertung abgeben</button><div id="srMsg"></div></section>';
       document.getElementById('srSend').onclick=async function(){let r=await db.rpc('submit_service_review',{p_post_id:id,p_quality:+document.getElementById('srQ').value,p_reliability:+document.getElementById('srR').value,p_communication:+document.getElementById('srC').value,p_value_rating:+document.getElementById('srV').value,p_comment:document.getElementById('srComment').value.trim()});if(r.error)return document.getElementById('srMsg').innerHTML=N(r.error.message,1);serviceDetail(id)}
     }
   }
 }
 async function serviceThreadPage(id){
   if(!user){location.hash='#/login';return}
   let tr=await db.from('service_threads').select('*').eq('id',id).maybeSingle();if(!tr.data){app.innerHTML='<div class="wrap formPage"><div class="empty">Unterhaltung nicht gefunden.</div></div>';return}
   let t=tr.data,[pr,mr,people]=await Promise.all([db.from('service_posts').select('*').eq('id',t.post_id).maybeSingle(),db.from('service_messages').select('*').eq('thread_id',id).order('created_at'),svcCards([t.customer_id,t.provider_id])]),p=pr.data,msgs=mr.data||[],other=user.id===t.customer_id?t.provider_id:t.customer_id,op=people[other]||{},ownUnlock=user.id===t.customer_id?t.customer_unlock_at:t.provider_unlock_at,otherUnlock=user.id===t.customer_id?t.provider_unlock_at:t.customer_unlock_at,contact=null;
   if(t.contact_unlocked_at){let cr=await db.rpc('service_contact_details',{p_thread_id:id});contact=(cr.data||[])[0]||null}
   app.innerHTML='<div class="wrap formPage"><a class="btn" href="#/services/post/'+t.post_id+'">← Zum Service</a><div class="head" style="margin-top:15px"><div><span class="km24SectionKicker">SERVICE-NACHRICHTEN</span><h1 style="margin:5px 0">'+svcEsc(p?.title||'Unterhaltung')+'</h1><p class="mut">Mit '+svcEsc(op.business_name||op.display_name||'Mitglied')+'</p></div></div>'+(contact?'<div class="km24SvcContact"><b>✓ Kontaktdaten freigegeben</b><div style="margin-top:6px">'+svcEsc(contact.business_name||contact.display_name||'')+(contact.phone?'<br>📞 '+svcEsc(contact.phone):'')+(contact.website?'<br>🌐 '+svcEsc(contact.website):'')+(contact.city?'<br>📍 '+svcEsc((contact.postal_code||'')+' '+contact.city):'')+'</div></div>':'<div class="panel" style="margin-bottom:12px"><b>🔒 Kontaktschutz</b><p class="mut">'+(ownUnlock?(otherUnlock?'Freigabe wird aktiviert …':'Du hast zugestimmt. Warte noch auf die Gegenseite.'):'Telefon und Website bleiben verborgen, bis beide Seiten der Freigabe zustimmen.')+'</p><button class="btn" id="svcUnlock" '+(ownUnlock?'disabled':'')+'>'+(ownUnlock?'✓ Von dir freigegeben':'Kontaktdaten freigeben')+'</button></div>')+'<div class="chatBox"><div id="svcMessages" class="km24SvcMessageList">'+(msgs.length?msgs.map(function(m){return '<div class="km24SvcMsg '+(m.sender_id===user.id?'mine':'')+'">'+svcEsc(m.body)+'<small>'+svcEsc(D(m.created_at))+'</small></div>'}).join(''):'<div class="mut">Noch keine Nachrichten.</div>')+'</div><div class="km24SvcThreadSend"><input id="svcMsgInput" maxlength="4000" placeholder="Nachricht schreiben …"><button class="btn primary" id="svcMsgSend">Senden</button></div></div></div>';
   if(!contact&&!ownUnlock){document.getElementById('svcUnlock').onclick=async function(){let r=await db.rpc('service_unlock_contact',{p_thread_id:id});if(r.error)return alert(r.error.message);serviceThreadPage(id)}}
   document.getElementById('svcMsgSend').onclick=async function(){let inp=document.getElementById('svcMsgInput'),body=inp.value.trim();if(!body)return;let r=await db.rpc('send_service_message',{p_thread_id:id,p_body:body});if(r.error)return alert(r.error.message);serviceThreadPage(id)}
 }
 async function serviceMinePage(){
   if(!user){location.hash='#/login';return}
   let [r,cats]=await Promise.all([db.from('service_posts').select('*').eq('user_id',user.id).neq('status','deleted').order('created_at',{ascending:false}),svcCategories()]),arr=r.data||[],ims=await svcImages(arr.map(function(x){return x.id})),cm={};cats.forEach(function(c){cm[c.slug]=c});
   app.innerHTML='<div class="wrap formPage"><div class="head"><div><span class="km24SectionKicker">MEINE SERVICES</span><h1 style="margin:5px 0">Dienstleistungen & Aufträge</h1></div><a class="btn primary" href="#/services">Services öffnen</a></div><div class="km24SvcGrid">'+(arr.length?arr.map(function(x){return svcCardHtml(x,ims[x.id],{display_name:'Du',is_verified:false,account_type:profile?.account_type},cm[x.category_slug])}).join(''):'<div class="empty" style="grid-column:1/-1">Noch keine Service-Einträge.</div>')+'</div></div>'
 }
 async function serviceInboxPage(){
   if(!user){location.hash='#/login';return}
   let tr=await db.from('service_threads').select('*').order('updated_at',{ascending:false});if(tr.error){app.innerHTML='<div class="wrap formPage">'+N(tr.error.message,1)+'</div>';return}let arr=tr.data||[];
   if(!arr.length){app.innerHTML='<div class="wrap formPage"><a class="btn" href="#/services">← Services</a><div class="empty" style="margin-top:18px">Noch keine Service-Nachrichten.</div></div>';return}
   let [pr,mr,people]=await Promise.all([db.from('service_posts').select('id,title,post_type').in('id',arr.map(function(x){return x.post_id})),db.from('service_messages').select('*').in('thread_id',arr.map(function(x){return x.id})).order('created_at',{ascending:false}),svcCards(arr.flatMap(function(x){return [x.customer_id,x.provider_id]}))]),pm={},last={};(pr.data||[]).forEach(function(x){pm[x.id]=x});(mr.data||[]).forEach(function(x){if(!last[x.thread_id])last[x.thread_id]=x});
   app.innerHTML='<div class="wrap formPage"><div class="head"><div><span class="km24SectionKicker">SERVICE-NACHRICHTEN</span><h1 style="margin:5px 0">Unterhaltungen</h1></div><a class="btn" href="#/services">Services</a></div><div class="manage">'+arr.map(function(t){let other=user.id===t.customer_id?t.provider_id:t.customer_id,n=people[other]?.business_name||people[other]?.display_name||'Mitglied',p=pm[t.post_id],m=last[t.id];return '<div class="manageRow" style="grid-template-columns:1fr auto"><div><b>'+svcEsc(n)+'</b><div>'+svcEsc(p?.title||'Service')+'</div><small class="mut">'+svcEsc(m?.body||'Noch keine Nachricht')+'</small></div><button class="btn" onclick="km24ServiceGo(\'#/services/thread/'+t.id+'\')">Öffnen</button></div>'}).join('')+'</div></div>'
 }

 async function serviceJobsPage(){
   if(!user){location.hash='#/login';return}
   let r=await db.from('service_posts').select('*').eq('user_id',user.id).eq('post_type','request').neq('status','deleted').order('created_at',{ascending:false});
   if(r.error){app.innerHTML='<div class="wrap formPage">'+N(r.error.message,1)+'</div>';return}
   let arr=r.data||[],ids=arr.map(function(x){return x.id}),quotes={};
   if(ids.length){
     let qr=await db.from('service_quotes').select('request_id,status').in('request_id',ids);
     (qr.data||[]).forEach(function(q){
       let x=quotes[q.request_id]||(quotes[q.request_id]={total:0,pending:0,accepted:0});
       x.total++;if(q.status==='pending')x.pending++;if(q.status==='accepted')x.accepted++
     })
   }
   let statusLabel={active:'Offen',matched:'Vergeben',completed:'Abgeschlossen',paused:'Pausiert'};
   app.innerHTML='<div class="wrap formPage"><div class="head"><div><span class="km24SectionKicker">MEINE AUFTRÄGE</span><h1 style="margin:5px 0">Aufträge & eingegangene Angebote</h1><p class="mut">Behalte offene, vergebene und abgeschlossene Service-Aufträge im Blick.</p></div><div class="actions"><a class="btn primary" href="#/services/request/new">＋ Auftrag erstellen</a><a class="btn" href="#/services">Services</a></div></div><div class="manage">'+(arr.length?arr.map(function(p){let q=quotes[p.id]||{total:0,pending:0,accepted:0};return '<div class="manageRow km24SvcManageRow" style="grid-template-columns:1fr auto"><div><span class="badge">'+svcEsc(statusLabel[p.status]||p.status)+'</span><b style="display:block;margin-top:6px">'+svcEsc(p.title)+'</b><div class="mut" style="margin-top:5px">📍 '+svcEsc(p.postal_code+' '+p.city)+' · '+q.total+' Angebot(e)'+(q.pending?' · '+q.pending+' offen':'')+'</div></div><button class="btn primary" onclick="km24ServiceGo(\'#/services/post/'+p.id+'\')">Öffnen</button></div>'}).join(''):'<div class="empty">Du hast noch keinen Service-Auftrag erstellt.</div>')+'</div></div>'
 }

 async function serviceQuotesPage(){
   if(!user){location.hash='#/login';return}
   let qr=await db.from('service_quotes').select('*').eq('provider_id',user.id).order('created_at',{ascending:false});
   if(qr.error){app.innerHTML='<div class="wrap formPage">'+N(qr.error.message,1)+'</div>';return}
   let arr=qr.data||[],posts={};
   if(arr.length){
     let pr=await db.from('service_posts').select('id,title,city,postal_code,status').in('id',arr.map(function(x){return x.request_id}));
     (pr.data||[]).forEach(function(x){posts[x.id]=x})
   }
   let label={pending:'Offen',accepted:'Angenommen',declined:'Nicht ausgewählt',withdrawn:'Zurückgezogen'};
   let cls={accepted:'statusGood',declined:'statusBad',pending:'statusWarn'};
   app.innerHTML='<div class="wrap formPage"><div class="head"><div><span class="km24SectionKicker">MEINE OFFERTEN</span><h1 style="margin:5px 0">Gesendete Service-Angebote</h1><p class="mut">Hier siehst du Status, Preis und Unterhaltung zu deinen Offerten.</p></div><a class="btn" href="#/services">Services</a></div><div class="manage">'+(arr.length?arr.map(function(q){let p=posts[q.request_id]||{};return '<div class="manageRow km24SvcManageRow" style="grid-template-columns:1fr auto"><div><div class="activityStatus '+(cls[q.status]||'')+'">'+svcEsc(label[q.status]||q.status)+'</div><b style="display:block;margin-top:6px">'+svcEsc(p.title||'Auftrag')+'</b><div style="margin-top:5px"><b>'+svcEsc(q.price_model==='hourly'?'CHF '+svcFmt(q.price_chf)+' / Std.':q.price_model==='from'?'ab CHF '+svcFmt(q.price_chf):'CHF '+svcFmt(q.price_chf))+'</b></div><div class="mut">'+svcEsc((p.postal_code||'')+' '+(p.city||''))+'</div></div><div class="actions"><button class="btn" onclick="km24ServiceGo(\'#/services/post/'+q.request_id+'\')">Auftrag</button><button class="btn primary" onclick="km24ServiceGo(\'#/services/thread/'+q.thread_id+'\')">Nachrichten</button></div></div>'}).join(''):'<div class="empty">Du hast noch keine Service-Offerte gesendet.</div>')+'</div></div>'
 }
 function km24ServiceRoute(){
   let h=location.hash||'';if(!h.startsWith('#/services'))return false;
   if(h==='#/services')servicesPage();
   else if(h==='#/services/offer/new')serviceForm('offer');
   else if(h==='#/services/request/new')serviceForm('request');
   else if(h==='#/services/mine')serviceMinePage();
   else if(h==='#/services/inbox')serviceInboxPage();
   else if(h==='#/services/jobs')serviceJobsPage();
   else if(h==='#/services/quotes')serviceQuotesPage();
   else if(h.startsWith('#/services/post/'))serviceDetail(h.split('/')[3]);
   else if(h.startsWith('#/services/thread/'))serviceThreadPage(h.split('/')[3]);
   else servicesPage();
   return true
 }
 function injectChrome(){
   let nav=document.querySelector('header .nav');
   if(nav&&!document.getElementById('km24ServicesTopLink')){
     let a=document.createElement('a');a.id='km24ServicesTopLink';a.className='btn km24DesktopNav km24ServicesTopLink';a.href='#/services';a.textContent='🛠 Services';nav.insertBefore(a,nav.firstChild)
   }
   let market=document.querySelector('.km24FooterGrid>div:nth-child(2)');
   if(market&&!market.querySelector('[href="#/services"]')){let a=document.createElement('a');a.href='#/services';a.textContent='Dienstleistungen';market.insertBefore(a,market.children[1]||null)}
 }
 function injectHome(){
   let cat=document.querySelector('.km24CategorySection');if(!cat||document.getElementById('km24SvcHome')||document.getElementById('km24SrvSpotlightV2'))return;
   let s=document.createElement('section');s.id='km24SvcHome';s.className='km24SvcHome';s.innerHTML='<div class="wrap"><div class="km24HomeSectionHead"><div><span class="km24SectionKicker">🛠️ KAUFMICH24 SERVICES</span><h2>Dienstleistungen</h2><p>Aufträge ausschreiben oder neue Kunden finden.</p></div><a class="btn" href="#/services">Alle Services</a></div><div class="km24SvcHomeGrid"><a class="km24SvcHomeCard" href="#/services"><span>🤝</span><b>Services entdecken</b><small>Dienstleister und offene Aufträge aus der ganzen Schweiz.</small></a><a class="km24SvcHomeCard" href="#/services/offer/new"><span>🛠️</span><b>Dienstleistung anbieten</b><small>Leistung, Einsatzgebiet und Preis veröffentlichen.</small></a><a class="km24SvcHomeCard" href="#/services/request/new"><span>🔎</span><b>Auftrag erstellen</b><small>Angebote von passenden Dienstleistern erhalten.</small></a></div></div>';cat.insertAdjacentElement('afterend',s)
 }
 window.km24ServiceGo=svcGo;
 window.km24ServiceRoute=km24ServiceRoute;
 injectChrome();
 let oldCreate=window.createChoicePage;
 if(typeof oldCreate==='function')window.createChoicePage=async function(){await oldCreate();let g=document.querySelector('.planGrid');if(g&&!g.querySelector('[href="#/services"]'))g.insertAdjacentHTML('beforeend','<a class="plan km24CreateChoice" href="#/services"><div style="font-size:42px">🛠️</div><h2>Dienstleistungen</h2><p>Biete eine Dienstleistung an oder erstelle einen Auftrag und erhalte Angebote.</p><span class="btn primary">Services öffnen</span></a>')};
 window.__km24HomeHooks=window.__km24HomeHooks||[];
 window.__km24HomeHooks.push(async function(){injectHome()});
 window.addEventListener('hashchange',function(){setTimeout(function(){if(km24ServiceRoute())return;injectChrome()},30)});
 setTimeout(function(){injectChrome()},180);
})();
