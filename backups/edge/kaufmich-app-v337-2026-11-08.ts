import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SNAPSHOT_NAME = "live";

async function loadSnapshot() {
  const base = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!base || !serviceKey) throw new Error("Missing Supabase server configuration");
  const url = base + "/rest/v1/kaufmich_frontend_snapshots?name=eq." + encodeURIComponent(SNAPSHOT_NAME) + "&select=html,updated_at&limit=1";
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      "apikey": serviceKey,
      "authorization": "Bearer " + serviceKey,
      "accept": "application/json",
      "cache-control": "no-store"
    }
  });
  if (!res.ok) throw new Error("Snapshot fetch failed: " + res.status);
  const rows = await res.json();
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row || typeof row.html !== "string" || row.html.length < 1000000) throw new Error("Frontend snapshot unavailable or unexpectedly short");
  return { html: row.html, updatedAt: String(row.updated_at || "") };
}

const KM24_DETAIL_CONTRAST_FIX = "<style id=\"km24-detail-seller-contrast-v2-20261107\">\n/* Seller card: accessible contrast in light mode, scoped to listing details only. */\nhtml:not([data-km24-theme=\"dark\"]) body #app .detail .side > .panel,\nhtml:not([data-km24-theme=\"dark\"]) body #app .detail .side > .auctionbox{\n opacity:1!important;filter:none!important;color:#1f2937!important;-webkit-text-fill-color:#1f2937!important;\n}\nhtml:not([data-km24-theme=\"dark\"]) body #app .detail .side .seller,\nhtml:not([data-km24-theme=\"dark\"]) body #app .detail .side .ratingStars{\n color:#172334!important;-webkit-text-fill-color:#172334!important;opacity:1!important;text-shadow:none!important;\n}\nhtml:not([data-km24-theme=\"dark\"]) body #app .detail .side .mut,\nhtml:not([data-km24-theme=\"dark\"]) body #app .detail .side small,\nhtml:not([data-km24-theme=\"dark\"]) body #app .detail .side .km24ProTrustChip + small{\n color:#465364!important;-webkit-text-fill-color:#465364!important;opacity:1!important;filter:none!important;text-shadow:none!important;\n}\nhtml:not([data-km24-theme=\"dark\"]) body #app .detail .side .badge{\n opacity:1!important;filter:none!important;color:#26374a!important;-webkit-text-fill-color:#26374a!important;\n background-color:#edf2f7!important;border-color:#cbd5e1!important;text-shadow:none!important;\n}\nhtml:not([data-km24-theme=\"dark\"]) body #app .detail .side .km24ProTrustChip,\nhtml:not([data-km24-theme=\"dark\"]) body #app .detail .side .km24ProTrustChip :is(span,b,strong,i){\n opacity:1!important;filter:none!important;color:#294238!important;-webkit-text-fill-color:#294238!important;text-shadow:none!important;\n}\nhtml:not([data-km24-theme=\"dark\"]) body #app .detail .side .km24ProTrustChip{\n background:#f1f6f3!important;border-color:#cbded3!important;font-size:12px!important;line-height:1.35!important;\n}\nhtml:not([data-km24-theme=\"dark\"]) body #app .detail .side .km24ProTrustChip.good,\nhtml:not([data-km24-theme=\"dark\"]) body #app .detail .side .km24ProTrustChip.good :is(span,b,strong,i){\n color:#17633f!important;-webkit-text-fill-color:#17633f!important;\n}\nhtml:not([data-km24-theme=\"dark\"]) body #app .detail .side .km24ProTrustChip.good{\n background:#e8f6ee!important;border-color:#afd8bf!important;\n}\nhtml:not([data-km24-theme=\"dark\"]) body #app .detail .side .notice{\n color:#185b37!important;-webkit-text-fill-color:#185b37!important;\n background:#e4f4e9!important;background-image:none!important;border:1px solid #a5cfb5!important;\n opacity:1!important;filter:none!important;text-shadow:none!important;\n}\nhtml:not([data-km24-theme=\"dark\"]) body #app .detail .side .notice :is(span,b,strong,small,p){\n color:#185b37!important;-webkit-text-fill-color:#185b37!important;opacity:1!important;\n}\n</style>";

