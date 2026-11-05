import test from "node:test";
import assert from "node:assert/strict";
import {groupPhotos,PhotoUploadQueue} from "./photo-upload-queue.mjs";
const BID="11111111-1111-4111-8111-111111111111";
const files=()=>Array.from({length:4},(_,i)=>({type:"image/jpeg",size:120,name:"Toy-"+i+".jpg",lastModified:i}));
const uuids=["22222222-2222-4222-8222-222222222222","33333333-3333-4333-8333-333333333333",
 "44444444-4444-4444-8444-444444444444","55555555-5555-4555-8555-555555555555"];
function mock({failAt=0,blocked=false}={}){
 const events=[],counts={attempts:0};
 const api={
   async ensureItem(batch,id){events.push(["item",batch,id])},
   async upload(batch,id,file,order){
      counts.attempts++;events.push(["photo",batch,id,file.name,order]);
      if(counts.attempts===failAt)throw Error(blocked?"Bitte nicht erneut hochladen":"Netzwerkfehler");
   }
 };
 return{api,events,counts};
}
function queue(api,sameProduct=false){let n=0;return new PhotoUploadQueue({api,batchId:BID,files:files(),sameProduct,newUUID:()=>uuids[n++]})}
test("groups into products without losing images",()=>{
 assert.equal(groupPhotos(files(),false).length,4);
 assert.equal(groupPhotos(files(),true).length,1);
 assert.equal(groupPhotos(files(),true)[0].length,4);
 assert.throws(()=>groupPhotos(Array(11).fill({type:"image/jpeg",size:100}),true),/Maximal 10/);
 assert.throws(()=>groupPhotos(Array(101).fill({type:"image/jpeg",size:100})),/Maximal 100/);
});
test("each image becomes a private draft product by default",async()=>{
 const m=mock(),q=queue(m.api);
 const r=await q.run();
 assert.equal(r.state,"completed");assert.equal(r.done,4);
 assert.equal(m.events.filter(e=>e[0]==="item").length,4);
 assert.equal(m.events.filter(e=>e[0]==="photo").length,4);
 assert.deepEqual(m.events.filter(e=>e[0]==="photo").map(e=>e[4]),[0,0,0,0]);
});
test("multiple images of same article create one product with ordered photos",async()=>{
 const m=mock(),q=queue(m.api,true);
 await q.run();
 assert.equal(m.events.filter(e=>e[0]==="item").length,1);
 assert.deepEqual(m.events.filter(e=>e[0]==="photo").map(e=>e[4]),[0,1,2,3]);
});
test("resume after failed upload does not recreate earlier items or images",async()=>{
 const m=mock({failAt:3}),q=queue(m.api);
 await assert.rejects(q.run(),/Netzwerkfehler/);
 assert.deepEqual(q.snapshot().state,"paused");
 assert.equal(q.snapshot().done,2);
 await q.run();
 assert.equal(q.snapshot().state,"completed");
 assert.equal(m.events.filter(e=>e[0]==="item").length,4);
 assert.equal(m.events.filter(e=>e[0]==="photo"&&e[3]==="Toy-0.jpg").length,1);
});
test("ambiguous cleanup error blocks unsafe retry",async()=>{
 const m=mock({failAt:1,blocked:true}),q=queue(m.api);
 await assert.rejects(q.run(),/Bitte nicht/);
 assert.equal(q.snapshot().state,"blocked");
 await assert.rejects(q.run(),/Uploadstatus ist unklar/);
 assert.equal(m.events.filter(e=>e[0]==="photo").length,1);
});
test("duplicate source file selection is rejected",()=>{
 let ff=files();ff.push({...ff[0]});
 assert.throws(()=>groupPhotos(ff),/mehrfach ausgewählt/);
});
test("a finished queue is idempotent in memory",async()=>{
 const m=mock(),q=queue(m.api);await q.run();
 const old=m.events.length;await q.run();
 assert.equal(m.events.length,old);
});
