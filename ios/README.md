# KaufMich24 iOS – isoliertes technisches Grundgerüst

**Status: Prototyp; NICHT App-Store-fertig.** Die iOS-Version befindet sich ausschliesslich auf dem Feature-Branch. Diese Dateien verändern weder die Live-Webseite noch Android, Vercel oder Supabase.

## Voraussetzungen

- macOS mit Xcode 26 oder neuer (Apple verlangt für neue Uploads derzeit mindestens Xcode 26).
- XcodeGen (z. B. `brew install xcodegen`).
- Für TestFlight und App Store: aktives Apple Developer Program und passende Signatur.

## Projekt generieren und testen

```sh
cd ios
xcodegen generate
open KaufMich24.xcodeproj
```

In Xcode das Entwicklerteam zuordnen und auf einem echten iPhone testen. Bundle ID: `ch.kaufmich24.app`. Zum Bauen für den Simulator ist keine kostenpflichtige Mitgliedschaft nötig.

## Enthaltene Grundlagen

- iOS SwiftUI-Einstieg mit eingebetteter Website über WKWebView und persistenter Websession
- native Zurück-, Start-, Aktualisieren- und Teilen-Aktionen
- Pull-to-Refresh und einfache Fehleranzeige

## Nicht fertig – diese Punkte zuerst auflösen

1. **Apple-Review 4.2:** Die App muss über einen blossen Website-Wrapper hinausgehen. Wesentliche native Mehrwerte (z. B. passende native Such-/Inseratfunktionen, Kamera-/Bildauswahl, Push, Deep Links) sind noch zu implementieren und zu testen.
2. **Anmeldung:** Google/Apple/E-Mail-Login, OAuth-Redirects und Sitzungen innerhalb WKWebView sind noch nicht auf dem Gerät getestet. Keine Aussage über funktionierenden Login machen.
3. **Bezahlte Inserate-Boosts:** Apple verlangt grundsätzlich In-App Purchase, wenn bezahlte Werbung im selben App-Erlebnis angezeigt wird. Bestehende Stripe/TWINT-Webzahlungen nicht ungeprüft in der iOS-App anbieten. Erst Zahlungs-/StoreKit-Konzept festlegen.
4. **UGC-Schutz:** Meldung, Moderation, Nutzerblockieren und Kontaktmöglichkeit implementieren bzw. verifizieren.
5. **Datenschutz:** In-App-Kontolöschung, Privacy Policy, App-Privacy-Formulare, Nutzungsbedingungen und gegebenenfalls Sign in with Apple / gleichwertige Login-Option prüfen.
6. **Medien/Dateien:** Fotos, Kamera, Uploads, Nachrichten, Auktionen und externe Links auf echtem iPhone testen. App-Icon (finales K24-Logo), Screenshots und Launch-Design ergänzen.
7. **Distribution:** Signieren, TestFlight-Tests durchführen, App Store Connect-Eintrag und Testzugang für Reviewer bereitstellen.

Weitere Informationen: https://developer.apple.com/app-store/review/guidelines/

**Keine Store-Einreichung, automatische Veröffentlichung oder Live-Änderung aus diesem Branch.**
