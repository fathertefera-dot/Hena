'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Minus, Plus, MessageSquare, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/utils'
import type { CartItemWithDetails } from '@/types'

export function CartItemRow({ item }: { item: CartItemWithDetails }) {
  const { removeItem, updateQuantity } = useCart()
  const image = item.product.images?.[0]

  const handleRemove = async () => {
    await removeItem(item.id)
    toast.success('Item Removed', {
      description: `${item.product.name} has been removed from your cart.`,
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    })
  }

  const handleUpdate = async (newQty: number) => {
    if (newQty < 1) return
    await updateQuantity(item.id, newQty)
    toast.info('Quantity Updated', {
      description: `${item.product.name} quantity is now ${newQty}.`,
      icon: <Plus className="h-4 w-4 text-blue-500" />,
    })
  }

  return (
    <div className="flex gap-4 py-4">
      <Link href={`/products/${item.product.slug}`} className="relative shrink-0 h-20 w-20 rounded-lg overflow-hidden bg-muted">
        {image ? (
          <Image src={image.url} alt={item.product.name} fill sizes="80px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🎂</div>
        )}
      </Link>
      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/products/${item.product.slug}`} className="font-display text-base font-semibold text-foreground hover:text-primary transition-colors line-clamp-2">
            {item.product.name}
          </Link>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={handleRemove}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">{item.variant.name}</p>
        {item.cake_message && (
          <div className="flex items-start gap-1.5 mt-1.5 text-xs text-muted-foreground bg-muted/50 rounded-md px-2 py-1.5">
            <MessageSquare className="h-3 w-3 shrink-0 mt-0.5 text-primary" />
            <span className="italic">“{item.cake_message}”</span>
          </div>
        )}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <button onClick={() => handleUpdate(item.quantity - 1)} className="h-7 w-7 rounded border border-border flex items-center justify-center hover:bg-muted transition-colors">
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
            <button onClick={() => handleUpdate(item.quantity + 1)} disabled={item.quantity >= 99} className="h-7 w-7 rounded border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50">
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <p className="font-display text-base font-semibold text-foreground">{formatPrice(item.variant.price * item.quantity)}</p>
        </div>
      </div>
    </div>
  )
}

export function CartSummary({ showCheckoutButton = true }: { showCheckoutButton?: boolean }) {
  const { items, totalAmount, itemCount } = useCart()
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 sticky top-24">
      <h2 className="font-display text-xl font-semibold">Order Summary</h2>
      <Separator />
      {items.map((item) => (
        <div key={item.id} className="flex justify-between items-start gap-2 text-sm">
          <span className="text-muted-foreground flex-1 min-w-0">
            {item.product.name} <span className="text-muted-foreground/60">({item.variant.name}) × {item.quantity}</span>
          </span>
          <span className="font-medium shrink-0">{formatPrice(item.variant.price * item.quantity)}</span>
        </div>
      ))}
      <Separator />
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
        <span className="font-display text-2xl font-bold text-foreground">{formatPrice(totalAmount)}</span>
      </div>
      <div className="bg-muted/50 rounded-lg px-4 py-3 text-xs text-muted-foreground">
        Delivery charges will be confirmed by our team after your order is placed.
      </div>
      {showCheckoutButton && (
        <Button size="lg" className="w-full" asChild>
          <Link href="/checkout">Proceed to Checkout</Link>
        </Button>
      )}
    </div>
  )
}
