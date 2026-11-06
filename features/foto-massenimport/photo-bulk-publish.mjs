// Explicit, sequential publishing of reviewed photo drafts; no AI decisions.
// Uses the normal authenticated listing INSERT path via a SECURITY INVOKER RPC.
// No service-role key, no rate-limit bypass and no automatic posting on upload.
const PUBLIC_BUCKET="listing-images",PRIVATE_BUCKET="km24-bulk-draft-photos";
function uuid(v){
  if(typeof v!=="string"||!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v))
    throw Error("Ungültiger Artikel.");
  return v.toLowerCase();
}
function unwrap(res,label){
  if(!res||res.error)throw Error(label+": "+String(res?.error?.message||"Keine Antwort"));
  return res.data;
}
function check(item,photos){
  const missing=[];
  if(String(item?.title||"").trim().length<3)missing.push("Titel");
  if(item?.price_chf==null||!Number.isFinite(Number(item.price_chf))||Number(item.price_chf)<0)missing.push("Preis");
  if(!item?.category_slug)missing.push("Kategorie");
  if(!Array.isArray(photos)||photos.length===0)missing.push("Foto");
  return missing;
}
export function listingCopyPath(userId,itemId,objectName){
  const uid=uuid(userId),item=uuid(itemId);
  const match=String(objectName||"").match(/^([0-9a-f-]{36})\/([0-9a-f-]{36})\/([0-9a-f-]{36})\/([0-9a-f-]{36}\.(?:jpg|png|webp))$/i);
  if(!match||match[1].toLowerCase()!==uid||match[3].toLowerCase()!==item)
    throw Error("Foto ist diesem Artikel nicht zugeordnet.");
  return uid+"/"+item+"/"+match[4].toLowerCase();
}
export async function buildPublishPlan(api,batchId) {
  const uid=await api.owner(),batch=uuid(batchId);
  const items=await api.listItems(batch);
  if(!Array.isArray(items)||items.length>100)throw Error("Ungültige Entwurfsliste.");
  const list=await Promise.all(items.map(async item=>{
    const photos=await api.listPhotos(batch,item.id);
    return {item,photos,missing:check(item,photos)};
  }));
  const ids=items.map(item=>item.id);
  const existing=new Set();
  if(ids.length){
    const r=await api.db.from("listings").select("id")
      .eq("seller_id",uid).in("id",ids);
    for(const item of unwrap(r,"Veröffentlichungsstatus prüfen")||[]) existing.add(item.id);
  }
  for(const entry of list)entry.alreadyPublished=existing.has(entry.item.id);
  return {
    uid,batch,
    ready:list.filter(x=>!x.missing.length&&!x.alreadyPublished),
    incomplete:list.filter(x=>x.missing.length&&!x.alreadyPublished),
    previouslyPublished:list.filter(x=>x.alreadyPublished),
    total:list.length
  };
}
async function verifyCopied(api,uid,itemId,target) {
  const dir=uid+"/"+itemId;
  const name=target.slice(dir.length+1);
  const res=await api.db.storage.from(PUBLIC_BUCKET).list(dir,{limit:100});
  if(res.error || !Array.isArray(res.data)||!res.data.some(f=>f.name===name))
    throw Error("Bild konnte nicht zuverlässig übertragen werden.");
}
export async function publishPhotoBatch(api,batchId,onProgress=()=>{},limit=100) {
  if(!Number.isInteger(limit)||limit<1||limit>100)throw Error("Ungültiges Limit.");
  const plan=await buildPublishPlan(api,batchId);
  if(!plan.ready.length)throw Error("Kein fertiger Artikel: Bitte Titel, Preis, Kategorie und Foto prüfen.");
  let published=0;
  const target=plan.ready.slice(0,limit);
  for(const entry of target){
    const itemId=uuid(entry.item.id);
    try {
      for(const photo of entry.photos){
        const destination=listingCopyPath(plan.uid,itemId,photo.object_name);
        let copied;
        try{
          copied=await api.db.storage.from(PRIVATE_BUCKET).copy(
            photo.object_name,destination,{destinationBucket:PUBLIC_BUCKET}
          );
        }catch(err){
          copied={error:{message:String(err?.message||err)}};
        }
        // Retried file copies may report a conflict. Verify the exact expected
        // destination exists instead of overwriting another object.
        if(copied?.error||!copied?.data)
          await verifyCopied(api,plan.uid,itemId,destination);
      }
      const res=await api.db.rpc("km24_publish_photo_draft",{p_item_id:itemId});
      const listingId=unwrap(res,"Inserat veröffentlichen");
      if(listingId!==itemId)throw Error("Veröffentlichung gab eine unerwartete Inserat-ID zurück.");
      published++;
      onProgress({published,total:target.length,listingId});
    }catch(err){
      // Files copied before an RPC failure stay in the user's own public
      // staging folder so a retry can safely detect and reuse them. No duplicate
      // listing is created because the RPC uses the immutable draft item ID.
      const error=new Error("Nach "+published+" Artikeln gestoppt: "+String(err?.message||err));
      error.published=published;
      error.total=target.length;
      throw error;
    }
  }
  return {
    published,ready:plan.ready.length,skippedIncomplete:plan.incomplete.length,
    alreadyPublished:plan.previouslyPublished.length,
    remaining:plan.ready.length-published
  };
}
