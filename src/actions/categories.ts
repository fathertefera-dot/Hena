'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/actions/auth'
import { categoryFormSchema } from '@/lib/validations'
import type { ActionResult, Category } from '@/types'

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) return []
  return (data ?? []) as Category[]
}

export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) return []
  return (data ?? []) as Category[]
}

export async function createCategory(formData: unknown): Promise<ActionResult<{ id: string }>> {
  const adminCheck = await requireAdmin()
  if (!adminCheck.ok) return adminCheck.error

  const parsed = categoryFormSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const admin = createAdminClient()

  const { data, error } = await admin
    .from('categories')
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      sort_order: parsed.data.sort_order,
      is_active: parsed.data.is_active,
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'A category with this slug already exists.' }
    }
    return { success: false, error: 'Failed to create category.' }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/')
  revalidatePath('/products')

  return { success: true, data: { id: data.id }, message: 'Category created successfully' }
}

export async function updateCategory(
  id: string,
  formData: unknown
): Promise<ActionResult<void>> {
  const adminCheck = await requireAdmin()
  if (!adminCheck.ok) return adminCheck.error

  const parsed = categoryFormSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const admin = createAdminClient()

  const { error } = await admin
    .from('categories')
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      sort_order: parsed.data.sort_order,
      is_active: parsed.data.is_active,
    })
    .eq('id', id)

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'A category with this slug already exists.' }
    }
    return { success: false, error: 'Failed to update category.' }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/')
  revalidatePath('/products')

  return { success: true, data: undefined, message: 'Category updated successfully' }
}

export async function deleteCategory(id: string): Promise<ActionResult<void>> {
  const adminCheck = await requireAdmin()
  if (!adminCheck.ok) return adminCheck.error

  const admin = createAdminClient()

  // Unlink products from this category first
  await admin.from('products').update({ category_id: null }).eq('category_id', id)

  const { error } = await admin.from('categories').delete().eq('id', id)

  if (error) {
    return { success: false, error: 'Failed to delete category.' }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/')
  revalidatePath('/products')

  return { success: true, data: undefined, message: 'Category deleted successfully' }
}

export async function uploadCategoryImage(
  categoryId: string,
  file: File
): Promise<ActionResult<{ url: string }>> {
  const adminCheck = await requireAdmin()
  if (!adminCheck.ok) return adminCheck.error

  const admin = createAdminClient()

  const ext = file.name.split('.').pop()
  const fileName = `${categoryId}-${Date.now()}.${ext}`

  const { error: uploadError } = await admin.storage
    .from('branding')
    .upload(`categories/${fileName}`, file, { upsert: true })

  if (uploadError) {
    return { success: false, error: 'Failed to upload image.' }
  }

  const { data: urlData } = admin.storage
    .from('branding')
    .getPublicUrl(`categories/${fileName}`)

  await admin
    .from('categories')
    .update({ image_url: urlData.publicUrl })
    .eq('id', categoryId)

  revalidatePath('/admin/categories')

  return { success: true, data: { url: urlData.publicUrl } }
}
