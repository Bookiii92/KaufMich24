// Manual and irreversible cleanup of OWN inactive photo-import test listings.
// Must never run automatically; caller must obtain explicit confirmation.
// Uses authenticated owner RLS + strict listing and Storage path validation.
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function id(v){if(typeof v!=="string"||!UUID.test(v))throw Error("Ungültige ID.");return v.toLowerCase()}
function checked(result,action){if(!result || result.error)throw Error(action+": "+String(result?.error?.message||"Keine Antwort"));return result.data}
function ownedPath(uid,item,path){
  if(typeof path!=="string" || !path.startsWith(uid+"/"+item+"/"))throw Error("Bild liegt ausserhalb dieses Artikels.");
  const file=path.slice((uid+"/"+item+"/").length);
  if(!/^[0-9a-f-]{36}\.(jpg|png|webp)$/i.test(file))throw Error("Ungültiger Bildpfad.");
  return path;
}
async function plan(api,batchId){
  const uid=id(await api.owner()),batch=id(batchId);
  const draftItems=await api.listItems(batch);
  if(!Array.isArray(draftItems)||draftItems.length>100)throw Error("Ungültiger Import.");
  const ids=draftItems.map(row=>id(row.id));
  if(new Set(ids).size!==ids.length)throw Error("Artikel mehrfach vorhanden.");
  if(!ids.length)return {uid,batch,items:[]};
  const listings=checked(await api.db.from("listings").select("id,seller_id,status,extra_fields")
    .eq("seller_id",uid).in("id",ids),"Inserate prüfen")||[];
  const byId=new Map(listings.map(x=>[x.id,x]));
  const targets=[];
  for(const item of draftItems){
    const l=byId.get(item.id);
    if(!l)continue;
    if(l.seller_id!==uid || l.status!=="inactive" || l.extra_fields?.km24_photo_import!==true)continue;
    targets.push({id:item.id,title:item.title||"Artikel"});
  }
  return {uid,batch,items:targets};
}
export async function planInactiveBulkCleanup(api,batchId){return plan(api,batchId)}
export async function cleanupInactiveBulkBatch(api,batchId,onProgress=()=>{}){
  const first=await plan(api,batchId);
  if(!first.items.length)return {cleaned:0,total:0};
  let cleaned=0;
  for(const item of first.items){
    // Revalidate status and ownership just before mutating anything.
    const check=checked(await api.db.from("listings").select("id,seller_id,status,extra_fields")
      .eq("id",item.id).eq("seller_id",first.uid).single(),"Testinserat überprüfen");
    if(check?.id!==item.id || check?.seller_id!==first.uid ||
       check?.status!=="inactive" || check?.extra_fields?.km24_photo_import!==true)
      throw Error("Inserat nicht mehr inaktiv oder nicht als Foto-Test markiert.");
    const linked=checked(await api.db.from("listing_images").select("id,storage_path")
      .eq("listing_id",item.id),"Öffentliche Bilder laden")||[];
    if(linked.length>10)throw Error("Zu viele Bilder; keine automatische Löschung.");
    const paths=linked.map(image=>ownedPath(first.uid,item.id,image.storage_path));
    // Prevent public reappearance before removing public Storage objects.
    checked(await api.db.from("listings").update({status:"deleted"})
      .eq("id",item.id).eq("seller_id",first.uid).eq("status","inactive")
      .select("id,status").single(),"Inserat ausblenden");
    if(paths.length){
      checked(await api.db.storage.from("listing-images").remove(paths),"Öffentliche Bilder löschen");
      checked(await api.db.from("listing_images").delete()
        .eq("listing_id",item.id).in("id",linked.map(x=>x.id)),"Bildzuordnungen entfernen");
    }
    // Only once the public copies are gone do we remove private draft photos.
    await api.deleteItem(first.batch,item.id);
    cleaned++;
    onProgress({cleaned,total:first.items.length,title:item.title});
  }
  return {cleaned,total:first.items.length};
}
