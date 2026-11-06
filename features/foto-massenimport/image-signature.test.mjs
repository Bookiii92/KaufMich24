import test from "node:test";
import assert from "node:assert/strict";
import {verifyImageSignature} from "./image-signature.mjs";
function file(type,bytes) {
  return new Blob([new Uint8Array(bytes)],{type});
}
const jpeg=[255,216,255,224,0,16,74,70,73,70,0,0];
const png=[137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82];
const webp=[82,73,70,70,14,0,0,0,87,69,66,80,86,80,56,32];
test("accepts JPEG PNG WebP actual magic bytes",async()=>{
  assert.equal(await verifyImageSignature(file("image/jpeg",jpeg)),"jpg");
  assert.equal(await verifyImageSignature(file("image/png",png)),"png");
  assert.equal(await verifyImageSignature(file("image/webp",webp)),"webp");
});
test("rejects MIME spoofing and non-images before uploading",async()=>{
  await assert.rejects(verifyImageSignature(file("image/png",jpeg)),/stimmt nicht/);
  await assert.rejects(verifyImageSignature(file("image/jpeg",[60,115,118,103,62])),/stimmt nicht/);
  await assert.rejects(verifyImageSignature(file("image/webp",[82,73,70,70,1,2,3,4,0,0,0,0])),/stimmt nicht/);
});
test("rejects HEIC until browser conversion is implemented",async()=>{
  await assert.rejects(verifyImageSignature(file("image/heic",jpeg)),/Nur JPG/);
});
test("does not trust objects missing readable binary content",async()=>{
  await assert.rejects(verifyImageSignature({type:"image/jpeg",size:100}),/nicht geprüft/);
});
