-- ============================================================
-- PART 6/6 — Storage: policies for branding & about buckets
-- ============================================================

-- ============================================================
-- STORAGE POLICIES - branding bucket
-- ============================================================
CREATE POLICY "branding_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'branding');

CREATE POLICY "branding_insert_admin"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'branding' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "branding_update_admin"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'branding' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "branding_delete_admin"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'branding' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- STORAGE POLICIES - about bucket
-- ============================================================
CREATE POLICY "about_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'about');

CREATE POLICY "about_insert_admin"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'about' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "about_update_admin"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'about' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "about_delete_admin"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'about' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
