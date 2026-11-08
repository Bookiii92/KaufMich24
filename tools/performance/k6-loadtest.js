// KaufMich24 – read-only synthetic HTTP load test (k6)
// Never point this at kaufmich24.ch or at a staging proxy that forwards to production.
// Required: a dedicated isolated test server with /__loadtest/identity endpoint.
import http from "k6/http";
import { check, sleep, fail } from "k6";
import { Trend, Rate } from "k6/metrics";

const pages = new Trend("km24_page_ms", true);
const appErrors = new Rate("km24_app_errors");
const BASE = String(__ENV.BASE_URL || "").replace(/\/+$/, "");
const VERIFIED_TOKEN = String(__ENV.ISOLATED_TEST_APPROVED || "");
const TEST_LISTING_PATH = String(__ENV.TEST_LISTING_PATH || "");

export const options = {
  discardResponseBodies: true,
  stages: [
    { duration: "25s", target: 25 },
    { duration: "45s", target: 25 },
    { duration: "25s", target: 50 },
    { duration: "45s", target: 50 },
    { duration: "25s", target: 100 },
    { duration: "45s", target: 100 },
    { duration: "25s", target: 250 },
    { duration: "45s", target: 250 },
    { duration: "20s", target: 0 }
  ],
  thresholds: {
    http_req_failed: [{ threshold: "rate<0.02", abortOnFail: true, delayAbortEval: "20s" }],
    http_req_duration: [{ threshold: "p(95)<2500", abortOnFail: true, delayAbortEval: "20s" }],
    km24_app_errors: ["rate<0.02"]
  },
  noConnectionReuse: false,
  userAgent: "KaufMich24-Isolated-LoadTest/1.0"
};

function guardedBase() {
  if (VERIFIED_TOKEN !== "YES_ISOLATED_FROM_PRODUCTION") fail("Explicit isolation approval missing");
  const parsed = /^(https?):\/\/([a-z0-9.-]+)(?::[0-9]{2,5})?$/i.exec(BASE);
  if (!parsed) fail("BASE_URL must be a plain staging origin with no path or query");
  const hostname = parsed[2].toLowerCase();
  if (/^(www\.)?kaufmich24\.ch$/.test(hostname) || hostname.endsWith(".supabase.co")) fail("PRODUCTION NOT ALLOWED");
  const local = ["localhost", "127.0.0.1"].includes(hostname);
  const staging = hostname.includes("staging") && (hostname.endsWith(".up.railway.app") || hostname.endsWith(".vercel.app"));
  if (!local && !staging) fail("Only local or staging subdomains are allowed");
  return BASE;
}

export function setup() {
  const base = guardedBase();
  const response = http.get(base + "/__loadtest/identity", { timeout: "5s", responseType: "text" });
  if (response.status !== 200) fail("Isolation identity endpoint missing");
  let data;
  try { data = JSON.parse(response.body); } catch (_) { fail("Invalid isolation identity"); }
  if (data.environment !== "isolated-staging" || data.production_connected !== false || data.isolated !== true) {
    fail("Test endpoint does not prove isolation");
  }
  if (!data.database_ref || data.database_ref === "aaqqcnrnrvybboirrrtd") {
    fail("Test DB is missing or points at KaufMich24 production!");
  }
  return { base };
}

export default function (context) {
  const paths = ["/"];
  if (/^\/listing\/[a-zA-Z0-9-]+$/.test(TEST_LISTING_PATH)) paths.push(TEST_LISTING_PATH);
  const path = paths[(__ITER + __VU) % paths.length];
  const res = http.get(context.base + path, {
    timeout: "10s",
    redirects: 0,
    tags: { route: path.startsWith("/listing/") ? "listing" : "home" }
  });
  pages.add(res.timings.duration);
  const ok = check(res, {
    "HTTP 200": r => r.status === 200,
    "text/html": r => String(r.headers["Content-Type"] || "").includes("text/html")
  });
  appErrors.add(!ok);
  sleep(1.5 + Math.random() * 2.5);
}
