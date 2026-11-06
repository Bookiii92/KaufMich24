# KaufMich24 – geschützter Foto-Massenimport (Review-Checkliste)

Status: 5. November 2026. **Nicht auf kaufmich24.ch live.**

## Neu im Entwicklungszweig

- photo-import-beta.html: lokale Demo mit Fotoauswahl, ohne Serverzugriff.
- review-only-private-drafts.sql: nur zu prüfende private Tabellen, eigene Bild-Bucket, RLS und Upload-Quoten. **Nicht in Produktion ausführen.**
- secure-drafts-client.mjs: Firmen-/Händler-Authentifizierung, private Entwürfe, Reservierung von Bildpfaden, Upload und sichere Löschreihenfolge.
- secure-drafts-page.mjs: responsive Oberfläche für authentifizierte Firmenkonten; muss den bestehenden Supabase-Client von KaufMich24 als Parameter erhalten.
- secure-drafts-client.test.mjs: Node-Tests für Validierungen und verweigerte Zugriffe.

## Noch nicht umgesetzt

Die private Storage-Bucket und Entwurfstabellen sind noch nicht provisioniert. KaufMich24 und KupiMe24 sind produktive Supabase-Projekte; ein eigenes isoliertes KaufMich24-Staging-Projekt ist nicht vorhanden. Die GitHub-Dateien ändern die Live-Webseite nicht und schalten keinen Upload frei.

Der öffentliche Bucket listing-images wird **nicht** für ungeprüfte Fotoentwürfe verwendet. Die alte Edge Function kaufmich-listing-assistant ist deaktiviert. Automatische KI-Produkterkennung und öffentliche Veröffentlichung sind noch gesperrt.

## Architektur / Rechte

Die Entwürfe werden in separaten Datensätzen gespeichert. Jeder Datensatz und jeder Objektpfad ist an owner_id = auth.uid() gebunden. INSERT setzt ein aktives Konto mit vollständigen Kontaktangaben voraus und ist nur für business/dealer vorgesehen. Bilder werden nur privat gespeichert und über kurzfristig signierte Ansichtslinks angezeigt.

Quoten: 5 offene Imports/Konto, 100 Artikel und 100 Bilder je Import, 10 Fotos/Artikel, höchstens 10 MiB/Bild, nur JPG/PNG/WebP. Unvollständige Einträge bleiben privat. Anti-Spam- und Tarifgrenzen der bestehenden öffentlichen Inserate bleiben unverändert.

## Vor dem Test unbedingt erforderlich

1. Isolierte Supabase-Testumgebung verwenden. Ein weiteres Projekt kann kostenpflichtig werden und muss vor Anlage abgestimmt werden.
2. SQL-RLS-Regeln prüfen, anwenden und Supabase Security Advisors auswerten.
3. Zwei angemeldete Testkonten A/B: B darf Bilder und Entwürfe von A niemals lesen, ändern oder löschen.
4. Privatkonto und Gast müssen abgewiesen werden; blockierte bzw. unvollständige Konten ebenfalls.
5. 11. Foto/Artikel, 101. Foto/Import, 101. Artikel und sechsten offenen Import prüfen.
6. Archivierte Imports dürfen nicht reaktiviert werden, um Quoten zu umgehen.
7. Parallele Uploads und Fehler mitten im Vorgang prüfen. Bei Löschvorgängen erst Dateien, dann Metadaten entfernen.
8. iPhone, Android und Desktop mit echtem Testkonto prüfen, insbesondere Upload-Abbruch und lokales Browsercache-Verhalten.
9. Gesonderte Freigabe einholen, bevor die Migration oder neue UI auf der Produktivseite eingesetzt wird.

## UI-Einstieg in Staging

Die exportierte Funktion mountPhotoDraftPanel aus secure-drafts-page.mjs erwartet ein root-DOM-Element und den bereits authentifizierten supabaseClient aus KaufMich24. Die bestehende Weboberfläche basiert auf dem Supabase-Snapshot live; GitHub-Commits veröffentlichen sie nicht automatisch.

## Noch explizit gesperrt

Kein Code dieses Features darf öffentliche Inserate erstellen, KI-Bildauswertung aktivieren oder das 12/Stunde- und 60/Tag-Limit umgehen, bevor die getrennten Tests und die Freigabe erfolgt sind.
