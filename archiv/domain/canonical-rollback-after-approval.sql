-- PREPARED ONLY – run only after explicit approval if live postflight fails.
-- Fails closed if site has changed after the canonical patch.
BEGIN;
DO $restore$
DECLARE live_html text;previous_html text;
BEGIN
 SELECT html INTO STRICT live_html FROM public.kaufmich_frontend_snapshots
 WHERE name='live' FOR UPDATE;
 IF md5(live_html) <> '1106a611f9ac541c60018fd81e0c957b' THEN
   RAISE EXCEPTION 'STOP: live HTML changed after step-3 patch. Reconcile changes before rollback.';
 END IF;
 SELECT html INTO STRICT previous_html
 FROM public.kaufmich_frontend_snapshots
 WHERE name='backup-before-domain-step3-20261108';
 IF md5(previous_html) <> '7b4d2ffd9ea2eff12f2c9bf6d9fd4fef' THEN
   RAISE EXCEPTION 'STOP: rollback snapshot checksum mismatch';
 END IF;
 UPDATE public.kaufmich_frontend_snapshots
 SET html=previous_html, updated_at=now() WHERE name='live';
END
$restore$;
COMMIT;
