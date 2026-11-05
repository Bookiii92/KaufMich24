# KaufMich24 Foto-Massenimport – Beta

## Funktionsstand (5. November 2026)
- Separater Online-Preview: `https://aaqqcnrnrvybboirrrtd.supabase.co/functions/v1/kaufmich-photo-bulk-preview`
- Isolierte Supabase Edge Function `kaufmich-photo-bulk-preview`, Version 1, Status ACTIVE.
- Bis zu 100 Bilder, bis zu 10 Bilder pro Artikel.
- Bilder zu einem Artikel zusammenführen, Titel, Beschreibung, Preis und Standort prüfen.
- Entwürfe inklusive Bilddateien **nur lokal im Browser (IndexedDB)** speichern und später laden.
- JSON-Export enthält **keine Bilddateien**.
- Kein Backend-Upload, keine Live-Inserate, kein KI-Bildverständnis, keine versteckten Datenbankzugriffe.
- Wegen privater lokaler Entwürfe nicht auf gemeinsam genutzten Geräten verwenden.

## Sicherheitsprüfung
- Das Preview ist eine eigenständige Edge Function: Sie ändert weder `kaufmich_frontend_snapshots.live` noch `listings`, `listing_images` oder `profiles`.
- JavaScript-Quelltext nach Deployment wieder aus der Edge Function gelesen; Syntax erfolgreich geprüft.
- Supabase-Projektstatus: ACTIVE_HEALTHY.
- Live-Snapshot nach Deployment unverändert (2'215'262 Zeichen, 5. November 2026, 12:18:57 UTC).
- Externe HTTP-/Mobil-Browser-End-to-End-Prüfung der neuen Edge-URL noch nicht bestätigt.
- In dieser Beta sind Anmeldung und Firmenkonto-Berechtigung **nicht** integriert.

## Für den nächsten Integrationsschritt
1. Original-Website verwendet HTML aus `public.kaufmich_frontend_snapshots`, Name `live`, **nicht gesichert direkt das GitHub-Repo**. Den HTML-Stand nur in isolierter Staging-Umgebung patchen.
2. Authentifizierte Firmen-/Händlerkonten prüfen: `profiles.account_type` `business` oder `dealer`, bei Veröffentlichung zusätzlich gewünschte Firmenverifizierung.
3. Neue private Storage-Bucket für Bildentwürfe, eigene RLS und sichere Upload-Signaturen; nicht die vorhandene öffentliche `listing-images` Bucket für ungeprüfte Fotoentwürfe verwenden.
4. Bildentwürfe in privaten, per Verkäufer gesicherten Batch-Tabellen verwalten; Quoten und Abbruch/Retry vorsehen.
5. Neue Edge Function für optionale KI-Produktanalyse; bisherige `kaufmich-listing-assistant` gibt HTTP 410 zurück. Provider-Kosten, Rate Limits und explizite Händlerfreigabe einplanen.
6. Beim Publizieren existierende Tabellen `listings` + `listing_images` benutzen, aber Regeln und Trigger unverändert respektieren.
7. `private.guard_listing_abuse` begrenzt **alle neu angelegten Inserate** auf 12 pro Stunde und 60 pro Tag pro Verkäufer (auch Entwürfe); `private.enforce_dealer_listing_limit` begrenzt aktive Inserate tarifabhängig. Für echte Masseneinträge einen separaten geprüften Bulk-Freigabepfad designen, bevor Limits geändert werden.
8. Staging mit Testkonto, Upload, RLS und Duplikatschutz prüfen; erst nach separater Freigabe auf Produktion schalten.

## Veröffentlichungsstatus
**Nicht live auf kaufmich24.ch.** Dieser Branch ist eine isolierte Implementierungsvorbereitung, keine automatische Deployment-Quelle für die aktuelle öffentliche KaufMich24-Weboberfläche.


## Update 05.11.2026 – geschützter Server-Entwurf im PR
- `review-only-private-drafts.sql`: neue private `km24-bulk-draft-photos`-Bucket und drei Entwurfs-Tabellen, per RLS auf den Besitzer begrenzt, mit serverseitigen Limits (5 offene Batches, 100 Artikel, 100 Fotos, max. 10 je Artikel). **Noch nicht angewandt.**
- `secure-drafts-client.mjs`: authentifizierte Supabase-Operationen für Upload und Metadaten; reserviert Bildpfad vor Upload, bereinigt Fehluploads, erlaubt nur zeitlich befristete Bildlinks.
- `secure-drafts-client.test.mjs`: Node-Tests für Authentifizierung, Formatprüfung, private Fotopfade und Uploadfehler.
- Die öffentliche `listing-images`-Bucket, die `listings`-Tabelle und die bestehende Live-Webseite bleiben unverändert.
- Die vorhandene Foto-Beta ist weiterhin **nur lokal**; Server-Foto-Uploads werden erst nach RLS-/Sicherheitstests und separater Aktivierungsfreigabe freigeschaltet.

