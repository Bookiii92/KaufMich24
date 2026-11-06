import test from "node:test";
import assert from "node:assert/strict";
import {listingCopyPath,buildPublishPlan,publishPhotoBatch} from "./photo-bulk-publish.mjs";

const UID="11111111-1111-4111-8111-111111111111";
const BATCH="22222222-2222-4222-8222-222222222222";
const A="33333333-3333-4333-8333-333333333333",B="44444444-4444-4444-8444-444444444444";
const PA="55555555-5555-4555-8555-555555555555",PB="66666666-6666-4666-8666-666666666666";
const file=(item,pic)=>({id:pic,object_name:UID+"/"+BATCH+"/"+item+"/"+pic+".jpg"});
function mock({items=[A,B],existing=[],category="spielzeug",copyFail=false,rpcFailAt=0,missingPhoto=[]}={}){
  const files=new Map([[A,[file(A,PA)]],[B,[file(B,PB)]]]);
  const records=items.map((id,i)=>({id,title:"Spielzeug "+(i+1),price_chf:12,category_slug:category}));
  const posted=new Set(existing),calls=[];let rpcN=0;
  const db={
    from(t){
      assert.equal(t,"listings");
      return {select(){return this},eq(){return this},in(field,ids){
        return Promise.resolve({data:ids.filter(id=>posted.has(id)).map(id=>({id})),error:null});
      }};
    },
    storage:{from(t){
      assert.ok(["km24-bulk-draft-photos","listing-images"].includes(t));
      return{
        async copy(src,dst,opts){
          calls.push(["copy",t,src,dst,opts]);
          return copyFail?{data:null,error:{message:"already exists"}}:{data:{path:dst},error:null};
        },
        async list(dir){
          calls.push(["verifyCopy",dir]);
          return {data:[{name:PA+".jpg"},{name:PB+".jpg"}],error:null};
        }
      }
    }},
    async rpc(name,args){
      calls.push(["rpc",name,args]);rpcN++;
      if(rpcN===rpcFailAt)return {data:null,error:{message:"Tageslimit"}};
      posted.add(args.p_item_id);
      return {data:args.p_item_id,error:null};
    }
  };
  const api={
    db,async owner(){return UID},
    async listItems(){return records},
    async listPhotos(_,item){return missingPhoto.includes(item)?[]:files.get(item)||[]}
  };
  return{api,calls,posted};
}
test("stable public path uses own UUIDs and rejects image ownership spoofing",()=>{
 const path=UID+"/"+A+"/"+PA+".jpg";
 assert.equal(listingCopyPath(UID,A,file(A,PA).object_name),path);
 assert.throws(()=>listingCopyPath(UID,B,file(A,PA).object_name),/nicht zugeordnet/);
 assert.throws(()=>listingCopyPath(UID,A,"../../etc/passwd"),/nicht zugeordnet/);
});
test("plan requires title, price, category and private photos",async()=>{
 const x=mock({category:null,missingPhoto:[A]});
 const p=await buildPublishPlan(x.api,BATCH);
 assert.equal(p.ready.length,0);
 assert.equal(p.incomplete.length,2);
 assert.ok(p.incomplete[0].missing.includes("Kategorie"));
 assert.ok(p.incomplete[0].missing.includes("Foto"));
});
test("publish copies from private to public before RPC, no admin secret required",async()=>{
 const x=mock({items:[A]});
 const r=await publishPhotoBatch(x.api,BATCH);
 assert.equal(r.published,1);
 assert.deepEqual(x.calls.map(z=>z[0]),["copy","rpc"]);
 assert.equal(x.calls[0][4].destinationBucket,"listing-images");
 assert.equal(x.calls[1][2].p_item_id,A);
});
test("retry accepts existing copied image only after file existence check",async()=>{
 const x=mock({items:[A],copyFail:true});
 const result=await publishPhotoBatch(x.api,BATCH);
 assert.equal(result.published,1);
 assert.deepEqual(x.calls.map(z=>z[0]),["copy","verifyCopy","rpc"]);
});
test("already public listings are never published again",async()=>{
 const x=mock({existing:[A]});
 const result=await publishPhotoBatch(x.api,BATCH);
 assert.equal(result.published,1);
 assert.equal(result.alreadyPublished,1);
 assert.equal(x.calls.filter(x=>x[0]==="rpc").length,1);
 assert.equal(x.calls.find(x=>x[0]==="rpc")[2].p_item_id,B);
});
test("publication stops on existing backend limit; retry skips published records",async()=>{
 const x=mock({rpcFailAt:2});
 await assert.rejects(publishPhotoBatch(x.api,BATCH),e=>e.published===1&&/Tageslimit/.test(e.message));
 assert.equal(x.posted.has(A),true);
 const retry=await publishPhotoBatch(x.api,BATCH);
 assert.equal(retry.published,1);
 assert.equal(retry.alreadyPublished,1);
});
test("incomplete products are skipped and cannot be sent to RPC",async()=>{
 const x=mock({missingPhoto:[A]});
 const r=await publishPhotoBatch(x.api,BATCH);
 assert.equal(r.published,1);
 assert.equal(r.skippedIncomplete,1);
 assert.equal(x.calls.find(x=>x[0]==="rpc")[2].p_item_id,B);
});
test("without complete products nothing gets copied or published",async()=>{
 const x=mock({category:null});
 await assert.rejects(publishPhotoBatch(x.api,BATCH),/Kein fertiger Artikel/);
 assert.equal(x.calls.length,0);
});
