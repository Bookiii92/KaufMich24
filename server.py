import os
import gzip
import urllib.request
import urllib.error
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlsplit

PORT = int(os.environ.get("PORT", "8080"))
UPSTREAM_URL = os.environ.get(
    "UPSTREAM_URL",
    "https://aaqqcnrnrvybboirrrtd.supabase.co/functions/v1/kaufmich-app"
).rstrip("/")

# Security migration:
# The old messages view queried public.profiles directly.
# These replacements route that lookup through the restricted public seller RPC.
PROFILE_QUERY_OLD = 'pids.length?db.from("profiles").select("id,display_name,business_name").in("id",pids):Promise.resolve({data:[]})'
PROFILE_QUERY_NEW = 'pids.length?db.rpc("seller_cards_public",{p_seller_ids:pids}):Promise.resolve({data:[]})'
PROFILE_MAP_OLD = '(pq.data||[]).forEach(x=>profiles[x.id]=x)'
PROFILE_MAP_NEW = '(pq.data||[]).forEach(x=>profiles[x.seller_id]=x)'

MANIFEST_LINK = '<link rel="manifest" href="/manifest.webmanifest">'

def patch_frontend(html: str) -> str:
    html = html.replace(PROFILE_QUERY_OLD, PROFILE_QUERY_NEW)
    html = html.replace(PROFILE_MAP_OLD, PROFILE_MAP_NEW)

    if 'rel="manifest"' not in html and "</head>" in html:
        html = html.replace("</head>", MANIFEST_LINK + "</head>", 1)

    return html

def fetch_upstream(query: str = "") -> bytes:
    url = UPSTREAM_URL + (("?" + query) if query else "")
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "KaufMich24-Railway/1.0",
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Encoding": "gzip",
        },
    )
    with urllib.request.urlopen(req, timeout=20) as res:
        body = res.read()
        if (res.headers.get("Content-Encoding") or "").lower() == "gzip":
            body = gzip.decompress(body)
        return body

class Handler(BaseHTTPRequestHandler):
    server_version = "KaufMich24/1.0"

    def send_common_headers(self, content_type: str, content_length: int, cache: str = "no-store"):
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(content_length))
        self.send_header("Cache-Control", cache)
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        self.send_header("Cross-Origin-Opener-Policy", "same-origin-allow-popups")

    def reply_bytes(self, status: int, body: bytes, content_type: str, cache: str = "no-store"):
        self.send_response(status)
        self.send_common_headers(content_type, len(body), cache)
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def do_HEAD(self):
        self.do_GET()

    def do_GET(self):
        parsed = urlsplit(self.path)
        path = parsed.path

        if path == "/health":
            self.reply_bytes(200, b"ok", "text/plain; charset=utf-8")
            return

        local_files = {
            "/manifest.webmanifest": ("manifest.webmanifest", "application/manifest+json; charset=utf-8"),
            "/sw.js": ("sw.js", "application/javascript; charset=utf-8"),
            "/robots.txt": ("robots.txt", "text/plain; charset=utf-8"),
            "/sitemap.xml": ("sitemap.xml", "application/xml; charset=utf-8"),
            "/icon.svg": ("icon.svg", "image/svg+xml"),
        }

        if path in local_files:
            filename, ctype = local_files[path]
            file_path = os.path.join(os.path.dirname(__file__), filename)
            with open(file_path, "rb") as f:
                data = f.read()
            self.reply_bytes(200, data, ctype, "public, max-age=3600")
            return

        try:
            raw = fetch_upstream(parsed.query)
            html = raw.decode("utf-8")
            html = patch_frontend(html)

            # Safety check: the known unsafe direct SELECT must not survive.
            if PROFILE_QUERY_OLD in html:
                raise RuntimeError("Unsafe profiles query was not patched")

            self.reply_bytes(200, html.encode("utf-8"), "text/html; charset=utf-8")
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, RuntimeError) as exc:
            body = (
                "<!doctype html><html lang='de'><meta charset='utf-8'>"
                "<meta name='viewport' content='width=device-width,initial-scale=1'>"
                "<title>KaufMich24</title>"
                "<body style='font-family:system-ui;background:#171612;color:#eee;padding:32px'>"
                "<h1>KaufMich24</h1><p>Die Seite ist vorübergehend nicht erreichbar.</p>"
                "<p>Bitte in Kürze erneut versuchen.</p></body></html>"
            ).encode("utf-8")
            print("upstream error:", repr(exc), flush=True)
            self.reply_bytes(502, body, "text/html; charset=utf-8")

    def log_message(self, fmt, *args):
        print("%s - %s" % (self.address_string(), fmt % args), flush=True)

if __name__ == "__main__":
    print(f"KaufMich24 listening on :{PORT}, upstream={UPSTREAM_URL}", flush=True)
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
