-- ============================================================
-- PART A — Delivery Zones (Phase A: admin-managed zone list +
-- customer picks a zone at checkout). Delivery FEE per zone is
-- intentionally NOT included yet — that is Phase B, a separate
-- migration that will ALTER this table to add a `fee` column,
-- once the zone/address structure itself is working end-to-end.
-- ============================================================

-- ============================================================
-- DELIVERY ZONES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.delivery_zones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_zones_active ON public.delivery_zones(is_active);
CREATE INDEX IF NOT EXISTS idx_delivery_zones_sort ON public.delivery_zones(sort_order);

DROP TRIGGER IF EXISTS delivery_zones_updated_at ON public.delivery_zones;
CREATE TRIGGER delivery_zones_updated_at
  BEFORE UPDATE ON public.delivery_zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- RLS — mirrors the exact categories_* policy pattern already
-- used elsewhere in this project (public sees active rows only;
-- admins see everything; only admins can write).
-- ============================================================
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "delivery_zones_select_public"
  ON public.delivery_zones FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "delivery_zones_insert_admin"
  ON public.delivery_zones FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "delivery_zones_update_admin"
  ON public.delivery_zones FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "delivery_zones_delete_admin"
  ON public.delivery_zones FOR DELETE
  USING (public.is_admin());

-- ============================================================
-- ORDERS — link each order to the zone the customer picked.
--
-- delivery_zone_id   : FK for reporting/joins. ON DELETE SET NULL
--                       so deleting a zone later never breaks old
--                       orders.
-- delivery_zone_name : a SNAPSHOT of the zone name at order time
--                       (same pattern as order_items.product_name) —
--                       so the order still shows "Bole" correctly
--                       even if an admin later renames or deletes
--                       that zone.
--
-- Both are nullable because existing historical orders were placed
-- before zones existed. The checkout FORM (app-level validation)
-- requires a zone for all NEW orders — this is intentionally not a
-- DB-level NOT NULL constraint so this migration is safe to run
-- against a table that already has rows.
-- ============================================================
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_zone_id UUID REFERENCES public.delivery_zones(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS delivery_zone_name TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_delivery_zone ON public.orders(delivery_zone_id);
