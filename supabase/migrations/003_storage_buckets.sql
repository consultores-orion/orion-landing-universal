-- ============================================================================
-- Migration 003: Storage Buckets + RLS Policies
-- ============================================================================
-- Creates the Storage buckets required by the application and configures
-- Row Level Security policies on storage.objects so that:
--   - Public users can READ (download) files from all buckets
--   - Only authenticated users can INSERT/UPDATE/DELETE files
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Create buckets
-- ----------------------------------------------------------------------------
-- Note: storage.buckets INSERT is idempotent with ON CONFLICT DO NOTHING

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'media',
    'media',
    true,
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif', 'image/x-icon']
  ),
  (
    'page_images',
    'page_images',
    true,
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
  ),
  (
    'avatars',
    'avatars',
    true,
    2097152, -- 2 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  )
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. RLS Policies on storage.objects
-- ----------------------------------------------------------------------------
-- Supabase enables RLS on storage.objects by default.
-- Without explicit policies, ALL operations are denied.

-- 2.1 media bucket
CREATE POLICY "media_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

CREATE POLICY "media_auth_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media');

CREATE POLICY "media_auth_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'media');

CREATE POLICY "media_auth_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'media');

-- 2.2 page_images bucket
CREATE POLICY "page_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'page_images');

CREATE POLICY "page_images_auth_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'page_images');

CREATE POLICY "page_images_auth_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'page_images');

CREATE POLICY "page_images_auth_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'page_images');

-- 2.3 avatars bucket
CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_auth_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatars_auth_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_auth_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars');

-- ============================================================================
-- End of migration 003_storage_buckets
-- ============================================================================
