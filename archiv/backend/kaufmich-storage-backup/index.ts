import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.4";
import { zipSync,strToU8,unzipSync } from "npm:fflate@0.8.2";

const BACKUP = "km24-backups";
const SANDBOX = "km24-restore-sandbox";
const json = (data: unknown, status=200) => new Response(JSON.stringify(data), {
  status, headers: { "content-type":"application/json", "cache-control":"no-store" }
});

async function concurrent<T>(items:T[], concurrency:number, action:(x:T)=>Promise<void>) {
  let index = 0;
  await Promise.all(Array.from({length:Math.min(items.length,concurrency)}, async ()=>{
    while(index < items.length) {
      const item = items[index++];
      await action(item);
    }
  }));
}

Deno.serve(async (req) => {
  try {
    if(req.method !== "POST") return json({error:"method_not_allowed"},405);
    const url=Deno.env.get("SUPABASE_URL"), key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if(!url || !key) return json({error:"missing_server_config"},500);
    const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
    const token=req.headers.get("x-km24-ops-token") || "";
    const {data:allowed,error:authError}=await db.rpc("ops_worker_token_valid",{p_token:token});
    if(authError || allowed!==true) return json({error:"unauthorized"},401);
    let body:any={};try {body=await req.json()} catch {}
    const mode=body.mode || "process";
    const now=new Date();
    const startTime=now.getUTCHours()>3 || (now.getUTCHours()===3&&now.getUTCMinutes()>=45);
    if(mode==="start" || (mode==="process" && startTime)) {
      const {error}=await db.rpc("ops_storage_backup_start");
      if(error) throw new Error("start: "+error.message);
    }
    if(mode==="cleanup") {
      // Never remove production media. Only expire completed, old backup runs and
      // their unreferenced immutable backup objects after the retention window.
      const cutoff=new Date(Date.now()-15*86400000).toISOString().slice(0,10);
      const {data:old,error:oldError}=await db.from("ops_storage_backup_runs")
        .select("id,manifest_path,backup_date").eq("state","completed")
        .lt("backup_date",cutoff).order("backup_date",{ascending:true}).limit(10);
      if(oldError)throw oldError;
      let runsRemoved=0,manifestsRemoved=0;
      for(const run of old||[]) {
        if(run.manifest_path) {
          const {error:re}=await db.storage.from(BACKUP).remove([run.manifest_path]);
          if(re)throw re;
          manifestsRemoved++;
        }
        const {error:de}=await db.from("ops_storage_backup_runs").delete().eq("id",run.id);
        if(de)throw de;
        runsRemoved++;
      }
      const {data:orphans,error:orphanError}=await db.rpc("ops_storage_backup_orphan_paths",{p_limit:100});
      if(orphanError)throw orphanError;
      const paths=(orphans||[]).map((o:any)=>o.path);
      if(paths.length) {
        const {error:delError}=await db.storage.from(BACKUP).remove(paths);
        if(delError)throw delError;
      }
      return json({ok:true,run_retention_days:15,old_runs_removed:runsRemoved,
        manifests_removed:manifestsRemoved,unreferenced_versions_removed:paths.length});
    }
    if(mode==="verify_database_archive") {
      const {data:last,error:findErr}=await db.from("ops_backups")
        .select("storage_path,created_at").eq("status","completed")
        .order("created_at",{ascending:false}).limit(1).maybeSingle();
      if(findErr || !last?.storage_path) throw new Error("No completed logical backup");
      const {data:archive,error:downloadErr}=await db.storage.from(BACKUP).download(last.storage_path);
      if(downloadErr || !archive) throw new Error("Could not download logical backup");
      const zipped=new Uint8Array(await archive.arrayBuffer());
      const files=unzipSync(zipped);
      if(!files["backup.json"])throw new Error("Missing backup.json");
      const payload=JSON.parse(new TextDecoder().decode(files["backup.json"]));
      const details=Object.entries(payload.table_counts || {}) as Array<[string,number]>;
      const mismatches=details.filter(([name,number])=> !Array.isArray(payload.tables?.[name]) || payload.tables[name].length!==number);
      const hasLive=(payload.tables?.kaufmich_frontend_snapshots||[])
        .some((x:any)=>x.name==="live" && typeof x.html==="string" && x.html.length>1000000);
      const success=mismatches.length===0 && hasLive && Array.isArray(payload.auth_users)
        && Array.isArray(payload.storage_manifest);
      return json({ok:success,archive:last.storage_path,
        archive_bytes:zipped.length,tables_checked:details.length,table_mismatches:mismatches.length,
        auth_users:payload.auth_users?.length||0,stored_manifest_items:payload.storage_manifest?.length||0,
        live_frontend_restorable:hasLive});
    }
    if(mode==="restore_test") {
      const {data:items,error:ie}=await db.from("ops_storage_backup_items")
        .select("id,source_bucket,source_path,backup_path,size_bytes,run_id")
        .not("copied_at","is",null).order("size_bytes",{ascending:false}).limit(2);
      if(ie) throw ie;
      if(!items?.length) return json({error:"no_copied_files_for_restore"},409);
      const {data:buckets,error:be}=await db.storage.listBuckets();if(be)throw be;
      if(!(buckets||[]).some((b:any)=>b.id===SANDBOX)) {
        const {error:ce}=await db.storage.createBucket(SANDBOX,{public:false,fileSizeLimit:52428800});
        if(ce) throw ce;
      }
      const tests:any[]=[];
      for(const item of items) {
        const dest="restore-test/"+item.id+"/"+item.source_path.split("/").at(-1);
        const {error:copyError}=await db.storage.from(BACKUP)
          .copy(item.backup_path,dest,{destinationBucket:SANDBOX});
        if(copyError && !/duplicate|already exists/i.test(copyError.message)) throw copyError;
        const {data:restored,error:readErr}=await db.storage.from(SANDBOX).download(dest);
        const {data:archived,error:originalErr}=await db.storage.from(BACKUP).download(item.backup_path);
        if(readErr || originalErr || !restored || !archived) throw new Error("restore_download_failed");
        const h=async (blob:Blob)=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",await blob.arrayBuffer())))
          .map(v=>v.toString(16).padStart(2,"0")).join("");
        const checksumA=await h(archived),checksumB=await h(restored);
        tests.push({bucket:item.source_bucket,bytes:item.size_bytes,size_match:archived.size===restored.size&&restored.size===item.size_bytes,sha256_match:checksumA===checksumB});
      }
      return json({ok:tests.every(x=>x.size_match&&x.sha256_match),sandbox_bucket:SANDBOX,files_tested:tests.length,tests});
    }
    if(mode!=="process" && mode!=="start") return json({error:"unsupported_mode"},400);
    const {data:claimed,error:claimError}=await db.rpc("ops_storage_backup_claim",{p_limit:40});
    if(claimError) throw claimError;
    let success=0,failed=0;
    await concurrent((claimed||[]) as any[],5,async(item)=>{
      let err="";
      try {
        const {error}=await db.storage.from(item.source_bucket)
          .copy(item.source_path,item.backup_path,{destinationBucket:BACKUP});
        if(error) err=error.message;
        const {data:verified,error:verifyErr}=await db.rpc("ops_storage_backup_mark",{p_item_id:item.item_id,p_error:err || null});
        if(verifyErr) throw verifyErr;
        if(verified)success++;else failed++;
      } catch(e) {
        failed++;
        await db.rpc("ops_storage_backup_mark",{p_item_id:item.item_id,p_error:String((e as Error).message).slice(0,400)}).catch(()=>{});
      }
    });
    const {data:runs,error:runError}=await db.from("ops_storage_backup_runs")
      .select("id,backup_date,state,file_count,size_bytes,manifest_path").eq("state","running").order("backup_date",{ascending:true}).limit(1);
    if(runError) throw runError;
    const run=runs?.[0];
    if(!run) return json({ok:true,claimed:(claimed||[]).length,copied:success,failed,no_active_runs:true});
    // Collect a run's immutable version mapping, without requesting file bytes.
    const items:any[]=[];let offset=0;
    for(;;) {
      const {data,error}=await db.from("ops_storage_backup_items")
        .select("id,source_bucket,source_path,source_updated_at,size_bytes,mime_type,backup_path,copied_at,attempts,last_error")
        .eq("run_id",run.id).order("source_bucket").order("source_path").range(offset,offset+499);
      if(error)throw error;
      items.push(...(data||[]));if((data||[]).length<500)break;offset+=500;
    }
    const remaining=items.filter(x=>!x.copied_at);
    let finalized=false;
    if(remaining.length===0) {
      const path="storage-manifests/v1/"+run.backup_date+"/manifest.zip";
      const {data:logical}=await db.from("ops_backups").select("storage_path,created_at")
        .eq("status","completed").order("created_at",{ascending:false}).limit(1).maybeSingle();
      const manifest={format:"KM24-storage-backup-v1",date:run.backup_date,created_at:new Date().toISOString(),
        database_archive:logical?.storage_path||null,
        file_count:items.length,total_bytes:items.reduce((a,i)=>a+Number(i.size_bytes),0),
        entries:items.map(x=>({bucket:x.source_bucket,path:x.source_path,version:x.backup_path,
          updated_at:x.source_updated_at,size_bytes:x.size_bytes,mime_type:x.mime_type}))};
      const manifestZip=zipSync({"manifest.json":strToU8(JSON.stringify(manifest))},{level:6});
      const {error:upError}=await db.storage.from(BACKUP).upload(path,manifestZip,
        {contentType:"application/zip",cacheControl:"3600",upsert:false});
      if(upError && !/duplicate|already exists/i.test(upError.message))throw upError;
      const {data:done,error:doneError}=await db.rpc("ops_storage_backup_complete",{p_run_id:run.id,p_manifest_path:path});
      if(doneError) throw doneError;
      finalized=done===true;
    }
    return json({ok:failed===0,backup_date:run.backup_date,source_files:run.file_count,
      source_bytes:run.size_bytes,claimed:(claimed||[]).length,copied:success,failed,
      remaining:remaining.length,exhausted_retries:remaining.filter(x=>x.attempts>=5).length,
      completed:finalized});
  }catch(e){
    console.error("storage backup worker:",(e as Error).message);
    return json({ok:false,error:String((e as Error).message).slice(0,500)},500);
  }
});
