-- Executes against a throwaway PostgreSQL 17 GitHub Actions service ONLY.
\set ON_ERROR_STOP on
CREATE SCHEMA km24_test;
GRANT USAGE ON SCHEMA km24_test TO authenticated,anon;
CREATE FUNCTION km24_test.assert_true(ok boolean, label text)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  IF ok IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'FAILED: %', label;
  END IF;
  RAISE NOTICE 'PASS: %', label;
END;
$$;
CREATE FUNCTION km24_test.expect_denied(statement text, label text)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE rejection text;
BEGIN
  BEGIN
    EXECUTE statement;
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS rejection = MESSAGE_TEXT;
    RAISE NOTICE 'PASS: % (denied: %)', label, rejection;
    RETURN;
  END;
  RAISE EXCEPTION 'FAILED: % -- operation was allowed', label;
END;
$$;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA km24_test TO authenticated,anon;
\echo === PostgreSQL RLS test: A creates a business batch, item and photo ===
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
INSERT INTO public.km24_bulk_draft_batches(id,title)
VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','A Firmenprodukte');
INSERT INTO public.km24_bulk_draft_items(id,batch_id,title,category_slug)
VALUES('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Lernspielzeug','spielzeug');
INSERT INTO public.km24_bulk_draft_photos
(id,item_id,batch_id,object_name,mime_type,size_bytes)
VALUES('cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/dddddddd-dddd-4ddd-8ddd-dddddddddddd.jpg',
  'image/jpeg',1024);
INSERT INTO storage.objects(bucket_id,name)
VALUES('km24-bulk-draft-photos','11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/dddddddd-dddd-4ddd-8ddd-dddddddddddd.jpg');
SELECT km24_test.assert_true((SELECT count(*)=1 FROM public.km24_bulk_draft_batches),'A reads own batch');
SELECT km24_test.assert_true((SELECT count(*)=1 FROM storage.objects WHERE bucket_id='km24-bulk-draft-photos'),'A reads own private image metadata');
RESET ROLE;
SELECT km24_test.assert_true((SELECT public=false AND file_size_limit=10485760 FROM storage.buckets WHERE id='km24-bulk-draft-photos'),'bucket private and max 10MB');
SET ROLE authenticated;
SELECT km24_test.expect_denied($q$
  DELETE FROM public.km24_bulk_draft_photos WHERE id='cccccccc-cccc-4ccc-8ccc-cccccccccccc'
$q$,'metadata cannot delete before file is removed');
SELECT km24_test.expect_denied($q$
  DELETE FROM public.km24_bulk_draft_items WHERE id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
$q$,'item cannot delete while private photo exists');
SELECT km24_test.expect_denied($q$
  DELETE FROM public.km24_bulk_draft_batches WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
$q$,'batch cannot cascade-delete live private photos');
\echo === User B cannot see or modify A ===
SELECT set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',false);
SELECT km24_test.assert_true((SELECT count(*)=0 FROM public.km24_bulk_draft_batches),'B cannot read A batches');
SELECT km24_test.assert_true((SELECT count(*)=0 FROM public.km24_bulk_draft_items),'B cannot read A items');
SELECT km24_test.assert_true((SELECT count(*)=0 FROM public.km24_bulk_draft_photos),'B cannot read A private image reservations');
SELECT km24_test.assert_true((SELECT count(*)=0 FROM storage.objects),'B cannot read A private storage object');
SELECT km24_test.expect_denied($q$
  INSERT INTO public.km24_bulk_draft_items(batch_id,title)
  VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','B injects into A batch')
$q$,'B cannot add an item to A import');
SELECT km24_test.expect_denied($q$
  INSERT INTO storage.objects(bucket_id,name)
  VALUES('km24-bulk-draft-photos',
    '22222222-2222-4222-8222-222222222222/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee.jpg')
$q$,'B cannot upload an unreserved image');
WITH changes AS (
  UPDATE public.km24_bulk_draft_items SET title='By B' WHERE id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' RETURNING 1
) SELECT km24_test.assert_true((SELECT count(*)=0 FROM changes),'B cannot alter A item');
WITH changes AS (
  DELETE FROM public.km24_bulk_draft_batches WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' RETURNING 1
) SELECT km24_test.assert_true((SELECT count(*)=0 FROM changes),'B cannot delete A batch');
INSERT INTO public.km24_bulk_draft_batches(id,title)
VALUES('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','B own dealership import');
SELECT km24_test.assert_true((SELECT count(*)=1 FROM public.km24_bulk_draft_batches),'B can create and see only own batch');
\echo === Private, inactive, incomplete-contact and anon are denied ===
SELECT set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',false);
SELECT km24_test.expect_denied($q$
  INSERT INTO public.km24_bulk_draft_batches(title) VALUES('private account should be denied')
$q$,'private account cannot start import');
SELECT set_config('request.jwt.claim.sub','44444444-4444-4444-8444-444444444444',false);
SELECT km24_test.expect_denied($q$
  INSERT INTO public.km24_bulk_draft_batches(title) VALUES('inactive account should be denied')
$q$,'inactive business account cannot start import');
SELECT set_config('request.jwt.claim.sub','55555555-5555-4555-8555-555555555555',false);
SELECT km24_test.expect_denied($q$
  INSERT INTO public.km24_bulk_draft_batches(title) VALUES('no contact should be denied')
$q$,'firm without contact details cannot start import');
RESET ROLE;
SET ROLE anon;
SELECT km24_test.expect_denied($q$SELECT count(*) FROM public.km24_bulk_draft_batches$q$,'anonymous cannot read bulk batches');
SELECT km24_test.expect_denied($q$
  INSERT INTO public.km24_bulk_draft_batches(title) VALUES('anonymous import')
$q$,'anonymous cannot create bulk batches');
RESET ROLE;
\echo === User A quotas, invariants and storage cleanup ===
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
SELECT km24_test.expect_denied($q$
  UPDATE public.km24_bulk_draft_items
  SET batch_id='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
  WHERE id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
$q$,'user A cannot move item to B batch');
SELECT km24_test.expect_denied($q$
  UPDATE public.km24_bulk_draft_batches
  SET owner_id='22222222-2222-4222-8222-222222222222'
  WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
$q$,'user A cannot reassign batch owner');
-- 100 items total, including the first A item.
INSERT INTO public.km24_bulk_draft_items(batch_id,title)
SELECT 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Artikel '||x FROM generate_series(1,99) x;
SELECT km24_test.assert_true((SELECT count(*)=100 FROM public.km24_bulk_draft_items),'exactly 100 items are permitted per import');
SELECT km24_test.expect_denied($q$
 INSERT INTO public.km24_bulk_draft_items(batch_id,title)
 VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Artikel 101')
$q$,'101st item is denied');
-- First item: one storage-backed photo + nine additional metadata reservations.
INSERT INTO public.km24_bulk_draft_photos(item_id,batch_id,object_name,mime_type,size_bytes)
SELECT 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
       'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
       '11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/'||gen_random_uuid()||'.jpg',
       'image/jpeg',100 FROM generate_series(1,9);
