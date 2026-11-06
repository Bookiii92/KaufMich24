import test from "node:test";
import assert from "node:assert/strict";
import {eligibleFirmAccount,openPhotoBulkRoute,PHOTO_IMPORT_ROUTE} from "./spa-photo-route-bridge.mjs";

const A="11111111-1111-4111-8111-111111111111";
const client={auth:{async getUser(){return{data:{user:{id:A}}}}}};
const root={replaceChildren(){}};
test("only verified business and dealer identities are eligible",()=>{
  assert.equal(PHOTO_IMPORT_ROUTE,"#/foto-massenimport");
  assert.equal(eligibleFirmAccount({id:A},{id:A,account_type:"business"}),true);
  assert.equal(eligibleFirmAccount({id:A},{id:A,account_type:"dealer"}),true);
  assert.equal(eligibleFirmAccount({id:A},{id:A,account_type:"private"}),false);
  assert.equal(eligibleFirmAccount({id:A},{id:"other",account_type:"dealer"}),false);
});
test("unauthenticated users redirect without loading sensitive module",async()=>{
  const to=[];let loaded=0;
  const r=await openPhotoBulkRoute({root,client,user:null,profile:null,navigate:x=>to.push(x),loadPanel:async()=>{loaded++;return{}}});
  assert.equal(r.mounted,false);assert.deepEqual(to,["#/login"]);assert.equal(loaded,0);
});
test("private profiles redirect without loading import module",async()=>{
  const to=[];let loaded=0;
  const r=await openPhotoBulkRoute({root,client,user:{id:A},profile:{id:A,account_type:"private"},navigate:x=>to.push(x),loadPanel:async()=>{loaded++;return{}}});
  assert.equal(r.mounted,false);assert.deepEqual(to,["#/business"]);assert.equal(loaded,0);
});
test("business route mounts only after authenticating the current session",async()=>{
  let mounted=0,loaded=0,gotClient=null;
  const r=await openPhotoBulkRoute({root,client,user:{id:A},profile:{id:A,account_type:"business"},
    loadPanel:async()=>{loaded++;return{mountPhotoDraftPanel:async args=>{mounted++;gotClient=args.supabaseClient}}}});
  assert.equal(r.mounted,true);assert.equal(loaded,1);assert.equal(mounted,1);assert.equal(gotClient,client);
});
test("changing route during async import prevents mounting",async()=>{
  let n=0,mounted=0;
  const r=await openPhotoBulkRoute({root,client,user:{id:A},profile:{id:A,account_type:"dealer"},
    isRouteActive:()=>++n===1,
    loadPanel:async()=>({mountPhotoDraftPanel:async()=>{mounted++}})});
  assert.equal(r.mounted,false);assert.equal(r.reason,"route_changed");assert.equal(mounted,0);
});
test("expired or mismatched JWT session never mounts",async()=>{
 const stale={auth:{async getUser(){return{data:{user:{id:"22222222-2222-4222-8222-222222222222"}}}}}};
 let loaded=0;const to=[];
 const r=await openPhotoBulkRoute({root,client:stale,user:{id:A},profile:{id:A,account_type:"dealer"},
   navigate:x=>to.push(x),loadPanel:async()=>{loaded++;return{}}});
 assert.equal(r.mounted,false);assert.equal(r.reason,"session_expired");assert.equal(loaded,0);
 assert.deepEqual(to,["#/login"]);
});
