import type { Order, OrderItem } from '@/types'
import { PAYMENT_METHOD_LABELS, formatPrice } from '@/lib/utils'

interface TelegramConfig {
  botToken: string
  chatId: string
}

// ============================================================
// Telegram's "HTML" parse_mode only requires escaping &, < and >
// (https://core.telegram.org/bots/api#html-style). Any customer-
// supplied text (name, address, notes, cake messages, etc.) MUST
// be passed through this before being interpolated into a
// message, otherwise a customer could inject their own <a>, <b>,
// or other tags — or break message formatting entirely — via an
// order field. Only call this on USER-SUPPLIED values, never on
// the literal HTML tags we add ourselves (e.g. <b>...</b>).
// ============================================================
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

async function sendTelegramMessage(config: TelegramConfig, message: string): Promise<boolean> {
  if (!config.botToken || !config.chatId) {
    console.warn('[Telegram] Bot token or chat ID not configured. Skipping notification.')
    return false
  }

  const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    })

    const data = await response.json() as { ok: boolean; description?: string }

    if (!data.ok) {
      console.error('[Telegram] Failed to send message:', data.description)
      return false
    }

    return true
  } catch (error) {
    console.error('[Telegram] Network error:', error)
    return false
  }
}

export async function sendNewOrderNotification(
  config: TelegramConfig,
  order: Order & { items: OrderItem[] }
): Promise<boolean> {
  const itemsList = order.items
    .map(
      (item) =>
        `  • ${escapeHtml(item.product_name)} (${escapeHtml(item.variant_name)}) × ${item.quantity} = ${formatPrice(
          item.price * item.quantity
        )}${item.cake_message ? `\n    💌 Message: "${escapeHtml(item.cake_message)}"` : ''}`
    )
    .join('\n')

  const message = `
🎂 <b>New Order Received!</b>

📋 <b>Order:</b> ${escapeHtml(order.order_number)}
👤 <b>Customer:</b> ${escapeHtml(order.customer_name)}
📞 <b>Phone:</b> ${escapeHtml(order.customer_phone)}
📍 <b>Address:</b> ${escapeHtml(order.delivery_address)}
💳 <b>Payment:</b> ${PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method}

🛒 <b>Items:</b>
${itemsList}

💰 <b>Total:</b> ${formatPrice(order.total_amount)}
${order.order_note ? `\n📝 <b>Note:</b> ${escapeHtml(order.order_note)}` : ''}

⏰ <i>${new Date(order.created_at).toLocaleString('en-US', { timeZone: 'Africa/Addis_Ababa' })}</i>
  `.trim()

  return sendTelegramMessage(config, message)
}

export async function sendOrderStatusUpdateNotification(
  config: TelegramConfig,
  order: Order
): Promise<boolean> {
  const statusEmoji: Record<string, string> = {
    pending: '⏳',
    confirmed: '✅',
    preparing: '👨‍🍳',
    delivered: '🎉',
    cancelled: '❌',
  }

  const emoji = statusEmoji[order.status] ?? '📦'

  const message = `
${emoji} <b>Order Status Updated</b>

📋 <b>Order:</b> ${escapeHtml(order.order_number)}
👤 <b>Customer:</b> ${escapeHtml(order.customer_name)}
🔄 <b>New Status:</b> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
${order.cancel_reason ? `\n❌ <b>Cancel Reason:</b> ${escapeHtml(order.cancel_reason)}` : ''}
  `.trim()

  return sendTelegramMessage(config, message)
}

// ============================================================
// ስክሪንሾት መላክ ለ Telegram (sendPhoto)
// ============================================================

export async function sendTelegramPhoto(
  config: TelegramConfig,
  photoUrl: string,
  caption: string
): Promise<boolean> {
  if (!config.botToken || !config.chatId) {
    console.warn('[Telegram] Bot token or chat ID not configured. Skipping photo notification.')
    return false
  }

  const url = `https://api.telegram.org/bot${config.botToken}/sendPhoto`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chatId,
        photo: photoUrl,
        caption: caption,
        parse_mode: 'HTML',
      }),
    })

    const data = await response.json() as { ok: boolean; description?: string }

    if (!data.ok) {
      // ✅ ትክክለኛው የ Telegram ስህተት መልእክት በ Vercel Logs ላይ ይታያል
      console.error('[Telegram] Failed to send photo:', JSON.stringify(data, null, 2))
      return false
    }

    return true
  } catch (error) {
    console.error('[Telegram] Network error while sending photo:', error)
    return false
  }
}
