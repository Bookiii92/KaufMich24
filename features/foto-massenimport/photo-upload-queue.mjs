// Resumable, sequential, client-side orchestration. Never publishes listings.
// Only used with a private, RLS-protected SecurePhotoDrafts instance.
import {validateImage,MAX_PHOTOS,MAX_PER_ITEM} from "./secure-drafts-client.mjs";

function defaultUUID(){
  if(typeof globalThis.crypto?.randomUUID!=="function")throw new Error("Sichere Browser-ID fehlt.");
  return globalThis.crypto.randomUUID();
}
export function groupPhotos(files,sameProduct=false) {
  const selected=Array.from(files||[]);
  if(!selected.length)throw new Error("Bitte zuerst Fotos auswählen.");
  if(selected.length>MAX_PHOTOS)throw new Error("Maximal 100 Fotos je Import.");
  selected.forEach(validateImage);
  if(sameProduct && selected.length>MAX_PER_ITEM)
    throw new Error("Maximal 10 Fotos pro Artikel.");
  // Warn rather than silently discard images with the same filename.
  const dup=new Set();
  for(const f of selected){
    if(typeof f.lastModified!=="number")continue;
    const signature=[f.name,f.size,f.lastModified].join("|");
    if(dup.has(signature))throw new Error("Dasselbe Foto wurde mehrfach ausgewählt: "+String(f.name));
    dup.add(signature);
  }
  return sameProduct?[selected]:selected.map((file)=>[file]);
}
export function productName(file){
  const base=String(file?.name||"").replace(/\.[^.]+$/,"").replace(/[_-]+/g," ").trim();
  return base.length>=3?base.slice(0,120):"Neuer Artikel";
}
export class PhotoUploadQueue {
  constructor({api,batchId,files,sameProduct=false,newUUID=defaultUUID}) {
    if(!api || typeof api.ensureItem!=="function" || typeof api.upload!=="function")
      throw new Error("Private Upload-Funktionen fehlen.");
    if(typeof batchId!=="string" || !batchId)throw new Error("Import-ID fehlt.");
    const groups=groupPhotos(files,sameProduct);
    this.api=api;this.batchId=batchId;this.busy=false;this.pauseRequested=false;
    this.groups=groups.map((photos)=>({
      id:newUUID(),photos,done:0,created:false,title:productName(photos[0])
    }));
    this.state="ready";this.failure=null;
  }
  snapshot(){
    const total=this.groups.reduce((n,g)=>n+g.photos.length,0);
    const done=this.groups.reduce((n,g)=>n+g.done,0);
    return {state:this.state,total,done,remaining:total-done,groups:this.groups.length,
      failure:this.failure?String(this.failure.message||this.failure):null};
  }
  requestPause(){this.pauseRequested=true}
  async run(onProgress=()=>{}){
    if(this.busy)throw new Error("Ein Import läuft bereits.");
    if(this.state==="blocked")throw new Error("Der Uploadstatus ist unklar. Bitte zuerst die Bildreservierung prüfen.");
    if(this.state==="completed")return this.snapshot();
    this.busy=true;this.pauseRequested=false;this.state="running";this.failure=null;
    try{
      for(const g of this.groups){
        if(this.pauseRequested){this.state="paused";return this.snapshot()}
        if(!g.created){
          // Stable UUID prevents duplicate products when a database response is lost.
          await this.api.ensureItem(this.batchId,g.id,{
            title:g.title,description:"",price_chf:null,category_slug:null,
            condition:"new",city:"",postal_code:"",canton:""
          });
          g.created=true;
        }
        while(g.done<g.photos.length){
          if(this.pauseRequested){this.state="paused";return this.snapshot()}
          await this.api.upload(this.batchId,g.id,g.photos[g.done],g.done);
          g.done++;
          onProgress(this.snapshot());
        }
      }
      this.state="completed";
      onProgress(this.snapshot());
      return this.snapshot();
    }catch(err){
      this.failure=err;
      // If cleanup failed, retry could create an orphan; prevent automatic resumption.
      this.state=/Bitte nicht erneut hochladen|Reservierung muss bereinigt|Uploadstatus ist unklar/.test(String(err?.message||err))?"blocked":"paused";
      onProgress(this.snapshot());
      throw err;
    }finally{this.busy=false}
  }
}
