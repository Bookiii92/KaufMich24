// Static checks only. Does not validate PostgreSQL execution or effective RLS.
import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";
const sql=readFileSync(new URL("./review-only-private-drafts.sql",import.meta.url),"utf8");
const checks=[
  ["private bucket", /VALUES\('km24-bulk-draft-photos','km24-bulk-draft-photos',false,10485760/],
  ["RLS enabled for batches", /ALTER TABLE public\.km24_bulk_draft_batches ENABLE ROW LEVEL SECURITY/],
  ["RLS enabled for items", /ALTER TABLE public\.km24_bulk_draft_items ENABLE ROW LEVEL SECURITY/],
  ["RLS enabled for photos", /ALTER TABLE public\.km24_bulk_draft_photos ENABLE ROW LEVEL SECURITY/],
  ["business restrictions", /p\.account_type IN \('business','dealer'\)/],
  ["active account requirement", /private\.is_account_active/],
  ["contact requirement", /private\.has_marketplace_contact/],
  ["photo quota", /Maximal 100 Bilder pro Import/],
  ["item quota", /Maximal 100 Artikel pro Import/],
  ["open import quota", /Maximal fünf offene Foto-Importe/],
  ["photo path restriction", /split_part\(object_name,'\/',1\) = owner_id::text/],
  ["immutable item batch", /NEW\.batch_id IS DISTINCT FROM OLD\.batch_id/],
  ["immutable ownership", /NEW\.owner_id IS DISTINCT FROM OLD\.owner_id/],
  ["no bucket reuse", /Draft bucket already exists/],
  ["owner folder storage policy", /p\.object_name = name AND p\.owner_id = \(SELECT auth\.uid\(\)\)/],
  ["not granted to anon", /REVOKE ALL ON public\.km24_bulk_draft_batches,public\.km24_bulk_draft_items,public\.km24_bulk_draft_photos FROM PUBLIC,anon/],
  ["serialized photo inserts", /-- Always lock the batch BEFORE the item/]
];
for(const [name,pattern] of checks){assert.match(sql,pattern,"Missing: "+name);console.log("PASS "+name)}
console.log(checks.length+" statische SQL-Sicherheitsprüfungen bestanden.");