SELECT km24_test.assert_true((SELECT count(*)=10 FROM public.km24_bulk_draft_photos WHERE item_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),'10 photos per article allowed');
SELECT km24_test.expect_denied($q$
  INSERT INTO public.km24_bulk_draft_photos(item_id,batch_id,object_name,mime_type,size_bytes)
  VALUES('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
         '11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/ffffffff-ffff-4fff-8fff-ffffffffffff.jpg','image/jpeg',100)
$q$,'11th photo on same item is denied');
-- Reach 100 photo reservations spread over other items, then reject 101st.
INSERT INTO public.km24_bulk_draft_photos(item_id,batch_id,object_name,mime_type,size_bytes)
SELECT i.id,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/'||i.id||'/'||gen_random_uuid()||'.jpg',
  'image/jpeg',100
FROM public.km24_bulk_draft_items i
WHERE i.batch_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  AND i.id<>'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
ORDER BY i.id LIMIT 90;
SELECT km24_test.assert_true((SELECT count(*)=100 FROM public.km24_bulk_draft_photos),'exactly 100 photo reservations allowed per import');
SELECT km24_test.expect_denied($q$
  INSERT INTO public.km24_bulk_draft_photos(item_id,batch_id,object_name,mime_type,size_bytes)
  SELECT i.id,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/'||i.id||'/99999999-9999-4999-8999-999999999999.jpg',
    'image/jpeg',100
  FROM public.km24_bulk_draft_items i
  WHERE i.batch_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    AND i.id<>'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
  LIMIT 1
$q$,'101st photo on same batch is denied');
INSERT INTO public.km24_bulk_draft_batches(title)
SELECT 'weiterer Import '||x FROM generate_series(1,4) x;
SELECT km24_test.assert_true((SELECT count(*)=5 FROM public.km24_bulk_draft_batches),'five open imports allowed per owner');
SELECT km24_test.expect_denied($q$
 INSERT INTO public.km24_bulk_draft_batches(title) VALUES('sechster Import')
$q$,'sixth open import is denied');
-- Storage must be deleted BEFORE its photo metadata; both should then succeed.
DELETE FROM storage.objects
WHERE bucket_id='km24-bulk-draft-photos'
  AND name='11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/dddddddd-dddd-4ddd-8ddd-dddddddddddd.jpg';
DELETE FROM public.km24_bulk_draft_photos WHERE id='cccccccc-cccc-4ccc-8ccc-cccccccccccc';
SELECT km24_test.assert_true((SELECT count(*)=0 FROM public.km24_bulk_draft_photos WHERE id='cccccccc-cccc-4ccc-8ccc-cccccccccccc'),'photo metadata can be cleaned only after Storage object');
-- Archiving enforces one-way transition and is still visible to its owner.
UPDATE public.km24_bulk_draft_batches SET state='archived'
WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
SELECT km24_test.assert_true((SELECT state='archived' FROM public.km24_bulk_draft_batches WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),'owner may archive batch');
SELECT km24_test.expect_denied($q$
 UPDATE public.km24_bulk_draft_batches SET state='draft'
 WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
$q$,'archived import cannot be reactivated');
\echo === All isolated PostgreSQL RLS assertions passed ===
