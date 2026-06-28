-- ============================================================
-- Fix #3: handle_new_user() trusts raw_user_meta_data->>'role'
-- (anyone calling supabase.auth.signUp() directly — bypassing the
--  app's register() action which always sends role:'customer' —
--  could pass { data: { role: 'admin' } } and get an admin
--  account auto-created)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'customer'  -- always 'customer' on self-signup; role is never
                -- read from client-supplied metadata. Admins must
                -- be promoted afterwards by an existing admin
                -- (Fix #2's WITH CHECK enforces that path).
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- No need to recreate the trigger itself — it already points at
-- this function by name, so CREATE OR REPLACE above takes effect
-- immediately for all future signups.
