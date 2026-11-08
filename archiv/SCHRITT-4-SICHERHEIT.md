# KaufMich24 – Schritt 4: Absicherung

Stand: 08.11.2026 (Europe/Zurich). Sicherheitsprüfung nach der freigegebenen Domain-Korrektur.
**Keine Kontoeinstellungen, Passwörter, 2FA-Faktoren, DNS-Einträge, Stripe-Schlüssel, Website-Einstellungen oder Produktivdateien geändert.**

## A. Kurze 2FA-Anleitung für die sieben Dienste

Bei jedem Dienst bitte eine Authenticator-App bzw. einen Passkey/Sicherheitsschlüssel bevorzugen und die vom Anbieter angebotene Wiederherstellung **getrennt vom Smartphone** sicher aufbewahren. Niemals einen Anmelde-/Einrichtungscode, QR-Code, Passwort, Recovery-Code oder Private Key im Chat oder GitHub teilen.

| Dienst | So aktivierst du den zweiten Faktor | Offizielle Hilfe |
|---|---|---|
| **GitHub** | https://github.com → Profilbild → **Settings → Password and authentication → Two-factor authentication → Enable**. Authenticator-App einrichten, verifizieren und Recovery-Codes offline sichern. Wenn schon aktiv: bestehenden Zustand prüfen, statt erneut zu aktivieren. | https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication |
| **Supabase** | https://supabase.com/dashboard → eigenes Benutzerprofil / **Account Settings → Multi-factor authentication** → TOTP hinzufügen und bestätigen. **Wichtig:** Supabase bietet derzeit keine Recovery-Codes. Richte unbedingt einen zweiten unabhängigen TOTP-Faktor ein, denn ohne Faktor könnte Kontozugriff dauerhaft verloren gehen. | https://supabase.com/docs/guides/platform/multi-factor-authentication |
| **Railway** | https://railway.com → eigene **Account Security Settings** → **Set up two-factor authentication** → TOTP-App scannen, Code bestätigen, Recovery-Codes getrennt speichern. Optional Passkey hinzufügen. | https://docs.railway.com/access/multi-factor-authentication |
| **Vercel** | https://vercel.com → Profilbild → **Settings → Authentication** → 2FA aktivieren und TOTP-App konfigurieren. Zusätzlich Passkey möglich. Beim Erzwingen der Team-2FA vorher Auswirkungen auf CI/CD-Tokens und Mitglieder prüfen. | https://vercel.com/changelog/2fa-is-now-available |
| **Stripe** | https://dashboard.stripe.com → Profil / **Personal details → Two-step authentication → Add authentication method** → Authenticator-App, Passkey oder Sicherheitsschlüssel registrieren; Backup-Code sicher aufbewahren. | https://support.stripe.com/questions/enable-two-step-authentication?locale=en-GB |
| **Domain/DNS: Hostpoint** | https://admin.hostpoint.ch → **Admin → Hostpoint ID → Passwort & Sicherheit → Jetzt aktivieren** → Authenticator-App bestätigen. Hostpoint ist als **DNS-Anbieter anhand der Nameserver** bestätigt; falls die Domain bei einem anderen Registrar registriert ist, dessen Zugang separat schützen. | https://support.hostpoint.ch/de/administratives/hostpoint-id/zwei-faktor-authentifizierung/haeufig-gestellte-fragen-zur-zwei-faktor-authentifizierung/wo-aktiviere-ich-die-zwei-faktor-authentifizierung |
| **Google Play Console** | Die Play Console verwendet die Sicherheit des **Google-Kontos**. Öffne https://myaccount.google.com/security → **Sicherheit & Anmeldung → 2‑Faktor-Authentifizierung**; dann Passkey, Google Prompt oder Authenticator-App einrichten und Wiederherstellungsoptionen hinterlegen. | https://support.google.com/accounts/answer/185839?hl=de |

**Wichtige Grenze:** Die Kontoverbindungen geben keine verlässliche Auskunft darüber, welche Personen bereits 2FA aktiviert haben; kein Status wird als „aktiviert“ behauptet. Die Aktivierung verlangt die eigene Interaktion des Kontoinhabers.

## B. Ergebnis des Quellcode-Secret-Audits

### Untersuchter Stand

- **Produktiv-HTML:** `public.kaufmich_frontend_snapshots` / `name='live'`, nach der Domain-Korrektur (2'356'136 Bytes, MD5 `1106a611f9ac541c60018fd81e0c957b`).
- **GitHub öffentliches Repository:** `Bookiii92/KaufMich24`, Branch `main`: 11 Textdateien sowie 1 ZIP-Archiv; ZIP mit **13 Originaldateien**, einschliesslich `.env.example`, erfolgreich entpackt und auf erkennbare Geheimnisformate geprüft.
- **GitHub Archivbranch:** `archiv/stand-vor-aufraeumen-2026-11-07` mit vollständigem **2,36-MB Original-Frontend**. Der Git-Blob wurde direkt ausgelesen und separat auf Muster geprüft. Die aufgespaltenen HTML/CSS/JS-Dateien stammen verlustfrei aus diesem Original-Frontend. Der separate Backup-Worker und die begleitenden Skripte/Dokumente wurden auf dieselben Muster geprüft.
- **Private Android-Quellen:** `Bookiii92/kaufmich24-android`, `main`: Gradle-, Java-, Manifest-, GitHub-Actions-, Dokumentations- und Einstellungstexte. Keine eingebetteten Android-Signierschlüsseldateien (`.jks`, `.keystore`, `.p12`, `.pem`) im Git-Baum; Workflow liest Upload-Keystore und Signierpasswörter aus GitHub Actions Secrets.

