import test from "node:test";import assert from "node:assert/strict";
import {inspectBusinessUploadReadiness} from "./upload-account-readiness.mjs";
const u={id:"a",email_confirmed_at:"2026-11-01T00:00:00Z"};
const p={id:"a",account_type:"business",phone:"+41791234567",street_address:"Musterstrasse 1",postal_code:"6234",city:"Triengen",address_confirmed_at:"2026-11-01"};
test("complete business or dealer profile can proceed",()=>{
 assert.equal(inspectBusinessUploadReadiness(u,p).ready,true);
 assert.equal(inspectBusinessUploadReadiness(u,{...p,account_type:"dealer"}).ready,true);
});
test("missing address and phone produce actionable errors",()=>{
 const x=inspectBusinessUploadReadiness(u,{...p,phone:"",address_confirmed_at:null,street_address:""});
 assert.equal(x.ready,false);assert.ok(x.missing.some(x=>x.includes("Telefonnummer")));
 assert.ok(x.missing.some(x=>x.includes("Strasse")));
 assert.ok(x.missing.some(x=>x.includes("Adresse")));
});
test("incomplete email and non-business profile never passes",()=>{
 assert.equal(inspectBusinessUploadReadiness({...u,email_confirmed_at:null},p).ready,false);
 assert.equal(inspectBusinessUploadReadiness(u,{...p,account_type:"private"}).ready,false);
 assert.equal(inspectBusinessUploadReadiness(u,{...p,id:"b"}).ready,false);
});
