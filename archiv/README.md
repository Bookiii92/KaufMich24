# KaufMich24 – Sicherung vor dem Aufräumen (07.11.2026)

> **Isolierte Arbeitskopie.** Dieser Branch darf nicht auf `main` gemergt oder produktiv veröffentlicht werden, bevor Sicherung, Tests und Freigabe abgeschlossen sind.

## 1. Unveränderter Ausgangsstand

- Datei: [original/frontend-live-2026-11-07.html](original/frontend-live-2026-11-07.html)
- Quelle: Supabase, Tabelle `public.kaufmich_frontend_snapshots`, Datensatz `name='live'`
- Zeitpunkt der Quelle (UTC): `2026-11-07 22:40:50.431959+00`
- UTF-8-Grösse: `2 356 200` Bytes; `2 341 386` Unicode-Zeichen
- MD5 der Datenbank-Originalzeichenfolge: `7b4d2ffd9ea2eff12f2c9bf6d9fd4fef` (ausschliesslich Integritätsvergleich, keine Sicherheits-Signatur).
- Git-Commit des unveränderten Exports: `e8aa9dacb41f06deb52773ea45600ff44e88270b`

Die Originaldatei **niemals editieren**. Refaktorierung nur in separaten Dateien. CSS-/JS-Extraktion muss einen byteidentischen Wiederaufbau ermöglichen.

## 2. Architektur (bestätigte Bestandteile)

| Dienst | Funktion |
| --- | --- |
| Supabase | PostgreSQL 17, Authentifizierung, Storage und Edge Functions. Die Function `kaufmich-app` liest den aktiven HTML-Snapshot `live` aus der Datenbank, ergänzt ggf. Server-Injektionen und liefert HTML. Weitere Edge Functions bearbeiten u. a. Nachrichten, Push, SEO und Zahlungsflüsse. Projekt-Ref: `aaqqcnrnrvybboirrrtd`. |
| Railway | Python-Proxy/Webdienste und Weiterleitungen. Projekt `KaufMich` mit u. a. `kaufmich-production-new` (GitHub `Bookiii92/KaufMich24`, Dockerfile/Python), `kaufmich-web` und `kaufmich-www` (Python-Proxy aus Dienstkonfiguration). |
| Vercel | Projekte `kaufmich24-migration`, `kaufmich24-proxy`, `kaufmich24-seo-proxy` und weitere Test-/Installationsprojekte. `kaufmich24.ch` und `www.kaufmich24.ch` sind beim Projekt `kaufmich24-migration` eingetragen. Die tatsächliche DNS-/Live-Routing-Zuständigkeit ist separat zu prüfen (Schritt 3). |
| Stripe | Zahlungsanbieter. KaufMich24 enthält Supabase Edge Functions für Checkout, Webhooks und die Abrechnungsverwaltung. Geheimschlüssel dürfen nur serverseitig liegen und niemals in Dateien im öffentlichen Repository. |
| GitHub | Codeverwaltung: `Bookiii92/KaufMich24` (Railway-Basis), `Bookiii92/kaufmich24-android` (Android, private TWA-App); andere Projekte existieren ebenfalls. |

## 3. Frontend-Technik

Der produktive Frontendstand ist bislang ein grosser, ausgelieferter HTML-Text mit eingebettetem CSS und JavaScript; kein verifiziertes Next.js-/React-Quellprojekt. Die Supabase Edge Function `kaufmich-app` lädt diesen Snapshot und kann serverseitig zusätzliche Anpassungen hinzufügen. Die vorliegende Datei sichert den **Datenbank-Snapshot** unverändert, nicht alle separaten Edge-Function-Injektionen.

## 4. Bisherige Veröffentlichung (IST-Zustand)

1. **Frontend:** Änderungen am Datensatz `kaufmich_frontend_snapshots/live` verändern die HTML-Grundlage, welche die Supabase Edge Function `kaufmich-app` ausliefert. Ein Teil der späteren UI-Korrekturen wird zusätzlich in Edge-Function-Code bzw. Proxy-Konfigurationen umgesetzt.
2. **Supabase-Backend:** Eigenständige Edge Functions werden separat deployed; Datenbankmigrationen haben einen eigenen Ablauf.
3. **Railway:** GitHub-gebundene Services können beim Push auf konfigurierte Branches neu gebaut werden. Weitere Proxy-Dienste nutzen Container-Images und Startskripte/Umgebungsvariablen.
4. **Vercel:** Eigene Projekte/Deployments für Migration, Proxy und SEO. Ein Vercel-Deployment bedeutet nicht automatisch, dass die Live-Domain darauf zeigt.
5. **Android:** Separates privates GitHub-Projekt `Bookiii92/kaufmich24-android`, Trusted Web Activity mit Android Browser Helper; signierte Bundles für Google Play.

