import test from "node:test";
import assert from "node:assert/strict";
import {SecurePhotoDrafts, validateImage, cleanDraft, MAX_BYTES} from "./secure-drafts-client.mjs";

const USER="11111111-1111-4111-8111-111111111111";
const BATCH="22222222-2222-4222-8222-222222222222";
const ITEM="33333333-3333-4333-8333-333333333333";
const IMAGE="44444444-4444-4444-8444-444444444444";
const jpeg=()=>new Blob([new Uint8Array([255,216,255,224,0,16,74,70,73,70,0,0])],{type:"image/jpeg"});
function fixture(options={}){
  const calls=[];
  const client={
    auth:{async getUser(){return {data:{user:options.guest?null:{id:USER}},error:null}}},
    from(table){
      calls.push(["from",table]);
      const q={
        select(v){calls.push(["select",v]);return this},
        eq(k,v){calls.push(["eq",k,v]);return this},
        order(v){calls.push(["order",v]);return this},
        limit(v){calls.push(["limit",v]);return this},
        insert(v){calls.push(["insert",v]);return this},
        update(v){calls.push(["update",v]);return this},
        delete(){calls.push(["delete"]);return this},
        async single(){return{data:table==="profiles"?{account_type:options.type||"business"}:{id:IMAGE,object_name:USER+"/"+BATCH+"/"+ITEM+"/"+IMAGE+".jpg"},error:null}},
        then(resolve){return Promise.resolve({data:[],error:null}).then(resolve)}
      };
      return q;
    },
    storage:{from(bucket){
      calls.push(["bucket",bucket]);
      return{
        async upload(...args){calls.push(["upload",...args]);return{data:{},error:options.uploadFail?{message:"network"}:null}},
        async remove(args){calls.push(["remove",args]);return{data:{},error:options.removeFail?{message:"network"}:null}},
        async createSignedUrl(path,ttl){calls.push(["signed",path,ttl]);return{data:{signedUrl:"https://example.invalid/preview"},error:null}}
      }
    }}
  };
  return {client,calls};
}
test("allowed image types and size",()=>{
  assert.equal(validateImage({size:10,type:"image/jpeg"}),"jpg");
  assert.equal(validateImage({size:10,type:"image/png"}),"png");
  assert.equal(validateImage({size:10,type:"image/webp"}),"webp");
  for(const type of ["application/pdf","image/svg+xml","image/heic"])
    assert.throws(()=>validateImage({size:10,type}),/JPG/);
  assert.throws(()=>validateImage({size:MAX_BYTES+1,type:"image/png"}),/10 MB/);
});
test("draft input validation protects prices, categories and immutable fields",()=>{
  assert.equal(cleanDraft({title:"Spielzeug",price_chf:"19,90",category_slug:"spielzeug"}).price_chf,19.9);
  for(const price of ["-1","Infinity","2e4","19.999"])
    assert.throws(()=>cleanDraft({price_chf:price}),/Preis/);
  assert.deepEqual(cleanDraft({owner_id:USER,batch_id:BATCH},true),{});
  assert.throws(()=>cleanDraft({category_slug:"spielzeug;DROP"}),/Kategorie/);
});
test("private or unauthenticated accounts cannot create drafts",async()=>{
  let x=fixture({type:"private"});
  await assert.rejects(new SecurePhotoDrafts(x.client,()=>IMAGE).createBatch(),/Nur Firmen/);
  x=fixture({guest:true});
  await assert.rejects(new SecurePhotoDrafts(x.client,()=>IMAGE).createBatch(),/anmelden/);
});
test("uploads are to owner-owned private bucket, without overwrites",async()=>{
  const x=fixture(),api=new SecurePhotoDrafts(x.client,()=>IMAGE);
  await api.upload(BATCH,ITEM,jpeg(),0);
  const uploaded=x.calls.find(c=>c[0]==="upload");
  assert.equal(uploaded[1],USER+"/"+BATCH+"/"+ITEM+"/"+IMAGE+".jpg");
  assert.equal(uploaded[3].upsert,false);
  assert.ok(x.calls.findIndex(c=>c[0]==="insert")<x.calls.findIndex(c=>c[0]==="upload"));
  assert.ok(x.calls.some(c=>c[0]==="bucket" && c[1]==="km24-bulk-draft-photos"));
});
test("failed storage upload cleans metadata reservation",async()=>{
  const x=fixture({uploadFail:true});
  await assert.rejects(new SecurePhotoDrafts(x.client,()=>IMAGE).upload(BATCH,ITEM,jpeg(),0),/Upload fehlgeschlagen/);
  assert.ok(x.calls.some(c=>c[0]==="remove"));
  assert.ok(x.calls.some(c=>c[0]==="delete"));
  assert.ok(x.calls.findIndex(c=>c[0]==="remove") < x.calls.findIndex(c=>c[0]==="delete"));
});
test("foreign path, invalid UUID and illegal image order are blocked",async()=>{
  const x=fixture(),api=new SecurePhotoDrafts(x.client,()=>IMAGE);
  await assert.rejects(api.preview("99999999-9999-4999-8999-999999999999/x/y/test.jpg"),/nicht zu diesem Konto/);
  await assert.rejects(api.upload("../etc",ITEM,{type:"image/png",size:10}),/Ungültige ID/);
  await assert.rejects(api.upload(BATCH,ITEM,{type:"image/png",size:10},10),/Maximal 10/);
});

test("ambiguous upload retains reservation when file removal fails",async()=>{
  const x=fixture({uploadFail:true,removeFail:true}),api=new SecurePhotoDrafts(x.client,()=>IMAGE);
  await assert.rejects(api.upload(BATCH,ITEM,jpeg(),0),/Bitte nicht erneut hochladen/);
  assert.ok(x.calls.some(c=>c[0]==="remove"));
  assert.equal(x.calls.filter(c=>c[0]==="delete").length,0);
});
test("spoofed JPEG is rejected before any DB reservation",async()=>{
  const x=fixture(),api=new SecurePhotoDrafts(x.client,()=>IMAGE);
  const bad=new Blob(["<script>not an image</script>"],{type:"image/jpeg"});
  await assert.rejects(api.upload(BATCH,ITEM,bad,0),/Format überein/);
  assert.equal(x.calls.filter(c=>c[0]==="insert").length,0);
});
