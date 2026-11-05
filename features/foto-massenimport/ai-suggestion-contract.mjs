// Contract for a future optional AI photo analyzer.
// Does not call an AI provider, upload photos or publish listings.
const MAX_TITLE=120,MAX_DESCRIPTION=5000;
export function normalizePhotoSuggestion(raw, categorySlugs=[]) {
  if(!raw || typeof raw!=="object" || Array.isArray(raw))
    throw new Error("Ungültiger Produktvorschlag.");
  const categories=new Set(Array.from(categorySlugs).map(String));
  const warnings=[];
  const title=typeof raw.title==="string"?raw.title.trim().slice(0,MAX_TITLE):"";
  const description=typeof raw.description==="string"?raw.description.trim().slice(0,MAX_DESCRIPTION):"";
  if(title.length<3)warnings.push("Titel von Händler ergänzen");
  if(description.length<10)warnings.push("Beschreibung von Händler ergänzen");
  const category=typeof raw.category_slug==="string"&&categories.has(raw.category_slug)?
      raw.category_slug:null;
  if(!category)warnings.push("Kategorie manuell auswählen");
  // Pricing, condition, model, brand and stock cannot be trusted from a photo.
  // Always require explicit seller confirmation for every product.
  warnings.push("Preis und Zustand manuell prüfen");
  warnings.push("Produktmerkmale, Marke und Lieferbarkeit prüfen");
  return Object.freeze({
    title,description,category_slug:category,
    price_chf:null,condition:null,stock_quantity:null,
    review_required:true,reviewed:false,
    warnings:Object.freeze(warnings)
  });
}
export function isReviewedSuggestion(suggestion,sellerChanges={}) {
  if(!suggestion?.review_required || suggestion.reviewed!==false)return false;
  if(sellerChanges?.confirmed!==true)return false;
  const title=String(sellerChanges.title||"").trim();
  const description=String(sellerChanges.description||"").trim();
  const price=String(sellerChanges.price_chf??"").replace(",",".").trim();
  const condition=String(sellerChanges.condition||"");
  const category=String(sellerChanges.category_slug||"");
  return title.length>=3&&title.length<=120&&description.length>=10&&
    /^\d{1,10}(\.\d{1,2})?$/.test(price)&&
    ["new","like_new","used","defective"].includes(condition)&&category.length>0;
}
