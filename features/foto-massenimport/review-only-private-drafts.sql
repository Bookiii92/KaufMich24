-- REVIEW ONLY: do not apply automatically to KaufMich24 production.
-- Isolated server-side draft storage for the photo bulk-import feature.
-- Requires security review and a separate explicit release approval.
BEGIN;

CREATE TABLE public.km24_bulk_draft_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Foto-Massenimport' CHECK (char_length(title) BETWEEN 1 AND 120),
  state text NOT NULL DEFAULT 'draft' CHECK (state IN ('draft','archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(id, owner_id)
);

CREATE TABLE public.km24_bulk_draft_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL,
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  sort_order int NOT NULL DEFAULT 0 CHECK (sort_order BETWEEN 0 AND 99),
  title text NOT NULL DEFAULT '' CHECK (char_length(title) <= 120),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 5000),
  price_chf numeric(12,2) CHECK (price_chf >= 0),
  category_slug text REFERENCES public.categories(slug),
  condition text NOT NULL DEFAULT 'new'
    CHECK (condition IN ('new','like_new','used','defective')),
  city text NOT NULL DEFAULT '' CHECK (char_length(city) <= 150),
  postal_code text NOT NULL DEFAULT '' CHECK (char_length(postal_code) <= 20),
  canton text NOT NULL DEFAULT '' CHECK (char_length(canton) <= 2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT km24_bulk_items_owner_batch_fk
    FOREIGN KEY (batch_id,owner_id)
    REFERENCES public.km24_bulk_draft_batches(id,owner_id) ON DELETE CASCADE,
  UNIQUE(id,batch_id,owner_id)
);

CREATE TABLE public.km24_bulk_draft_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL,
  batch_id uuid NOT NULL,
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  object_name text NOT NULL UNIQUE,
  mime_type text NOT NULL CHECK (mime_type IN ('image/jpeg','image/png','image/webp')),
  size_bytes bigint NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 10485760),
  sort_order int NOT NULL DEFAULT 0 CHECK (sort_order BETWEEN 0 AND 9),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT km24_bulk_photo_owner_item_fk
    FOREIGN KEY(item_id,batch_id,owner_id)
    REFERENCES public.km24_bulk_draft_items(id,batch_id,owner_id) ON DELETE CASCADE,
  CONSTRAINT km24_bulk_photo_object_path CHECK (
    split_part(object_name,'/',1) = owner_id::text
    AND split_part(object_name,'/',2) = batch_id::text
    AND split_part(object_name,'/',3) = item_id::text
    AND split_part(object_name,'/',4) ~ '^[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$'
    AND object_name !~ '//'
    AND array_length(string_to_array(object_name,'/'),1) = 4
  )
);

CREATE INDEX km24_bulk_batches_owner ON public.km24_bulk_draft_batches(owner_id,created_at DESC);
CREATE INDEX km24_bulk_items_batch ON public.km24_bulk_draft_items(batch_id,sort_order);
CREATE INDEX km24_bulk_photos_item ON public.km24_bulk_draft_photos(item_id,sort_order);

