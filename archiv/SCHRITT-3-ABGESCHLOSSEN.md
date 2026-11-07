# Schritt 3 – freigegebene Canonical-Korrektur LIVE abgeschlossen

Datum der Freigabe: 08.11.2026 (Europe/Zurich). Freigabe im Chat: "Ok dann mach das".

## Änderung
Auf Supabase-Projekt `aaqqcnrnrvybboirrrtd` wurde die bereits geprüfte und vom Nutzer ausdrücklich freigegebene SQL-Korrektur `archiv/domain/canonical-apply-after-approval.sql` ausgeführt.

- Ursprüngliches `kaufmich_frontend_snapshots.live`: MD5 `7b4d2ffd9ea2eff12f2c9bf6d9fd4fef`, 2'356'200 Bytes.
- Neu: MD5 `1106a611f9ac541c60018fd81e0c957b`, 2'356'136 Bytes.
- Zwei fehlerhafte, doppelte Homepage-Canonicals mit `www` auf genau einen Canonical `https://kaufmich24.ch/` bereinigt.
- Homepage `og:url` von `https://www.kaufmich24.ch/` auf `https://kaufmich24.ch/` umgestellt.
- **Kein** DNS-, Railway-, Vercel-, Stripe-, Inserats-, Gebots- oder Design-Code wurde durch diesen Schritt geändert.

## Vorherige Sicherungen
1. Vor dem Eingriff **frisches** privates Datenbank-Backup bestätigt: `km24-backups/daily/2026/11/07/KaufMich24-2026-11-07T23-47-19-085Z.zip`, 6'045'897 Bytes, 84 Datenbereiche und 9 Frontend-Snapshots (u. a. live) gemäß Backup-Aufruf.
2. Zusätzlicher direkter Rollback-Snapshot in Supabase: `public.kaufmich_frontend_snapshots` mit `name='backup-before-domain-step3-20261108'` und dem MD5 des Original-HTML.
3. Der Sicherheits-SQL-Prüfer hat die ursprüngliche MD5 und das Ergebnis-MD5 abgeglichen, mit atomarem SQL-Commit.

## Live-Postcheck (serverseitige HTTP-GETs, über Supabase/pg_net)
- `GET https://kaufmich24.ch/?domain_check=20261108`: HTTP 200, `Server: Vercel`; exakt 1 Canonical und 1 og:url, beide ohne www.
- `GET https://www.kaufmich24.ch/?domain_check=20261108`: Vercel leitet weiter auf `https://kaufmich24.ch/?domain_check=20261108`. Das HTTP-Tool folgt Weiterleitungen und zeigte den finalen Status 200; die Vercel-Domainkonfiguration weist weiterhin eine 308-Dauerweiterleitung aus.
- `GET https://kaufmich24.ch/listing/ae48c989-67df-4b19-a2d2-5ade7ea5531f`: HTTP 200, eigener Canonical auf der korrekten Inserat-URL.
- `GET https://kaufmich24.ch/sitemap.xml`: HTTP 200 `application/xml`, 58 URLs (33 Inserate).
- `GET https://kaufmich24.ch/robots.txt`: HTTP 200 `text/plain`, verweist auf `https://kaufmich24.ch/sitemap.xml`.
- Das GitHub-Repository `main`, die DNS-Konfiguration und die Live-Hosting-Deployments wurden nicht bearbeitet.

## Rückgängig machen
Bei einem Fehler `archiv/domain/canonical-rollback-after-approval.sql` **nur nach erneuter Kontrolle** ausführen. Das Skript verlangt als Ausgangsstand exakt MD5 `1106a611f9ac541c60018fd81e0c957b` und stellt den in Supabase gesicherten Original-HTML-Stand wieder her. Wenn zwischenzeitlich jemand den Live-HTML-Code weiterentwickelt, **nicht** blind zurückrollen – zuerst die Änderungen abgleichen.

## Manueller Handytest weiterhin ausstehend
ChatGPT konnte keinen echten Android-/iOS-Browser bedienen und keine echten Gebote abgeben. Manuell prüfen: Startseite; ein Inserat mit Bildern; Auktionsansicht und Gebotsfeld; Öffnen der `www`-Adresse; QR-Codes durch Scannen. Keine echten Gebote nur für den Test absenden.

**Nächster Schritt (4: Absicherung) ausdrücklich noch nicht begonnen.**
