# Schritt 2 – vollständige Storage-Dateisicherung (08.11.2026, Schweizer Zeit)

## Ergebnis und Umfang

- Produktivprojekt: Supabase `aaqqcnrnrvybboirrrtd`.
- Ursprünglicher Live-Frontendstand bleibt unverändert; `main` in GitHub ebenso.
- Das bisherige logische Datenbank-Backup `kaufmich-daily-backup` um **03:30 UTC** blieb unverändert und wurde vor den Änderungen zusätzlich erfolgreich ausgeführt (ZIP, 6'045'657 Bytes am 07.11.2026 23:14 UTC).
- Neuer separater Storage-Backup-Prozess `kaufmich-storage-backup` als Edge Function; Job `kaufmich-storage-binary-backup` alle **10 Minuten** (UTC). Ein neuer Tagesstand beginnt nach 03:45 UTC, nach dem bisherigen Datenbank-Backup.
- Initiale Sicherung vom 07.11.2026: **361 von 361 Dateien**, **240'199'733 Bytes**, keine fehlenden Kopien. Enthalten: 350 `listing-images`, 2 `listing-attachments`, 6 `profile-avatars`, 3 `km24-bulk-draft-photos`.
- Speicher: privater Supabase-Bucket `km24-backups`, unter `storage-versions/v1/` (Binärdateien) und `storage-manifests/v1/2026-11-07/manifest.zip` (Dateiliste und zugehörige Archivversionen).
- Geprüfter Run: `state=completed`, `copied=361`, `missing=0`. Manifest wurde erfolgreich gespeichert.
- Der Snapshot ist nach seiner Erstanlage **unveränderlich**; zusätzliche Testdateien werden nicht nachträglich eingefügt. Das Sandbox-Bucket `km24-restore-sandbox` ist aus produktiven Sicherungsläufen ausgeschlossen.
- Die tägliche Kopie nutzt versionsbezogene, wiederverwendbare Storage-Pfade. Unveränderte Dateien werden nicht noch einmal gespeichert.
- Ein separater Retention-Job `kaufmich-storage-backup-retention` läuft täglich um **06:00 UTC** und entfernt **abgelaufene abgeschlossene** Backup-Läufe nach 15 Tagen sowie unreferenzierte Backup-Dateiversionen. Niemals die Originaldateien. Das ursprüngliche Datenbank-Backup hat weiterhin seine eigenständige 14-Tage-Aufbewahrung.

## Test-Wiederherstellung

1. Neues, privates Test-Bucket `km24-restore-sandbox` angelegt (kein Zugriff über die öffentliche Website).
2. Zwei gespeicherte Dateiversionen aus `km24-backups` in das Sandbox-Bucket kopiert: ein Video (7'356'970 Bytes) und ein Inseratsbild (5'014'405 Bytes).
3. Beide Testdateien erneut heruntergeladen und mit der jeweiligen Backup-Kopie verglichen: **Dateigrösse und SHA-256 stimmen in beiden Fällen exakt überein**.
4. Das bestehende Datenbank-ZIP `daily/2026/11/07/KaufMich24-2026-11-07T23-14-25-467Z.zip` wurde entpackt, `backup.json` geparst und mit den gespeicherten Zählwerten verglichen: **84 Datenbereiche, 0 Zählabweichungen, 19 Auth-Benutzer in der logischen Exportliste, 361 Einträge in der Datei-Metadatenliste und Live-Frontend enthalten**.

**WICHTIGE GRENZE:** Dies ist ein tatsächlicher Storage-Restore-Test und eine logische Datenbankarchiv-Integritätsprüfung, **keine** vollständige Wiederherstellung der produktiven PostgreSQL-/Auth-Installation in ein separates Supabase-Projekt. Das bestehende logische Backup enthält weder alle PostgreSQL-DDL-/Rollenzuweisungen noch Auth-Passwort-Hashes. Ein vollständiger Disaster-Recovery-Test der Datenbank setzt eine geeignete isolierte Testinstanz und vollständige DB-/Auth-Backups voraus, ggf. mit zusätzlichen Kosten. Nicht als vollständige Produktions-Wiederherstellbarkeit ausgeben.

## Betrieb und Test

- Edge Function: `kaufmich-storage-backup` (Version 4 zum Zeitpunkt dieser Dokumentation).
- Eigene additive, RLS-geschützte Tabellen: `public.ops_storage_backup_runs` und `public.ops_storage_backup_items`. RPC-Funktionen: `ops_storage_backup_start`, `ops_storage_backup_claim`, `ops_storage_backup_mark`, `ops_storage_backup_complete`, `ops_storage_backup_orphan_paths`. Nur Server-Rolle hat Ausführungsrechte; keine öffentlichen Client-Zugriffe.
- Alle HTTP-Aufrufe verwenden den bestehenden serverseitig aus dem Supabase Vault bezogenen Operations-Token. Nie Secret- oder Service-Role-Werte in Code oder Git ablegen.
- Nachfolgetage anhand `state=completed`, `file_count` und der Anzahl `copied_at IS NOT NULL` prüfen. Prüfen, dass das jeweilige `storage-manifests/v1/<datum>/manifest.zip` existiert.
- Auf dem Handy: Startseite laden, Inserat inklusive Bild öffnen, Gebotsfeld anzeigen. **Kein echtes Gebot zum Test abschicken.** Login und echtes Bieten nur mit vorher eingerichteten Testkonten/isolierter Umgebung testen. Dieser Browser-Test wurde nicht von ChatGPT auf einem physischen Gerät durchgeführt.
- Der Zeitpunkt des ersten Backups liegt zum Teil vor dem Datum im Schweizer Zeitzonen-Kalender, da Backup-Daten intern in **UTC** gespeichert werden.

## Rückgängig machen

1. Nur den neuen periodischen Backup-Prozess anhalten: `cron.unschedule(17)`, und die neue Retention-Aufgabe `cron.unschedule(18)`; die ursprüngliche DB-Cron-Aufgabe **5** läuft weiter.
2. Die neue Edge Function `kaufmich-storage-backup` wird dann nicht mehr von Cron gestartet. Das bestehende `kaufmich-backup-worker` wird nicht berührt.
3. **Keine** bereits gesicherten Dateiversionen oder den Original-Bucket löschen, bevor alle relevanten Backups geprüft wurden.
4. Neue Backup-Ledger-Tabellen und Test-Bucket nur nach gesonderter Freigabe und gesicherter Datenaufbewahrung entfernen. Die Live-Site/Inserate müssen nicht zurückgesetzt werden.

## Wiederherstellung einer Datei (für befugte Techniker)

1. Im privaten Bucket `km24-backups` das passende Tages-Manifest (`manifest.zip`) öffnen, darin `manifest.json` entpacken.
2. Den gewünschten Eintrag anhand `bucket` und `path` bestimmen. Das Feld `version` nennt den gesicherten Pfad unter `storage-versions/v1/`.
3. Mit Service-Role-Rechten die Version via Supabase Storage `.copy(backupPath,testPath,{destinationBucket:'km24-restore-sandbox'})` zunächst in ein **privates** Test-Bucket kopieren.
4. Dateigrösse und SHA-256 vergleichen, erst danach bei einem echten Notfall und mit ausdrücklicher Bestätigung in einen Produktiv-Bucket restaurieren.
