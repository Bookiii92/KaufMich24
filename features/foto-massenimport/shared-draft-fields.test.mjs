import test from "node:test";
import assert from "node:assert/strict";
import {normalizeSharedFields,applySharedFields} from "./shared-draft-fields.mjs";

test("ignores blank values and preserves explicit location and status",()=>{
  assert.deepEqual(normalizeSharedFields({
    city:" Triengen ", postal_code:"6234",canton:" lu ",
    category_slug:"spielzeug",condition:"new", price_chf:"0"
  }),{category_slug:"spielzeug",condition:"new",city:"Triengen",postal_code:"6234",canton:"LU"});
});
test("refuses empty, untrusted, or invalid values",()=>{
  assert.throws(()=>normalizeSharedFields({}),/mindestens eine/);
  assert.throws(()=>normalizeSharedFields({category_slug:"spielzeug;delete"}),/Kategorie/);
  assert.throws(()=>normalizeSharedFields({postal_code:"12345"}),/PLZ/);
  assert.throws(()=>normalizeSharedFields({canton:"ZZ"}),/Kanton/);
  assert.throws(()=>normalizeSharedFields({condition:"publish"}),/Zustand/);
  assert.throws(()=>normalizeSharedFields({city:"X".repeat(151)}),/lang/);
});
test("updates each draft and reports progress without changing title or price",async()=>{
  const calls=[],progress=[];
  const api={
    async listItems(batch){assert.equal(batch,"batch");return[{id:"one"},{id:"two"},{id:"three"}]},
    async updateItem(id,data){calls.push({id,data:{...data}})}
  };
  const result=await applySharedFields(api,"batch",{city:"Triengen",postal_code:"6234"},(done,total)=>progress.push([done,total]));
  assert.equal(result.updated,3);
  assert.deepEqual(result.changedFields,["city","postal_code"]);
  assert.deepEqual(progress,[[1,3],[2,3],[3,3]]);
  assert.deepEqual(calls.map(x=>x.id),["one","two","three"]);
  assert.deepEqual(Object.keys(calls[0].data),["city","postal_code"]);
});
test("partial failure reports exactly how many drafts were saved",async()=>{
  let visited=0;
  const api={
    async listItems(){return[{id:"a"},{id:"b"},{id:"c"}]},
    async updateItem(){visited++;if(visited===2)throw Error("Verbindung unterbrochen")}
  };
  await assert.rejects(applySharedFields(api,"batch",{condition:"used"}),err=>{
    assert.match(err.message,/gespeichert: 1 von 3/);
    assert.equal(err.updated,1);assert.equal(err.total,3);
    return true;
  });
  assert.equal(visited,2);
});
test("missing articles and oversized batches fail closed",async()=>{
  const api={listItems:async()=>[],updateItem:async()=>{throw Error("should not call")}};
  await assert.rejects(applySharedFields(api,"batch",{city:"Luzern"}),/keine Artikel/);
  api.listItems=async()=>Array.from({length:101},(_,i)=>({id:String(i)}));
  await assert.rejects(applySharedFields(api,"batch",{city:"Luzern"}),/Zu viele/);
});
