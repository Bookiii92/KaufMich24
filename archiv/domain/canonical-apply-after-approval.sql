-- PREPARED ONLY – DO NOT RUN without explicit user approval and a NEW completed backup.
-- Project: Supabase aaqqcnrnrvybboirrrtd
-- Canonical homepage correction; the live domain / Vercel routing stay unchanged.
BEGIN;
DO $domain$
DECLARE
  old_html text;old_updated_at timestamptz;new_html text;
  old_tag constant text := '<link rel="canonical" href="https://www.kaufmich24.ch/">';
  new_tag constant text := '<link rel="canonical" href="https://kaufmich24.ch/">';
  old_og constant text := '<meta property="og:url" content="https://www.kaufmich24.ch/">';
  new_og constant text := '<meta property="og:url" content="https://kaufmich24.ch/">';
  backup_name constant text := 'backup-before-domain-step3-20261108';
  n_old integer; n_og integer; first_pos integer; second_pos integer;
BEGIN
  SELECT html,updated_at INTO STRICT old_html,old_updated_at
  FROM public.kaufmich_frontend_snapshots WHERE name='live' FOR UPDATE;
  IF md5(old_html) <> '7b4d2ffd9ea2eff12f2c9bf6d9fd4fef' THEN
    RAISE EXCEPTION 'STOP: production HTML changed since validated dry-run';
  END IF;
  n_old:=(length(old_html)-length(replace(old_html,old_tag,'')))/length(old_tag);
  n_og:=(length(old_html)-length(replace(old_html,old_og,'')))/length(old_og);
  IF n_old<>2 OR n_og<>1 THEN
    RAISE EXCEPTION 'STOP: expected 2 old canonicals and 1 old og:url, got % and %',n_old,n_og;
  END IF;
  IF EXISTS (SELECT 1 FROM public.kaufmich_frontend_snapshots WHERE name=backup_name) THEN
    RAISE EXCEPTION 'STOP: rollback snapshot name already exists';
  END IF;
  -- Secure in-database rollback point before modifying the original row.
  INSERT INTO public.kaufmich_frontend_snapshots(name,html,updated_at)
  VALUES(backup_name,old_html,old_updated_at);
  first_pos:=strpos(old_html,old_tag);
  second_pos:=first_pos+length(old_tag)-1+
    strpos(substr(old_html,first_pos+length(old_tag)),old_tag);
  IF first_pos<1 OR second_pos<=first_pos THEN
    RAISE EXCEPTION 'STOP: duplicate position not found';
  END IF;
  new_html:=replace(
     replace(overlay(old_html placing '' from second_pos for length(old_tag)),old_tag,new_tag),
     old_og,new_og
  );
  IF md5(new_html) <> '1106a611f9ac541c60018fd81e0c957b' THEN
    RAISE EXCEPTION 'STOP: reconstructed HTML checksum differs from dry-run';
  END IF;
  UPDATE public.kaufmich_frontend_snapshots
  SET html=new_html,updated_at=now() WHERE name='live';
END
$domain$;
COMMIT;
-- Postflight: inspect GET https://kaufmich24.ch/ and robots.txt, sitemap.xml,
-- login, image, listing, bidding UI; no real purchase/bid on production.
