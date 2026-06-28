'use client'

import { useState, useEffect, useTransition } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrderStatusBadge, OrderTimeline } from '@/components/orders/OrderComponents'
import { updateOrderStatus, getAdminOrderById } from '@/actions/orders'
import { formatDateTime, formatPrice, PAYMENT_METHOD_LABELS, ORDER_STATUS_LABELS } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const [order, setOrder] = useState<Order | null | undefined>(undefined)
  const [isPending, startTransition] = useTransition()
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('')
  const [cancelReason, setCancelReason] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [id, setId] = useState<string | null>(null)

  // Unwrap params safely
  useEffect(() => {
    params.then((p) => setId(p.id))
  }, [params])

  // Load order
  useEffect(() => {
    if (id && !loaded) {
      setLoaded(true)
      getAdminOrderById(id).then((o) => setOrder(o))
    }
  }, [id, loaded])

  if (!id || order === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (order === null) return notFound()

  const handleUpdateStatus = () => {
    if (!newStatus) return
    if (newStatus === 'cancelled' && !cancelReason.trim()) {
      toast.error('Please provide a cancellation reason')
      return
    }

    startTransition(async () => {
      const result = await updateOrderStatus(id, {
        status: newStatus,
        cancel_reason: cancelReason.trim() || undefined,
      })

      if (result.success) {
        toast.success('Order status updated')
        setOrder((prev) =>
          prev ? { ...prev, status: newStatus as OrderStatus, cancel_reason: cancelReason || prev.cancel_reason } : prev
        )
        setNewStatus('')
        setCancelReason('')
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/orders" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
        <div>
          <h1 className="font-display text-2xl font-semibold font-mono text-primary">
            {order.order_number}
          </h1>
          <p className="text-sm text-muted-foreground">Placed {formatDateTime(order.created_at)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Order Items */}
          <Card>
            <CardHeader><CardTitle>Order Items</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 py-2 border-b border-border/50 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.variant_name} × {item.quantity} — {formatPrice(item.price)} each
                    </p>
                    {item.cake_message && (
                      <p className="text-xs text-primary italic mt-0.5">💌 &ldquo;{item.cake_message}&rdquo;</p>
                    )}
                  </div>
                  <p className="font-semibold text-sm shrink-0 sm:text-right">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-semibold pt-2">
                <span>Total</span>
                <span className="font-display text-xl">{formatPrice(order.total_amount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader><CardTitle>Delivery Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Customer Name</p>
                <p className="font-medium">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Phone</p>
                <a href={`tel:${order.customer_phone}`} className="font-medium text-primary hover:underline">
                  {order.customer_phone}
                </a>
              </div>
              <div className="sm:col-span-2">
                <p className="text-muted-foreground mb-1">Delivery Address</p>
                <p className="font-medium">{order.delivery_address}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Payment Method</p>
                <p className="font-medium">{PAYMENT_METHOD_LABELS[order.payment_method]}</p>
              </div>
              {order.order_note && (
                <div className="sm:col-span-2">
                  <p className="text-muted-foreground mb-1">Order Note</p>
                  <p className="font-medium">{order.order_note}</p>
                </div>
              )}
              {order.cancel_reason && (
                <div className="sm:col-span-2">
                  <p className="text-muted-foreground mb-1">Cancellation Reason</p>
                  <p className="font-medium text-destructive">{order.cancel_reason}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Update Status */}
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <Card>
              <CardHeader><CardTitle>Update Status</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>New Status</Label>
                  <Select value={newStatus} onValueChange={(v) => setNewStatus(v as OrderStatus)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'] as OrderStatus[])
                        .filter((s) => s !== order.status)
                        .map((s) => (
                          <SelectItem key={s} value={s}>
                            {ORDER_STATUS_LABELS[s]}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {newStatus === 'cancelled' && (
                  <div className="space-y-1.5">
                    <Label>Cancellation Reason *</Label>
                    <Textarea
                      placeholder="Why is this order being cancelled?"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="h-20"
                    />
                  </div>
                )}

                <Button
                  onClick={handleUpdateStatus}
                  disabled={!newStatus || isPending}
                  className="w-full"
                >
                  {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating...</> : 'Update Status'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader><CardTitle>Order Timeline</CardTitle></CardHeader>
            <CardContent>
              <OrderTimeline
                status={order.status}
                createdAt={order.created_at}
                updatedAt={order.updated_at}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
