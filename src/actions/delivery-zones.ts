'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/actions/auth'
import { deliveryZoneFormSchema } from '@/lib/validations'
import type { ActionResult, DeliveryZone } from '@/types'

export async function getActiveDeliveryZones(): Promise<DeliveryZone[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('delivery_zones')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) return []
  return (data ?? []) as DeliveryZone[]
}

export async function getAllDeliveryZones(): Promise<DeliveryZone[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('delivery_zones')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) return []
  return (data ?? []) as DeliveryZone[]
}

export async function createDeliveryZone(
  formData: unknown
): Promise<ActionResult<{ id: string }>> {
  const adminCheck = await requireAdmin()
  if (!adminCheck.ok) return adminCheck.error

  const parsed = deliveryZoneFormSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const admin = createAdminClient()

  const { data, error } = await admin
    .from('delivery_zones')
    .insert({
      name: parsed.data.name,
      sort_order: parsed.data.sort_order,
      is_active: parsed.data.is_active,
    })
    .select('id')
    .single()

  if (error || !data) {
    return { success: false, error: 'Failed to create delivery zone.' }
  }

  revalidatePath('/admin/delivery-zones')
  revalidatePath('/checkout')

  return { success: true, data: { id: data.id }, message: 'Delivery zone created successfully' }
}

export async function updateDeliveryZone(
  id: string,
  formData: unknown
): Promise<ActionResult<void>> {
  const adminCheck = await requireAdmin()
  if (!adminCheck.ok) return adminCheck.error

  const parsed = deliveryZoneFormSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const admin = createAdminClient()

  const { error } = await admin
    .from('delivery_zones')
    .update({
      name: parsed.data.name,
      sort_order: parsed.data.sort_order,
      is_active: parsed.data.is_active,
    })
    .eq('id', id)

  if (error) {
    return { success: false, error: 'Failed to update delivery zone.' }
  }

  revalidatePath('/admin/delivery-zones')
  revalidatePath('/checkout')

  return { success: true, data: undefined, message: 'Delivery zone updated successfully' }
}

export async function deleteDeliveryZone(id: string): Promise<ActionResult<void>> {
  const adminCheck = await requireAdmin()
  if (!adminCheck.ok) return adminCheck.error

  const admin = createAdminClient()

  // Orders referencing this zone keep their delivery_zone_name
  // snapshot and have delivery_zone_id set to NULL automatically
  // (ON DELETE SET NULL on the FK) — old orders stay readable.
  const { error } = await admin.from('delivery_zones').delete().eq('id', id)

  if (error) {
    return { success: false, error: 'Failed to delete delivery zone.' }
  }

  revalidatePath('/admin/delivery-zones')
  revalidatePath('/checkout')

  return { success: true, data: undefined, message: 'Delivery zone deleted successfully' }
}
