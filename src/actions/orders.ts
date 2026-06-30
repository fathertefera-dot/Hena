'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkoutSchema, orderStatusSchema } from '@/lib/validations'
import { requireAdmin } from '@/actions/auth'
import { getSettings } from '@/actions/settings'
import { clearCart, getCart } from '@/actions/cart'
import { sendNewOrderNotification, sendOrderStatusUpdateNotification, sendTelegramPhoto, escapeHtml } from '@/lib/telegram'
import { ORDERS_PER_PAGE } from '@/lib/utils'
import { PAYMENT_METHOD_LABELS, formatPrice } from '@/lib/utils'
import type { ActionResult, Order, OrderFilters, PaginatedResult } from '@/types'

export async function createOrder(
  formData: unknown,
  screenshotFile?: File | null
): Promise<ActionResult<{ order_number: string; order_id: string }>> {
  const parsed = checkoutSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const cartItems = await getCart()
  if (cartItems.length === 0) {
    return { success: false, error: 'Your cart is empty.' }
  }

  // ------------------------------------------------------------
  // Server-side enforcement of the admin payment-method toggles.
  // The checkout UI hides disabled methods, but that's a client-side
  // convenience only — without this check, someone could call
  // createOrder() directly (devtools / API client) with a
  // payment_method the admin has turned OFF (e.g. Telebirr disabled
  // for maintenance) and it would still go through.
  // ------------------------------------------------------------
  const settings = await getSettings()
  const paymentMethodEnabled: Record<typeof parsed.data.payment_method, boolean> = {
    cash_on_delivery: settings.payment_cod,
    telebirr: settings.payment_telebirr,
    bank_transfer: settings.payment_bank_transfer,
  }

  if (!paymentMethodEnabled[parsed.data.payment_method]) {
    return {
      success: false,
      error: 'This payment method is currently unavailable. Please choose a different one.',
    }
  }

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0
  )

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const admin = createAdminClient()

  // ------------------------------------------------------------
  // Look up the zone server-side instead of trusting a name sent
  // from the client — this confirms the id is real and still
  // active (an admin may have deactivated/deleted it moments ago),
  // and gives us the name to snapshot onto the order.
  // ------------------------------------------------------------
  const { data: zone } = await admin
    .from('delivery_zones')
    .select('id, name')
    .eq('id', parsed.data.delivery_zone_id)
    .eq('is_active', true)
    .single()

  if (!zone) {
    return {
      success: false,
      error: 'The selected delivery area is no longer available. Please choose another one.',
    }
  }

  let screenshotUrl = ''

  // ስክሪንሾት መጫን
  if (screenshotFile && parsed.data.payment_method !== 'cash_on_delivery') {
    const ext = screenshotFile.name.split('.').pop()
    const fileName = `payment-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    if (screenshotFile.size > 5 * 1024 * 1024) {
      return { success: false, error: 'Screenshot is too large. Please upload a file under 5MB.' }
    }

    const { error: uploadError } = await admin.storage
      .from('checkout')
      .upload(fileName, screenshotFile, { upsert: false })

    if (uploadError) {
      console.error('[Orders] Upload error:', uploadError)
      return { success: false, error: `Upload failed: ${uploadError.message}` }
    }

    const { data: urlData } = admin.storage.from('checkout').getPublicUrl(fileName)
    screenshotUrl = urlData.publicUrl
  }

  // ትዕዛዝ መፍጠር
  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert({
      user_id: user?.id ?? null,
      customer_name: parsed.data.full_name,
      customer_phone: parsed.data.phone,
      delivery_zone_id: zone.id,
      delivery_zone_name: zone.name,
      delivery_address: parsed.data.delivery_address,
      order_note: parsed.data.order_note ?? null,
      payment_method: parsed.data.payment_method,
      payment_screenshot_url: screenshotUrl || null,
      total_amount: totalAmount,
      status: 'pending',
    })
    .select('id, order_number, created_at')
    .single()

  if (orderError || !order) {
    console.error('[Orders] Create error:', orderError)
    return {
      success: false,
      error: orderError?.message || 'Failed to place order. Please try again.',
    }
  }

  // የትዕዛዝ ዕቃዎች
  const orderItemsToInsert = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    variant_id: item.variant_id,
    product_name: item.product.name,
    variant_name: item.variant.name,
    price: item.variant.price,
    quantity: item.quantity,
    cake_message: item.cake_message ?? null,
  }))

  const { error: itemsError } = await admin.from('order_items').insert(orderItemsToInsert)

  if (itemsError) {
    await admin.from('orders').delete().eq('id', order.id)
    return { success: false, error: 'Failed to save order items. Please try again.' }
  }

  await clearCart()

  // Telegram ማሳወቂያ (ስህተት ካለ ወደ UI ይመጣል)
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (botToken && chatId) {
    const caption = `
🎂 <b>New Order Received!</b>

📋 <b>Order:</b> ${escapeHtml(order.order_number)}
👤 <b>Customer:</b> ${escapeHtml(parsed.data.full_name)}
📞 <b>Phone:</b> ${escapeHtml(parsed.data.phone)}
📍 <b>Area:</b> ${escapeHtml(zone.name)}
🏠 <b>Address:</b> ${escapeHtml(parsed.data.delivery_address)}
💳 <b>Payment:</b> ${PAYMENT_METHOD_LABELS[parsed.data.payment_method] ?? parsed.data.payment_method}
💰 <b>Total:</b> ${formatPrice(totalAmount)}
    `.trim()

    try {
      if (screenshotUrl) {
        const sent = await sendTelegramPhoto({ botToken, chatId }, screenshotUrl, caption)
        if (!sent) {
          console.warn('[Telegram] Photo sending failed (returned false)')
          // ስህተቱ ወደ UI አይመጣም (ትዕዛዙ ተፈጥሯል)
        }
      } else {
        await sendNewOrderNotification(
          { botToken, chatId },
          {
            ...order,
            user_id: user?.id ?? null,
            customer_name: parsed.data.full_name,
            customer_phone: parsed.data.phone,
            delivery_zone_id: zone.id,
            delivery_zone_name: zone.name,
            delivery_address: parsed.data.delivery_address,
            order_note: parsed.data.order_note ?? null,
            payment_method: parsed.data.payment_method,
            status: 'pending',
            cancel_reason: null,
            total_amount: totalAmount,
            updated_at: order.created_at,
            items: orderItemsToInsert.map((item) => ({
              ...item,
              id: '',
              created_at: order.created_at,
            })),
          }
        )
      }
    } catch (error: any) {
      console.error('[Telegram] Error caught in createOrder:', error)
      // ስህተቱን ወደ UI መልስ (ትዕዛዙ ተፈጥሯል)
      return {
        success: true,
        data: { order_number: order.order_number, order_id: order.id },
        message: `Order placed but Telegram notification failed: ${error.message || error}`,
      }
    }
  }

  return {
    success: true,
    data: { order_number: order.order_number, order_id: order.id },
    message: 'Order placed successfully!',
  }
}

// ቀሪው ኮድ (trackOrder, getAdminOrders, etc.) እንደበፊቱ ይቆያል
export async function trackOrder(
  orderNumber: string,
  phone: string
): Promise<Order | null> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('orders')
    .select(`*, items:order_items(*)`)
    .eq('order_number', orderNumber.toUpperCase())
    .eq('customer_phone', phone)
    .single()
  if (error || !data) return null
  return data as Order
}

export async function getAdminOrders(
  filters: OrderFilters = {}
): Promise<PaginatedResult<Order>> {
  const adminCheck = await requireAdmin()
  if (!adminCheck.ok) {
    return { data: [], meta: { page: 1, perPage: ORDERS_PER_PAGE, total: 0, totalPages: 0 } }
  }

  const supabase = await createClient()

  const page = filters.page ?? 1
  const perPage = ORDERS_PER_PAGE
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let query = supabase
    .from('orders')
    .select(`*, items:order_items(*)`, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (filters.status) query = query.eq('status', filters.status)
  if (filters.search) {
    query = query.or(
      `order_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,customer_phone.ilike.%${filters.search}%`
    )
  }

  const { data, count, error } = await query
  if (error) return { data: [], meta: { page, perPage, total: 0, totalPages: 0 } }

  return {
    data: (data ?? []) as Order[],
    meta: { page, perPage, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / perPage) },
  }
}

export async function getAdminOrderById(id: string): Promise<Order | null> {
  const adminCheck = await requireAdmin()
  if (!adminCheck.ok) return null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`*, items:order_items(*)`)
    .eq('id', id)
    .single()
  if (error || !data) return null
  return data as Order
}

export async function updateOrderStatus(
  orderId: string,
  formData: unknown
): Promise<ActionResult<void>> {
  const adminCheck = await requireAdmin()
  if (!adminCheck.ok) return adminCheck.error

  const parsed = orderStatusSchema.safeParse(formData)
  if (!parsed.success) return { success: false, error: 'Invalid status' }

  const { status, cancel_reason } = parsed.data
  if (status === 'cancelled' && !cancel_reason) {
    return { success: false, error: 'Please provide a cancellation reason.' }
  }

  const admin = createAdminClient()
  const { data: updatedOrder, error } = await admin
    .from('orders')
    .update({ status, cancel_reason: status === 'cancelled' ? (cancel_reason ?? null) : null })
    .eq('id', orderId)
    .select('*')
    .single()

  if (error || !updatedOrder) return { success: false, error: 'Failed to update order status.' }

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (botToken && chatId) {
    sendOrderStatusUpdateNotification({ botToken, chatId }, updatedOrder as Order).catch(console.error)
  }

  return { success: true, data: undefined, message: 'Order status updated' }
}

export async function getDashboardStats() {
  const adminCheck = await requireAdmin()
  if (!adminCheck.ok) {
    return { total_orders: 0, pending_orders: 0, delivered_orders: 0, total_products: 0 }
  }

  const admin = createAdminClient()
  const [
    { count: total_orders },
    { count: pending_orders },
    { count: delivered_orders },
    { count: total_products },
  ] = await Promise.all([
    admin.from('orders').select('id', { count: 'exact', head: true }),
    admin.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'delivered'),
    admin.from('products').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ])
  return {
    total_orders: total_orders ?? 0,
    pending_orders: pending_orders ?? 0,
    delivered_orders: delivered_orders ?? 0,
    total_products: total_products ?? 0,
  }
}
