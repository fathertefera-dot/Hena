-- ============================================================
-- PART 4/6 — RLS: policies for carts, cart_items, orders, order_items, banners, settings + handle_new_user trigger
-- ============================================================

-- ============================================================
-- CARTS POLICIES (service role bypasses RLS)
-- ============================================================
CREATE POLICY "carts_select_own"
  ON public.carts FOR SELECT
  USING (user_id = auth.uid() OR auth.uid() IS NULL);

CREATE POLICY "carts_insert_anon"
  ON public.carts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "carts_update_own"
  ON public.carts FOR UPDATE
  USING (user_id = auth.uid() OR auth.uid() IS NULL);

CREATE POLICY "carts_delete_own"
  ON public.carts FOR DELETE
  USING (user_id = auth.uid() OR auth.uid() IS NULL);

-- ============================================================
-- CART ITEMS POLICIES
-- ============================================================
CREATE POLICY "cart_items_select_own"
  ON public.cart_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.carts c
      WHERE c.id = cart_id AND (c.user_id = auth.uid() OR auth.uid() IS NULL)
    )
  );

CREATE POLICY "cart_items_insert_anon"
  ON public.cart_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "cart_items_update_own"
  ON public.cart_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.carts c
      WHERE c.id = cart_id AND (c.user_id = auth.uid() OR auth.uid() IS NULL)
    )
  );

CREATE POLICY "cart_items_delete_own"
  ON public.cart_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.carts c
      WHERE c.id = cart_id AND (c.user_id = auth.uid() OR auth.uid() IS NULL)
    )
  );

-- ============================================================
-- ORDERS POLICIES
-- ============================================================
CREATE POLICY "orders_select_own"
  ON public.orders FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY "orders_insert_anon"
  ON public.orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "orders_update_admin"
  ON public.orders FOR UPDATE
  USING (public.is_admin());

-- ============================================================
-- ORDER ITEMS POLICIES
-- ============================================================
CREATE POLICY "order_items_select_own"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "order_items_insert_anon"
  ON public.order_items FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- BANNERS POLICIES
-- ============================================================
CREATE POLICY "banners_select_public"
  ON public.banners FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "banners_insert_admin"
  ON public.banners FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "banners_update_admin"
  ON public.banners FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "banners_delete_admin"
  ON public.banners FOR DELETE
  USING (public.is_admin());

-- ============================================================
-- SETTINGS POLICIES
-- ============================================================
CREATE POLICY "settings_select_public"
  ON public.settings FOR SELECT
  USING (true);

CREATE POLICY "settings_insert_admin"
  ON public.settings FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "settings_update_admin"
  ON public.settings FOR UPDATE
  USING (public.is_admin());

-- ============================================================
-- HANDLE NEW USER FUNCTION (auto-create profile on signup)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
