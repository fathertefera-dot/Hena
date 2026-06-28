'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Search, Loader2, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { OrderStatusBadge, OrderTimeline } from '@/components/orders/OrderComponents'
import { trackOrderSchema, type TrackOrderFormValues } from '@/lib/validations'
import { trackOrder } from '@/actions/orders'
import { formatDateTime, formatPrice, PAYMENT_METHOD_LABELS } from '@/lib/utils'
import type { Order } from '@/types'

export default function TrackOrderPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [isPending, startTransition] = useTransition()

  const { register, handleSubmit, formState: { errors } } = useForm<TrackOrderFormValues>({
    resolver: zodResolver(trackOrderSchema),
  })

  const onSubmit = (data: TrackOrderFormValues) => {
    setNotFound(false)
    setOrder(null)
    startTransition(async () => {
      const result = await trackOrder(data.order_number, data.phone)
      if (result) {
        setOrder(result)
      } else {
        setNotFound(true)
      }
    })
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-xl">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Package className="h-7 w-7 text-primary" />
          </div>
        </div>
        <h1 className="font-display text-3xl font-semibold text-foreground mb-2">Track Your Order</h1>
        <p className="text-muted-foreground">Enter your order number and phone number to check your order status.</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-border bg-card p-6 space-y-4 mb-6">
        <div className="space-y-1.5">
          <Label htmlFor="order_number">Order Number</Label>
          <Input
            id="order_number"
            placeholder="e.g. IKU-1001"
            {...register('order_number')}
            className={errors.order_number ? 'border-destructive' : ''}
          />
          {errors.order_number && (
            <p className="text-xs text-destructive">{errors.order_number.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="The phone number used when ordering"
            {...register('phone')}
            className={errors.phone ? 'border-destructive' : ''}
          />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Searching...</>
          ) : (
            <><Search className="h-4 w-4" /> Track Order</>
          )}
        </Button>
      </form>

      {/* Not Found */}
      {notFound && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-center">
          <p className="font-semibold text-destructive mb-1">Order Not Found</p>
          <p className="text-sm text-muted-foreground">
            We couldn't find an order with that number and phone number. Please check your details and try again.
          </p>
        </div>
      )}

      {/* Order Details */}
      {order && (
        <div className="space-y-4 animate-fade-in">
          {/* Header */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Order Number</p>
                <p className="font-mono text-xl font-bold text-primary">{order.order_number}</p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-0.5">Placed on</p>
                <p className="font-medium">{formatDateTime(order.created_at)}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Payment</p>
                <p className="font-medium">{PAYMENT_METHOD_LABELS[order.payment_method]}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Delivery to</p>
                <p className="font-medium text-xs">{order.delivery_address}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Total</p>
                <p className="font-display font-bold text-lg">{formatPrice(order.total_amount)}</p>
              </div>
            </div>

            {order.cancel_reason && (
              <div className="mt-4 bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                <p className="text-xs font-semibold text-destructive mb-1">Cancellation Reason</p>
                <p className="text-sm text-muted-foreground">{order.cancel_reason}</p>
              </div>
            )}
          </div>

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-display text-lg font-semibold mb-4">Order Items</h2>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start gap-3 text-sm">
                    <div>
                      <p className="font-medium text-foreground">{item.product_name}</p>
                      <p className="text-muted-foreground text-xs">{item.variant_name} × {item.quantity}</p>
                      {item.cake_message && (
                        <p className="text-xs italic text-primary mt-0.5">💌 &ldquo;{item.cake_message}&rdquo;</p>
                      )}
                    </div>
                    <p className="font-semibold shrink-0">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="font-display text-lg">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-semibold mb-6">Order Status</h2>
            <OrderTimeline
              status={order.status}
              createdAt={order.created_at}
              updatedAt={order.updated_at}
            />
          </div>
        </div>
      )}
    </div>
  )
}
