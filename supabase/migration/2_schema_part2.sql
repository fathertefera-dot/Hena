-- ============================================================
-- PART 2/6 — Schema: carts, cart_items, orders, order_items, banners, settings + seed data
-- ============================================================

-- ============================================================
-- CARTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.carts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  TEXT NOT NULL UNIQUE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_carts_session ON public.carts(session_id);
CREATE INDEX idx_carts_user ON public.carts(user_id);

CREATE TRIGGER carts_updated_at
  BEFORE UPDATE ON public.carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- CART ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cart_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id      UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id   UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id   UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity     INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0 AND quantity <= 100),
  cake_message TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cart_id, variant_id)
);

CREATE INDEX idx_cart_items_cart ON public.cart_items(cart_id);
CREATE INDEX idx_cart_items_product ON public.cart_items(product_id);

CREATE TRIGGER cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ORDER NUMBER SEQUENCE
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START WITH 1001 INCREMENT BY 1;

-- ============================================================
-- ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     TEXT NOT NULL UNIQUE DEFAULT ('IKU-' || nextval('public.order_number_seq')::TEXT),
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name    TEXT NOT NULL,
  customer_phone   TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  order_note       TEXT,
  payment_method   TEXT NOT NULL
                     CHECK (payment_method IN ('cash_on_delivery', 'telebirr', 'bank_transfer')),
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'confirmed', 'preparing', 'delivered', 'cancelled')),
  cancel_reason    TEXT,
  total_amount     NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_phone ON public.orders(customer_phone);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ORDER ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id    UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name  TEXT NOT NULL,
  variant_name  TEXT NOT NULL,
  price         NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  quantity      INTEGER NOT NULL CHECK (quantity > 0),
  cake_message  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_order_items_product ON public.order_items(product_id);

-- ============================================================
-- BANNERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.banners (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url   TEXT NOT NULL,
  title       TEXT,
  link        TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_banners_active ON public.banners(is_active);
CREATE INDEX idx_banners_sort ON public.banners(sort_order);

CREATE TRIGGER banners_updated_at
  BEFORE UPDATE ON public.banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SETTINGS TABLE (Key-Value Store)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.settings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT NOT NULL UNIQUE,
  value       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_settings_key ON public.settings(key);

CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- DEFAULT SETTINGS SEED DATA
-- ============================================================
INSERT INTO public.settings (key, value) VALUES
  ('business_name',    'Iku Sweet Cake'),
  ('phone',            '+251900000000'),
  ('support_email',    'hello@ikusweetcake.com'),
  ('telegram',         'https://t.me/ikusweetcake'),
  ('facebook',         'https://facebook.com/ikusweetcake'),
  ('address',          'Addis Ababa, Ethiopia'),
  ('business_hours',   'Mon–Sat: 8:00 AM – 8:00 PM'),
  ('about_title',      'Handcrafted with Love'),
  ('about_content',    'At Iku Sweet Cake, we believe every celebration deserves a cake as unique as the moment itself. Our skilled bakers craft each cake by hand using the finest ingredients, turning your sweetest memories into edible art.'),
  ('about_image',      ''),
  ('logo_url',         ''),
  ('favicon_url',      ''),
  ('meta_title',       'Iku Sweet Cake – Custom Cakes in Addis Ababa'),
  ('meta_description', 'Order beautiful custom cakes online. Birthdays, weddings, and every sweet occasion. Handcrafted with love in Addis Ababa.'),
  ('payment_cod',      'true'),
  ('payment_telebirr', 'true'),
  ('payment_bank_transfer', 'true'),
  ('telegram_bot_token', ''),
  ('telegram_chat_id',   '')
ON CONFLICT (key) DO NOTHING;
