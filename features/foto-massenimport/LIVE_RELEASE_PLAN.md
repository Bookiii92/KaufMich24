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

## Statische ESM-Bereitstellung (separat, keine Live-Aktivierung)

- Auf dem bestehenden KaufMich24-Supabase-Projekt wurde die eigenständige, ausschliesslich lesende Edge Function `kaufmich-photo-bulk-assets` (Version 1) angelegt. Sie liefert nur vorher geprüfte JavaScript-Moduldateien per GET/HEAD/OPTIONS aus; kein Datenbankzugriff, keine Fotos, keine Verkäuferdaten und kein Zugriff auf den Service-Role-Schlüssel.
- Modul-Basis-URL: `https://aaqqcnrnrvybboirrrtd.supabase.co/functions/v1/kaufmich-photo-bulk-assets/`.
- Bereitgestellt: `spa-photo-route-bridge.mjs`, `secure-drafts-page.mjs`, `secure-drafts-client.mjs`, `photo-upload-queue.mjs`, `image-signature.mjs`, `shared-draft-fields.mjs` und `ai-suggestion-contract.mjs`.
- Quelle: GitHub-PR #2, Commit `3f1d2d9a3e5e4ffdef34daf01930c3c8dfed4449`. Kein automatisches GitHub-Deployment: bei Änderungen am Code sind eine neue Prüfung und ein separates Asset-Update nötig.
- Die Edge Function konnte nach Deployment über die Supabase-Verwaltung als `ACTIVE` und mit unverändertem Quellcode eingesehen werden. Eine unabhängige Browser-/HTTP-End-to-End-Prüfung der Assets steht noch aus.
- **Wichtig:** Die Modulbereitstellung aktiviert keine KaufMich24-Routerfunktion. In der produktiven Datenbank gibt es weiterhin keine `km24_bulk_draft_*`-Tabellen und keine private `km24-bulk-draft-photos`-Bucket. Deshalb ist kein echter Server-Foto-Upload möglich.
- Beim Produktiv-Rollout nicht die bestehende Website durch ungeprüften dynamischen Code ersetzen. Erst Schema-, Rechte- und Mobilbrowser-Tests sowie funktionsfähiges Rücksetzen prüfen.

## Produktive Backend-Freigabe und Sperren (05.11.2026)

Die ausschliesslich **additive** private SQL-Migration wurde nach erfolgreicher PostgreSQL-17-RLS-Testserie bewusst auf das vorhandene KaufMich24-Supabase-Projekt angewandt (Migrationsname: `km24_private_photo_bulk_drafts_20261105`).

Nachkontrolle:
- 3 neue private Draft-Tabellen mit aktiviertem RLS, bestehenden Import- und Eigentümer-Policies; keine anonymen SELECT-Tabellenrechte.
- 1 neuer `km24-bulk-draft-photos`-Bucket mit `public=false`, 10 MiB Dateigrenze, JPG/PNG/WebP.
- 0 Importvorgänge, 0 Entwurfsartikel, 0 Bildmetadaten, 0 hochgeladene Dateien zum Prüfzeitpunkt.
- Supabase-Security-Advisor zeigt keine Warnungen für diese drei neuen Tabellen.
- Produktiver HTML-Snapshot unverändert, 2'215'262 Zeichen. Es gibt **keine** öffentliche Firmen-CTA oder Router-Einbindung.
- Auf dem separaten statischen JavaScript-Asset-Host läuft Version 2 mit `upload-account-readiness.mjs`. Aktueller HTTP-Test (GitHub Run `42096338947`, zweiter Versuch) erfolgreich.
- Auf vorhandenen Firmen-/Händlerkonten ist derzeit **kein** Konto vollständig kontaktverifiziert; das vorhandene Firmenkonto ist aktiv, aber hat weder international formatierte Telefonnummer noch vollständig bestätigte Strasse/PLZ/Ort/Adresse. Diese Daten nicht übergehen und nicht selbst mit erfundenen Angaben befüllen. Die Importoberfläche verweist auf `#/verification`.

**Noch nicht freigegeben:** echter angemeldeter Auth-/Storage-Upload mit zwei Konten, mobile Browsereingabe, Sicherheitstest zu realen Signed URLs sowie der produktive CTA/Routen-Einbau. Die SQL-Freigabe ist **nicht** die Freigabe zum öffentlichen Import oder zur Veröffentlichung von Inseraten.

**Kosten:** kein zusätzlicher Supabase-Branch oder separates Testprojekt; tatsächliche Speicher- und Transfer-Nutzung des bestehenden Projekts kann dennoch abrechnungsrelevant sein.

**Migration-Drift:** Die Produktionsmigration ist bereits angewandt und darf nicht nochmals ausgeführt werden. Beim späteren Merge die lokale SQL-Datei mit der Supabase-Migrationshistorie synchronisieren, statt erneut `CREATE TABLE` aufzurufen.
