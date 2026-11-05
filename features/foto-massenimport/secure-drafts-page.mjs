// UI integration for KaufMich24 authenticated sessions; never publishes listings.
// Call mountPhotoDraftPanel({root, supabaseClient}) from a verified firm session.
import {SecurePhotoDrafts,validateImage,MAX_PHOTOS,MAX_PER_ITEM} from "./secure-drafts-client.mjs";

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
  await api.owner();
  const style=el("style");style.textContent=[
    ".km24d{max-width:1100px;margin:20px auto;font-family:system-ui,Arial;color:#18304d}",
    ".km24d *{box-sizing:border-box}.km24d h1{font-size:28px;margin:0 0 10px}",
    ".km24d .km24d-panel{border:1px solid #d5e0f2;background:white;border-radius:12px;padding:16px;margin:14px 0}",
    ".km24d .km24d-flex{display:flex;flex-wrap:wrap;gap:10px;align-items:center}",
    ".km24d button{background:#1653e9;color:white;border:0;border-radius:8px;padding:10px;cursor:pointer}",
    ".km24d button:disabled{opacity:.55;cursor:default}",
    ".km24d input,.km24d select,.km24d textarea{font:inherit;border:1px solid #d4ddea;border-radius:7px;padding:8px;max-width:100%}",
    ".km24d .km24d-field{display:flex;flex-direction:column;gap:5px;min-width:145px;flex:1;font-size:13px}",
    ".km24d .km24d-field input,.km24d .km24d-field select,.km24d .km24d-field textarea{width:100%}",
    ".km24d .km24d-row{border:1px solid #dce4f0;border-radius:10px;padding:12px;margin:12px 0}",
    ".km24d .km24d-message{padding:12px;background:#eaf2ff;border-left:4px solid #2863ea;border-radius:7px}",
    ".km24d .km24d-photos{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}",
    ".km24d .km24d-photos img{width:90px;height:90px;object-fit:cover;border-radius:8px}",
    ".km24d .km24d-inputs{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}",
    "@media(max-width:650px){.km24d{margin:5px}.km24d .km24d-panel{padding:12px}.km24d .km24d-field{min-width:100%}}"
  ].join("");
  const shell=el("section",{className:"km24d"});
  root.replaceChildren(style,shell);
  shell.appendChild(el("h1",{},"📸 Foto-Massenimport für Firmen"));
  shell.appendChild(el("p",{},"Private Entwürfe mit bis zu 100 Fotos. Keine Excel-Tabelle nötig."));
  shell.appendChild(el("div",{className:"km24d-message"},"Testversion: KI-Erkennung und Veröffentlichung sind deaktiviert."));
  const imports=el("div",{className:"km24d-panel"});
  imports.appendChild(el("h2",{},"1. Import anlegen"));
  const importControls=el("div",{className:"km24d-flex"});
  const batchSelect=el("select",{"aria-label":"Foto-Import auswählen"});
  const batchName=el("input",{placeholder:"Name, z. B. Spielwaren November",maxLength:120});
  const createButton=el("button",{},"Neuen Import anlegen");
  importControls.append(batchSelect,batchName,createButton);imports.appendChild(importControls);shell.appendChild(imports);
  const uploads=el("div",{className:"km24d-panel"});
  uploads.appendChild(el("h2",{},"2. Produktfotos hochladen"));
  uploads.appendChild(el("p",{},"JPG, PNG oder WebP (10 MB pro Foto)."));
  const uploadControls=el("div",{className:"km24d-flex"});
  const input=el("input",{type:"file",accept:"image/jpeg,image/png,image/webp"});input.multiple=true;
  const sameLabel=el("label",{},"Gleiches Produkt (max. 10 Fotos)");
  const sameInput=el("input",{type:"checkbox"});sameLabel.prepend(sameInput);
  const uploadButton=el("button",{},"Fotos privat hochladen");
  uploadControls.append(input,sameLabel,uploadButton);uploads.appendChild(uploadControls);shell.appendChild(uploads);
  const itemsSection=el("div",{className:"km24d-panel"});itemsSection.appendChild(el("h2",{},"3. Entwürfe bearbeiten"));
  const itemsList=el("div");itemsSection.appendChild(itemsList);shell.appendChild(itemsSection);
  const message=el("div",{className:"km24d-message","role":"status"},"Bereit.");
  shell.appendChild(message);
  let currentBatch="",busy=false,categories=[];
  function notice(text){message.textContent=text}
  async function work(fn){
    if(busy)return;
    busy=true;[createButton,uploadButton].forEach((b)=>b.disabled=true);
    try{await fn()}catch(e){notice("Fehler: "+String(e?.message||e))}
    finally{busy=false;[createButton,uploadButton].forEach((b)=>b.disabled=false)}
  }
  const c=await supabaseClient.from("categories").select("slug,name_de,parent_slug").eq("is_active",true).limit(250);
  if(!c.error)categories=(c.data||[]).filter((v)=>v.slug).map((v)=>[v.slug,v.name_de]);
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
    notice(photos.length+" private Bilder geladen.");
  }
  async function refreshItems(){
    itemsList.replaceChildren();
    if(!currentBatch){itemsList.appendChild(el("p",{},"Bitte zuerst einen Import anlegen."));return}
    const items=await api.listItems(currentBatch);
    if(!items.length){itemsList.appendChild(el("p",{},"Noch keine Artikel hochgeladen."));return}
    for(const item of items){
      const row=el("article",{className:"km24d-row"});
      row.appendChild(el("h3",{},item.title||"Neuer Artikel"));
      const form=el("form");
      const fields=el("div",{className:"km24d-inputs"});
      const refs={};
      refs.title=labelField(fields,"Titel","title","text",item.title);
      refs.price_chf=labelField(fields,"Preis (CHF)","price_chf","text",item.price_chf);
      refs.category_slug=labelField(fields,"Kategorie","category_slug","select",item.category_slug,[["","Bitte wählen"],...categories]);
      refs.description=labelField(fields,"Beschreibung","description","textarea",item.description);
      refs.condition=labelField(fields,"Zustand","condition","select",item.condition,[["new","Neu"],["like_new","Wie neu"],["used","Gebraucht"],["defective","Defekt"]]);
      refs.city=labelField(fields,"Ort","city","text",item.city);
      refs.postal_code=labelField(fields,"PLZ","postal_code","text",item.postal_code);
      refs.canton=labelField(fields,"Kanton","canton","text",item.canton);
      form.appendChild(fields);
      const save=el("button",{type:"submit"},"Entwurf speichern");form.appendChild(save);
      form.addEventListener("submit",(ev)=>{ev.preventDefault();work(async()=>{
        const details={};
        for(const [k,v] of Object.entries(refs))details[k]=v.value;
        await api.updateItem(item.id,details);
        notice("Artikel gespeichert. Noch nicht veröffentlicht.");
      })});
      const morePhotos=el("input",{type:"file",accept:"image/jpeg,image/png,image/webp"});morePhotos.multiple=true;
      const loadImages=el("button",{type:"button"},"Bilder anzeigen");
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
      const actions=el("div",{className:"km24d-flex"});actions.append(loadImages,morePhotos);
      row.append(form,actions,photosTarget);itemsList.appendChild(row);
    }
  }
  createButton.addEventListener("click",()=>work(async()=>{
    const b=await api.createBatch(batchName.value.trim()||"Foto-Massenimport");
    currentBatch=b.id;await refreshBatches();await refreshItems();notice("Privater Import angelegt.");
  }));
  batchSelect.addEventListener("change",()=>work(async()=>{
    currentBatch=batchSelect.value;await refreshItems();
  }));
  uploadButton.addEventListener("click",()=>work(async()=>{
    if(!currentBatch)throw new Error("Zuerst einen Import anlegen.");
    const files=Array.from(input.files||[]);if(!files.length)throw new Error("Bitte Fotos wählen.");
    if(files.length>MAX_PHOTOS)throw new Error("Maximal 100 Fotos pro Auswahl.");
    files.forEach(validateImage);
    if(sameInput.checked && files.length>MAX_PER_ITEM)throw new Error("Maximal 10 Fotos desselben Produkts auf einmal.");
    const groups=sameInput.checked?[files]:files.map((f)=>[f]);
    let done=0;
    for(const group of groups){
      const item=await api.createItem(currentBatch,{
        title:filenameTitle(group[0]),description:"",price_chf:null,category_slug:null,
        condition:"new",city:"",postal_code:"",canton:""
      });
      for(let i=0;i<group.length;i++){
        notice("Foto "+(done+1)+" von "+files.length+" wird privat gespeichert.");
        await api.upload(currentBatch,item.id,group[i],i);done++;
      }
    }
    input.value="";await refreshItems();
    notice(groups.length+" Entwürfe mit "+done+" Bildern privat gespeichert. Nicht veröffentlicht.");
  }));
  await refreshBatches();await refreshItems();
  return {api,refresh:async()=>{await refreshBatches();await refreshItems()}};
}
