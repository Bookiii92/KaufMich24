const CACHE = "kaufmich24-shell-v1";
self.addEventListener("install", event => {
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", event => {
  // Network-first. The marketplace data itself stays live in Supabase.
});
