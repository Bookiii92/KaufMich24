
(function(){
if(window.__km24ProSalesV1)return;window.__km24ProSalesV1=true;

window.km24DurationEnd=function(v,existing){
 v=String(v||"d3");
 if(v==="keep"&&existing)return new Date(existing);
 let m=/^h(1|3|6|12)$/.exec(v);if(m)return new Date(Date.now()+Number(m[1])*3600000);
 let d=/^d(\d{1,2})$/.exec(v),days=Math.max(1,Math.min(14,d?Number(d[1]):3));
 return new Date(Date.now()+days*86400000)
};
function durationOptions(selected){
 let sel=String(selected||"d3"),a=[["h1","1 Stunde"],["h3","3 Stunden"],["h6","6 Stunden"],["h12","12 Stunden"]].concat(Array.from({length:14},(_,i)=>["d"+(i+1),(i+1)+" "+(i?"Tage":"Tag")]));
 return a.map(x=>'<option value="'+x[0]+'" '+(sel===x[0]?"selected":"")+'>'+x[1]+'</option>').join("")
}
function remainingEndToDuration(v){
 if(!v)return"d3";let h=Math.max(1,(new Date(v)-Date.now())/3600000);
 if(h<=1.5)return"h1";if(h<=4.5)return"h3";if(h<=9)return"h6";if(h<=18)return"h12";return"d"+Math.max(1,Math.min(14,Math.round(h/24)))
}
window.km24SaveBusinessPrice=async function(listingId,inputId){
 let el=document.getElementById(inputId);if(!el)return;
 let v=String(el.value||"").trim();
 if(!v){await db.from("listing_business_prices").delete().eq("listing_id",listingId).eq("seller_id",user.id);return}
 let n=Number(v);if(!Number.isFinite(n)||n<0)return;
 await db.from("listing_business_prices").upsert({listing_id:listingId,seller_id:user.id,price_chf:n,updated_at:new Date().toISOString()},{onConflict:"listing_id"})
};
window.km24UploadListingAttachments=async function(listingId,inputId,msgEl){
 const input=document.getElementById(inputId),files=Array.from(input?.files||[]),result={ok:0,failed:0,errors:[]};
 if(!files.length)return result;
 const types={mp4:"video/mp4",mov:"video/quicktime",webm:"video/webm",pdf:"application/pdf",doc:"application/msword",docx:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",xls:"application/vnd.ms-excel",xlsx:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",txt:"text/plain"};
 if(files.length>4){result.failed+=files.length-4;result.errors.push("Maximal 4 Dateien möglich.");}
 for(let i=0;i<Math.min(4,files.length);i++){
  const f=files[i],ext=(f.name.split(".").pop()||"").toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,8),mime=types[ext]||(Object.values(types).includes(f.type)?f.type:"");
  if(!mime){result.failed++;result.errors.push(f.name+": Dateityp nicht unterstützt (MP4, MOV, WebM, PDF und Dokumente).");continue;}
  if(f.size===0){result.failed++;result.errors.push(f.name+": Datei ist leer.");continue;}
  if(f.size>52428800){result.failed++;result.errors.push(f.name+": "+(f.size/1048576).toFixed(1)+" MB, maximal 50 MB.");continue;}
  if(msgEl)msgEl.textContent="Datei "+(i+1)+" von "+Math.min(files.length,4)+" wird hochgeladen: "+f.name+" …";
  const uid=(window.crypto&&typeof crypto.randomUUID==="function")?crypto.randomUUID():("km24_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2));
  const path=user.id+"/"+listingId+"/"+uid+"."+ext;
  try{
   const up=await db.storage.from("listing-attachments").upload(path,f,{contentType:mime,upsert:false});
   if(up.error)throw up.error;
   const row=await db.from("listing_attachments").insert({listing_id:listingId,storage_path:path,file_name:f.name,mime_type:mime,file_size:f.size,attachment_type:mime.startsWith("video/")?"video":"document",sort_order:i});
   if(row.error){await db.storage.from("listing-attachments").remove([path]);throw row.error;}
   result.ok++;
  }catch(err){result.failed++;result.errors.push(f.name+": "+String(err?.message||"Upload fehlgeschlagen"));}
 }
 if(input)input.value="";
 if(msgEl)msgEl.textContent=result.failed?(result.ok+" hochgeladen, "+result.failed+" fehlgeschlagen: "+result.errors.join("; ")):(result.ok+" Datei(en) erfolgreich hochgeladen.");
 return result;
};
async function enhanceForm(edit,id){
 let p=edit?"e":"",vis=document.getElementById(p+"visibility"),round=document.getElementById(p+"offerRound"),opts=document.getElementById(p+"offerRoundOptions"),dur=document.getElementById(p+"offerRoundDuration");
 if(!vis||!round||!opts||!dur)return;
 dur.innerHTML=durationOptions("d3");
 let toggle=()=>opts.classList.toggle("hide",!round.checked);round.onchange=toggle;toggle();
 let days=document.getElementById(edit?"edays":"days"),time=document.getElementById(edit?"etime":"auctionTime");
 let au=()=>{if(!days||!time)return;let short=String(days.value).startsWith("h");time.disabled=short;time.closest("label")?.classList.toggle("mut",short)};
 days?.addEventListener("change",au);au();
 if(edit&&id){
  let [lr,bp,ar,or]=await Promise.all([
    db.from("listings").select("listing_visibility,sale_mode,offer_round_end_at,offer_round_allow_early_accept").eq("id",id).eq("seller_id",user.id).maybeSingle(),
    db.from("listing_business_prices").select("price_chf").eq("listing_id",id).maybeSingle(),
    db.from("listing_attachments").select("*").eq("listing_id",id).order("sort_order"),
    db.from("offers").select("id").eq("listing_id",id).limit(1)
  ]);
  let l=lr.data||{};vis.value=l.listing_visibility||"public";
  let bpEl=document.getElementById("ebusinessPrice");if(bpEl&&bp.data?.price_chf!=null)bpEl.value=bp.data.price_chf;
  round.checked=l.sale_mode==="offer_round";document.getElementById("eofferEarly").checked=l.offer_round_allow_early_accept!==false;
  dur.innerHTML=durationOptions(remainingEndToDuration(l.offer_round_end_at));toggle();
  if((or.data||[]).length&&round.checked){dur.disabled=true;round.disabled=true;let small=opts.querySelector("small.mut");if(small)small.textContent="Laufzeit und Modus sind nach dem ersten Angebot gesperrt. «Vorzeitig annehmen» kann weiterhin geändert werden."}
  renderEditAttachments(ar.data||[])
 }
}
async function renderEditAttachments(rows){
 let box=document.getElementById("eExistingAttachments");if(!box)return;
 box.innerHTML=rows.length?'<div class="km24AttachmentGrid">'+rows.map(x=>'<div class="km24Attachment" data-att="'+x.id+'"><b>'+(x.attachment_type==="video"?"🎥 ":"📄 ")+E(x.file_name)+'</b><div class="km24AttachmentMeta">'+Math.max(1,Math.round(Number(x.file_size||0)/1024))+' KB</div><button type="button" class="btn" data-del-att="'+x.id+'" style="margin-top:7px">Entfernen</button></div>').join("")+'</div>':'<div class="mut">Noch keine Videos oder Dokumente hinterlegt.</div>';
 box.querySelectorAll("[data-del-att]").forEach(b=>b.onclick=async()=>{
  if(!confirm("Datei wirklich entfernen?"))return;
  let x=rows.find(r=>r.id===b.dataset.delAtt);if(!x)return;
  let q=await db.from("listing_attachments").delete().eq("id",x.id);
  if(q.error)return alert(q.error.message);
  await db.storage.from("listing-attachments").remove([x.storage_path]);
  rows=rows.filter(r=>r.id!==x.id);renderEditAttachments(rows)
 })
}
async function enhanceDetail(id){
 let lr=await db.from("listings").select("id,seller_id,listing_visibility,sale_mode,offer_round_end_at,offer_round_allow_early_accept,status,price_type,title").eq("id",id).maybeSingle(),l=lr.data;if(!l)return;
 let title=document.querySelector(".detail h1");
 if(title){
  let b=document.createElement("div");b.className="km24ProBadges";
  if(l.listing_visibility==="business_only")b.innerHTML+='<span class="km24ProBadge b2b">🏪 Nur Gewerbe</span>';
  if(l.sale_mode==="offer_round")b.innerHTML+='<span class="km24ProBadge">🤝 Angebotsrunde</span>';
  if(b.innerHTML&&!title.previousElementSibling?.classList?.contains("km24ProBadges"))title.before(b)
 }
 let side=document.querySelector(".detail .side");
 if(side&&l.sale_mode==="offer_round"&&!document.getElementById("km24OfferRound")){
  let sr=await db.rpc("offer_round_stats",{p_listing_id:id}),s=(sr.data||[])[0]||{},ended=!!s.is_ended;
  let panel=document.createElement("div");panel.id="km24OfferRound";panel.className="panel km24OfferRound";
  panel.innerHTML='<h3>🤝 Angebotsrunde</h3><p class="mut">'+(ended?"Die Angebotsrunde ist beendet. Der Verkäufer kann jetzt ein Angebot auswählen.":"Interessenten können bis zum Ablauf Angebote einreichen.")+'</p><div class="km24OfferRoundStats"><div><small>Angebote</small><b>'+E(s.offer_count||0)+'</b></div><div><small>Höchstes offenes Angebot</small><b>'+(s.highest_offer_chf!=null?"CHF "+E(F(s.highest_offer_chf)):"Noch keines")+'</b></div></div><small class="mut">Ende: '+E(D(s.offer_round_end_at))+(s.allow_early_accept?" · Verkäufer darf vorher annehmen":" · Annahme erst nach Ablauf")+'</small>';
  side.prepend(panel);
  let form=document.getElementById("offf");
  if(form){let btn=form.querySelector("button");if(btn)btn.textContent=ended?"Angebotsrunde beendet":"Angebot abgeben";if(ended)form.querySelectorAll("input,button").forEach(x=>x.disabled=true)}
 }
 if(side){
  let bp=await db.from("listing_business_prices").select("price_chf").eq("listing_id",id).maybeSingle();
  if(bp.data?.price_chf!=null&&!document.getElementById("km24BusinessPrice")){
    let p=document.createElement("div");p.id="km24BusinessPrice";p.className="panel";p.innerHTML='<small class="mut">🏪 Gewerbepreis</small><div class="big">CHF '+E(F(bp.data.price_chf))+'</div><small class="mut">Nur für verifizierte Gewerbekonten sichtbar.</small>';side.prepend(p)
  }
 }
 let ar=await db.from("listing_attachments").select("*").eq("listing_id",id).order("sort_order");
 if((ar.data||[]).length){
  let host=document.querySelector(".detail .wrap");if(host&&!document.getElementById("km24Attachments")){
    let sec=document.createElement("section");sec.id="km24Attachments";sec.className="panel km24Attachments";sec.innerHTML='<h3>📎 Videos & Dokumente</h3><div class="km24AttachmentGrid" id="km24AttachmentGrid"></div>';host.appendChild(sec);
    let grid=sec.querySelector("#km24AttachmentGrid");
    for(let x of ar.data){
      let sg=await db.storage.from("listing-attachments").createSignedUrl(x.storage_path,3600);if(sg.error)continue;
      let url=sg.data.signedUrl,row=document.createElement("div");row.className="km24Attachment";
      if(x.attachment_type==="video")row.innerHTML='<b>🎥 '+E(x.file_name)+'</b><video controls preload="metadata" src="'+E(url)+'"></video>';
      else row.innerHTML='<a href="'+E(url)+'" target="_blank" rel="noopener">📄 '+E(x.file_name)+'</a><div class="km24AttachmentMeta">'+Math.max(1,Math.round(Number(x.file_size||0)/1024))+' KB</div>';
      grid.appendChild(row)
    }
  }
 }
}
async function enhanceInventory(){
 if(location.hash!=="#/me"||!user)return;
 document.getElementById("km24InventoryStrip")?.remove();
 let q=await db.from("listings").select("status,price_type,sale_mode").eq("seller_id",user.id).neq("status","deleted"),a=q.data||[];
 let reserved=a.filter(x=>x.status==="reserved").length,
     auctions=a.filter(x=>x.status==="active"&&x.price_type==="auction").length,
     rounds=a.filter(x=>x.status==="active"&&x.sale_mode==="offer_round").length;
 let anchor=document.querySelector(".km24AccountStats");
 if(!anchor)return;
 let s=document.createElement("section");
 s.id="km24InventoryStrip";
 s.className="km24InventoryStrip";
 s.innerHTML='<div class="km24InventoryTitle"><span class="km24AccountKicker">VERKAUFSÜBERSICHT</span><small>Zusätzliche Status deiner Inserate</small></div>'+
   '<div class="km24InventoryGrid">'+
   [["Reserviert",reserved,"🔒"],["Auktionen",auctions,"🔨"],["Angebotsrunden",rounds,"🤝"]]
   .map(x=>'<div class="km24InventoryCard"><span>'+x[2]+'</span><b>'+x[1]+'</b><small>'+x[0]+'</small></div>').join("")+
   '</div>';
 anchor.insertAdjacentElement("afterend",s)
}

const oldSell=sell;sell=function(){oldSell();enhanceForm(false,null)};
const oldEditListing=editListing;editListing=async function(id){await oldEditListing(id);await enhanceForm(true,id)};
const oldDetailPro=detail;detail=async function(id){await oldDetailPro(id);await enhanceDetail(id)};
const oldMePro=me;me=async function(){await oldMePro();await enhanceInventory()};

setTimeout(async()=>{try{let h=location.hash||"#/";if(h.startsWith("#/sell"))enhanceForm(false,null);else if(h.startsWith("#/edit/"))enhanceForm(true,h.split("/")[2]);else if(h.startsWith("#/listing/"))enhanceDetail(h.split("/")[2]);else if(h==="#/me")enhanceInventory()}catch(e){console.warn("KM pro sales",e)}},500)
})();
