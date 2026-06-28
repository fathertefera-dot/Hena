-- ============================================================
-- IKU SWEET CAKE - Row Level Security Policies Migration 002
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings        ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTION: Check if current user is admin
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid() OR public.is_admin());

-- ============================================================
-- CATEGORIES POLICIES
-- ============================================================
CREATE POLICY "categories_select_public"
  ON public.categories FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "categories_insert_admin"
  ON public.categories FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "categories_update_admin"
  ON public.categories FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "categories_delete_admin"
  ON public.categories FOR DELETE
  USING (public.is_admin());

-- ============================================================
-- PRODUCTS POLICIES
-- ============================================================
CREATE POLICY "products_select_public"
  ON public.products FOR SELECT
  USING (status = 'active' OR public.is_admin());

CREATE POLICY "products_insert_admin"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "products_update_admin"
  ON public.products FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "products_delete_admin"
  ON public.products FOR DELETE
  USING (public.is_admin());

-- ============================================================
-- PRODUCT IMAGES POLICIES
-- ============================================================
CREATE POLICY "product_images_select_public"
  ON public.product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id AND (p.status = 'active' OR public.is_admin())
    )
  );

CREATE POLICY "product_images_insert_admin"
  ON public.product_images FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "product_images_update_admin"
  ON public.product_images FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "product_images_delete_admin"
  ON public.product_images FOR DELETE
  USING (public.is_admin());

-- ============================================================
-- PRODUCT VARIANTS POLICIES
-- ============================================================
CREATE POLICY "product_variants_select_public"
  ON public.product_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id AND (p.status = 'active' OR public.is_admin())
    )
  );

CREATE POLICY "product_variants_insert_admin"
  ON public.product_variants FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "product_variants_update_admin"
  ON public.product_variants FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "product_variants_delete_admin"
  ON public.product_variants FOR DELETE
  USING (public.is_admin());

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