### Nachgelagerte Prüfpunkte
1. SQL-Migration zuerst in separater Testdatenbank anwenden, Nutzer-RLS mit zwei Konten prüfen, anschliessend Sicherheits-Advisor kontrollieren.
2. MIME-Dateiinhalte, Kompression von HEIC und Speicherbudgets verbindlich prüfen.
3. Foto-Entwürfe über die aktive Firmen-Session verbinden, fehlgeschlagene Uploads und Wiederaufnahme testen.
4. KI-Analyse und Veröffentlichung separat vorbereiten. Bestehende Spam- und Händlerlimits nicht aufheben.

Tests lokal: `node --test features/foto-massenimport/*.test.mjs`.

## Neu: gemeinsame Angaben ohne Excel

Die authentifizierte Firmenoberfläche bietet einen optionalen Schritt „Angaben für alle Artikel übernehmen“. Firmen können Kategorie, Zustand, Ort, PLZ und Kanton einmal eingeben und explizit auf alle Entwürfe eines Imports anwenden. Nur ausgefüllte Felder werden aktualisiert; vorhandene Produkttitel, Beschreibungen, Mengen und Preise bleiben unverändert. Die UI verlangt vor dem Speichern eine Bestätigung. Bei teilweisem Netzwerkausfall wird die Anzahl bereits aktualisierter Artikel zurückgemeldet.

Der Helfer ist als `shared-draft-fields.mjs` umgesetzt und durch `shared-draft-fields.test.mjs` abgedeckt.

## Kosten- und Veröffentlichungsgrenze

Die Vorbereitungsarbeit läuft ausschliesslich auf dem vorhandenen GitHub-Entwicklungszweig. Es wird **kein zusätzlicher Supabase-Branch oder kostenpflichtiges Testprojekt** angelegt. Die laufenden automatisierten CI-Tests können von den allgemeinen GitHub-Nutzungsgrenzen abhängen; zusätzliche Supabase-Rechenstunden wurden nicht gestartet. Live-RLS- und echte Bild-Uploads sind **weiterhin ungetestet**, weil die private Upload-Bucket und Tabellen auf dem Produktivprojekt bewusst **nicht** angelegt wurden. Auch das Überprüfen mit mehreren echten Konten ist noch ausstehend. Für diese abschliessenden Prüfungen muss eine sichere, gesondert freigegebene Teststrategie vorliegen.


## Update: Bildsignatur, Wiederaufnahme und KI-Schnittstelle (05.11.2026)
- `image-signature.mjs`: tatsächliche JPEG-, PNG- und WebP-Dateikennung prüfen, nicht nur den Dateinamen. HEIC bleibt gesperrt, bis eine zuverlässige Umwandlung vorliegt.
- `secure-drafts-client.mjs`: bei unsicherem Upload zuerst möglichen Storage-Inhalt löschen, erst danach Metadaten bereinigen. Wenn die Bereinigung fehlschlägt, nicht blind wiederholen.
- `photo-upload-queue.mjs`: Foto-Importe nach Unterbruch im selben geöffneten Browser fortsetzen. Bereits erfolgreich hochgeladene Fotos werden nicht erneut gesendet. Der UUID-basierte Artikelentwurf hilft gegen Doppelanlage bei verlorener Datenbankantwort.
- `secure-drafts-page.mjs`: Pausieren/Fortsetzen sowie Kapazitätsprüfung vor dem Start. Wiederaufnahme ist **nicht** über einen kompletten Browserneustart garantiert; in der separaten Demo gibt es dagegen lokale Entwurfsspeicherung.
- `ai-suggestion-contract.mjs`: Vorbereitung für spätere KI-Vorschläge. Preise, Zustand und Lagerbestand werden **nicht** von der KI übernommen. Menschliche Prüfung ist zwingend.
- Automatischer GitHub-Workflow: 28 Tests und 17 statische SQL-Prüfungen bestanden (Run `42087793868`). Diese Tests sind keine echten RLS-/Browser-Integrationstests und beweisen keine Produktionsbereitschaft.
- Keine neue kostenpflichtige Supabase-Testumgebung, kein KI-API-Aufruf und keine Änderungen an KaufMich24.ch.
