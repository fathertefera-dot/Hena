-- ============================================================
-- PART 5/6 — Storage: bucket creation + policies for products & banners buckets
-- ============================================================

-- ============================================================
-- IKU SWEET CAKE - Storage Buckets Migration 003
-- ============================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('products',  'products',  true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('banners',   'banners',   true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('branding',  'branding',  true, 5242880,  ARRAY['image/jpeg','image/png','image/webp','image/svg+xml','image/x-icon']),
  ('about',     'about',     true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE POLICIES - products bucket
-- ============================================================
CREATE POLICY "products_images_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

CREATE POLICY "products_images_insert_admin"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'products' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "products_images_update_admin"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'products' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "products_images_delete_admin"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'products' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- STORAGE POLICIES - banners bucket
-- ============================================================
CREATE POLICY "banners_images_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'banners');

CREATE POLICY "banners_images_insert_admin"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'banners' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "banners_images_update_admin"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'banners' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "banners_images_delete_admin"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'banners' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
