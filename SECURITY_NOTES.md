# Sicherheitsnotizen

Bereits im Supabase-Backend gehärtet:
- sensible Admin-RPCs für anon gesperrt
- buyer_confirm_transaction auf angemeldete Nutzer begrenzt
- AI-Usage-RLS korrigiert
- interne Mail-/Push-/AI-Queues für Browserrollen gesperrt
- Default-Privileges für neue Datenbankobjekte restriktiver gesetzt
- payment_availability auf SECURITY INVOKER umgestellt

Diese Railway-Version behebt zusätzlich die verbleibende direkte öffentliche Profilabfrage im Nachrichtenbereich auf Frontend-Ebene.

Noch separat in Supabase Dashboard aktivieren:
- Leaked Password Protection

Die produktive Domain erst nach einem vollständigen Staging-Test umschalten.
