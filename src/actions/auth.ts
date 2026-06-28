'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, registerSchema } from '@/lib/validations'
import type { ActionResult } from '@/types'

export async function login(formData: unknown): Promise<ActionResult<void>> {
  const parsed = loginSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return {
      success: false,
      error:
        error.message === 'Invalid login credentials'
          ? 'Invalid email or password. Please try again.'
          : error.message,
    }
  }

  revalidatePath('/', 'layout')
  return { success: true, data: undefined }
}

export async function register(formData: unknown): Promise<ActionResult<void>> {
  const parsed = registerSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.full_name,
        role: 'customer',
      },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return {
        success: false,
        error: 'An account with this email already exists. Please sign in instead.',
      }
    }
    return { success: false, error: error.message }
  }

  return {
    success: true,
    data: undefined,
    message: 'Account created successfully! Please check your email to confirm your account.',
  }
}

export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function getCurrentUser() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile) return profile

  // ------------------------------------------------------------
  // Defensive fallback (fixes the login-loop bug):
  // handle_new_user() normally creates this row at signup time.
  // If it's missing — e.g. the account existed before that
  // trigger was added, or the trigger migration was never run —
  // the user has a perfectly valid auth session but no profile
  // row. Previously this function returned null in that case,
  // which made pages like /account treat a logged-in user as
  // logged-out, bouncing them back to /login forever. Self-heal
  // by creating the missing row now.
  // ------------------------------------------------------------
  const { data: newProfile } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      email: user.email ?? '',
      full_name: (user.user_metadata?.full_name as string | undefined) ?? '',
      role: 'customer',
    })
    .select('*')
    .single()

  if (newProfile) return newProfile

  // Insert failed — most likely a race with another concurrent
  // request that created the row a moment earlier. Read once more
  // before giving up.
  const { data: retryProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return retryProfile ?? null
}

export async function getAdminUser() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') return null
  return user
}

// ============================================================
// ADMIN GUARD — call this at the top of every admin-only
// server action BEFORE touching the admin (service-role) client.
//
// Usage:
//   const adminCheck = await requireAdmin()
//   if (!adminCheck.ok) return adminCheck.error
//
// Without this, an action that uses createAdminClient() bypasses
// RLS entirely, so checking `if (!user)` alone is NOT enough —
// it only confirms someone is logged in, not that they're an
// admin. Any authenticated customer could otherwise call the
// action directly and mutate admin-only data.
// ============================================================
export type AdminCheckResult =
  | { ok: true; userId: string }
  | { ok: false; error: ActionResult<never> }

export async function requireAdmin(): Promise<AdminCheckResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, error: { success: false, error: 'Unauthorized' } }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { ok: false, error: { success: false, error: 'Forbidden' } }
  }

  return { ok: true, userId: user.id }
}
