# KaufMich24 – Frontend aufteilen (Phase 1)

Stand: 8. November 2026. **Nur GitHub-Testzweig, kein Live-Deployment.**

## Quellstand gesichert
- 10 vollständig gespeicherte Teile unter `tools/scaling/snapshot/`.
- Original-Snapshot aus der Supabase-Tabelle `public.kaufmich_frontend_snapshots`, `name='live'`.
- Erwartete MD5 der ursprünglichen HTML-Datei: `4b53308e2ab73e16269b89c692ae7679`.
- Originalgrösse: 2'359'558 Bytes.
- 168 `script`-Tags und 284 `style`-Tags.
- Diese Source-Dateien bitte **nicht** verändern, bis ein neuer Backup-Stand exportiert ist.

## Build durchführen (auf lokaler Kopie des Testzweigs)
```bash
node tools/scaling/extract-assets.mjs
node tools/scaling/verify-build.mjs
```

Es werden `dist/index.html`, `dist/assets/km24-<hash>.js`, `dist/assets/km24-<hash>.css` und `dist/assets-manifest.json` erzeugt. Der Builder bricht ab, falls die Quell-Dateien nicht exakt die erwartete MD5-Prüfsumme ergeben. Ausgelagerte Tags lassen sich bytegetreu wiederherstellen; auch diese Kontrolle ist eingebaut.

## Erste rein statische Prüfung
Aus dem vollständigen Quellstand wurde das aktuelle Extraktionsverfahren bereits unabhängig simuliert:
- 1 grosser JavaScript-Block und 1 grosser CSS-Block werden ausgelagert.
- Der resultierende HTML-String ist rund 417'000 UTF-16-Codeeinheiten kürzer, also ca. 18 %.
- Die Wiederherstellung der ursprünglichen HTML-Tags ist exakt gelungen.
- Cookie Joe, Authentifizierung, Chat, Jobs und Navigation wurden hierbei **nicht im Browser getestet**.

Attribute wie `id`, `type=module`, `nonce`, `async` und `defer` sowie dynamische Style-Elemente bleiben bewusst inline. Dadurch wird im ersten Schritt nur ein Teil des insgesamt 2.36 MB grossen Monolithen ausgelagert.

## Vor einer Veröffentlichung erforderlich
1. Build auf dem GitHub-Testzweig lokal ausführen, `verify-build.mjs` muss bestehen.
2. Getrennte Staging-Vorschau einrichten, ohne Schreibzugriff auf Produktionsdaten und ohne den echten Zahlungs-, E-Mail- und Push-Versand.
3. Staging muss statische `/assets/*`-Dateien ausliefern, bevor ein HTML-Router-Fallback greift.
4. Mobile und Desktop prüfen: Hell/Dunkel, Cookie Joe, Startseite, Suche, Inserat, Zurück und Scroll-Wiederherstellung, Login, Jobs, Auktionen, Chat, Fotos, Bezahlung.
5. Erst danach darf eine kontrollierte Live-Umstellung stattfinden; Rollback ist das bisherige Supabase-HTML.

## CDN-Konfiguration nach erfolgreichen Tests
- `/assets/km24-*`: `Cache-Control: public,max-age=31536000,immutable`
- HTML: `Cache-Control: no-cache` oder kurze TTL plus Revalidierung
- Keine Cache-Freigabe für nutzerspezifische oder authentifizierte APIs.

## Datenbank-Teil abgeschlossen
Migration `km24_scaling_read_indexes_20261108` hat vier gezielte Indizes erstellt. Sie sind verifiziert. Es wurden keine Inseratdatensätze geändert. Der derzeit kleine Datenbestand verwendet nicht zwingend jeden neuen Index; eine tatsächliche Beschleunigung ist noch nicht im Lasttest gemessen.
