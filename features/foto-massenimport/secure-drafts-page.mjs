// UI integration for KaufMich24 authenticated sessions; never publishes listings.
// Call mountPhotoDraftPanel({root, supabaseClient}) from a verified firm session.
import {SecurePhotoDrafts,validateImage,MAX_PHOTOS,MAX_PER_ITEM} from "./secure-drafts-client.mjs";
import {PhotoUploadQueue,groupPhotos} from "./photo-upload-queue.mjs";
import {applySharedFields} from "./shared-draft-fields.mjs";
import {inspectBusinessUploadReadiness} from "./upload-account-readiness.mjs";

const el=(tag,props={},value=null)=>{
  const node=document.createElement(tag);
  for(const [k,v] of Object.entries(props)){
    if(k==="className")node.className=v;
    else if(k==="type" || k==="accept" || k==="maxLength" || k==="placeholder")node[k]=v;
    else node.setAttribute(k,String(v));
  }
  if(value!==null)node.textContent=String(value);
  return node;
};
function filenameTitle(file){
  const v=String(file.name||"").replace(/\.[^.]+$/,"").replace(/[_-]+/g," ").trim();
  return v.length>=3?v.slice(0,120):"Neuer Artikel";
}
function labelField(parent,label,field,kind,value,options){
  const box=el("label",{},label);
  box.className="km24d-field";
  let inp;
  if(kind==="select"){
    inp=el("select");
    options.forEach((o)=>{const option=el("option",{value:o[0]},o[1]);inp.appendChild(option)});
    inp.value=value??"";
  }else if(kind==="textarea"){
    inp=el("textarea");inp.rows=3;inp.value=value??"";
  }else{
    inp=el("input",{type:kind||"text"});inp.value=value??"";
  }
  inp.name=field;
  box.appendChild(inp);parent.appendChild(box);
  return inp;
}
export async function mountPhotoDraftPanel({root,supabaseClient}){
  if(!root || !supabaseClient)throw new Error("KaufMich24-Sitzung fehlt.");
  const api=new SecurePhotoDrafts(supabaseClient);
  const auth=await supabaseClient.auth.getUser();
  if(auth.error || !auth.data?.user?.id)throw new Error("Bitte erneut anmelden.");
  const current=auth.data.user;
  const profileResponse=await supabaseClient.from("profiles")
    .select("id,account_type,phone,street_address,postal_code,city,canton,address_confirmed_at")
    .eq("id",current.id).single();
  if(profileResponse.error || !profileResponse.data)
    throw new Error("Profil konnte nicht geladen werden. Bitte die Anmeldung prüfen.");
  const readiness=inspectBusinessUploadReadiness(current,profileResponse.data);
  const firmLocation={city:profileResponse.data.city||"",postal_code:profileResponse.data.postal_code||"",canton:profileResponse.data.canton||""};
  if(!readiness.ready){
    const container=el("section",{className:"km24d-account-warning"});
    container.style.cssText="max-width:700px;margin:36px auto;font-family:system-ui;padding:24px;border:1px solid #e1e6ee;border-radius:12px;color:#24334a";
    container.appendChild(el("h1",{},"📸 Foto-Massenimport: Konto vervollständigen"));
    container.appendChild(el("p",{},"Private Foto-Uploads sind erst nach der Bestätigung deiner Firmenangaben verfügbar."));
    const list=el("ul");
    for(const reason of readiness.missing)list.appendChild(el("li",{},reason));
    container.appendChild(list);
    const link=el("a",{href:"#/verification"},"Kontodaten ergänzen und bestätigen");
    link.style.cssText="display:inline-block;padding:12px 18px;background:#1556d4;color:white;border-radius:7px;text-decoration:none";
    container.appendChild(link);
    root.replaceChildren(container);
    return {blocked:true,reason:"account_contact_required"};
  }
  await api.owner();
  const style=el("style");style.textContent=[
    ".km24d{width:100%;max-width:780px;margin:0 auto;padding:12px 12px 150px;font-family:system-ui,Arial;color:#18304d}",
    ".km24d *{box-sizing:border-box}.km24d h1{font-size:28px;margin:0 0 10px}",
    ".km24d .km24d-panel{border:1px solid #d5e0f2;background:white;border-radius:16px;padding:16px;margin:14px 0}",
    ".km24d .km24d-flex{display:flex;flex-wrap:wrap;gap:10px;align-items:center}",
    ".km24d button{background:#1653e9;color:white;border:0;border-radius:8px;padding:10px;cursor:pointer}",
    ".km24d button:disabled{opacity:.55;cursor:default}",
    ".km24d input,.km24d select,.km24d textarea{font:inherit;border:1px solid #d4ddea;border-radius:7px;padding:8px;max-width:100%}",
    ".km24d .km24d-field{display:flex;flex-direction:column;gap:5px;min-width:145px;flex:1;font-size:13px}",
    ".km24d .km24d-field input,.km24d .km24d-field select,.km24d .km24d-field textarea{width:100%}",
    ".km24d .km24d-row{border:1px solid #dce4f0;border-radius:16px;padding:14px;margin:12px 0}.km24d .km24d-row h3{font-size:17px;margin:0 0 8px}",
    ".km24d .km24d-message{padding:12px;background:#eaf2ff;border-left:4px solid #2863ea;border-radius:7px}",
    ".km24d .km24d-photos{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}",
    ".km24d .km24d-photos img{width:90px;height:90px;object-fit:cover;border-radius:8px}",
    ".km24d .km24d-inputs{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}",
    ".km24d .km24d-pick{display:block;width:100%;min-height:54px;font-weight:800;font-size:18px;border-radius:12px}",
    ".km24d details>summary{cursor:pointer;font-weight:700;padding:12px 0}.km24d .km24d-row details{margin:7px 0 13px}",
    "html[data-km24-theme=dark] .km24d{color:#f1f5ff}html[data-km24-theme=dark] .km24d .km24d-panel,html[data-km24-theme=dark] .km24d .km24d-row{background:#101823;border-color:#35465c}html[data-km24-theme=dark] .km24d input,html[data-km24-theme=dark] .km24d select,html[data-km24-theme=dark] .km24d textarea{background:#1d293a;color:#f1f5ff;border-color:#4c5a6e}",
    "@media(max-width:650px){.km24d{padding:12px 10px 150px}.km24d .km24d-panel{padding:13px}.km24d .km24d-field{min-width:100%}.km24d .km24d-row{padding:12px}}"
  ].join("");
  const shell=el("section",{className:"km24d"});
  root.replaceChildren(style,shell);
  shell.appendChild(el("h1",{},"📸 Viele Artikel ganz einfach"));
  shell.appendChild(el("p",{},"Fotos auswählen, Titel und Preis ergänzen – fertig. Bis zu 100 Fotos ohne Excel."));
  shell.appendChild(el("div",{className:"km24d-message"},"Beta-Test: Alle Artikel bleiben privat. Nichts wird veröffentlicht."));
  const locationLabel=el("p",{},"📍 Standort für alle Artikel: "+([firmLocation.postal_code,firmLocation.city,firmLocation.canton].filter(Boolean).join(" ")||"aus Firmenprofil"));
  locationLabel.style.cssText="font-weight:700;font-size:14px;margin:8px 0";shell.appendChild(locationLabel);
  const imports=el("details",{className:"km24d-panel"});
  imports.appendChild(el("summary",{},"Bisherige Foto-Importe verwalten"));
  const importControls=el("div",{className:"km24d-flex"});
  const batchSelect=el("select",{"aria-label":"Foto-Import auswählen"});
  const batchName=el("input",{placeholder:"Name, z. B. Spielwaren November",maxLength:120});
  const createButton=el("button",{},"Neuen Import anlegen");
  importControls.append(batchSelect,batchName,createButton);imports.appendChild(importControls);
  const uploads=el("div",{className:"km24d-panel"});
  uploads.appendChild(el("h2",{},"1. Fotos auswählen"));
  uploads.appendChild(el("p",{},"Jedes Foto wird ein Artikel. Mehrere Fotos vom gleichen Artikel? Unten ankreuzen."));
  const uploadControls=el("div",{className:"km24d-flex"});
  const input=el("input",{type:"file",accept:"image/jpeg,image/png,image/webp"});input.multiple=true;input.hidden=true;
  const pickButton=el("button",{type:"button",className:"km24d-pick"},"📷 Fotos vom Handy auswählen");
  pickButton.addEventListener("click",()=>input.click());
  const sameLabel=el("label",{},"Gleiches Produkt (max. 10 Fotos)");
  const sameInput=el("input",{type:"checkbox"});sameLabel.prepend(sameInput);
  const uploadButton=el("button",{type:"button"},"Fotos privat hochladen");uploadButton.hidden=true;
  const resumeButton=el("button",{},"Unterbrochenen Upload fortsetzen");resumeButton.hidden=true;
  const pauseButton=el("button",{},"Nach aktuellem Foto pausieren");pauseButton.hidden=true;
  uploadControls.append(pickButton,input,sameLabel,uploadButton,resumeButton,pauseButton);
  uploads.appendChild(uploadControls);shell.appendChild(uploads);shell.appendChild(imports);
  const sharedPanel=el("details",{className:"km24d-panel"});
  sharedPanel.appendChild(el("summary",{},"Optionale Angaben für alle Artikel"));
  sharedPanel.appendChild(el("p",{},"Nur ausgefüllte Felder werden geändert. Titel, Beschreibung und Preise bleiben unverändert."));
  const sharedFields=el("div",{className:"km24d-inputs"});
  const sharedCategory=labelField(sharedFields,"Kategorie","category_slug","select","",[["","Nicht ändern"]]);
  const sharedCondition=labelField(sharedFields,"Zustand","condition","select","",[["","Nicht ändern"],["new","Neu"],["like_new","Wie neu"],["used","Gebraucht"],["defective","Defekt"]]);
  const sharedCity=labelField(sharedFields,"Ort (nur einmal ändern)","city","text",firmLocation.city);
  const sharedZip=labelField(sharedFields,"PLZ","postal_code","text",firmLocation.postal_code);
  const sharedCanton=labelField(sharedFields,"Kanton","canton","select",firmLocation.canton,[
    ["","Nicht ändern"],...["AG","AI","AR","BE","BL","BS","FR","GE","GL","GR","JU","LU","NE","NW","OW","SG","SH","SO","SZ","TG","TI","UR","VD","VS","ZG","ZH"].map((v)=>[v,v])
  ]);
  const applyShared=el("button",{type:"button"},"Angaben auf alle Entwürfe anwenden");
  sharedPanel.append(sharedFields,applyShared);shell.appendChild(sharedPanel);
  const itemsSection=el("div",{className:"km24d-panel"});itemsSection.appendChild(el("h2",{},"2. Artikel prüfen"));
  const itemsList=el("div");itemsSection.appendChild(itemsList);shell.appendChild(itemsSection);
  const message=el("div",{className:"km24d-message","role":"status"},"Bereit.");
  shell.insertBefore(message,itemsSection);
  let currentBatch="",busy=false,categories=[],pendingQueue=null,previewObserver=null;
  function notice(text){message.textContent=text}
  async function work(fn){
    if(busy)return;
    busy=true;[createButton,uploadButton,applyShared].forEach((b)=>b.disabled=true);
    try{await fn()}catch(e){notice("Fehler: "+String(e?.message||e))}
    finally{busy=false;[createButton,uploadButton,applyShared].forEach((b)=>b.disabled=false)}
  }
  const c=await supabaseClient.from("categories").select("slug,name_de,parent_slug").eq("is_active",true).limit(250);
  if(!c.error)categories=(c.data||[]).filter((v)=>v.slug).map((v)=>[v.slug,v.name_de]);
  categories.forEach(([slug,name])=>sharedCategory.appendChild(el("option",{value:slug},name)));
  applyShared.addEventListener("click",async()=>{
    if(!currentBatch){notice("Bitte zuerst einen Import anlegen.");return}
    if(!confirm("Gemeinsame Angaben wirklich auf alle Entwürfe dieses Imports übertragen?"))return;
    await work(async()=>{
      const values={category_slug:sharedCategory.value,condition:sharedCondition.value,
        city:sharedCity.value,postal_code:sharedZip.value,canton:sharedCanton.value};
      const outcome=await applySharedFields(api,currentBatch,values,(done,total)=>{
        notice("Gemeinsame Angaben: "+done+" von "+total+" Artikeln gespeichert.");
      });
      await refreshItems();
      notice("Gemeinsame Angaben bei "+outcome.updated+" Entwürfen gespeichert. Preise und Titel wurden nicht verändert.");
    });
  });
  async function refreshBatches(){
    const batches=(await api.listBatches()).filter((b)=>b.state==="draft");
    batchSelect.replaceChildren(el("option",{value:""},"Import wählen"));
    batches.forEach((b)=>batchSelect.appendChild(el("option",{value:b.id},b.title)));
    if(!batches.some((b)=>b.id===currentBatch))currentBatch=batches[0]?.id||"";
    batchSelect.value=currentBatch;
  }
  async function showImages(target,itemId){
    const photos=await api.listPhotos(currentBatch,itemId);
    target.replaceChildren();
    for(const photo of photos){
      const image=el("img",{alt:"Privates Artikelbild"});
      image.loading="lazy";image.src=await api.preview(photo.object_name);
      target.appendChild(image);
    }
    // Signed image previews do not interrupt upload progress messages.
  }
  async function refreshItems(){
    if(previewObserver){previewObserver.disconnect();previewObserver=null;}
    itemsList.replaceChildren();
    if(!currentBatch){itemsList.appendChild(el("p",{},"Noch keine Artikel. Oben Fotos auswählen – ein Import wird automatisch angelegt."));return}
    const items=await api.listItems(currentBatch);
    if(!items.length){itemsList.appendChild(el("p",{},"Noch keine Artikel hochgeladen."));return}
    const shownBatch=currentBatch;
    if(typeof IntersectionObserver!=="undefined"){
      previewObserver=new IntersectionObserver((entries,observer)=>{
        for(const entry of entries){
          if(!entry.isIntersecting)continue;
          observer.unobserve(entry.target);
          const target=entry.target.querySelector(".km24d-photos");
          const itemId=entry.target.dataset.itemId;
          if(currentBatch===shownBatch && target && itemId)void showImages(target,itemId).catch(()=>{});
        }
      },{rootMargin:"250px"});
    }
    for(const item of items){
      const row=el("article",{className:"km24d-row"});row.dataset.itemId=item.id;
      row.appendChild(el("h3",{},item.title||"Neuer Artikel"));
      const form=el("form");
      const fields=el("div",{className:"km24d-inputs"});
      const advanced=el("details");advanced.appendChild(el("summary",{},"Mehr Angaben (optional)"));
      const moreFields=el("div",{className:"km24d-inputs"});
      const refs={};
      refs.title=labelField(fields,"Titel","title","text",item.title);
      refs.price_chf=labelField(fields,"Preis (CHF)","price_chf","text",item.price_chf);
      refs.category_slug=labelField(moreFields,"Kategorie","category_slug","select",item.category_slug,[["","Bitte wählen"],...categories]);
      refs.description=labelField(moreFields,"Beschreibung","description","textarea",item.description);
      refs.condition=labelField(moreFields,"Zustand","condition","select",item.condition,[["new","Neu"],["like_new","Wie neu"],["used","Gebraucht"],["defective","Defekt"]]);
      advanced.appendChild(moreFields);form.append(fields,advanced);
      const save=el("button",{type:"submit"},"Entwurf speichern");save.hidden=true;form.appendChild(save);
      for(const [key,field] of Object.entries(refs))field.addEventListener("change",()=>work(async()=>{
        await api.updateItem(item.id,{[key]:field.value});
        notice("✓ Gespeichert – Artikel bleiben privat.");
      }));
      form.addEventListener("submit",(ev)=>{ev.preventDefault();work(async()=>{
        const details={};
        for(const [k,v] of Object.entries(refs))details[k]=v.value;
        await api.updateItem(item.id,details);
        notice("Artikel gespeichert. Noch nicht veröffentlicht.");
      })});
      const morePhotos=el("input",{type:"file",accept:"image/jpeg,image/png,image/webp"});morePhotos.multiple=true;
      const loadImages=el("button",{type:"button"},"Bilder anzeigen");loadImages.hidden=true;
      const photosTarget=el("div",{className:"km24d-photos"});
      loadImages.addEventListener("click",()=>work(()=>showImages(photosTarget,item.id)));
      morePhotos.addEventListener("change",()=>work(async()=>{
        const files=Array.from(morePhotos.files||[]);
        files.forEach(validateImage);
        const existing=await api.listPhotos(currentBatch,item.id);
        if(existing.length+files.length>MAX_PER_ITEM)throw new Error("Maximal zehn Fotos pro Artikel.");
        for(let i=0;i<files.length;i++)await api.upload(currentBatch,item.id,files[i],existing.length+i);
        morePhotos.value="";
        await showImages(photosTarget,item.id);
      }));
      const remove=el("button",{type:"button"},"Artikel entfernen");
      remove.addEventListener("click",()=>{
        if(!confirm("Diesen Entwurf und alle zugehörigen privaten Fotos löschen?"))return;
        work(async()=>{
          await api.deleteItem(currentBatch,item.id);
          await refreshItems();
          notice("Privater Entwurf und Fotos gelöscht.");
        });
      });
      const actions=el("div",{className:"km24d-flex"});actions.append(loadImages,morePhotos,remove);
      row.append(photosTarget,form,actions);itemsList.appendChild(row);
      // Load only visible thumbnails on long (up to 100 item) mobile lists.
      if(previewObserver)previewObserver.observe(row);
      else void showImages(photosTarget,item.id).catch(()=>{});
    }
  }
  createButton.addEventListener("click",()=>work(async()=>{
    if(pendingQueue)throw new Error("Bitte zuerst den laufenden Upload abschliessen.");
    const b=await api.createBatch(batchName.value.trim()||"Foto-Massenimport");
    currentBatch=b.id;await refreshBatches();await refreshItems();notice("Privater Import angelegt.");
  }));
  batchSelect.addEventListener("change",()=>work(async()=>{
    if(pendingQueue)throw new Error("Bitte zuerst den laufenden Upload abschliessen.");
    currentBatch=batchSelect.value;await refreshItems();
  }));
  function progress(p){notice("Privater Upload: "+p.done+" von "+p.total+" Fotos abgeschlossen. "+(p.state==="paused"?"Kann fortgesetzt werden.":""))}
  async function processQueue(){
    if(!pendingQueue)throw new Error("Kein unterbrochener Import vorhanden.");
    pauseButton.hidden=false;resumeButton.hidden=true;
    try{
      await pendingQueue.run(progress);
      if(pendingQueue.state==="completed"){
        const done=pendingQueue.snapshot();
        pendingQueue=null;
        await refreshItems();
        notice(done.done+" Fotos als private Entwürfe gespeichert. Nichts veröffentlicht.");
      }else if(pendingQueue.state==="paused"){
        resumeButton.hidden=false;await refreshItems();
      }
    }finally{
      pauseButton.hidden=true;
      if(pendingQueue?.state==="paused")resumeButton.hidden=false;
    }
  }
  uploadButton.addEventListener("click",()=>work(async()=>{
    if(pendingQueue)throw new Error("Zuerst den vorherigen Upload abschliessen oder die Seite neu laden.");
    const files=Array.from(input.files||[]);
    const groups=groupPhotos(files,sameInput.checked);
    if(!currentBatch){
      const created=await api.createBatch("Foto-Import "+new Date().toLocaleDateString("de-CH"));
      currentBatch=created.id;await refreshBatches();
    }
    const [items,photos]=await Promise.all([api.listItems(currentBatch),api.listBatchPhotos(currentBatch)]);
    if(items.length+groups.length>100)throw new Error("Maximal 100 Artikel pro Import.");
    if(photos.length+files.length>MAX_PHOTOS)throw new Error("Maximal 100 Fotos pro Import.");
    pendingQueue=new PhotoUploadQueue({api,batchId:currentBatch,files,sameProduct:sameInput.checked,location:firmLocation});
    input.value=""; // Keep files in pendingQueue during an interrupted upload.
    await processQueue();
  }));
  input.addEventListener("change",()=>{if(input.files?.length)uploadButton.click()});
  resumeButton.addEventListener("click",()=>work(processQueue));
  pauseButton.addEventListener("click",()=>{
    if(pendingQueue)pendingQueue.requestPause();
  });
  await refreshBatches();await refreshItems();
  return {api,refresh:async()=>{await refreshBatches();await refreshItems()}};
}
