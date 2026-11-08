/**
 * KaufMich24 – deterministic static staging build from a backed-up production HTML snapshot.
 * Run: node tools/scaling/extract-assets.mjs
 * Creates dist/index.html and immutable dist/assets/*
 *
 * The source is deliberately stored in chunks because GitHub Contents has a size limit.
 * This build DOES NOT modify the live Supabase snapshot or publish the website.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";

const root = resolve("tools/scaling/snapshot");
const output = resolve(process.argv[2] || "dist");
const expectedMd5 = "4b53308e2ab73e16269b89c692ae7679";
const files = readdirSync(root).filter(x => /^part-\d{3}\.html\.txt$/.test(x)).sort();
if (files.length !== 10) throw new Error("Expected 10 source parts; found " + files.length);
const input = files.map(f => readFileSync(join(root, f), "utf8")).join("");
function md5(txt) { return createHash("md5").update(txt, "utf8").digest("hex"); }
if (md5(input) !== expectedMd5) throw new Error("Original HTML checksum mismatch; refuse to build");
mkdirSync(join(output, "assets"), { recursive: true });

const manifest = {
  sourceMd5: expectedMd5,
  originalBytes: Buffer.byteLength(input),
  extractedScripts: 0,
  extractedStyles: 0,
  skippedScripts: 0,
  skippedStyles: 0,
  assets: []
};
const replacements = new Map();
function extract(ext, body, originalTag, tagFactory) {
  const sha = createHash("sha256").update(body, "utf8").digest("hex").slice(0, 16);
  const filename = "km24-" + sha + "." + ext;
  const pathname = "/assets/" + filename;
  const dest = join(output, "assets", filename);
  if (!existsSync(dest)) writeFileSync(dest, body, "utf8");
  const tag = tagFactory(pathname);
  if (!manifest.assets.includes(pathname)) manifest.assets.push(pathname);
  replacements.set(tag, originalTag);
  return tag;
}

// Only attribute-free classic scripts: do not change script tags that are
// referenced by ID, are JSON-LD/import maps, or have async/defer/module flags.
let html = input.replace(/<script>([\s\S]*?)<\/script\s*>/gi, (whole, js) => {
  const safe = js.length > 1024 && !/document\.currentScript|document\.write\s*\(|sourceMappingURL/.test(js);
  if (!safe) { manifest.skippedScripts++; return whole; }
  manifest.extractedScripts++;
  return extract("js", js, whole, path => '<script src="' + path + '"></script>');
});

// Separate only attribute-free style elements. Preserve source order and leave
// dynamic styles (with IDs) untouched. Relative URLs have different resolution
// rules in external stylesheets and are therefore not moved.
html = html.replace(/<style>([\s\S]*?)<\/style\s*>/gi, (whole, css) => {
  const relativeUrl = /url\(\s*['"]?(?!\/|https?:|data:|#)[^)'"]+/i.test(css);
  const safe = css.length > 1024 && !relativeUrl && !/@import\b|@charset\b/i.test(css);
  if (!safe) { manifest.skippedStyles++; return whole; }
  manifest.extractedStyles++;
  return extract("css", css, whole, path => '<link rel="stylesheet" href="' + path + '">');
});

// Exact source equivalence test: restoring extracted elements yields the same
// code-point sequence, including all Cookie Joe, login, listing and chat code.
let restored = html;
for (const [tag, original] of replacements) restored = restored.replace(tag, original);
if (restored !== input) throw new Error("Source equivalence check FAILED");
if (!manifest.extractedScripts || !manifest.extractedStyles) throw new Error("Nothing extracted");

writeFileSync(join(output, "index.html"), html, "utf8");
manifest.htmlBytes = Buffer.byteLength(html);
manifest.extractedBytes = manifest.originalBytes - manifest.htmlBytes;
manifest.htmlMd5 = md5(html);
manifest.sourceEquivalent = true;
writeFileSync(join(output, "assets-manifest.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log(JSON.stringify(manifest, null, 2));
