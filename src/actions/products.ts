'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/actions/auth'
import { productFormSchema } from '@/lib/validations'
import { PRODUCTS_PER_PAGE } from '@/lib/utils'
import type {
  ActionResult,
  PaginatedResult,
  Product,
  ProductFilters,
} from '@/types'

// ============================================================
// PUBLIC ACTIONS
// ============================================================

export async function getProducts(
  filters: ProductFilters = {}
): Promise<PaginatedResult<Product>> {
  const supabase = await createClient()
  const page = filters.page ?? 1
  const perPage = filters.perPage ?? PRODUCTS_PER_PAGE
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let query = supabase
    .from('products')
    .select(
      `
      *,
      category:categories(*),
      images:product_images(*),
      variants:product_variants(*)
      `,
      { count: 'exact' }
    )
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }

  if (filters.category) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', filters.category)
      .single()
    if (cat) {
      query = query.eq('category_id', cat.id)
    }
  }

  const { data, count, error } = await query

  if (error) {
    console.error('[Products] Fetch error:', error)
    return { data: [], meta: { page, perPage, total: 0, totalPages: 0 } }
  }

  const products = (data ?? []).map((p) => ({
    ...p,
    images: (p.images ?? []).sort(
      (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
    ),
    variants: (p.variants ?? []).sort(
      (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
    ),
  })) as Product[]

  const total = count ?? 0

  return {
    data: products,
    meta: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  }
}

// ✅ አዲስ የተጨመረ function
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select(
      `
      *,
      category:categories(*),
      images:product_images(*),
      variants:product_variants(*)
      `
    )
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (error || !data) return null

  return {
    ...data,
    images: (data.images ?? []).sort(
      (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
    ),
    variants: (data.variants ?? []).sort(
      (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
    ),
  } as Product
}

export async function getAllProductSlugs(): Promise<string[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('products')
    .select('slug')
    .eq('status', 'active')
  return (data ?? []).map((p) => p.slug as string)
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select(
      `
      *,
      category:categories(*),
      images:product_images(*),
      variants:product_variants(*)
      `
    )
    .eq('status', 'active')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []

  return (data ?? []).map((p) => ({
    ...p,
    images: (p.images ?? []).sort(
      (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
    ),
    variants: (p.variants ?? []).sort(
      (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
    ),
  })) as Product[]
}

// ============================================================
// ADMIN ACTIONS
// ============================================================

export async function getAdminProducts(
  filters: ProductFilters = {}
): Promise<PaginatedResult<Product>> {
  const supabase = await createClient()
  const page = filters.page ?? 1
  const perPage = 20
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { data: [], meta: { page, perPage, total: 0, totalPages: 0 } }

  let query = supabase
    .from('products')
    .select(
      `
      *,
      category:categories(*),
      images:product_images(*),
      variants:product_variants(*)
      `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to)

  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }

  const { data, count, error } = await query

  if (error) return { data: [], meta: { page, perPage, total: 0, totalPages: 0 } }

  return {
    data: (data ?? []) as unknown as Product[],
    meta: {
      page,
      perPage,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / perPage),
    },
  }
}

export async function getAdminProductById(id: string): Promise<Product | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select(
      `
      *,
      category:categories(*),
      images:product_images(*),
      variants:product_variants(*)
      `
    )
    .eq('id', id)
    .single()

  if (error || !data) return null

  return {
    ...data,
    images: (data.images ?? []).sort(
      (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
    ),
    variants: (data.variants ?? []).sort(
      (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
    ),
  } as Product
}

export async function createProduct(
  formData: unknown
): Promise<ActionResult<{ id: string }>> {
  const adminCheck = await requireAdmin()
  if (!adminCheck.ok) return adminCheck.error

  const parsed = productFormSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const admin = createAdminClient()

  const { data: product, error: productError } = await admin
    .from('products')
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      category_id: parsed.data.category_id || null,
      availability: parsed.data.availability,
      is_featured: parsed.data.is_featured,
      status: parsed.data.status,
    })
    .select('id')
    .single()

  if (productError || !product) {
    if (productError?.code === '23505') {
      return { success: false, error: 'A product with this slug already exists.' }
    }
    return { success: false, error: 'Failed to create product. Please try again.' }
  }

  if (parsed.data.variants.length > 0) {
    const variantsToInsert = parsed.data.variants.map((v, i) => ({
      product_id: product.id,
      name: v.name,
      price: v.price,
      sort_order: v.sort_order ?? i,
    }))

    const { error: variantError } = await admin
      .from('product_variants')
      .insert(variantsToInsert)

    if (variantError) {
      await admin.from('products').delete().eq('id', product.id)
      return { success: false, error: 'Failed to create product variants.' }
    }
  }

  revalidatePath('/products')
  revalidatePath('/admin/products')

  return { success: true, data: { id: product.id }, message: 'Product created successfully' }
}

export async function updateProduct(
  id: string,
  formData: unknown
): Promise<ActionResult<void>> {
  const adminCheck = await requireAdmin()
  if (!adminCheck.ok) return adminCheck.error

  const parsed = productFormSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const admin = createAdminClient()

  const { error: productError } = await admin
    .from('products')
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      category_id: parsed.data.category_id || null,
      availability: parsed.data.availability,
      is_featured: parsed.data.is_featured,
      status: parsed.data.status,
    })
    .eq('id', id)

  if (productError) {
    if (productError.code === '23505') {
      return { success: false, error: 'A product with this slug already exists.' }
    }
    return { success: false, error: 'Failed to update product.' }
  }

  // Sync variants: delete all and re-insert
  await admin.from('product_variants').delete().eq('product_id', id)

  if (parsed.data.variants.length > 0) {
    const variantsToInsert = parsed.data.variants.map((v, i) => ({
      product_id: id,
      name: v.name,
      price: v.price,
      sort_order: v.sort_order ?? i,
    }))

    const { error: variantError } = await admin
      .from('product_variants')
      .insert(variantsToInsert)

    if (variantError) {
      return { success: false, error: 'Failed to update product variants.' }
    }
  }

  revalidatePath('/products')
  revalidatePath(`/products/${parsed.data.slug}`)
  revalidatePath('/admin/products')
  revalidatePath(`/admin/products/${id}`)

  return { success: true, data: undefined, message: 'Product updated successfully' }
}

