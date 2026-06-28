'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/actions/auth'
import { bannerFormSchema } from '@/lib/validations'
import type { ActionResult, Banner } from '@/types'

export async function getActiveBanners(): Promise<Banner[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) return []
  return (data ?? []) as Banner[]
}

export async function getAllBanners(): Promise<Banner[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) return []
  return (data ?? []) as Banner[]
}

export async function createBanner(
  formData: unknown,
  imageFile: File | null
): Promise<ActionResult<{ id: string }>> {
  const adminCheck = await requireAdmin()
  if (!adminCheck.ok) return adminCheck.error

  const parsed = bannerFormSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const admin = createAdminClient()
  let imageUrl = ''

  if (imageFile) {
    const ext = imageFile.name.split('.').pop()
    const fileName = `banner-${Date.now()}.${ext}`

    const { error: uploadError } = await admin.storage
      .from('banners')
      .upload(fileName, imageFile, { upsert: false })

    if (uploadError) {
      return { success: false, error: 'Failed to upload banner image.' }
    }

    const { data: urlData } = admin.storage.from('banners').getPublicUrl(fileName)
    imageUrl = urlData.publicUrl
  }

  const { data, error } = await admin
    .from('banners')
    .insert({
      image_url: imageUrl,
      title: parsed.data.title || null,
      link: parsed.data.link || null,
      sort_order: parsed.data.sort_order,
      is_active: parsed.data.is_active,
    })
    .select('id')
    .single()

  if (error || !data) {
    return { success: false, error: 'Failed to create banner.' }
  }

  revalidatePath('/admin/banners')
  revalidatePath('/')

  return { success: true, data: { id: data.id }, message: 'Banner created successfully' }
}

export async function updateBanner(
  id: string,
  formData: unknown,
  imageFile: File | null
): Promise<ActionResult<void>> {
  const adminCheck = await requireAdmin()
  if (!adminCheck.ok) return adminCheck.error

  const parsed = bannerFormSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const admin = createAdminClient()
  const updateData: Record<string, unknown> = {
    title: parsed.data.title || null,
    link: parsed.data.link || null,
    sort_order: parsed.data.sort_order,
    is_active: parsed.data.is_active,
  }

  if (imageFile) {
    const ext = imageFile.name.split('.').pop()
    const fileName = `banner-${id}-${Date.now()}.${ext}`

    const { error: uploadError } = await admin.storage
      .from('banners')
      .upload(fileName, imageFile, { upsert: false })

    if (!uploadError) {
      const { data: urlData } = admin.storage.from('banners').getPublicUrl(fileName)
      updateData['image_url'] = urlData.publicUrl
    }
  }

  const { error } = await admin.from('banners').update(updateData).eq('id', id)

  if (error) {
    return { success: false, error: 'Failed to update banner.' }
  }

  revalidatePath('/admin/banners')
  revalidatePath('/')

  return { success: true, data: undefined, message: 'Banner updated successfully' }
}

export async function deleteBanner(id: string): Promise<ActionResult<void>> {
  const adminCheck = await requireAdmin()
  if (!adminCheck.ok) return adminCheck.error

  const admin = createAdminClient()

  const { error } = await admin.from('banners').delete().eq('id', id)

  if (error) {
    return { success: false, error: 'Failed to delete banner.' }
  }

  revalidatePath('/admin/banners')
  revalidatePath('/')

  return { success: true, data: undefined, message: 'Banner deleted successfully' }
}
