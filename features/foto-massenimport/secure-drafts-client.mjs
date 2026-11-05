// Private photo import drafts. Safe for use ONLY after review-only migration is applied.
// No writes to public.listings; no publishing workflow.
export const BUCKET = "km24-bulk-draft-photos";
export const MAX_PHOTOS = 100, MAX_PER_ITEM = 10, MAX_BYTES = 10485760;
const TYPES = Object.freeze({"image/jpeg":"jpg","image/png":"png","image/webp":"webp"});
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function id(value) {
  if(typeof value !== "string" || !UUID.test(value)) throw new Error("Ungültige ID");
  return value.toLowerCase();
}
function result(x) {
  if(x && x.error) throw new Error(String(x.error.message || "Speichern fehlgeschlagen"));
  return x && x.data;
}
export function validateImage(file) {
  if(!file || typeof file.size !== "number" || !Object.prototype.hasOwnProperty.call(TYPES,file.type))
    throw new Error("Nur JPG, PNG und WebP erlaubt. HEIC bitte zuerst umwandeln.");
  if(!Number.isSafeInteger(file.size) || file.size < 1 || file.size > MAX_BYTES)
    throw new Error("Foto muss maximal 10 MB gross sein.");
  return TYPES[file.type];
}
export function cleanDraft(input,partial=false) {
  if(!input || typeof input!=="object" || Array.isArray(input)) throw new Error("Ungültiger Artikel");
  const out={};
  for(const [key,max] of [["title",120],["description",5000],["city",150],["postal_code",20],["canton",2]]) {
    if(!partial || Object.prototype.hasOwnProperty.call(input,key)){
      const v=String(input[key]??"").trim();
      if(v.length>max) throw new Error("Feld zu lang: "+key);
      out[key]=v;
    }
  }
  if(!partial || Object.prototype.hasOwnProperty.call(input,"condition")){
    const c=String(input.condition||"new");
    if(!["new","like_new","used","defective"].includes(c)) throw new Error("Ungültiger Zustand");
    out.condition=c;
  }
  if(!partial || Object.prototype.hasOwnProperty.call(input,"category_slug")) {
    const c=input.category_slug ? String(input.category_slug) : null;
    if(c && !/^[a-z0-9_]{2,80}$/.test(c)) throw new Error("Ungültige Kategorie");
    out.category_slug=c;
  }
  if(!partial || Object.prototype.hasOwnProperty.call(input,"price_chf")){
    const p=input.price_chf==null?"":String(input.price_chf).trim().replace(",",".");
    if(p==="")out.price_chf=null;
    else {
      if(!/^\d{1,10}(\.\d{1,2})?$/.test(p)) throw new Error("Ungültiger Preis");
      out.price_chf=Number(p);
    }
  }
  return out;
}
export class SecurePhotoDrafts {
  constructor(client,uuidFactory) {
    if(typeof client?.from!=="function" || typeof client?.auth?.getUser!=="function"
       || typeof client?.storage?.from!=="function") throw new Error("Supabase-Client fehlt");
    this.db=client;
    this.uuid=uuidFactory||(()=>globalThis.crypto.randomUUID());
  }
  async owner() {
    const auth=await this.db.auth.getUser();
    if(auth.error || !auth.data?.user?.id) throw new Error("Bitte zuerst anmelden.");
    const uid=id(auth.data.user.id);
    const profile=result(await this.db.from("profiles").select("account_type").eq("id",uid).single());
    if(!["business","dealer"].includes(profile?.account_type))
      throw new Error("Nur Firmen- und Händlerkonten sind zugelassen.");
    // Server RLS additionally requires active account and confirmed marketplace contact.
    return uid;
  }
  async createBatch(title="Foto-Massenimport") {
    const uid=await this.owner(),v=String(title).trim();
    if(v.length<1||v.length>120)throw new Error("Ungültiger Importname");
    return result(await this.db.from("km24_bulk_draft_batches")
      .insert({owner_id:uid,title:v}).select("id,owner_id,title,state").single());
  }
  async listBatches() {
    const uid=await this.owner();
    return result(await this.db.from("km24_bulk_draft_batches")
      .select("id,title,state,created_at").eq("owner_id",uid)
      .order("created_at",{ascending:false}).limit(25))||[];
  }
  async createItem(batchId,details) {
    const uid=await this.owner(),v=cleanDraft(details);
    return result(await this.db.from("km24_bulk_draft_items")
      .insert({...v,owner_id:uid,batch_id:id(batchId)})
      .select("id,batch_id,owner_id,title").single());
  }
  async updateItem(itemId,details) {
    const uid=await this.owner(),v=cleanDraft(details,true);
    if(Object.keys(v).length===0) throw new Error("Keine Änderungen");
    return result(await this.db.from("km24_bulk_draft_items")
      .update(v).eq("id",id(itemId)).eq("owner_id",uid)
      .select("id,title,description,price_chf,category_slug,condition,city,postal_code,canton").single());
  }
  async listItems(batchId) {
    const uid=await this.owner();
    return result(await this.db.from("km24_bulk_draft_items")
      .select("id,batch_id,title,description,price_chf,category_slug,condition,city,postal_code,canton")
      .eq("owner_id",uid).eq("batch_id",id(batchId)).order("created_at",{ascending:true}).limit(100))||[];
  }
  async listPhotos(batchId,itemId) {
    const uid=await this.owner();
    return result(await this.db.from("km24_bulk_draft_photos")
      .select("id,object_name,mime_type,size_bytes,sort_order")
      .eq("owner_id",uid).eq("batch_id",id(batchId)).eq("item_id",id(itemId))
      .order("sort_order",{ascending:true}).limit(10))||[];
  }
  async upload(batchId,itemId,file,order=0) {
    const uid=await this.owner(),b=id(batchId),i=id(itemId);
    const ext=validateImage(file);
    if(!Number.isInteger(order)||order<0||order>=MAX_PER_ITEM)throw new Error("Maximal 10 Bilder pro Artikel");
    const path=uid+"/"+b+"/"+i+"/"+id(this.uuid())+"."+ext;
    // The reservation is protected by ownership RLS and quota triggers.
    const metadata=result(await this.db.from("km24_bulk_draft_photos")
      .insert({owner_id:uid,batch_id:b,item_id:i,object_name:path,mime_type:file.type,
        size_bytes:file.size,sort_order:order})
      .select("id,object_name").single());
    const uploaded=await this.db.storage.from(BUCKET).upload(path,file,{
      upsert:false,contentType:file.type,cacheControl:"0"
    });
    if(uploaded.error){
      const cleanup=await this.db.from("km24_bulk_draft_photos").delete().eq("id",metadata.id).eq("owner_id",uid);
      if(cleanup.error)throw new Error("Upload fehlgeschlagen und Reservierung nicht bereinigt: "+cleanup.error.message);
      throw new Error("Foto-Upload fehlgeschlagen: "+uploaded.error.message);
    }
    return metadata;
  }
  async preview(objectName) {
    const uid=await this.owner();
    if(typeof objectName!=="string" || !objectName.startsWith(uid+"/") || objectName.split("/").length!==4)
      throw new Error("Foto gehört nicht zu diesem Konto");
    const signed=await this.db.storage.from(BUCKET).createSignedUrl(objectName,300);
    return result(signed).signedUrl;
  }
  async deletePhoto(photoId) {
    const uid=await this.owner(),photo=result(await this.db.from("km24_bulk_draft_photos")
      .select("id,object_name").eq("id",id(photoId)).eq("owner_id",uid).single());
    result(await this.db.storage.from(BUCKET).remove([photo.object_name]));
    result(await this.db.from("km24_bulk_draft_photos").delete()
      .eq("id",photo.id).eq("owner_id",uid));
    return true;
  }
  async deleteItem(batchId,itemId) {
    const uid=await this.owner(),batch=id(batchId),item=id(itemId);
    // Delete the private Storage objects before removing their RLS-owning metadata.
    // Any failure stops the operation so a retry can resume cleanup.
    const photos=await this.listPhotos(batch,item);
    for(const photo of photos)await this.deletePhoto(photo.id);
    result(await this.db.from("km24_bulk_draft_items").delete()
      .eq("id",item).eq("batch_id",batch).eq("owner_id",uid));
    return true;
  }
  async deleteBatch(batchId) {
    const uid=await this.owner(),batch=id(batchId);
    const items=await this.listItems(batch);
    for(const item of items)await this.deleteItem(batch,item.id);
    result(await this.db.from("km24_bulk_draft_batches").delete()
      .eq("id",batch).eq("owner_id",uid));
    return true;
  }
  async archiveBatch(batchId) {
    const uid=await this.owner();
    return result(await this.db.from("km24_bulk_draft_batches")
      .update({state:"archived"}).eq("owner_id",uid).eq("id",id(batchId)).eq("state","draft")
      .select("id,state").single());
  }
  // Publishing intentionally forbidden until separate rollout approval.
}
