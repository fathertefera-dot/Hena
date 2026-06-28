'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { settingsSchema } from '@/lib/validations'
import type { ActionResult, SiteSettings } from '@/types'

export async function getSettings(): Promise<SiteSettings> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('settings').select('key, value')

  if (error) {
    console.error('[Settings] Failed to fetch:', error)
    return getDefaultSettings()
  }

  const map: Record<string, string> = {}
  for (const row of data ?? []) {
    if (row.key) map[row.key] = row.value ?? ''
  }

  return {
    business_name: map['business_name'] ?? 'Iku Sweet Cake',
    phone: map['phone'] ?? '',
    support_email: map['support_email'] ?? '',
    address: map['address'] ?? '',
    business_hours: map['business_hours'] ?? '',
    meta_title: map['meta_title'] ?? 'Iku Sweet Cake',
    meta_description: map['meta_description'] ?? '',
    payment_cod: map['payment_cod'] !== 'false',
    payment_telebirr: map['payment_telebirr'] !== 'false',
    payment_bank_transfer: map['payment_bank_transfer'] !== 'false',
  }
}

function getDefaultSettings(): SiteSettings {
  return {
    business_name: 'Iku Sweet Cake',
    phone: '',
    support_email: '',
    address: '',
    business_hours: '',
    meta_title: 'Iku Sweet Cake – Custom Cakes',
    meta_description: '',
    payment_cod: true,
    payment_telebirr: true,
    payment_bank_transfer: true,
  }
}

export async function updateSettings(formData: unknown): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { success: false, error: 'Forbidden' }

  const parsed = settingsSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const admin = createAdminClient()
  const updates = Object.entries({
    business_name: parsed.data.business_name,
    phone: parsed.data.phone,
    support_email: parsed.data.support_email ?? '',
    address: parsed.data.address ?? '',
    business_hours: parsed.data.business_hours ?? '',
    meta_title: parsed.data.meta_title ?? '',
    meta_description: parsed.data.meta_description ?? '',
    payment_cod: String(parsed.data.payment_cod),
    payment_telebirr: String(parsed.data.payment_telebirr),
    payment_bank_transfer: String(parsed.data.payment_bank_transfer),
  })

  const rows = updates.map(([key, value]) => ({ key, value }))

  const { error } = await admin
    .from('settings')
    .upsert(rows, { onConflict: 'key' })

  if (error) {
    console.error('[Settings] Failed to update settings:', error)
    return { success: false, error: 'Failed to update settings. Please try again.' }
  }

  return { success: true, data: undefined, message: 'Settings updated successfully' }
}
