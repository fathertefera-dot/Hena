'use client'

import Link from 'next/link'
import { ShoppingCart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CartItemRow, CartSummary } from '@/components/cart/CartComponents'
import { PageLoadingSpinner } from '@/components/shared/index'
import { useCart } from '@/contexts/CartContext'

export default function CartPage() {
  const { items, isLoading, itemCount } = useCart()

  if (isLoading) return <PageLoadingSpinner />

  if (itemCount === 0) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center text-center gap-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <ShoppingCart className="h-10 w-10 text-muted-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground mb-2">Your Cart is Empty</h1>
          <p className="text-muted-foreground max-w-sm">
            Looks like you haven't added any cakes yet. Browse our collection to find your perfect cake!
          </p>
        </div>
        <Button size="lg" asChild>
          <Link href="/products" className="flex items-center gap-2">
            Browse Cakes <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-foreground">Shopping Cart</h1>
        <p className="text-muted-foreground mt-1">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {items.map((item) => (
              <div key={item.id} className="px-5">
                <CartItemRow item={item} />
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between items-center">
            <Button variant="outline" asChild>
              <Link href="/products">← Continue Shopping</Link>
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <CartSummary />
        </div>
      </div>
    </div>
  )
}
