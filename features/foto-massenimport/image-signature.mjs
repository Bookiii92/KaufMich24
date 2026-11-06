// File-content inspection for the private photo import. No image decoding/AI.
const MAGIC = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};
export async function verifyImageSignature(file) {
  const type = String(file?.type||"").toLowerCase();
  if (!Object.hasOwn(MAGIC,type)) throw new Error("Nur JPG, PNG oder WebP erlaubt.");
  if (typeof file?.slice !== "function") throw new Error("Bilddaten können nicht geprüft werden.");
  let buf;
  try {
    buf = await file.slice(0,16).arrayBuffer();
  } catch (_) {
    throw new Error("Foto konnte nicht gelesen werden.");
  }
  const b = new Uint8Array(buf);
  const isJpeg = b.length >= 3 && b[0]===0xff && b[1]===0xd8 && b[2]===0xff;
  const isPng = b.length>=8 && [137,80,78,71,13,10,26,10].every((n,i)=>b[i]===n);
  const isWebp = b.length>=12 && [82,73,70,70].every((n,i)=>b[i]===n)
      && [87,69,66,80].every((n,i)=>b[i+8]===n);
  if (!((type==="image/jpeg" && isJpeg) ||
      (type==="image/png" && isPng) ||
      (type==="image/webp" && isWebp))) {
    throw new Error("Bilddatei stimmt nicht mit dem Format überein.");
  }
  return MAGIC[type];
}
