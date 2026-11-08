/**
 * KaufMich24 static-asset extraction (STAGING ONLY).
 *
 * node tools/scaling/extract-assets.mjs /path/to/live-snapshot.html ./dist
 *
 * Preserves DOM order and inline script execution position. Extracts only classic
 * scripts without attributes, whose code doesn't reference document.currentScript,
 * document.write or inline source maps. Every extracted script is loaded synchronously.
 * Existing id=, nonce=, type=, defer= and async= scripts remain untouched.
 * A staging browser regression test is required before serving dist publicly.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";

const [source, outputArg] = process.argv.slice(2);
if (!source || !outputArg) {
  console.error("Usage: node tools/scaling/extract-assets.mjs <snapshot.html> <output-dir>");
  process.exit(2);
}
const output = resolve(outputArg);
const input = readFileSync(source, "utf8");
mkdirSync(join(output, "assets"), { recursive: true });
const stats = { initialBytes: Buffer.byteLength(input), extractedScripts: 0, extractedStyles: 0, skippedScripts: 0, assets: [] };
const assetPrefix = "/assets/";

function putAsset(ext, payload) {
  const sha = createHash("sha256").update(payload, "utf8").digest("hex").slice(0, 16);
  const name = "km24-" + sha + "." + ext;
  const filepath = join(output, "assets", name);
  if (!existsSync(filepath)) writeFileSync(filepath, payload, "utf8");
  if (!stats.assets.includes(assetPrefix + name)) stats.assets.push(assetPrefix + name);
  return assetPrefix + name;
}

// Extract plain classic inline scripts. Do not alter type=module or inline
// JSON-LD, import maps, dynamically addressed script tags, or inline bootstraps
// referring to document.currentScript. External scripts remain at the same position.
let html = input.replace(/<script>([\s\S]*?)<\/script\s*>/gi, (whole, js) => {
  if (js.length < 1024 || /document\.currentScript|document\.write\s*\(|sourceMappingURL/.test(js)) {
    stats.skippedScripts++; return whole;
  }
  const file = putAsset("js", js);
  stats.extractedScripts++;
  return '<script src="' + file + '"></script>';
});

// Join adjacent, unadorned <style> tags only when at least 3 are consecutive.
// Separating non-adjacent CSS would alter the cascade and is intentionally avoided.
// Tags with id, media, nonce or other attributes are left in place.
html = html.replace(/(?:<style>([\s\S]*?)<\/style\s*>\s*){3,}/gi, block => {
  const css = [];
  block.replace(/<style>([\s\S]*?)<\/style\s*>/gi, (_, x) => { css.push(x); return ""; });
  if (css.length < 3 || css.some(x => /@import\b|@charset\b/.test(x))) return block;
  const payload = css.join("\n/* --- original style boundary --- */\n");
  const file = putAsset("css", payload);
  stats.extractedStyles += css.length;
  return '<link rel="stylesheet" href="' + file + '">\n';
});

writeFileSync(join(output, "index.html"), html, "utf8");
stats.resultBytes = Buffer.byteLength(html);
stats.bytesRemovedFromHtml = stats.initialBytes - stats.resultBytes;
writeFileSync(join(output, "assets-manifest.json"), JSON.stringify(stats, null, 2) + "\n");
console.log(JSON.stringify(stats, null, 2));
