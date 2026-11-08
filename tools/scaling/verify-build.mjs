/**
 * Verification after: node tools/scaling/extract-assets.mjs
 * This is a static build validation, NOT an interactive browser test.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

const dist = resolve(process.argv[2] || "dist");
const manifest = JSON.parse(readFileSync(join(dist, "assets-manifest.json"), "utf8"));
const html = readFileSync(join(dist, "index.html"), "utf8");
const digest = text => createHash("md5").update(text, "utf8").digest("hex");
if (!manifest.sourceEquivalent || manifest.sourceMd5 !== "4b53308e2ab73e16269b89c692ae7679") throw new Error("Source verification missing");
if (digest(html) !== manifest.htmlMd5) throw new Error("Built HTML checksum mismatch");
if (manifest.extractedScripts < 1 || manifest.extractedStyles < 1) throw new Error("Missing extracted assets");
for (const pathname of manifest.assets) {
  if (!/^\/assets\/km24-[a-f0-9]{16}\.(css|js)$/.test(pathname)) throw new Error("Unsafe asset path: " + pathname);
  const file = join(dist, pathname.slice(1));
  if (!existsSync(file)) throw new Error("Asset not found: " + pathname);
  if (pathname.endsWith(".js")) {
    const parse = spawnSync(process.execPath, ["--check", file], { encoding: "utf8", timeout: 15000 });
    if (parse.status !== 0) throw new Error("JS syntax error: " + pathname + "\n" + parse.stderr);
    if (!html.includes('src="' + pathname + '"')) throw new Error("JS not referenced: " + pathname);
  } else if (!html.includes('href="' + pathname + '"')) throw new Error("CSS not referenced: " + pathname);
}
if (!html.includes("km24ScrollReturn") || !html.includes("km24ScheduleRoute")) {
  // The navigation code may live in an extracted asset.
  const js = manifest.assets.filter(p => p.endsWith(".js")).map(p => readFileSync(join(dist, p.slice(1)), "utf8")).join("\n");
  if (!js.includes("km24ScrollReturn") || !js.includes("km24ScheduleRoute")) {
    throw new Error("Navigation or scroll restore unexpectedly missing");
  }
}
const report = {
  sourceBytes: manifest.originalBytes,
  htmlBytes: manifest.htmlBytes,
  savedHtmlBytes: manifest.extractedBytes,
  savedPercent: +((manifest.extractedBytes / manifest.originalBytes) * 100).toFixed(1),
  assets: manifest.assets.length,
  sourceEquivalent: true,
  jsSyntaxChecked: true,
  results: "STATIC_BUILD_VALIDATED; browser tests still required"
};
console.log(JSON.stringify(report, null, 2));
