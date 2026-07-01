'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Loader2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/contexts/CartContext'
import { formatPrice, AVAILABILITY_LABELS } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Product, ProductVariant } from '@/types'

export function AddToCartForm({ product }: { product: Product }) {
  const router = useRouter()
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(product.variants?.[0] ?? null)
  const [quantity, setQuantity] = useState(1)
  const [cakeMessage, setCakeMessage] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const { addItem } = useCart()

  const handleAdd = async () => {
    if (!selectedVariant || isAdding) return

    setIsAdding(true)
    // -------------------------------------------------------
    // Do NOT wrap this in startTransition. Calling router.push
    // inside startTransition makes Next.js App Router treat the
    // navigation as a "deferred/non-urgent" transition, which
    // keeps the source page (shop) as the "current" page until
    // the transition fully resolves. When the user then taps "+"
    // on the cart page during that window, React processes the
    // interaction in the context of the shop page — causing it
    // to navigate back. Using plain async/await + useState for
    // the loading indicator avoids this entirely.
    // -------------------------------------------------------
    const result = await addItem(
      product.id,
      selectedVariant.id,
      quantity,
      cakeMessage.trim() || undefined
    )

    if (result.success) {
      router.push('/cart')
      // isAdding stays true intentionally — the component unmounts
      // on navigation so there's no need to reset it.
    } else {
      setIsAdding(false)
      toast.error('Failed to Add to Cart', {
        description: result.error || 'Please try again.',
        icon: <XCircle className="h-4 w-4 text-destructive" />,
      })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <span className={cn('h-2 w-2 rounded-full', product.availability === 'available' ? 'bg-green-500' : 'bg-yellow-500')} />
        <span className={cn('text-sm font-medium', product.availability === 'available' ? 'text-green-700' : 'text-yellow-700')}>
          {AVAILABILITY_LABELS[product.availability]}
        </span>
      </div>

      {product.variants && product.variants.length > 0 && (
        <div>
          <Label className="text-sm font-semibold mb-3 block">Select Size / Weight</Label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariant(v)}
                className={cn(
                  'flex flex-col items-center px-4 py-3 rounded-lg border-2 transition-all min-w-[80px] text-left',
                  selectedVariant?.id === v.id
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                )}
              >
                <span className="text-sm font-semibold">{v.name}</span>
                <span className="text-base font-display font-bold text-primary mt-0.5">{formatPrice(v.price)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-baseline gap-2 py-3 border-y border-border">
        <span className="text-sm text-muted-foreground">Price:</span>
        <span className="font-display text-2xl font-bold">{formatPrice(selectedVariant ? selectedVariant.price * quantity : 0)}</span>
        {quantity > 1 && (
          <span className="text-sm text-muted-foreground">({formatPrice(selectedVariant?.price ?? 0)} × {quantity})</span>
        )}
      </div>

      <div>
        <Label className="text-sm font-semibold mb-3 block">Quantity</Label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={isAdding}
            className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
          >
            −
          </button>
          <span className="w-10 text-center font-semibold text-lg">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(99, q + 1))}
            disabled={isAdding}
            className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>

      <div>
        <Label htmlFor="message" className="text-sm font-semibold mb-1.5 flex items-center gap-2">
          Cake Message <Badge variant="outline" className="text-[10px] font-normal">Optional</Badge>
        </Label>
        <p className="text-xs text-muted-foreground mb-2">Add a personal message to be written on your cake.</p>
        <Textarea
          id="message"
          placeholder="e.g. Happy Birthday Sarah! 🎉"
          value={cakeMessage}
          onChange={(e) => setCakeMessage(e.target.value.slice(0, 100))}
          className="resize-none h-20"
          maxLength={100}
        />
        <p className="text-xs text-muted-foreground mt-1 text-right">{cakeMessage.length}/100</p>
      </div>

      <Button
        size="xl"
        onClick={handleAdd}
        disabled={!selectedVariant || isAdding}
        className="w-full"
      >
        {isAdding ? (
          <><Loader2 className="h-5 w-5 animate-spin" /> Adding to Cart...</>
        ) : (
          <><ShoppingCart className="h-5 w-5" /> Add to Cart{selectedVariant && ` — ${formatPrice(selectedVariant.price * quantity)}`}</>
        )}
      </Button>
    </div>
  )
}
