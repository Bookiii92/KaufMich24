-- Transactional publish smoke test in disposable PostgreSQL 17 only.
\set ON_ERROR_STOP on
CREATE SCHEMA IF NOT EXISTS km24_test;
CREATE FUNCTION km24_test.check_truth(ok boolean,note text) RETURNS void
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 IF ok IS DISTINCT FROM true THEN RAISE EXCEPTION 'TEST FAIL: %',note; END IF;
 RAISE NOTICE 'PASS: %',note;
END;$$;
CREATE FUNCTION km24_test.expect_rejected(q text,note text) RETURNS void
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 BEGIN
  EXECUTE q;
 EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'PASS: % (rejected)',note;
  RETURN;
 END;
 RAISE EXCEPTION 'TEST FAIL: % (unexpectedly permitted)',note;
END;$$;
GRANT USAGE ON SCHEMA km24_test TO authenticated,anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA km24_test TO authenticated,anon;
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
INSERT INTO public.km24_bulk_draft_batches(id,title)
VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Spielzeug Import');
INSERT INTO public.km24_bulk_draft_items(id,batch_id,title,price_chf,category_slug)
VALUES('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
       'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
       'Plüschhase',19.95,'spielzeug');
INSERT INTO public.km24_bulk_draft_photos(id,item_id,batch_id,object_name,mime_type,size_bytes)
VALUES('cccccccc-cccc-4ccc-8ccc-cccccccccccc',
       'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
       'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
       '11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/dddddddd-dddd-4ddd-8ddd-dddddddddddd.jpg',
       'image/jpeg',150);
SELECT km24_test.expect_rejected(
  $$SELECT public.km24_publish_photo_draft('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')$$,
  'No listing can publish without actual private and public images');
SELECT km24_test.check_truth(
  (SELECT count(*)=0 FROM public.listings),
  'No partial live listing on missing images');
INSERT INTO storage.objects(bucket_id,name) VALUES
('km24-bulk-draft-photos',
'11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/dddddddd-dddd-4ddd-8ddd-dddddddddddd.jpg');
SELECT km24_test.expect_rejected(
  $$SELECT public.km24_publish_photo_draft('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')$$,
  'No listing can publish until public image copy is complete');
INSERT INTO storage.objects(bucket_id,name) VALUES
('listing-images',
'11111111-1111-4111-8111-111111111111/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/dddddddd-dddd-4ddd-8ddd-dddddddddddd.jpg');
SELECT km24_test.check_truth(
 public.km24_publish_photo_draft('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')
 ='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'::uuid,
 'Published listing uses the draft item UUID');
SELECT km24_test.check_truth(
 (SELECT count(*)=1 FROM public.listings WHERE status='active'
    AND extra_fields @> '{"km24_photo_import":true}'::jsonb
    AND seller_id=auth.uid()),
 'Standard listing INSERT and account RLS path used');
SELECT km24_test.check_truth(
 (SELECT count(*)=1 FROM public.listing_images
   WHERE listing_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
     AND storage_path='11111111-1111-4111-8111-111111111111/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/dddddddd-dddd-4ddd-8ddd-dddddddddddd.jpg'),
 'Public listing has its expected photo metadata');
SELECT km24_test.check_truth(
 public.km24_publish_photo_draft('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')
 ='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'::uuid,
 'Repeated publish returns same listing');
SELECT km24_test.check_truth((SELECT count(*)=1 FROM public.listings),
 'Retry never creates duplicate listing');

SELECT set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',false);
SELECT km24_test.expect_rejected(
  $$SELECT public.km24_publish_photo_draft('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')$$,
  'Other dealer cannot publish or inspect another firms item');
SELECT set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',false);
SELECT km24_test.expect_rejected(
  $$SELECT public.km24_publish_photo_draft('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')$$,
  'Private account cannot publish business draft');
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);

-- Make second draft, but omit required category, even if a complete image exists.
INSERT INTO public.km24_bulk_draft_items(id,batch_id,title,price_chf)
VALUES('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
       'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Spielzeug ohne Kategorie',5);
SELECT km24_test.expect_rejected(
  $$SELECT public.km24_publish_photo_draft('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee')$$,
  'Missing category is rejected server-side');

