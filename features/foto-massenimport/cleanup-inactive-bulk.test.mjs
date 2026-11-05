import test from "node:test";
import assert from "node:assert/strict";
import {planInactiveBulkCleanup,cleanupInactiveBulkBatch} from "./cleanup-inactive-bulk.mjs";

const UID="11111111-1111-4111-8111-111111111111";
const BATCH="22222222-2222-4222-8222-222222222222";
const ITEM="33333333-3333-4333-8333-333333333333";
const FILE="44444444-4444-4444-8444-444444444444.jpg";
const PATH=UID+"/"+ITEM+"/"+FILE;
function fixture({status="inactive",flag=true,seller=UID,path=PATH,storageFails=false}={}){
  const calls=[];
  const listing={id:ITEM,seller_id:seller,status,extra_fields:{km24_photo_import:flag}};
  let images=[{id:"55555555-5555-4555-8555-555555555555",storage_path:path}];
  let fail=storageFails;
  const api={
    async owner(){return UID},
    async listItems(){return[{id:ITEM,title:"Testartikel"}]},
    async deleteItem(batch,id){
      calls.push(["private-delete",batch,id]);
    },
    db:{
      from(table){
        let op="select",updates={},filters={},listIds=[];
        const b={
          select(){return b},
          eq(key,v){filters[key]=v;return b},
          in(key,v){if(key==="id")listIds=v;return b},
          update(v){op="update";updates=v;return b},
          delete(){op="delete";return b},
          async single(){return answer(true)},
          then(resolve,reject){return Promise.resolve(answer(false)).then(resolve,reject)}
        };
        function answer(single){
          if(table==="listings"){
            if(op==="update"){
              calls.push(["status-update",updates.status]);
              if(listing.status!==filters.status)return{data:null,error:{message:"changed"}};
              listing.status=updates.status;
              return{data:{...listing},error:null};
            }
            if(filters.seller_id && filters.seller_id!==listing.seller_id)return{data:single?null:[],error:single?{message:"missing"}:null};
            if(filters.id && filters.id!==listing.id)return{data:single?null:[],error:single?{message:"missing"}:null};
            if(listIds.length && !listIds.includes(listing.id))return{data:[],error:null};
            return{data:single?{...listing}:[{...listing}],error:null};
          }
          if(table==="listing_images"){
            if(op==="delete"){
              calls.push(["links-delete",listIds]);
              images=[];return{data:null,error:null};
            }
            return{data:images.slice(),error:null};
          }
          throw Error("Unexpected table "+table);
        }
        return b;
      },
      storage:{from(name){
        assert.equal(name,"listing-images");
        return{
          async remove(paths){
            calls.push(["public-delete",paths]);
            if(fail){fail=false;return{data:null,error:{message:"offline"}}}
            return{data:{},error:null};
          }
        };
      }}
    }
  };
  return{api,calls,listing,remaining:()=>images.length};
}
test("only inactive, own, photo-import listings are cleanup candidates",async()=>{
 for(const options of [{status:"active"},{flag:false},{seller:"66666666-6666-4666-8666-666666666666"}]){
   const x=fixture(options);
   assert.equal((await planInactiveBulkCleanup(x.api,BATCH)).items.length,0);
   assert.equal((await cleanupInactiveBulkBatch(x.api,BATCH)).cleaned,0);
   assert.equal(x.calls.length,0);
 }
});
test("deactivate, remove public files and links before deleting private drafts",async()=>{
 const x=fixture();
 const r=await cleanupInactiveBulkBatch(x.api,BATCH);
 assert.equal(r.cleaned,1);
 assert.equal(x.listing.status,"deleted");
 assert.deepEqual(x.calls.map(c=>c[0]),["status-update","public-delete","links-delete","private-delete"]);
 assert.equal(x.remaining(),0);
});
test("path outside same listing is rejected before mutating anything",async()=>{
 const x=fixture({path:UID+"/"+BATCH+"/"+FILE});
 await assert.rejects(cleanupInactiveBulkBatch(x.api,BATCH),/ausserhalb/);
 assert.equal(x.calls.length,0);
 assert.equal(x.listing.status,"inactive");
});
test("failed public removal keeps link and private files; retry is resumable",async()=>{
 const x=fixture({storageFails:true});
 await assert.rejects(cleanupInactiveBulkBatch(x.api,BATCH),/offline/);
 assert.equal(x.listing.status,"deleted");
 assert.equal(x.remaining(),1);
 assert.equal(x.calls.some(c=>c[0]==="private-delete"),false);
 const result=await cleanupInactiveBulkBatch(x.api,BATCH);
 assert.equal(result.cleaned,1);
 assert.equal(x.remaining(),0);
 assert.equal(x.calls.filter(c=>c[0]==="status-update").length,1);
});
