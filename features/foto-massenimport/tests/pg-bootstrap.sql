-- Disposable PostgreSQL-only Supabase/Auth/Storage fixture for CI.
-- No network connection to KaufMich24 production. Not a replacement for full Supabase E2E.
\set ON_ERROR_STOP on
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE SCHEMA auth;
CREATE SCHEMA private;
CREATE SCHEMA storage;
GRANT USAGE ON SCHEMA public,auth,private,storage TO authenticated;
GRANT USAGE ON SCHEMA public,auth,private,storage TO anon;
CREATE TABLE auth.users (id uuid PRIMARY KEY);
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid LANGUAGE sql STABLE AS $auth$
  SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid;
$auth$;
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  account_type text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  contact_complete boolean NOT NULL DEFAULT true
);
CREATE TABLE public.categories (slug text PRIMARY KEY);
CREATE TABLE storage.buckets (
  id text PRIMARY KEY,
  name text NOT NULL,
  public boolean NOT NULL DEFAULT false,
  file_size_limit bigint,
  allowed_mime_types text[]
);
CREATE TABLE storage.objects (
  id bigserial PRIMARY KEY,
  bucket_id text NOT NULL REFERENCES storage.buckets(id),
  name text NOT NULL,
  UNIQUE(bucket_id,name)
);
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
GRANT SELECT,INSERT,DELETE ON storage.objects TO authenticated;
GRANT USAGE ON SEQUENCE storage.objects_id_seq TO authenticated;
GRANT SELECT ON public.profiles,public.categories TO authenticated;
GRANT SELECT ON auth.users TO authenticated;
CREATE FUNCTION private.is_account_active(uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = ''
AS $function$
  SELECT EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=$1 AND p.active);
$function$;
CREATE FUNCTION private.has_marketplace_contact(uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = ''
AS $function$
  SELECT EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=$1 AND p.contact_complete);
$function$;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth,private TO authenticated;

INSERT INTO auth.users(id) VALUES
('11111111-1111-4111-8111-111111111111'),
('22222222-2222-4222-8222-222222222222'),
('33333333-3333-4333-8333-333333333333'),
('44444444-4444-4444-8444-444444444444'),
('55555555-5555-4555-8555-555555555555');
INSERT INTO public.profiles(id,account_type,active,contact_complete) VALUES
('11111111-1111-4111-8111-111111111111','business',true,true),
('22222222-2222-4222-8222-222222222222','dealer',true,true),
('33333333-3333-4333-8333-333333333333','private',true,true),
('44444444-4444-4444-8444-444444444444','business',false,true),
('55555555-5555-4555-8555-555555555555','business',true,false);
INSERT INTO public.categories(slug) VALUES('spielzeug'),('autos');
