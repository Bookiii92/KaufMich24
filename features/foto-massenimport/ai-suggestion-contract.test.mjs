import test from "node:test";
import assert from "node:assert/strict";
import {normalizePhotoSuggestion,isReviewedSuggestion} from "./ai-suggestion-contract.mjs";
test("untrusted AI never sets prices, stock or condition",()=>{
 const result=normalizePhotoSuggestion({
  title:"Holzspielzeug",description:"Holzspielzeug für Kinder aus Naturholz",
  category_slug:"spielzeug",price_chf:0.01,condition:"new",stock_quantity:999
 },["spielzeug","moebel"]);
 assert.equal(result.price_chf,null);
 assert.equal(result.stock_quantity,null);
 assert.equal(result.condition,null);
 assert.equal(result.reviewed,false);
 assert.equal(result.review_required,true);
});
test("unknown category must be confirmed by seller",()=>{
 const result=normalizePhotoSuggestion({title:"Babybett",description:"Kinderbett aus Holz",category_slug:"other"},["moebel"]);
 assert.equal(result.category_slug,null);
 assert.ok(result.warnings.some(w=>w.includes("Kategorie")));
});
test("long or non-string AI text is reduced safely",()=>{
 const x=normalizePhotoSuggestion({title:"a".repeat(800),description:42},[]);
 assert.equal(x.title.length,120);
 assert.equal(x.description,"");
});
test("suggestion is never approved without explicit complete seller review",()=>{
 const x=normalizePhotoSuggestion({title:"Spielzeug",description:"Plüschbär aus Stoff",category_slug:"spielzeug"},["spielzeug"]);
 const good={confirmed:true,title:"Plüschbär",description:"Plüschbär in gutem Zustand",price_chf:"15,90",condition:"used",category_slug:"spielzeug"};
 assert.equal(isReviewedSuggestion(x,{...good,confirmed:false}),false);
 assert.equal(isReviewedSuggestion(x,{...good,price_chf:"-1"}),false);
 assert.equal(isReviewedSuggestion(x,good),true);
});
