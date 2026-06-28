'use server'

import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { generateSessionId } from '@/lib/utils'
import type { ActionResult, CartItemWithDetails } from '@/types'

const CART_SESSION_COOKIE = 'iku_cart_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30

async function getOrCreateCartSession(): Promise<string> {
  const cookieStore = await cookies()
  let sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value

  if (!sessionId) {
    sessionId = generateSessionId()
    cookieStore.set(CART_SESSION_COOKIE, sessionId, {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })
  }

  return sessionId
}

async function getOrCreateCart(sessionId: string): Promise<string> {
  const admin = createAdminClient()

  const { data: existing } = await admin
    .from('carts')
    .select('id')
    .eq('session_id', sessionId)
    .single()

  if (existing) return existing.id as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: cart, error } = await admin
    .from('carts')
    .insert({ session_id: sessionId, user_id: user?.id ?? null })
    .select('id')
    .single()

  if (error || !cart) throw new Error('Failed to create cart')

  return cart.id as string
}

export async function getCart(): Promise<CartItemWithDetails[]> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value

  if (!sessionId) return []

  const admin = createAdminClient()

  const { data: cart } = await admin
    .from('carts')
    .select('id')
    .eq('session_id', sessionId)
    .single()

  if (!cart) return []

  const { data: items, error } = await admin
    .from('cart_items')
    .select(
      `*,
      product:products(*, images:product_images(*)),
      variant:product_variants(*)`
    )
    .eq('cart_id', cart.id)
    .order('created_at', { ascending: true })

  if (error) return []

  return (items ?? []).map((item) => ({
    ...item,
    product: {
      ...item.product,
      images: (item.product?.images ?? []).sort(
        (a: { sort_order: number }, b: { sort_order: number }) =>
          a.sort_order - b.sort_order
      ),
    },
  })) as CartItemWithDetails[]
}

export async function addToCart(
  productId: string,
  variantId: string,
  quantity: number,
  cakeMessage?: string
): Promise<ActionResult<void>> {
  if (quantity < 1 || quantity > 100) {
    return { success: false, error: 'Invalid quantity' }
  }

  const sessionId = await getOrCreateCartSession()
  const cartId = await getOrCreateCart(sessionId)
  const admin = createAdminClient()

  const { data: existing } = await admin
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cartId)
    .eq('variant_id', variantId)
    .single()

  if (existing) {
    const newQty = Math.min((existing.quantity as number) + quantity, 100)
    // ✅ Atomic update (Race Condition ን ይከላከላል)
    const { error } = await admin
      .from('cart_items')
      .update({ quantity: newQty, cake_message: cakeMessage ?? null })
      .eq('id', existing.id)

    if (error) return { success: false, error: 'Failed to update cart item.' }
  } else {
    const { error } = await admin.from('cart_items').insert({
      cart_id: cartId,
      product_id: productId,
      variant_id: variantId,
      quantity,
      cake_message: cakeMessage ?? null,
    })

    if (error) return { success: false, error: 'Failed to add item to cart.' }
  }

  return { success: true, data: undefined }
}

export async function removeFromCart(itemId: string): Promise<ActionResult<void>> {
  const admin = createAdminClient()
  const { error } = await admin.from('cart_items').delete().eq('id', itemId)
  if (error) return { success: false, error: 'Failed to remove item from cart.' }
  return { success: true, data: undefined }
}

export async function updateCartItemQuantity(
  itemId: string,
  quantity: number
): Promise<ActionResult<void>> {
  if (quantity < 1 || quantity > 100) {
    return { success: false, error: 'Invalid quantity' }
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId)

  if (error) return { success: false, error: 'Failed to update quantity.' }
  return { success: true, data: undefined }
}

export async function clearCart(): Promise<ActionResult<void>> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value

  if (!sessionId) return { success: true, data: undefined }

  const admin = createAdminClient()

  const { data: cart } = await admin
    .from('carts')
    .select('id')
    .eq('session_id', sessionId)
    .single()

  if (cart) {
    await admin.from('cart_items').delete().eq('cart_id', cart.id)
  }

  return { success: true, data: undefined }
}

export async function getCartCount(): Promise<number> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value

  if (!sessionId) return 0

  const admin = createAdminClient()

  const { data: cart } = await admin
    .from('carts')
    .select('id')
    .eq('session_id', sessionId)
    .single()

  if (!cart) return 0

  const { count } = await admin
    .from('cart_items')
    .select('id', { count: 'exact', head: true })
    .eq('cart_id', cart.id)

  return count ?? 0
}