-- Parent row lock serializes concurrent inserts and guards each quota.
CREATE FUNCTION private.km24_bulk_draft_quota_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
AS $fn$
DECLARE n int;
BEGIN
  IF tg_table_name = 'km24_bulk_draft_batches' THEN
    IF NEW.state <> 'draft' THEN RETURN NEW; END IF;
    PERFORM pg_advisory_xact_lock(hashtextextended(NEW.owner_id::text, 20261105));
    SELECT count(*) INTO n FROM public.km24_bulk_draft_batches
      WHERE owner_id = NEW.owner_id AND state = 'draft';
    IF n >= 5 THEN RAISE EXCEPTION 'Maximal fünf offene Foto-Importe.'; END IF;
  ELSIF tg_table_name = 'km24_bulk_draft_items' THEN
    PERFORM 1 FROM public.km24_bulk_draft_batches b
      WHERE b.id = NEW.batch_id AND b.owner_id = NEW.owner_id AND b.state = 'draft'
      FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Der Import ist nicht bearbeitbar.'; END IF;
    SELECT count(*) INTO n FROM public.km24_bulk_draft_items
      WHERE batch_id = NEW.batch_id;
    IF n >= 100 THEN RAISE EXCEPTION 'Maximal 100 Artikel pro Import.'; END IF;
  ELSIF tg_table_name = 'km24_bulk_draft_photos' THEN
    PERFORM 1 FROM public.km24_bulk_draft_items i
      JOIN public.km24_bulk_draft_batches b ON b.id = i.batch_id AND b.owner_id = i.owner_id
      WHERE i.id = NEW.item_id AND i.batch_id = NEW.batch_id
        AND i.owner_id = NEW.owner_id AND b.state = 'draft'
      FOR UPDATE OF i;
    IF NOT FOUND THEN RAISE EXCEPTION 'Der Import ist nicht bearbeitbar.'; END IF;
    SELECT count(*) INTO n FROM public.km24_bulk_draft_photos
      WHERE item_id = NEW.item_id;
    IF n >= 10 THEN RAISE EXCEPTION 'Maximal zehn Bilder pro Artikel.'; END IF;
  END IF;
  RETURN NEW;
END
$fn$;

CREATE TRIGGER km24_bulk_batch_quota BEFORE INSERT ON public.km24_bulk_draft_batches
 FOR EACH ROW EXECUTE FUNCTION private.km24_bulk_draft_quota_guard();
CREATE TRIGGER km24_bulk_item_quota BEFORE INSERT ON public.km24_bulk_draft_items
 FOR EACH ROW EXECUTE FUNCTION private.km24_bulk_draft_quota_guard();
CREATE TRIGGER km24_bulk_photo_quota BEFORE INSERT ON public.km24_bulk_draft_photos
 FOR EACH ROW EXECUTE FUNCTION private.km24_bulk_draft_quota_guard();

ALTER TABLE public.km24_bulk_draft_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.km24_bulk_draft_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.km24_bulk_draft_photos ENABLE ROW LEVEL SECURITY;

-- Only contact-complete firm/dealer accounts may create new draft batches.
CREATE POLICY km24_bulk_batches_select_own ON public.km24_bulk_draft_batches
  FOR SELECT TO authenticated USING (owner_id = (SELECT auth.uid()));
CREATE POLICY km24_bulk_batches_insert_eligible ON public.km24_bulk_draft_batches
  FOR INSERT TO authenticated WITH CHECK (
    owner_id = (SELECT auth.uid())
    AND private.has_marketplace_contact((SELECT auth.uid()))
    AND private.is_account_active((SELECT auth.uid()))
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = (SELECT auth.uid())
      AND p.account_type IN ('business','dealer'))
  );
CREATE POLICY km24_bulk_batches_update_own ON public.km24_bulk_draft_batches
  FOR UPDATE TO authenticated
  USING (owner_id = (SELECT auth.uid()))
  WITH CHECK (owner_id = (SELECT auth.uid()));
CREATE POLICY km24_bulk_batches_delete_own ON public.km24_bulk_draft_batches
  FOR DELETE TO authenticated USING (owner_id = (SELECT auth.uid()));

CREATE POLICY km24_bulk_items_select_own ON public.km24_bulk_draft_items
  FOR SELECT TO authenticated USING (owner_id = (SELECT auth.uid()));
CREATE POLICY km24_bulk_items_insert_own ON public.km24_bulk_draft_items
  FOR INSERT TO authenticated WITH CHECK (
    owner_id = (SELECT auth.uid()) AND
    EXISTS (SELECT 1 FROM public.km24_bulk_draft_batches b
      WHERE b.id = batch_id AND b.owner_id = (SELECT auth.uid()) AND b.state = 'draft')
  );
