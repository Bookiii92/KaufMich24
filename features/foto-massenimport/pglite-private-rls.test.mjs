// Integration test against ephemeral PostgreSQL running in WASM.
// Does not connect to Supabase, and does not use any real accounts or photos.
// In CI, install @electric-sql/pglite@0.5.15 in an isolated temp dir.
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PGlite} from "@electric-sql/pglite";

const migration=readFileSync(new URL("./review-only-private-drafts.sql",import.meta.url),"utf8");
const A="11111111-1111-4111-8111-111111111111";
const B="22222222-2222-4222-8222-222222222222";
const C="33333333-3333-4333-8333-333333333333";
const q=v=>"'"+String(v).replaceAll("'","''")+"'";
const random=()=>crypto.randomUUID();
async function switchTo(db,uid){
  await db.exec("RESET ROLE");
  await db.exec("SELECT set_config('request.jwt.claim.sub',"+q(uid||"")+",false)");
  await db.exec("SET ROLE "+(uid?"authenticated":"anon"));
}
async function results(db,statement){return (await db.query(statement)).rows}
const setup=[
  "CREATE ROLE authenticated",
  "CREATE ROLE anon",
  "CREATE SCHEMA auth",
  "CREATE SCHEMA private",
  "CREATE SCHEMA storage",
  "CREATE TABLE auth.users(id uuid PRIMARY KEY)",
  "CREATE TABLE public.categories(slug text PRIMARY KEY)",
  "CREATE TABLE public.profiles(id uuid PRIMARY KEY REFERENCES auth.users(id),account_type text NOT NULL,active boolean,contact_ok boolean)",
  "CREATE TABLE storage.buckets(id text PRIMARY KEY,name text NOT NULL,public boolean NOT NULL,file_size_limit bigint,allowed_mime_types text[])",
  "CREATE TABLE storage.objects(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),bucket_id text NOT NULL REFERENCES storage.buckets(id),name text NOT NULL,owner_id uuid)",
  "CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE SQL STABLE AS $$SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$",
  "CREATE FUNCTION private.is_account_active(p_user uuid) RETURNS boolean LANGUAGE SQL STABLE AS $$ SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id=p_user AND active) $$",
  "CREATE FUNCTION private.has_marketplace_contact(p_user uuid) RETURNS boolean LANGUAGE SQL STABLE AS $$ SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id=p_user AND contact_ok) $$",
  "GRANT USAGE ON SCHEMA public,auth,private,storage TO authenticated,anon",
  "GRANT SELECT ON public.profiles,public.categories TO authenticated",
  "GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth,private TO authenticated",
  "GRANT SELECT,INSERT,DELETE ON storage.objects TO authenticated",
  "ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY",
  "INSERT INTO auth.users VALUES("+[A,B,C].map(x=>"("+q(x)+")").join(",")+")",
  "INSERT INTO public.profiles VALUES ("+[A,"business",true,true].map(q).join(",")+"),("+[B,"business",true,true].map(q).join(",")+"),("+[C,"private",true,true].map(q).join(",")+")",
  "INSERT INTO public.categories VALUES('spielzeug')"
];
test("draft migration runs and enforces real PostgreSQL RLS under separate identities",async()=>{
  const db=new PGlite();
  try{
    for(const line of setup)await db.exec(line);
    await db.exec(migration);
    const rls=await results(db,"SELECT count(*)::int AS n FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname LIKE 'km24_bulk_draft_%' AND c.relrowsecurity");
    assert.equal(rls[0].n,3,"All 3 tables should have RLS enabled");
    const bucket=await results(db,"SELECT public FROM storage.buckets WHERE id='km24-bulk-draft-photos'");
    assert.equal(bucket[0].public,false);
    await switchTo(db,null);
    await assert.rejects(db.exec("INSERT INTO public.km24_bulk_draft_batches(title) VALUES('Gast')"),/permission denied|row-level security|RLS/);
    await switchTo(db,C);
    await assert.rejects(db.exec("INSERT INTO public.km24_bulk_draft_batches(title) VALUES('Privat')"),/row-level security|permission denied|RLS/);
    const batch=random(),item=random(),picture=random();
    const path=[A,batch,item,picture+".jpg"].join("/");
    await switchTo(db,A);
    await db.exec("INSERT INTO public.km24_bulk_draft_batches(id,owner_id,title) VALUES("+[batch,A,"Spielwaren"].map(q).join(",")+")");
    await db.exec("INSERT INTO public.km24_bulk_draft_items(id,batch_id,owner_id,title,category_slug) VALUES("+[item,batch,A,"Holzspielzeug","spielzeug"].map(q).join(",")+")");
    await db.exec("INSERT INTO public.km24_bulk_draft_photos(item_id,batch_id,owner_id,object_name,mime_type,size_bytes) VALUES("+[item,batch,A,path,"image/jpeg",500].map(q).join(",")+")");
    await db.exec("INSERT INTO storage.objects(bucket_id,name,owner_id) VALUES("+["km24-bulk-draft-photos",path,A].map(q).join(",")+")");
    const check=await results(db,"SELECT count(*)::int AS n FROM storage.objects WHERE bucket_id='km24-bulk-draft-photos'");
    assert.equal(check[0].n,1);
    await switchTo(db,B);
    for(const tbl of ["km24_bulk_draft_batches","km24_bulk_draft_items","km24_bulk_draft_photos"]){
      const visible=await results(db,"SELECT count(*)::int AS n FROM public."+tbl);
      assert.equal(visible[0].n,0, "Foreign user must not see "+tbl);
    }
    assert.equal((await results(db,"SELECT count(*)::int AS n FROM storage.objects"))[0].n,0,"Private storage must hide another user's images");
    await assert.rejects(db.exec("INSERT INTO public.km24_bulk_draft_photos(item_id,batch_id,owner_id,object_name,mime_type,size_bytes) VALUES("+[item,batch,B,path,"image/jpeg",100].map(q).join(",")+")"),/row-level security|foreign key|permission denied|RLS/);
    await switchTo(db,A);
    await assert.rejects(db.exec("UPDATE public.km24_bulk_draft_items SET batch_id="+q(random())+" WHERE id="+q(item)),/verschoben|constraint|permission denied|RLS/);
    for(let k=1;k<10;k++){
      const name=[A,batch,item,random()+".jpg"].join("/");
      await db.exec("INSERT INTO public.km24_bulk_draft_photos(item_id,batch_id,owner_id,object_name,mime_type,size_bytes) VALUES("+[item,batch,A,name,"image/jpeg",500].map(q).join(",")+")");
    }
    const extra=[A,batch,item,random()+".jpg"].join("/");
    await assert.rejects(db.exec("INSERT INTO public.km24_bulk_draft_photos(item_id,batch_id,owner_id,object_name,mime_type,size_bytes) VALUES("+[item,batch,A,extra,"image/jpeg",500].map(q).join(",")+")"),/Maximal zehn Bilder/);
    await db.exec("UPDATE public.km24_bulk_draft_batches SET state='archived' WHERE id="+q(batch));
    await assert.rejects(db.exec("UPDATE public.km24_bulk_draft_batches SET state='draft' WHERE id="+q(batch)),/row-level security|RLS|Archivierte/);
  }finally{await db.close()}
});
