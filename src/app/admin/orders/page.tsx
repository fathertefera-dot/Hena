import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Pagination, EmptyState } from '@/components/shared/index'
import { OrderStatusBadge } from '@/components/orders/OrderComponents'
import { getAdminOrders } from '@/actions/orders'
import { formatDateTime, formatPrice, PAYMENT_METHOD_LABELS, ORDERS_PER_PAGE } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types'

export const metadata: Metadata = { title: 'Orders' }

const STATUS_FILTERS: Array<{ label: string; value: string }> = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Preparing', value: 'preparing' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
]

interface OrdersPageProps {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams
  const status = params.status as OrderStatus | undefined
  const search = params.search ?? ''
  const page = Number(params.page ?? 1)

  const { data: orders, meta } = await getAdminOrders({ status, search: search || undefined, page })

  return (
    <div className="space-y-6">
      <div className="admin-page-header">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold">Orders</h1>
          <p className="text-muted-foreground mt-1">{meta.total} total orders</p>
        </div>
      </div>

      {/* Filters — Responsive */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form method="GET" action="/admin/orders" className="relative flex-1 max-w-sm">
          {status && <input type="hidden" name="status" value={status} />}
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            name="search" 
            placeholder="Search by order #, name, phone..." 
            defaultValue={search} 
            className="pl-10" 
          />
        </form>
        {(search || status) && (
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/orders" className="flex items-center gap-2">
              Clear Filters
            </Link>
          </Button>
        )}
      </div>

      {/* Status Tabs — Wrap on mobile */}
      <div className="flex flex-wrap gap-2 pb-1">
        {STATUS_FILTERS.map(({ label, value }) => {
          const isActive = (status ?? '') === value
          const href = value
            ? `/admin/orders?status=${value}${search ? `&search=${search}` : ''}`
            : `/admin/orders${search ? `?search=${search}` : ''}`
          return (
            <Link key={value} href={href}>
              <Badge
                variant={isActive ? 'default' : 'outline'}
                className="cursor-pointer whitespace-nowrap px-3 py-1.5 text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {label}
              </Badge>
            </Link>
          )
        })}
      </div>

      {/* Orders List — Desktop Table / Mobile Cards */}
      {orders.length === 0 ? (
        <EmptyState
          title="No orders found"
          description={search ? `No orders matching "${search}"` : 'No orders in this category yet.'}
          action={search || status ? { label: 'Clear Filters', href: '/admin/orders' } : undefined}
        />
      ) : (
        <Card>
          {/* Desktop Table (visible on md and up) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Order</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Customer</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Payment</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Total</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="font-mono text-primary font-semibold hover:underline">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{order.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {PAYMENT_METHOD_LABELS[order.payment_method]}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {formatDateTime(order.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatPrice(order.total_amount)}
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/orders/${order.id}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards (visible on smaller screens) */}
          <div className="md:hidden divide-y divide-border">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="block p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-semibold text-primary truncate">
                      {order.order_number}
                    </p>
                    <p className="text-sm font-medium text-foreground mt-1 truncate">
                      {order.customer_name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDateTime(order.created_at)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {PAYMENT_METHOD_LABELS[order.payment_method]}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <OrderStatusBadge status={order.status} />
                    <p className="text-sm font-semibold mt-2">
                      {formatPrice(order.total_amount)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      <Pagination
        currentPage={page}
        totalPages={meta.totalPages}
        baseUrl="/admin/orders"
        searchParams={{ status, search: search || undefined }}
      />
    </div>
  )
}
