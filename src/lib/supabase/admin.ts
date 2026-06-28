import { createClient } from '@supabase/supabase-js'

/**
 * Service role client — bypasses RLS.
 * Use ONLY in server-side code (Server Actions, API Routes, middleware).
 * NEVER expose to the client.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
