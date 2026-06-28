import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { getSettings } from '@/actions/settings'
import { getCart } from '@/actions/cart'

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your cake order.',
}

export default async function CheckoutPage() {
  const [settings, cartItems] = await Promise.all([
    getSettings(),
    getCart(),
  ])

  if (cartItems.length === 0) {
    redirect('/cart')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-foreground">Checkout</h1>
        <p className="text-muted-foreground mt-1">Fill in your details to place your order.</p>
      </div>

      <CheckoutForm settings={settings} />
    </div>
  )
}
