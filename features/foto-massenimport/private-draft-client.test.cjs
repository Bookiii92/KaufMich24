// Run with: node --test features/foto-massenimport/private-draft-client.test.cjs
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const { create: makeService, fields } = require("./private-draft-client.js");

const uid="11111111-1111-4111-a111-111111111111";
const bid="22222222-2222-4222-a222-222222222222";
const iid="33333333-3333-4333-a333-333333333333";
const pid="55555555-5555-4555-8555-555555555555";
function fake({uploadError=false,unauth=false}={}){
 const calls=[];
 const api={
   auth:{getUser:async()=>unauth?{error:{message:"not logged in"}}:{data:{user:{id:uid}}}},
   from(table){
     let mode="";let record={};
     const query={
       insert(payload){mode="insert";record=payload;calls.push([table,"insert",payload]);return query},
       select(){return query},eq(){return query},order(){return query},limit(){return query},
       delete(){mode="delete";calls.push([table,"delete"]);return query},
       update(payload){mode="update";record=payload;calls.push([table,"update",payload]);return query},
       async single(){return{data:{id:table==="km24_bulk_draft_batches"?bid:table==="km24_bulk_draft_items"?iid:pid,...record}}},
       then(resolve){return Promise.resolve({data:[{id:pid}],error:null}).then(resolve)}
     };
     return query
   },
   storage:{from(bucket){
     assert.equal(bucket,"km24-bulk-draft-photos");
     return{
       upload:async(path,file,options)=>{calls.push(["storage","upload",path,options]);return uploadError?{error:{message:"network error"}}:{data:{path},error:null}},
       remove:async paths=>{calls.push(["storage","remove",paths]);return{data:[],error:null}},
       createSignedUrl:async()=>({data:{signedUrl:"https://example.invalid/temporary?token=test"},error:null})
     }
   }}
 };
 return {service:makeService(api),calls}
}

test("Normalizes common Swiss prices without losing other fields",()=>{
 assert.deepEqual(fields({title:"  Teddy  ",price_chf:"29,90",condition:"new"}),{title:"Teddy",price_chf:29.9,condition:"new"});
 assert.throws(()=>fields({price_chf:"-1"}),/Preis/);
 assert.throws(()=>fields({sort_order:100}),/Reihenfolge/);
 assert.throws(()=>fields({category_slug:"../../bad"}),/Kategorie/);
});

test("Requires a logged-in user before inserting a batch",async()=>{
 const {service,calls}=fake({unauth:true});
 await assert.rejects(service.createBatch(),/anmelden/);
 assert.equal(calls.length,0);
});

test("Creates a batch and an item without activating a public listing",async()=>{
 const {service,calls}=fake();
 await service.createBatch("Spielwaren");
 await service.addItem(bid,{title:"Lernspielzeug",price_chf:"39.95"});
 assert(calls.some(([t,op])=>t==="km24_bulk_draft_batches"&&op==="insert"));
 assert(calls.some(([t,op])=>t==="km24_bulk_draft_items"&&op==="insert"));
 assert(!calls.some(([t])=>t==="listings"));
});

test("Reserves a private image path and forbids upsert",async()=>{
 const {service,calls}=fake();
 const img=await service.uploadPhoto(bid,iid,{type:"image/png",size:1500},0);
 const upload=calls.find(([t,op])=>t==="storage"&&op==="upload");
 assert(upload);
 assert(upload[2].startsWith(uid+"/"+bid+"/"+iid+"/"));
 assert.equal(upload[3].upsert,false);
 assert.equal(img.id,pid);
});

test("Rejects unsupported formats and oversize images",async()=>{
 const {service,calls}=fake();
 await assert.rejects(service.uploadPhoto(bid,iid,{type:"application/pdf",size:250},0),/JPG/);
 await assert.rejects(service.uploadPhoto(bid,iid,{type:"image/png",size:11*1024*1024},0),/JPG/);
 await assert.rejects(service.uploadPhoto(bid,iid,{type:"image/png",size:200},10),/zehn/);
 assert.equal(calls.length,0);
});

test("Failed upload deletes its reserved metadata and cannot publish",async()=>{
 const {service,calls}=fake({uploadError:true});
 await assert.rejects(service.uploadPhoto(bid,iid,{type:"image/jpeg",size:990},0),/Upload fehlgeschlagen/);
 assert(calls.some(([t,op])=>t==="km24_bulk_draft_photos"&&op==="delete"));
 assert(!calls.some(([t])=>t==="listings"));
});

test("Rejects foreign URLs before requesting temporary signed links",async()=>{
 const {service}=fake();
 await assert.rejects(service.signedUrl("not-the-owner/photo.jpg"),/Unzulässiger Bildpfad/);
 const signed=await service.signedUrl(uid+"/"+bid+"/"+iid+"/"+pid+".jpg");
 assert(signed.includes("temporary"));
});