CREATE POLICY km24_bulk_items_update_own ON public.km24_bulk_draft_items
  FOR UPDATE TO authenticated USING (
    owner_id = (SELECT auth.uid()) AND EXISTS(
      SELECT 1 FROM public.km24_bulk_draft_batches b
      WHERE b.id = batch_id AND b.owner_id = (SELECT auth.uid()) AND b.state = 'draft')
  ) WITH CHECK (
    owner_id = (SELECT auth.uid()) AND EXISTS(
      SELECT 1 FROM public.km24_bulk_draft_batches b
      WHERE b.id = batch_id AND b.owner_id = (SELECT auth.uid()) AND b.state = 'draft')
  );
CREATE POLICY km24_bulk_items_delete_own ON public.km24_bulk_draft_items
  FOR DELETE TO authenticated USING (owner_id = (SELECT auth.uid()) AND
    EXISTS (SELECT 1 FROM public.km24_bulk_draft_batches b
      WHERE b.id = batch_id AND b.owner_id = (SELECT auth.uid()) AND b.state = 'draft'));

CREATE POLICY km24_bulk_photos_select_own ON public.km24_bulk_draft_photos
  FOR SELECT TO authenticated USING (owner_id = (SELECT auth.uid()));
CREATE POLICY km24_bulk_photos_insert_own ON public.km24_bulk_draft_photos
  FOR INSERT TO authenticated WITH CHECK (
    owner_id = (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM public.km24_bulk_draft_items i
      JOIN public.km24_bulk_draft_batches b ON b.id = i.batch_id AND b.owner_id = i.owner_id
      WHERE i.id = item_id AND i.batch_id = batch_id AND
        i.owner_id = (SELECT auth.uid()) AND b.state = 'draft')
  );
CREATE POLICY km24_bulk_photos_delete_own ON public.km24_bulk_draft_photos
  FOR DELETE TO authenticated USING (owner_id = (SELECT auth.uid()) AND
    EXISTS (SELECT 1 FROM public.km24_bulk_draft_items i
      JOIN public.km24_bulk_draft_batches b ON b.id = i.batch_id AND b.owner_id = i.owner_id
      WHERE i.id = item_id AND i.batch_id = batch_id AND
        i.owner_id = (SELECT auth.uid()) AND b.state = 'draft'));

REVOKE ALL ON public.km24_bulk_draft_batches,public.km24_bulk_draft_items,public.km24_bulk_draft_photos FROM PUBLIC,anon;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.km24_bulk_draft_batches,public.km24_bulk_draft_items TO authenticated;
GRANT SELECT,INSERT,DELETE ON public.km24_bulk_draft_photos TO authenticated;

-- Private bucket; a public asset URL must never exist for unpublished photos.
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES('km24-bulk-draft-photos','km24-bulk-draft-photos',false,10485760,ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT(id) DO NOTHING;

-- Reserve metadata first, then upload to the same path with user JWT.
CREATE POLICY km24_bulk_storage_read_own ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'km24-bulk-draft-photos'
    AND EXISTS (SELECT 1 FROM public.km24_bulk_draft_photos p
      WHERE p.object_name = name AND p.owner_id = (SELECT auth.uid()))
  );
CREATE POLICY km24_bulk_storage_insert_own ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'km24-bulk-draft-photos'
    AND EXISTS (SELECT 1 FROM public.km24_bulk_draft_photos p
      JOIN public.km24_bulk_draft_batches b ON b.id = p.batch_id AND b.owner_id = p.owner_id
      WHERE p.object_name = name AND p.owner_id = (SELECT auth.uid()) AND b.state = 'draft')
  );
CREATE POLICY km24_bulk_storage_delete_own ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'km24-bulk-draft-photos'
    AND EXISTS (SELECT 1 FROM public.km24_bulk_draft_photos p
      JOIN public.km24_bulk_draft_batches b ON b.id = p.batch_id AND b.owner_id = p.owner_id
      WHERE p.object_name = name AND p.owner_id = (SELECT auth.uid()) AND b.state = 'draft')
  );

COMMIT;