### Gesuchte Geheimnisformate

Stripe `sk_live_` / `sk_test_` / `rk_live_` / `rk_test_`, Stripe-Webhooks `whsec_`, Supabase `sb_secret_`, direkt eingebettete Service-Role-JWTs, GitHub Personal Access Tokens, AWS-AKIA-/ASIA-Tokens, private PEM-Schlüssel sowie typische weitere Token-Präfixe.

**Ergebnis: keine Treffer dieser bekannten Secret-Formate im untersuchten Quellbestand.** Im Frontend gibt es einen Supabase-`sb_publishable_`-Schlüssel, der *zum öffentlichen Browsergebrauch vorgesehen* ist; bei richtiger RLS und Berechtigungskonfiguration ist dies **kein** Server-Secret. Der serverseitige Backup-Worker nennt `SUPABASE_SERVICE_ROLE_KEY` als **Umgebungsvariablennamen**, enthält aber keinen hartcodierten Schlüsselwert.

**Einschränkungen:** Musterbasierte Prüfungen erkennen keine willkürlich benannten oder gut verschleierten Secrets. Nicht verifiziert wurden alle alten Git-Committrees, GitHub Secret-Scanning-Alerts oder Anbieter-Secrets, die ausserhalb des Git-Repos gespeichert sind. Vor der Zusammenarbeit mit Externen sollte GitHub Secret Scanning / Push Protection bzw. ein lokales Repository-History-Audit mit `gitleaks git` (alle Branches/Commits) ergänzt werden. **Das grosse HTML-Archiv befindet sich in einem PUBLIC Repository.** Falls der Quellcode nicht öffentlich sein soll, diesen in ein privates Repository überführen; blosse Umstellung auf „private“ entfernt zuvor kopierte Inhalte nicht.

## C. Google Play App Signing – tatsächlicher Status

**Nicht verifizierbar mit den verbundenen Zugriffsrechten.** Das Android-Projekt `ch.kaufmich24.app` besitzt einen Workflow für einen signierten AAB-Upload mit GitHub Actions Secrets; dies belegt nicht den **Play-App-Signing-Status** bei Google.

In https://play.google.com/console/:
1. **KaufMich24** auswählen.
2. **Mit Google Play geschützt → Google Play Store-Vertrieb → Play App-Signatur aufrufen** (Menünamen ggf. leicht abweichend; alternativ **App-Integrität/App signing**).
3. Nach **App-Signaturschlüsselzertifikat** und **SHA-256-Fingerabdruck** suchen. Der **App-Signing**-Fingerprint ist vom Upload-Key-Fingerprint zu unterscheiden.
4. Wenn der Schlüssel und Zertifikatsfingerabdruck angezeigt werden, spricht das für aktiviertes Play App Signing; eine verbindliche Bestätigung braucht die Console-Ansicht.

Google-Hilfe: https://support.google.com/googleplay/android-developer/answer/9842756?hl=de-DE

**Zusätzliche reale Live-Prüfung:** GET `https://kaufmich24.ch/.well-known/assetlinks.json` antwortet derzeit **HTTP 404** mit `app_links_signing_fingerprint_pending`. Für eine verifizierte Trusted Web Activity (TWA) müssen Paketname `ch.kaufmich24.app` und der **richtige Google Play App Signing SHA-256-Fingerprint** als Digital Asset Links verfügbar sein. Keinen privaten Signierschlüssel in den Browser, Chat oder GitHub kopieren. Ein öffentlicher Zertifikatsfingerabdruck ist kein privater Schlüssel.

## D. Was wurde geändert, wie testen, wie rückgängig machen?

- **Geändert:** Nur dieses Markdown-Auditdokument im isolierten GitHub-Archivbranch. Keine Änderung an der produktiven Seite, Supabase-Datenbank, Domain, Railway, Vercel, Stripe oder Google Play Console.
- **Auf dem Handy testen:** Jede Dienstanmeldung in eigenem Browser öffnen, Konto-Menü und 2FA-Status prüfen. Nach selbst durchgeführter Aktivierung in einem privaten Browserfenster neu anmelden und Authenticator-/Passkey-Abfrage verifizieren. Bei Supabase zuerst unbedingt zweiten TOTP-Faktor einrichten. Auf KaufMich24 Startseite und Inserate kurz öffnen; durch diese Prüfung werden sie nicht verändert.
- **Rückgängig machen:** An produktiven Systemen ist nichts zurückzusetzen. Diese Datei kann per Git-Revert aus dem isolierten Branch entfernt werden. Einmal aktivierte 2FA sollte man aus Sicherheitsgründen **nicht** abschalten, nur um etwas rückgängig zu machen.

**Schritt 5 / neue Funktionen / SEO nicht begonnen.** Vor der tatsächlichen Live-Reparatur von `assetlinks.json` muss der korrekte Play-Zertifikatsfingerabdruck aus der Play Console bestätigt und eine neue Live-Änderung ausdrücklich freigegeben werden.
