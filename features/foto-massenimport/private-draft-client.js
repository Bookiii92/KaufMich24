(function(root){
"use strict";
const T={b:"km24_bulk_draft_batches",i:"km24_bulk_draft_items",p:"km24_bulk_draft_photos"}, BUCKET="km24-bulk-draft-photos";
const UUID=/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const EXT={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
function id(v,label){if(typeof v!=="string"||!UUID.test(v))throw Error("Ungültige ID: "+label);return v}
function result(r,label){if(!r||r.error||r.data==null)throw Error(label+": "+String(r?.error?.message||"Keine Daten"));return r.data}
function fields(p={}){
const out={},sizes={title:120,description:5000,city:150,postal_code:20,canton:2};
for(const k of Object.keys(sizes))if(Object.prototype.hasOwnProperty.call(p,k)){
const v=String(p[k]??"").trim();if(v.length>sizes[k])throw Error(k+": Eingabe zu lang");out[k]=v}
if(Object.prototype.hasOwnProperty.call(p,"price_chf")){
const raw=p.price_chf;if(raw===null||raw==="")out.price_chf=null;else{
const n=Number(String(raw).replace(",","."));if(!Number.isFinite(n)||n<0||n>9999999999.99)throw Error("Ungültiger Preis");out.price_chf=Math.round(n*100)/100}}
if(Object.prototype.hasOwnProperty.call(p,"sort_order")){
const n=Number(p.sort_order);if(!Number.isInteger(n)||n<0||n>99)throw Error("Ungültige Reihenfolge");out.sort_order=n}
if(Object.prototype.hasOwnProperty.call(p,"category_slug")){
const v=p.category_slug;if(v!==null&&v!==""&&(!/^[a-z0-9_]{1,80}$/.test(String(v))))throw Error("Ungültige Kategorie");out.category_slug=v||null}
if(Object.prototype.hasOwnProperty.call(p,"condition")){
if(!["new","like_new","used","defective"].includes(p.condition))throw Error("Ungültiger Zustand");out.condition=p.condition}
return out
}
function create(db){
if(!db?.auth?.getUser||!db?.storage?.from||!db?.from)throw Error("Angemeldeter Supabase-Client fehlt");
async function actor(){const r=await db.auth.getUser();if(r.error||!r.data?.user?.id)throw Error("Bitte bei KaufMich24 anmelden");return id(r.data.user.id,"Benutzer")}
async function createBatch(title="Foto-Massenimport"){
await actor();const t=String(title||"Foto-Massenimport").trim().slice(0,120);return result(await db.from(T.b).insert({title:t,state:"draft"}).select("id,title,state").single(),"Import erstellen")}
async function listBatches(){await actor();return result(await db.from(T.b).select("id,title,state,created_at").order("created_at",{ascending:false}).limit(30),"Importe laden")}
async function addItem(batchId,input){await actor();id(batchId,"Import");return result(await db.from(T.i).insert({...fields(input),batch_id:batchId}).select("*").single(),"Artikel anlegen")}
async function updateItem(batchId,itemId,input){await actor();id(batchId,"Import");id(itemId,"Artikel");const v=fields(input);if(!Object.keys(v).length)throw Error("Keine Änderungen");return result(await db.from(T.i).update(v).eq("batch_id",batchId).eq("id",itemId).select("*").single(),"Artikel speichern")}
async function listItems(batchId){await actor();id(batchId,"Import");return result(await db.from(T.i).select("*").eq("batch_id",batchId).order("sort_order",{ascending:true}),"Artikel laden")}
async function listPhotos(itemId){await actor();id(itemId,"Artikel");return result(await db.from(T.p).select("id,item_id,object_name,mime_type,size_bytes,sort_order").eq("item_id",itemId).order("sort_order",{ascending:true}),"Fotos laden")}
async function uploadPhoto(batchId,itemId,file,sort=0){
const uid=await actor();id(batchId,"Import");id(itemId,"Artikel");
if(!file||!EXT[file.type]||!Number.isFinite(file.size)||file.size<1||file.size>10485760)throw Error("Nur JPG, PNG und WebP bis 10 MB");
if(!Number.isInteger(sort)||sort<0||sort>9)throw Error("Maximal zehn Fotos pro Artikel");
if(typeof root.crypto?.randomUUID!=="function")throw Error("Sichere Browser-ID fehlt");
const object_name=uid+"/"+batchId+"/"+itemId+"/"+root.crypto.randomUUID()+"."+EXT[file.type];
const meta=result(await db.from(T.p).insert({batch_id:batchId,item_id:itemId,object_name,mime_type:file.type,size_bytes:file.size,sort_order:sort}).select("id,object_name,sort_order").single(),"Fotoplatz reservieren");
try{const r=await db.storage.from(BUCKET).upload(object_name,file,{contentType:file.type,upsert:false,cacheControl:"0"});
if(r.error)throw Error(String(r.error.message||r.error))}catch(e){
const c=await db.from(T.p).delete().eq("id",meta.id);
if(c.error)throw Error("Bild-Upload fehlgeschlagen; Fotoplatz muss bereinigt werden: "+String(e.message||e));
throw Error("Bild-Upload fehlgeschlagen: "+String(e.message||e))}
return meta
}
async function signedUrl(objectName,expiry=120){
const uid=await actor();if(typeof objectName!=="string"||!objectName.startsWith(uid+"/"))throw Error("Unzulässiger Bildpfad");
if(!Number.isInteger(expiry)||expiry<30||expiry>600)throw Error("Ungültige Linkdauer");
const r=result(await db.storage.from(BUCKET).createSignedUrl(objectName,expiry),"Bildlink erzeugen");return r.signedUrl
}
async function removePhoto(photoId){
await actor();id(photoId,"Foto");
const p=result(await db.from(T.p).select("id,object_name").eq("id",photoId).single(),"Foto finden");
const r=await db.storage.from(BUCKET).remove([p.object_name]);if(r.error)throw Error("Bild konnte nicht gelöscht werden: "+r.error.message);
return result(await db.from(T.p).delete().eq("id",photoId).select("id").single(),"Fotoplatz entfernen")
}
return Object.freeze({createBatch,listBatches,addItem,updateItem,listItems,listPhotos,uploadPhoto,signedUrl,removePhoto})
}
const API=Object.freeze({create,fields,BUCKET});if(typeof module!=="undefined"&&module.exports)module.exports=API;else root.Km24BulkDrafts=API;
})(typeof globalThis!=="undefined"?globalThis:this);