-- ============================================================
-- PART 3/6 — RLS: enable RLS + is_admin() + policies for profiles, categories, products, product_images, product_variants
-- ============================================================

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