-- Two images; simulated second image row failure rolls back entire listing
-- insert and any first image link, so no half-published article appears.
CREATE FUNCTION private.test_fail_second_image() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 IF new.sort_order=1 THEN RAISE EXCEPTION 'Simulierter Bildverknüpfungsfehler'; END IF;
 RETURN new;
END;$$;
CREATE TRIGGER fail_second_image BEFORE INSERT ON public.listing_images
 FOR EACH ROW EXECUTE FUNCTION private.test_fail_second_image();
INSERT INTO public.km24_bulk_draft_items(id,batch_id,title,price_chf,category_slug)
VALUES('ffffffff-ffff-4fff-8fff-ffffffffffff',
       'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Artikel mit zwei Bildern',24,'spielzeug');
INSERT INTO public.km24_bulk_draft_photos
 (id,item_id,batch_id,object_name,mime_type,size_bytes,sort_order) VALUES
 ('aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa',
  'ffffffff-ffff-4fff-8fff-ffffffffffff','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/ffffffff-ffff-4fff-8fff-ffffffffffff/eeeeeeee-1111-4111-8111-eeeeeeeeeeee.jpg',
  'image/jpeg',150,0),
 ('aaaaaaaa-2222-4222-8222-aaaaaaaaaaaa',
  'ffffffff-ffff-4fff-8fff-ffffffffffff','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/ffffffff-ffff-4fff-8fff-ffffffffffff/eeeeeeee-2222-4222-8222-eeeeeeeeeeee.jpg',
  'image/jpeg',150,1);
INSERT INTO storage.objects(bucket_id,name) VALUES
 ('km24-bulk-draft-photos','11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/ffffffff-ffff-4fff-8fff-ffffffffffff/eeeeeeee-1111-4111-8111-eeeeeeeeeeee.jpg'),
 ('km24-bulk-draft-photos','11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/ffffffff-ffff-4fff-8fff-ffffffffffff/eeeeeeee-2222-4222-8222-eeeeeeeeeeee.jpg'),
 ('listing-images','11111111-1111-4111-8111-111111111111/ffffffff-ffff-4fff-8fff-ffffffffffff/eeeeeeee-1111-4111-8111-eeeeeeeeeeee.jpg'),
 ('listing-images','11111111-1111-4111-8111-111111111111/ffffffff-ffff-4fff-8fff-ffffffffffff/eeeeeeee-2222-4222-8222-eeeeeeeeeeee.jpg');
SELECT km24_test.expect_rejected(
  $$SELECT public.km24_publish_photo_draft('ffffffff-ffff-4fff-8fff-ffffffffffff')$$,
  'Second image failure stops whole publish transaction');
SELECT km24_test.check_truth(
  (SELECT count(*)=0 FROM public.listings WHERE id='ffffffff-ffff-4fff-8fff-ffffffffffff')
  AND (SELECT count(*)=0 FROM public.listing_images WHERE listing_id='ffffffff-ffff-4fff-8fff-ffffffffffff'),
  'No half-published listing after SQL error');
DROP TRIGGER fail_second_image ON public.listing_images;

-- Existing insert quota remains effective when publishing drafts through RPC.
INSERT INTO public.listings(seller_id,category_slug,title,price_chf)
SELECT auth.uid(),'spielzeug','Testprodukt Nummer '||g,10
 FROM generate_series(1,11) g;
SELECT km24_test.check_truth(
 (SELECT count(*)=12 FROM public.listings WHERE seller_id=auth.uid()),
 'An existing 12/hour quota is reached through the normal listing INSERT');
SELECT km24_test.expect_rejected(
  $$SELECT public.km24_publish_photo_draft('ffffffff-ffff-4fff-8fff-ffffffffffff')$$,
  'Publishing cannot bypass normal listing hourly quota');
SELECT km24_test.check_truth(
 (SELECT count(*)=0 FROM public.listings WHERE id='ffffffff-ffff-4fff-8fff-ffffffffffff'),
 'Quota rejection leaves draft unpublished');
\echo === All photo bulk publication integration tests passed ===
