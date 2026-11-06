// Explicit one-click common fields for private photo-import drafts.
// Does not create listings or upload images. Each update remains owner-RLS-protected.
const CANTONS = new Set(["AG","AI","AR","BE","BL","BS","FR","GE","GL","GR","JU","LU","NE","NW","OW","SG","SH","SO","SZ","TG","TI","UR","VD","VS","ZG","ZH"]);
const CONDITIONS = new Set(["new","like_new","used","defective"]);

export function normalizeSharedFields(raw) {
  if(!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Ungültige gemeinsame Angaben.");
  const patch = {};
  const category = String(raw.category_slug ?? "").trim();
  if(category) {
    if(!/^[a-z0-9_]{2,80}$/.test(category)) throw new Error("Ungültige Kategorie.");
    patch.category_slug = category;
  }
  const condition = String(raw.condition ?? "").trim();
  if(condition) {
    if(!CONDITIONS.has(condition)) throw new Error("Ungültiger Zustand.");
    patch.condition = condition;
  }
  const city = String(raw.city ?? "").trim();
  if(city) {
    if(city.length > 150) throw new Error("Ortsname zu lang.");
    patch.city = city;
  }
  const zip = String(raw.postal_code ?? "").trim();
  if(zip) {
    if(!/^\d{4}$/.test(zip)) throw new Error("Bitte eine vierstellige Schweizer PLZ eingeben.");
    patch.postal_code = zip;
  }
  const canton = String(raw.canton ?? "").trim().toUpperCase();
  if(canton) {
    if(!CANTONS.has(canton)) throw new Error("Ungültiger Kanton.");
    patch.canton = canton;
  }
  if(!Object.keys(patch).length) throw new Error("Bitte mindestens eine gemeinsame Angabe auswählen.");
  return patch;
}

export async function applySharedFields(api, batchId, raw, onProgress = () => {}) {
  if(!api || typeof api.listItems !== "function" || typeof api.updateItem !== "function")
    throw new Error("Privater Foto-Import ist nicht verfügbar.");
  const patch = normalizeSharedFields(raw);
  const items = await api.listItems(batchId);
  if(!Array.isArray(items)) throw new Error("Die Entwürfe konnten nicht geladen werden.");
  if(items.length === 0) throw new Error("Noch keine Artikel vorhanden.");
  if(items.length > 100) throw new Error("Zu viele Artikel in diesem Import.");
  let updated = 0;
  for (const item of items) {
    if(!item || typeof item.id !== "string") throw new Error("Ungültiger Artikel im Import.");
    try {
      await api.updateItem(item.id, patch);
    } catch (e) {
      const err = new Error(String(e?.message || e) + " (gespeichert: " + updated + " von " + items.length + ").");
      err.updated = updated;
      err.total = items.length;
      throw err;
    }
    updated++;
    onProgress(updated, items.length);
  }
  return {updated, total:items.length, changedFields:Object.keys(patch)};
}
