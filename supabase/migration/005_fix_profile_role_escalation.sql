-- ============================================================
-- PART 8 — Fix #2: profiles_update_own RLS privilege escalation
-- (no WITH CHECK meant a user could PATCH their own profile and
--  set role = 'admin'; the implicit check defaulted to the USING
--  clause, which only verifies id = auth.uid() and never looks at
--  the new role value)
-- ============================================================

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (
    -- A non-admin user may update their own row, but the
    -- resulting role must stay 'customer' — they cannot promote
    -- themselves. is_admin() reflects the actor's CURRENT role
    -- (read before this statement's effect), so an already-admin
    -- user can still freely change roles (e.g. via an admin panel).
    (id = auth.uid() AND role = 'customer')
    OR public.is_admin()
  );
