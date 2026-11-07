# Schritt 3: Domain und Hosting (08.11.2026) – Prüfung und Vorschlag

**Status:** Recherche abgeschlossen. Canonical-Korrektur ausschließlich vorbereitet, **nicht live** veröffentlicht. Bewusst keine Domainänderungen, da zuvor ausdrücklich eine neue Sicherung und Benutzerfreigabe verlangt wurden.

## Ist-Zustand (mit Provider-Kontozugriff und HTTP-GET überprüft)

1. **DNS-Provider:** Hostpoint, Nameserver `ns.hostpoint.ch`, `ns2.hostpoint.ch`, `ns3.hostpoint.ch`.
2. **DNS-Apex `kaufmich24.ch`:** A-Eintrag zeigt auf Vercel (`76.76.21.21`), Provider meldet gültige Konfiguration. Der verifizierte Vercel-Projekteintrag ist `kaufmich24-migration`, ein bereitgestelltes Produktions-Deployment ist der Domain zugeordnet.
3. **DNS-www:** CNAME zeigt auf `cname.vercel-dns.com`; im Vercel-Domainprojekt ist **bereits `redirectStatusCode: 308`** auf `kaufmich24.ch` eingerichtet und `verified=true`.
4. **Vercel-Produktionsfunktion:** `api/proxy.js` leitet Anfragen an `https://aaqqcnrnrvybboirrrtd.supabase.co/functions/v1/kaufmich-app-stable` weiter. Die `vercel.json` Produktionskonfiguration benutzt einen Catch-all-Rewrite `/(.*)` an `/api/proxy?path=$1`.
5. **Railway** hat alte Custom-Domain-Einträge: `kaufmich-web` mit `kaufmich24.ch` (Verifizierung fehlend, Traffic-DNS inkorrekt), `kaufmich-www` mit `www.kaufmich24.ch` (Vercel-DNS statt Railway-Ziel). Railway ist nicht die öffentliche Einstiegsadresse. Seine internen Deployments keinesfalls vor separater Abhängigkeitsanalyse löschen.
6. **Live HTTP GET, durch Supabase-Netzwerk ausgeführt**: Hauptseite HTTP 200 und `Server: Vercel`; `/sitemap.xml` HTTP 200 `application/xml` mit **58 URLs, davon 33 Listing-Pfade**, alle ohne `www`; `/robots.txt` HTTP 200 `text/plain` und `Sitemap: https://kaufmich24.ch/sitemap.xml`.
7. **Abweichung:** Live-Homepage hat **zwei identische `<link rel="canonical" href="https://www.kaufmich24.ch/">`** und ein `og:url` mit `www`. Das kollidiert mit dem Vercel-Redirect und der korrekten dynamischen Sitemap. Die alten Dateien `robots.txt` und `sitemap.xml` im GitHub-Repository `main` nennen noch `www`, sind aber **nicht** die tatsächlich vom öffentlichen Vercel-Proxy ausgelieferten, dynamisch generierten Dateien.

## Entscheidung / Empfehlung

**Behalte Vercel als einzigen öffentlich erreichbaren Web-Einstiegspunkt** für `kaufmich24.ch`; Supabase bleibt Datenbank, Auth, Storage und Backend. Railway vorerst nur als unabhängige Test-/Legacy-Infrastruktur stehen lassen. Erst wenn Abhängigkeiten und ein Rollback vollständig geklärt sind, unnötige Railway-Webdienste/Domains in einem eigenen freigegebenen Wartungsschritt entfernen. Keine zweite produktive Route auf Railway konfigurieren.

**Behalte die bereits aktive 308-Weiterleitung `www` → `https://kaufmich24.ch`.** Nicht auf DNS-Ebene einen vermeintlichen Redirect durch bloßes CNAME-Festlegen ersetzen; Vercel leitet HTTP dauerhaft um. Die dynamische Sitemap und Live-robots.txt sind schon auf Apex eingestellt.

**Einzige derzeit erforderliche Korrektur:** Zwei Homepage-Canonicals zu einem zusammenführen und die Homepage-`og:url`-Adresse auf `https://kaufmich24.ch/` stellen. Keine Änderungen an den SEO-/Listing-Routen, keine neuen Features oder Rendering-Refaktorierung.

## Risikofreie Vorprüfung

Read-only-SQL wurde gegen `kaufmich_frontend_snapshots.live` ausgeführt; Ausgangs-Checksumme `7b4d2ffd9ea2eff12f2c9bf6d9fd4fef`, Eingangsbytes **2'356'200**. Rechnerischer Korrekturstand: **2'356'136 Bytes**, MD5 `1106a611f9ac541c60018fd81e0c957b`, genau **ein** Canonical auf Apex und **ein** `og:url` auf Apex. Die Anzeige der Sitemap blieb bereits korrekt und wird nicht überschrieben.

Vorbereitete Dateien, **nicht ausgeführt**:
- `domain/canonical-apply-after-approval.sql` – sichert den Original-Datensatz in einem separaten Supabase-Snapshot und ändert nur die drei Homepage-Metadatenstellen, kontrolliert Vorher-/Nachher-Prüfsummen.
- `domain/canonical-rollback-after-approval.sql` – stellt die alte HTML-Version zurück, wenn die erwartete Nachher-Prüfsumme stimmt.

Die Prüfsummen gehören zu **diesem** Datenbankstand. Bei zwischenzeitlicher Bearbeitung wird die Änderung absichtlich mit Fehler abgebrochen; keine unkontrollierte Überschreibung.

## Schritte nach expliziter Freigabe

1. **Erneut** aktuellen Live-Snapshot und laufende Domains kontrollieren, frisches Backup erstellen und Abschluss verifizieren.
2. Einmaligen gesicherten Datenbank-Snapshot erstellen und nur die Homepage-Metadaten korrigieren.
3. HTTP GETs von Apex, www, Sitemap und robots prüfen; `www` soll permanent zum gleichen Pfad ohne www umleiten. Sicherstellen, dass `canonical` genau 1x vorkommt, `og:url` auf Apex zeigt, Sitemap-URLs mit Apex beginnen.
4. Manuelle Mobile-Kontrolle: Startseite (normale und private Browsersitzung), Login, ein Inserat mit Foto, Bietfunktion ohne produktives Testgebot. Echte Gebote und Käufe nur in isolierter Testumgebung. Nicht ohne diesen Test „alles erfolgreich“ behaupten.
5. Bei Fehler die vorbereitete Rollback-SQL nur nach erneuter Prüfung ausführen; bei nicht passender Prüfsumme Änderungen nicht überschreiben.
6. Die öffentlichen Domains bzw. die Vercel-Produktivzuordnung **nicht** verändern, solange die kleine HTML-Korrektur genügt.

## Rückgängig machen und Grenzen

- Bis zu einer ausdrücklichen Freigabe: **kein Live-Rollback nötig**, da keine Produktionsänderung erfolgt.
- Die SQL-Rückkehr nutzt `backup-before-domain-step3-20261108` als Einzelsicherung, zusätzlich zu den täglichen Backups aus Schritt 2.
- Die bisherigen HTTP-Tests sind serverseitige GETs, kein simulierter kompletter Browser-/Handy-Bietprozess.
