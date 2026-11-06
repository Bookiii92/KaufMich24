-- Throwaway PostgreSQL 17 integration fixture. Never execute in production.
\set ON_ERROR_STOP on
ALTER TABLE public.categories ADD COLUMN is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.profiles
  ADD COLUMN city text,
  ADD COLUMN postal_code text,
  ADD COLUMN canton text;
UPDATE public.profiles SET city='Triengen',postal_code='6234',canton='LU';

CREATE TABLE public.listings(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.profiles(id),
  category_slug text NOT NULL REFERENCES public.categories(slug),
  title text NOT NULL CHECK(char_length(title) BETWEEN 3 AND 120),
  description text NOT NULL DEFAULT '',
  price_chf numeric NOT NULL CHECK(price_chf>=0),
  price_type text NOT NULL DEFAULT 'fixed',
  condition text NOT NULL DEFAULT 'used',
  city text,
  postal_code text,
  canton text,
  status text NOT NULL DEFAULT 'active',
  listing_intent text NOT NULL DEFAULT 'offer',
  listing_visibility text NOT NULL DEFAULT 'public',
  extra_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.listing_images(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id),
  storage_path text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  UNIQUE(listing_id,storage_path)
);
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY test_listing_select ON public.listings
  FOR SELECT TO authenticated USING (seller_id=auth.uid());
CREATE POLICY test_listing_insert ON public.listings
  FOR INSERT TO authenticated WITH CHECK (
    seller_id=auth.uid() AND private.has_marketplace_contact(auth.uid())
  );
CREATE POLICY test_images_select ON public.listing_images
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.listings l WHERE l.id=listing_id AND l.seller_id=auth.uid()));
CREATE POLICY test_images_insert ON public.listing_images
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.listings l WHERE l.id=listing_id AND l.seller_id=auth.uid()));
GRANT SELECT,INSERT ON public.listings,public.listing_images TO authenticated;

-- A representative 12/hour limit, while the actual live SQL uses the
-- existing private.guard_listing_abuse and dealer-specific triggers.
CREATE FUNCTION private.test_listing_hour_limit() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE used_count int;
BEGIN
  SELECT count(*) INTO used_count FROM public.listings l
   WHERE l.seller_id=NEW.seller_id
     AND l.created_at>now()-interval '1 hour';
  IF used_count>=12 THEN RAISE EXCEPTION '12 pro Stunde erreicht'; END IF;
  RETURN NEW;
END;$$;
CREATE TRIGGER test_listing_hour_limit BEFORE INSERT ON public.listings
 FOR EACH ROW EXECUTE FUNCTION private.test_listing_hour_limit();

INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES('listing-images','listing-images',true,10485760,
 ARRAY['image/jpeg','image/png','image/webp']);
CREATE POLICY test_public_storage_read ON storage.objects FOR SELECT TO authenticated
 USING (bucket_id='listing-images');
CREATE POLICY test_public_storage_insert ON storage.objects FOR INSERT TO authenticated
 WITH CHECK (bucket_id='listing-images' AND split_part(name,'/',1)=auth.uid()::text);
