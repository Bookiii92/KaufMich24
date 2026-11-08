# KaufMich24 skalierbar machen – Phase 1 + 2

**Stand:** 8. November 2026. Keine Umstellung von kaufmich24.ch auf diese Branch-Version.

## Bereits umgesetzt auf Supabase Pro (Produktion)
Vier gezielte, reversible Indizes in Migration `km24_scaling_read_indexes_20261108`:

```sql
CREATE INDEX IF NOT EXISTS km24_listings_status_updated_20261108_idx
  ON public.listings(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS km24_bulk_items_category_20261108_idx
  ON public.km24_bulk_draft_items(category_slug);
CREATE INDEX IF NOT EXISTS km24_bulk_items_batch_owner_20261108_idx
  ON public.km24_bulk_draft_items(batch_id, owner_id);
CREATE INDEX IF NOT EXISTS km24_bulk_photos_item_batch_owner_20261108_idx
  ON public.km24_bulk_draft_photos(item_id, batch_id, owner_id);
```

Keine Daten geändert. Nach Migration: alle vier Indizes nachgewiesen, Inseratanzahl unverändert (179). Der Planner nutzt auf dem noch kleinen Bestand einen anderen Index; neue Indexnutzung wird erst beim Wachstum messbar.

## Frontend-Aufteilung: nur vorbereitet
`node tools/scaling/extract-assets.mjs snapshot.html dist` extrahiert grössere klassische Inline-Skripte in nach Inhalt benannte JS-Dateien, lässt Bootstrap- und Spezialskripte inline und bündelt direkt benachbarte unbenannte CSS-Blöcke. Es gibt ein `dist/index.html` und ein `assets-manifest.json`. Die Anwendung muss auf einer **isolierten Staging-Instanz** getestet werden, bevor sie live geht.

**Caching-Ziel:** Assets mit unveränderlichem Hash im Dateinamen via CDN: `public,max-age=31536000,immutable`; HTML dagegen mit kurzer Cache-Dauer bzw. revalidation, damit Inserate und neue Releases aktuell bleiben.

**Wichtige Einschränkung:** Ein automatisches Verschieben von Inline-JavaScript kann Verhalten verändern, z. B. bei `document.currentScript`, CSP oder einer Browser-Ausführung bevor Dateien ausgeliefert sind. Keine produktive Aktivierung ohne Regressionstests (Startseite, Suche, Inseratdetail, Zurück/Scrollposition, Login, Registrierung, Jobs, Auktionen, Chat, Fotos, Zahlungen, Cookie Joe, Mobilbrowser).

## Weitere Schritte
1. Unveränderten Live-Snapshot exportieren, Build in isolierter Preview ausführen.
2. Browser-Regressionsprüfung und Netzwerkvergleich (erste und zweite Seitenansicht).
3. Suche und Listen seitenweise laden – erst mit echten Pagination-Controls, damit keine Angebote verschwinden. Der aktuelle Aufruf `search_marketplace_v3` verwendet `p_limit:100`. Nicht blind auf 20 reduzieren.
4. Test mit getrenntem Supabase-System und schrittweisen 25/50/100/250 Besuchern – erst nach ausdrücklicher Kostenfreigabe.

## Rollback
```sql
DROP INDEX IF EXISTS public.km24_listings_status_updated_20261108_idx;
DROP INDEX IF EXISTS public.km24_bulk_items_category_20261108_idx;
DROP INDEX IF EXISTS public.km24_bulk_items_batch_owner_20261108_idx;
DROP INDEX IF EXISTS public.km24_bulk_photos_item_batch_owner_20261108_idx;
```