**WARNUNG:** Nicht ungeprüft auf `main` pushen oder Inhalte von diesem Archiv in Supabase, Railway oder Vercel übernehmen. Die bestehende Proxy-Topologie ist noch nicht bereinigt.

## 5. Backups und Rollback

Die Supabase-Cron-Aufgabe `kaufmich-daily-backup` läuft täglich um 03:30 UTC und schreibt ZIP-Dateien in den privaten Bucket `km24-backups`. Der derzeitige Ablauf sichert logische Daten und Storage-Dateilisten, aber nicht alle Bilddateien selbst. Die Backup-Aufbewahrung ist auf 14 Tage konfiguriert. Ein vollständiger Restore-Test ist **noch nicht** erfolgt (Schritt 2).

Dieses GitHub-Archiv selbst benötigt **keinen Live-Rollback**, da es nicht veröffentlicht wurde. Bei einer späteren Freigabe müssen vor jedem Deployment der ursprüngliche Snapshot, das Ziel, Tests und eine Rückfallmöglichkeit feststehen.

## 6. Arbeitsschritte (Freigaben)

- [x] Datenbank-HTML unverändert exportieren und im isolierten Branch ablegen.
- [x] Architekturdokumentation erstellen.
- [x] CSS (280 Dateien), JavaScript (166 Dateien) und statische HTML-Textbausteine (72 Einträge) ohne Laufzeitänderung trennen; Rundreise-Vergleich nach jedem Teil erfolgreich.
- [ ] Nicht-produktive Mobil-/Staging-Tests für Startseite, Inserate und Bietablauf dokumentieren (echte Gebote nur mit separatem Testkonto/Testdaten).
- [ ] Nach ausdrücklicher Benutzerbestätigung mit Schritt 2 (vollständige Datei-Backups und Restore-Test) fortfahren.

## 7. Sicherheit und Zugänge

Repository `Bookiii92/KaufMich24` ist derzeit **öffentlich**. Bitte keine Passwörter, Tokens, Service-Role-Keys, Stripe-Secrets oder Signierschlüssel committen oder im Chat teilen. Ein rudimentärer Muster-Check des HTML-Exports fand keine typischen Secret-Marker; die vollständige Sicherheitsprüfung ist Bestandteil von Schritt 4. Die Domain-Registrierung und Google Play Console sind eigene Zugänge.

## 8. Verlustfreier modularer Wiederaufbau

- `src/template.html`: HTML-Gerüst mit eindeutig indizierten Platzhaltern.
- `src/styles/inline-*.css`: 280 ursprüngliche CSS-Blöcke.
- `src/scripts/inline-*.js`: 166 ursprüngliche JavaScript-Blöcke (werden erst beim Zusammenbau in ihre Originalpositionen eingefügt).
- `src/texts/strings.original.json`: 72 statische Textabschnitte mit Original-Leerzeichen.
- `src/stages/01-css.template.html` und `02-js.template.html`: Zwischenstände zum Prüfen der einzelnen Refactoring-Schritte.
- `src/manifest.json`: Quellen-Zeitpunkt, Anzahl der Teile, Länge und Integritätsprüfsumme.
- `tools/rebuild.mjs`: baut die Originaldatei zusammen und kontrolliert **exakte Stringgleichheit + UTF-8-Grösse + MD5**.

Im Repository ausführen: `node archiv/tools/rebuild.mjs`; optional `node archiv/tools/rebuild.mjs --write` erstellt nur die lokale Datei `archiv/dist/index.html` (keine Veröffentlichung). Die getrennten CSS-/JS-Quellen sind **keine sofort unabhängig ladbaren Browser-Bundles**; beim Build entsteht wieder dasselbe HTML. Erst nach separaten Tests dürfte man echte externe Assets daraus machen.

Ein **echter Git-Tag** `stand-vor-aufraeumen` wurde mangels Tag-Erstellfunktion des verbundenen GitHub-Zugangs noch nicht erstellt. Der gleichnamige *Branch* zeigt unveränderlich auf den ursprünglichen Export-Commit `e8aa9dacb41f06deb52773ea45600ff44e88270b`. Bitte nicht löschen oder bewegen.
