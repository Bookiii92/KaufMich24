-- REVIEW ONLY. Do not execute on live until isolated PostgreSQL tests and
-- photo-copy/rollback behavior have been checked.
-- One verified private draft -> one public listing, using existing triggers.
-- Uses SECURITY INVOKER so all usual row policies and listing rate limits run.
CREATE OR REPLACE FUNCTION public.km24_publish_photo_draft(p_item_id uuid)
RETURNS uuid
LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
AS $fn$
DECLARE
  v_uid uuid := auth.uid();
  v_batch uuid;
  v_item public.km24_bulk_draft_items%ROWTYPE;
  v_listing public.listings%ROWTYPE;
  v_count int;
  v_city text;
  v_post text;
  v_canton text;
BEGIN
  IF v_uid IS NULL OR p_item_id IS NULL THEN
    RAISE EXCEPTION 'Bitte zuerst als Firmenkonto anmelden.';
  END IF;
  IF NOT private.is_account_active(v_uid)
     OR NOT private.has_marketplace_contact(v_uid)
     OR NOT EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=v_uid
                      AND p.account_type IN ('business','dealer')) THEN
    RAISE EXCEPTION 'Firmenkonto und Kontaktdaten müssen bestätigt sein.';
  END IF;

  SELECT i.batch_id INTO v_batch FROM public.km24_bulk_draft_items i
    WHERE i.id=p_item_id AND i.owner_id=v_uid;
  IF NOT FOUND THEN RAISE EXCEPTION 'Entwurf nicht gefunden oder nicht berechtigt.'; END IF;

  -- Lock in same order as the existing private photo quota triggers: batch, item.
  PERFORM 1 FROM public.km24_bulk_draft_batches b
    WHERE b.id=v_batch AND b.owner_id=v_uid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Import nicht gefunden.'; END IF;
  SELECT i.* INTO STRICT v_item FROM public.km24_bulk_draft_items i
    WHERE i.id=p_item_id AND i.batch_id=v_batch AND i.owner_id=v_uid FOR UPDATE;

  -- Deterministic listing UUID (draft item UUID) prevents duplicate publishing.
  SELECT l.* INTO v_listing FROM public.listings l WHERE l.id=p_item_id;
  IF FOUND THEN
    IF v_listing.seller_id=v_uid
       AND v_listing.extra_fields @> '{"km24_photo_import":true}'::jsonb
       AND EXISTS(SELECT 1 FROM public.listing_images li WHERE li.listing_id=p_item_id) THEN
      RETURN p_item_id;
    END IF;
    RAISE EXCEPTION 'Diese Artikel-ID ist bereits vergeben.';
  END IF;

  IF NOT EXISTS(SELECT 1 FROM public.km24_bulk_draft_batches b
                WHERE b.id=v_batch AND b.state='draft' AND b.owner_id=v_uid) THEN
    RAISE EXCEPTION 'Der Import ist archiviert und kann nicht veröffentlicht werden.';
  END IF;
  IF char_length(btrim(v_item.title)) < 3 OR v_item.price_chf IS NULL
     OR v_item.category_slug IS NULL THEN
    RAISE EXCEPTION 'Titel, Preis und Kategorie müssen ergänzt werden.';
  END IF;
  IF NOT EXISTS(SELECT 1 FROM public.categories c
      WHERE c.slug=v_item.category_slug AND c.is_active=true) THEN
    RAISE EXCEPTION 'Bitte eine gültige Kategorie wählen.';
  END IF;

  SELECT coalesce(nullif(btrim(v_item.city),''),
                  nullif(btrim(p.city),'')),
         coalesce(nullif(btrim(v_item.postal_code),''),
                  nullif(btrim(p.postal_code),'')),
         coalesce(nullif(btrim(v_item.canton),''),
                  nullif(btrim(p.canton),''))
    INTO v_city,v_post,v_canton FROM public.profiles p WHERE p.id=v_uid;
  IF coalesce(v_city,'')='' OR coalesce(v_post,'')='' THEN
    RAISE EXCEPTION 'Bitte Firmenstandort und PLZ ergänzen.';
  END IF;

  SELECT count(*) INTO v_count FROM public.km24_bulk_draft_photos ph
    WHERE ph.item_id=p_item_id AND ph.owner_id=v_uid AND ph.batch_id=v_batch;
  IF v_count<1 OR v_count>10 THEN
    RAISE EXCEPTION 'Für jeden Artikel werden 1 bis 10 Fotos benötigt.';
  END IF;

  -- Check all files EXIST in BOTH buckets: source upload succeeded and
  -- the browser completed its Storage cross-bucket copy.
  IF EXISTS(
    SELECT 1 FROM public.km24_bulk_draft_photos ph
      WHERE ph.item_id=p_item_id AND ph.batch_id=v_batch AND ph.owner_id=v_uid
        AND (
          NOT EXISTS (SELECT 1 FROM storage.objects src
            WHERE src.bucket_id='km24-bulk-draft-photos'
              AND src.name=ph.object_name)
          OR NOT EXISTS (SELECT 1 FROM storage.objects dst
            WHERE dst.bucket_id='listing-images'
              AND dst.name=v_uid::text||'/'||p_item_id::text||'/'||
                  split_part(ph.object_name,'/',4))
        )
  ) THEN
    RAISE EXCEPTION 'Ein Foto fehlt noch. Bitte Bildübertragung erneut versuchen.';
  END IF;

  -- Existing INSERT triggers enforce verified seller, 12/hr, 60/day,
  -- dealer tariff caps, forbidden content and any marketplace fees.
  -- This INSERT and the image rows are committed atomically.
  INSERT INTO public.listings (
    id,seller_id,category_slug,title,description,price_chf,price_type,
    condition,city,postal_code,canton,status,listing_intent,listing_visibility,
    extra_fields
  ) VALUES (
    p_item_id,v_uid,v_item.category_slug,btrim(v_item.title),v_item.description,
    v_item.price_chf,CASE WHEN v_item.price_chf=0 THEN 'free' ELSE 'fixed' END,
    v_item.condition,v_city,v_post,v_canton,'active','offer','public',
    jsonb_build_object('km24_photo_import',true)
  );

  INSERT INTO public.listing_images(listing_id,storage_path,sort_order)
  SELECT p_item_id,
       v_uid::text||'/'||p_item_id::text||'/'||split_part(ph.object_name,'/',4),
       ph.sort_order
    FROM public.km24_bulk_draft_photos ph
    WHERE ph.item_id=p_item_id AND ph.owner_id=v_uid AND ph.batch_id=v_batch
    ORDER BY ph.sort_order,ph.created_at;

  RETURN p_item_id;
END
$fn$;
REVOKE ALL ON FUNCTION public.km24_publish_photo_draft(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.km24_publish_photo_draft(uuid) TO authenticated;
