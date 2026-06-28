-- ============================================================
-- PART 7/7 — Fix #1: Missing "checkout" storage bucket
-- (used in src/actions/orders.ts for Telebirr / Bank Transfer
--  payment screenshots — without this, createOrder() fails for
--  any non-cash-on-delivery order)
-- ============================================================

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('checkout', 'checkout', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE POLICIES - checkout bucket
-- ============================================================

-- Anyone can view (needed so admin can open the screenshot link
-- from the orders dashboard). Uploads/updates/deletes only happen
-- via the service-role client in orders.ts, which bypasses RLS —
-- the policies below are a defensive backstop against direct
-- anon/auth calls to the Storage API.
CREATE POLICY "checkout_images_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'checkout');

CREATE POLICY "checkout_images_insert_admin"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'checkout' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "checkout_images_update_admin"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'checkout' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "checkout_images_delete_admin"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'checkout' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