function sanitizeSnapshot(html: string) {
  return html
    .replace(/<style id=["']km24-global-boot-v2["']>[\s\S]*?<\/style>/gi, "")
    .replace(/<script id=["']km24-global-boot-v2-js["']>[\s\S]*?<\/script>/gi, "")
    .replace(/<style id=["']km24-refresh-no-flash-v1["']>[\s\S]*?<\/style>/gi, "")
    .replace(/classList\.add\(["']km24AppBoot["']\)/g, 'classList.remove("km24AppBoot")')
    .replace(/<meta name=["']theme-color["'] content=["'][^"']*["']>/i, '<meta name="theme-color" content="#ffffff">')
    .replace(/<meta name=["']apple-mobile-web-app-status-bar-style["'] content=["'][^"']*["']>/i, '<meta name="apple-mobile-web-app-status-bar-style" content="default">') + KM24_DETAIL_CONTRAST_FIX;
}

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="KaufMich24">
<defs>
  <linearGradient id="bg" x1="54" y1="458" x2="458" y2="54" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#071B9F"/><stop offset="0.48" stop-color="#0B63F6"/><stop offset="1" stop-color="#18E3D1"/></linearGradient>
  <linearGradient id="arm1" x1="182" y1="335" x2="418" y2="122" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0982FF"/><stop offset="0.55" stop-color="#20B9F3"/><stop offset="1" stop-color="#55F0D7"/></linearGradient>
  <linearGradient id="arm2" x1="200" y1="279" x2="414" y2="449" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0D8DFF"/><stop offset="0.52" stop-color="#20C0F3"/><stop offset="1" stop-color="#62F2D7"/></linearGradient>
  <linearGradient id="stem" x1="131" y1="393" x2="225" y2="259" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#129DFF"/><stop offset="1" stop-color="#0865E9"/></linearGradient>
  <linearGradient id="tag" x1="116" y1="126" x2="226" y2="388" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#DCEAFF"/></linearGradient>
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#00145F" flood-opacity="0.28"/></filter>
</defs>
<rect x="20" y="20" width="472" height="472" rx="108" fill="url(#bg)"/><path d="M20 288C116 242 173 173 222 20h270v151C396 196 332 248 291 318c-36 61-60 111-140 174H20V288Z" fill="#FFFFFF" opacity="0.07"/>
<g filter="url(#shadow)" transform="translate(-28 -32)"><path d="M111 164c0-31 25-56 56-56h72v88l-62 63v128h-10c-31 0-56-25-56-56V164Z" fill="url(#tag)"/><circle cx="159" cy="160" r="19" fill="#0B43D8"/><path d="M178 270 332 126c24-23 62-22 84 2 20 22 18 56-4 77L265 342 178 270Z" fill="url(#arm1)"/><path d="M180 273 233 322v68c0 37-30 67-67 67h-2c-29 0-53-24-53-53v-55l69-76Z" fill="url(#stem)"/><path d="M221 278 405 398c24 16 30 48 14 72-15 22-45 28-67 13L188 326l33-48Z" fill="url(#arm2)"/></g></svg>`;

const BADGE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><path fill="#000" d="M17 14h18v27l27-27h23L53 46l34 36H64L35 51v31H17V14Z"/></svg>`;

const SERVICE_WORKER = `
const KM24_SW_VERSION='km24-push-blue-v5';
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });
self.addEventListener('push', event => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch (_) { try { payload = { body: event.data ? event.data.text() : '' }; } catch (_) {} }
  const title = payload.title || 'KaufMich24';
  const url = payload.url || 'https://www.kaufmich24.ch/#/notifications';
  const tag = payload.tag || ('kaufmich24-' + Date.now());
  event.waitUntil(self.registration.showNotification(title, { body: payload.body || 'Du hast eine neue Benachrichtigung.', icon: '/icon.svg?v=blue-20261027', badge: '/badge.svg?v=blue-20261027', tag, renotify: true, requireInteraction: false, data: { url } }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = (event.notification && event.notification.data && event.notification.data.url) || 'https://www.kaufmich24.ch/#/notifications';
  event.waitUntil((async () => { const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true }); for (const client of list) { try { if ('navigate' in client) await client.navigate(target); return await client.focus(); } catch (_) {} } return self.clients.openWindow(target); })());
});`;

const MANIFEST = JSON.stringify({ id:"/", name:"KaufMich24", short_name:"KaufMich24", description:"Kaufen, verkaufen, Auktionen und Services in der Schweiz.", lang:"de-CH", start_url:"/", scope:"/", display:"standalone", display_override:["standalone","minimal-ui"], background_color:"#ffffff", theme_color:"#ffffff", icons:[{src:"/icon.svg?v=blue-20261027",sizes:"any",type:"image/svg+xml",purpose:"any maskable"}] });

const NO_CACHE = { "cache-control":"no-store, no-cache, must-revalidate, max-age=0", "cdn-cache-control":"no-store", "pragma":"no-cache", "expires":"0" };

Deno.serve(async (req) => {
  const path = new URL(req.url).pathname;
  if (path === "/health" || path.endsWith("/kaufmich-app/health")) return new Response("ok", { status:200, headers:{"content-type":"text/plain; charset=utf-8",...NO_CACHE,"x-km24-brand":"blue-v1","x-km24-edge":"v335-noflash"} });
  if (path === "/sw.js" || path.endsWith("/sw.js")) return new Response(SERVICE_WORKER,{headers:{"content-type":"application/javascript; charset=utf-8",...NO_CACHE,"service-worker-allowed":"/","x-km24-brand":"blue-v1","x-km24-edge":"v335-noflash"}});
  if (path === "/manifest.webmanifest" || path.endsWith("/manifest.webmanifest")) return new Response(MANIFEST,{headers:{"content-type":"application/manifest+json; charset=utf-8",...NO_CACHE,"x-km24-brand":"blue-v1","x-km24-edge":"v335-noflash"}});
  if (path === "/icon.svg" || path.endsWith("/icon.svg")) return new Response(ICON,{headers:{"content-type":"image/svg+xml; charset=utf-8",...NO_CACHE,"x-km24-brand":"blue-v1","x-km24-edge":"v335-noflash"}});
  if (path === "/badge.svg" || path.endsWith("/badge.svg")) return new Response(BADGE,{headers:{"content-type":"image/svg+xml; charset=utf-8",...NO_CACHE,"x-km24-brand":"blue-v1","x-km24-edge":"v335-noflash"}});
  try {
    const { html, updatedAt } = await loadSnapshot();
    const safeHtml = sanitizeSnapshot(html);
    return new Response(safeHtml,{status:200,headers:{"content-type":"text/html; charset=utf-8",...NO_CACHE,"vary":"accept-encoding","x-km24-snapshot":SNAPSHOT_NAME,"x-km24-snapshot-updated":updatedAt,"x-km24-brand":"blue-v1","x-km24-edge":"v335-noflash","x-km24-refresh-fix":"noflash-v3"}});
  } catch (err) {
    console.error("KaufMich24 snapshot serve failed",err);
    return new Response("KaufMich24 wird kurz aktualisiert. Bitte neu laden.",{status:503,headers:{"content-type":"text/plain; charset=utf-8",...NO_CACHE}});
  }
});