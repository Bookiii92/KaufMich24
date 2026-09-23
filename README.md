# KaufMich24

Replit-unabhängige Railway-Basis für **KaufMich24**.

## Was dieses Projekt macht

- läuft direkt auf Railway mit Python 3.12
- verwendet den aktuellen KaufMich24-Frontendstand aus der bestehenden Supabase Edge Function
- patcht die alte direkte `profiles`-Abfrage im Nachrichtenbereich auf `seller_cards_public`
- lässt das eigene private Profil weiterhin über die bestehende sichere Backend-Logik laufen
- enthält einen `/health`-Endpunkt für Railway
- enthält Manifest, Service Worker, robots.txt und sitemap.xml
- verändert die aktuelle Live-Domain nicht, solange du diese neue Instanz nur als Test-Service deployest

## Empfohlener Ablauf

1. ZIP entpacken.
2. Den **Inhalt des Ordners** in das GitHub-Repository `Bookiii92/KaufMich24` hochladen.
3. In Railway **einen neuen Service** aus diesem GitHub-Repository erstellen.
4. Noch **nicht** `kaufmich24.ch` auf diesen Service legen.
5. Erst die von Railway erzeugte Test-Domain öffnen und testen.
6. Wenn Login, Inserate, Bilder, Nachrichten, Verkäuferprofile und Adminbereich funktionieren, kann die Hauptdomain umgestellt werden.

## Wichtig

Der Frontend-Quellstand wird in dieser Übergangsversion weiterhin aus der bestehenden Supabase Edge Function bezogen. Dadurch bleibt die Darstellung exakt am aktuellen KaufMich24-Stand und Replit ist für das Hosting nicht mehr nötig.

Im nächsten Schritt kann das Frontend vollständig als statische/strukturierte Dateien in dieses Repository übernommen werden. Bis dahin ist diese Proxy-Struktur der sichere Weg, ohne die produktive Seite zu gefährden.

## Sicherheitsfix

Der bekannte direkte Lesezugriff im Nachrichtenbereich:

`profiles -> select(id, display_name, business_name)`

wird vor Auslieferung automatisch auf die bereits vorhandene eingeschränkte RPC-Funktion `seller_cards_public` umgestellt.
