# KaufMich24 – Kapazitäts- und Lasttest (Vorbereitung)

**Status (8. November 2026):** Testszenario erstellt, aber kein künstlicher Traffic gestartet. Live-System unverändert.

## Warum noch kein Live-Lasttest?
- Railway-Staging-Dienste haben aktuell keine aktive Deployment-Instanz.
- Die `server.py` im GitHub-Repository nutzt standardmässig die **produktive** Supabase Edge Function als UPSTREAM_URL.
- Supabase hat keine separate Entwicklungsdatenbank (Branch-Liste ist leer).
- Ein Test der bestehenden Staging-Domain könnte daher unbemerkt die Produktion treffen.

## Voraussetzungen
1. Dedizierte Testumgebung mit eigener Datenbank und Testdaten (synthetische Inserate, Nutzer, Bilder).
2. Test-Frontend und APIs müssen **ausschliesslich** diese Testdatenbank nutzen, inklusive Storage, Auth, RPCs und Background Jobs.
3. Test-Service muss `GET /__loadtest/identity` mit `{"environment":"isolated-staging","isolated":true,"production_connected":false,"database_ref":"<test-project-ref>"}` beantworten. Die Identität ist eine zusätzliche technische Schranke, kein Ersatz für die Konfigurationsprüfung.
4. DB-/Storage-/Provider-URLs nachkontrollieren. Externe Zahlungen, E-Mail-, Push- und Webhook-Worker im Test deaktivieren.
5. k6 installieren und Test-Inserat-ID im Testsystem einrichten.

## Durchführung
```bash
ISOLATED_TEST_APPROVED=YES_ISOLATED_FROM_PRODUCTION \
BASE_URL=https://kaufmich-staging-production.up.railway.app \
TEST_LISTING_PATH=/listing/<TEST-UUID> \
k6 run tools/performance/k6-loadtest.js
```

**WICHTIG:** Die angegebene Railway-URL darf erst verwendet werden, wenn dort ein isoliertes Test-Deployment existiert und `/__loadtest/identity` seine Trennung bestätigt. Die aktuell vorhandene Staging-Service-Konfiguration ist dafür nicht geeignet.

Die Stufen betragen 25, 50, 100, 250 virtuelle Nutzer, mit Denkpausen von 1,5–4 Sekunden. Für jedes Niveau p50, p95, p99, Fehlerquote und Durchsatz aufzeichnen. Der Test bricht bei zu hoher Fehlerquote oder p95-Latenz automatisch ab. Browser-Rendering, Login, Suche, Upload und Chat benötigen später zusätzliche separate Tests und sind durch dieses HTTP-Szenario noch nicht abgedeckt.

## Status der Produktionsumgebung (nur lesend ermittelt)
- Supabase Pro, Projekt-ID: `aaqqcnrnrvybboirrrtd`
- Postgres `max_connections=60` (kein Limit für registrierte Nutzer)
- 19 Profile, 179 Inserate, 369 Bild-Datensätze zum Prüfzeitpunkt
- Datenbankgrösse rund 301 MB; davon ca. 150 MB Frontend-Snapshots
- HTML-Snapshot ca. 2,36 MB ungepackt; Caching im Edge-App-Server überwiegend deaktiviert

**Keine verifizierte Kapazitätsgrenze:** Die Zahl gleichzeitig möglicher Besucher kann erst nach einem isolierten Lasttest mit echter Ergebnisdatei angegeben werden.
