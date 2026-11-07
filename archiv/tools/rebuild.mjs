// KaufMich24 lossless reconstruction (offline; never deploys anything)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const config = JSON.parse(read("src/manifest.json"));
const textMap = JSON.parse(read("src/texts/strings.original.json"));
let html = read("src/template.html");

function replaceOne(token, content) {
  if (!html.includes(token)) throw new Error("Missing placeholder: " + token);
  html = html.replace(token, () => content); // no $&-expansion
}
for (let n = 1; n <= config.css_files; n++) {
  const id = String(n).padStart(4, "0");
  replaceOne("__KM24_CSS_" + id + "__", read("src/styles/inline-" + id + ".css"));
}
for (let n = 1; n <= config.js_files; n++) {
  const id = String(n).padStart(4, "0");
  replaceOne("__KM24_JS_" + id + "__", read("src/scripts/inline-" + id + ".js"));
}
for (const [token, value] of Object.entries(textMap)) replaceOne(token, value);

const actualBytes = Buffer.byteLength(html, "utf8");
const actualMd5 = createHash("md5").update(html, "utf8").digest("hex");
const original = read(config.source);
if (actualBytes !== config.source_utf8_bytes || actualMd5 !== config.source_md5 || html !== original) {
  throw new Error("FAILED: assembled file does not exactly match original");
}
console.log("PASS: " + config.css_files + " CSS, " + config.js_files +
  " JS, " + config.text_nodes + " text sections; byte-for-byte identical (" + actualBytes + " bytes)");
if (process.argv.includes("--write")) {
  const target = path.join(root, "dist", "index.html");
  fs.mkdirSync(path.dirname(target), {recursive:true});
  fs.writeFileSync(target, html, "utf8");
  console.log("Written to " + target + " (not deployed)");
}
