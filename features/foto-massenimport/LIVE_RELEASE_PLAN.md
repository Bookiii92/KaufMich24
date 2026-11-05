# KaufMich24 – Live-Einbindung Foto-Massenimport

Stand 05.11.2026 – **Review vor Freigabe**, nicht produktiv ausrollen.

## Bestehende Architektur (read-only geprüft)

- KaufMich24.ch wird aus public.kaufmich_frontend_snapshots, name='live', bedient; HTML-Länge zum Prüfzeitpunkt 2'215'262 Zeichen.
- In der aktuellen HTML-Anwendung existiert \`const db=supabase.createClient(...),app=document.getElementById('app');let user=null,profile=null\`.
- Der Router ist \`function route()\` und dispatcht u. a. \`if(h==='#/business')return businessPage();\` und \`if(h==='#/create')return createChoicePage();\`.
- Die Firmen-Seite erkennt \`profile.account_type\` von \`dealer\`/ \`business\` und enthält einen CTA-Bereich \`km24BizActions\`.
- Der Snapshot wird **nicht** durch GitHub-Merge direkt ausgetauscht.

## Vorbereitete Dateien

- \`spa-photo-route-bridge.mjs\`: erlaubt Zugang nur zu angemeldeten Firmen/Händlern; überprüft \`db.auth.getUser()\` und verhindert das Laden einer UI nach Seitenwechsel.
- \`secure-drafts-page.mjs\`: Firmenansicht mit Fotos als private Entwürfe, gemeinsamen Feldern und Pausieren/Fortsetzen.
- \`secure-drafts-client.mjs\`: private Auth-/Storage-Operationen.
- \`photo-upload-queue.mjs\`: stabile UUIDs und pausierbare Upload-Reihe, Wiederaufnahme innerhalb derselben Browsersitzung.
- \`review-only-private-drafts.sql\`: 3 eigene Tabellen, separate private Bucket, echte Postgres-RLS/Quoten. In einer temporären PostgreSQL-17-Instanz mit mehreren Rollen getestet.
- \`tests/pg-bootstrap.sql\`, \`tests/pg-rls-regression.sql\`: niemals gegen KaufMich24-Produktion ausführen! Tests verwenden bewusst simulierte auth/storage-Schemas und erstellen Testrollen.

## Technischer Einbau nach Freigabe

1. Eine geprüfte, über HTTPS zugängliche Quelle für die gebündelten ES-Module bereitstellen. Es ist noch **keine** solche Hosting-URL für die neuen Module live. Der alte reine Lokal-Demo-Endpunkt ist keine Server-Upload-API.
2. Im bestehenden SPA-Router \`#/foto-massenimport\` ergänzen. Die Funktion muss bestehende \`db\`, \`app\`, \`user\`, \`profile\` und \`go\` an \`openPhotoBulkRoute\` übergeben. Keine separaten Login-Konten.
3. Erst bei \`profile.account_type\` \`business\` oder \`dealer\` einen dritten CTA \`Mehrere Artikel mit Fotos inserieren\` in \`km24BizActions\` anzeigen; normale Einzelinserate unverändert lassen.
4. Die private SQL-Migration vor Aktivierung in einer kontrollierten Release-Session anwenden, inkl. Backup, Rollback-Plan und erneuter Security-Advisor-Kontrolle. Bestehende \`listing-images\`-Bucket nicht ändern.
5. In der echten Supabase-Instanz mit zwei Testkonten prüfen: Auth, private Storage-Uploads, RLS, Signed URLs, Fehler bei Unterbruch, Limits, Mobile/Safari, Löschen und Archivieren.
6. Nur nach diesen Tests und separater ausdrücklicher Produktivfreigabe den Link für Firmen sichtbar schalten.

## Explizite Grenzen

- Die bisherigen CI-Tests verwenden **echtes PostgreSQL** mit Auth-/Storage-Testdoubles, nicht den echten Supabase-Storage-HTTP-Dienst.
- Auch erfolgreiche PostgreSQL-RLS-Tests beweisen noch nicht, dass CORS, JWT, Upload-Signaturen und iPhone-Dateiauswahl auf KaufMich24.ch korrekt sind.
- Die alte Funktion \`kaufmich-listing-assistant\` (410) ist keine aktive KI-Bilderkennung. Es wird **kein** kostenpflichtiger KI-Anbieter aufgerufen.
- Es gibt noch keine Serverfunktion, die Entwürfe öffentlich als \`listings\` veröffentlicht. Die bestehenden Spamregeln (12/Stunde, 60/Tag) und Händler-Tarifgrenzen werden nicht umgangen.
- Kein neuer kostenpflichtiger Supabase-Branch; GitHub Actions kann vom jeweiligen Nutzungs-Kontingent abhängen.

## Bereits behobene Fehler aus den echten PostgreSQL-Tests

Die Triggerfunktion \`private.km24_bulk_immutable_keys\` griff beim Archivieren auf das item-exklusive Feld \`batch_id\` zu und beim Bearbeiten eines Items auf das batch-exklusive Feld \`state\`. Die Fälle sind getrennt und mit automatischen PostgreSQL-Tests auf die tatsächlichen Tabellenspalten geprüft. Direkte Löschung von Metadaten, wenn die privaten Objekte noch vorhanden sind, wird verhindert.