export async function deleteProduct(id: string): Promise<ActionResult<void>> {
  const adminCheck = await requireAdmin()
  if (!adminCheck.ok) return adminCheck.error

  const admin = createAdminClient()

  const { error } = await admin.from('products').delete().eq('id', id)

  if (error) {
    return { success: false, error: 'Failed to delete product. Please try again.' }
  }

  revalidatePath('/products')
  revalidatePath('/admin/products')

  return { success: true, data: undefined, message: 'Product deleted successfully' }
}

export async function uploadProductImage(
  productId: string,
  file: File,
  sortOrder: number
): Promise<ActionResult<{ url: string; id: string }>> {
  const adminCheck = await requireAdmin()
  if (!adminCheck.ok) return adminCheck.error

  const admin = createAdminClient()

  const ext = file.name.split('.').pop()
  const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error: uploadError } = await admin.storage
    .from('products')
    .upload(fileName, file, { upsert: false })

  if (uploadError) {
    return { success: false, error: 'Failed to upload image.' }
  }

  const { data: urlData } = admin.storage.from('products').getPublicUrl(fileName)

  const { data: imageRecord, error: insertError } = await admin
    .from('product_images')
    .insert({
      product_id: productId,
      url: urlData.publicUrl,
      sort_order: sortOrder,
    })
    .select('id')
    .single()

  if (insertError || !imageRecord) {
    return { success: false, error: 'Failed to save image record.' }
  }

  revalidatePath(`/admin/products/${productId}`)

  return { success: true, data: { url: urlData.publicUrl, id: imageRecord.id } }
}

export async function deleteProductImage(imageId: string): Promise<ActionResult<void>> {
  const adminCheck = await requireAdmin()
  if (!adminCheck.ok) return adminCheck.error

  const admin = createAdminClient()

  const { data: image } = await admin
    .from('product_images')
    .select('url, product_id')
    .eq('id', imageId)
    .single()

  if (!image) return { success: false, error: 'Image not found.' }

  const url = new URL(image.url)
  const pathParts = url.pathname.split('/storage/v1/object/public/products/')
  const storagePath = pathParts[1]

  if (storagePath) {
    await admin.storage.from('products').remove([storagePath])
  }

  await admin.from('product_images').delete().eq('id', imageId)

  revalidatePath(`/admin/products/${image.product_id}`)

  return { success: true, data: undefined }
}
