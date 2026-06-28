import type { Metadata } from 'next'
import Link from 'next/link'
import { 
  ShoppingBag, Clock, CheckCircle2, Package, ArrowRight, 
  Plus, List, Settings, TrendingUp, Users, DollarSign
} from 'lucide-react'
import { getDashboardStats, getAdminOrders } from '@/actions/orders'
import { OrderStatusBadge } from '@/components/orders/OrderComponents'
import { formatDateTime, formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function AdminDashboardPage() {
  const [stats, { data: recentOrders }] = await Promise.all([
    getDashboardStats(),
    getAdminOrders({ page: 1, perPage: 5 }),
  ])

  const statCards = [
    {
      label: 'Total Orders',
      value: stats.total_orders,
      icon: ShoppingBag,
      href: '/admin/orders',
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      label: 'Pending',
      value: stats.pending_orders,
      icon: Clock,
      href: '/admin/orders?status=pending',
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
    },
    {
      label: 'Delivered',
      value: stats.delivered_orders,
      icon: CheckCircle2,
      href: '/admin/orders?status=delivered',
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      label: 'Active Products',
      value: stats.total_products,
      icon: Package,
      href: '/admin/products',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header with greeting and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back! Here’s how your store is performing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href="/admin/orders" className="flex items-center gap-1">
              <List className="h-4 w-4" /> Orders
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/products/new" className="flex items-center gap-1">
              <Plus className="h-4 w-4" /> New Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards — Fully Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statCards.map(({ label, value, icon: Icon, href, color, bg }) => (
          <Link
            key={label}
            href={href}
            className="group relative rounded-xl border border-border bg-card p-4 hover:shadow-md hover:scale-[1.02] transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl md:text-3xl font-bold text-foreground">
                  {value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
              <div className={`h-10 w-10 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
            </div>
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions — Mobile friendly */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/orders">📦 View All Orders</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/products">🍰 Manage Products</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/categories">🏷️ Categories</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/banners">🖼️ Banners</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/settings">⚙️ Settings</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Orders — Desktop Table / Mobile Card View */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <Card className="p-10 text-center text-sm text-muted-foreground">
            No orders yet. Start selling!
          </Card>
        ) : (
          <Card>
            {/* Desktop Table (hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Order</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Customer</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono text-xs font-semibold text-primary hover:underline"
                        >
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground text-xs">{order.customer_name}</p>
                        <p className="text-[11px] text-muted-foreground">{order.customer_phone}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDateTime(order.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-semibold">
                        {formatPrice(order.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-border">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="block p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-sm font-semibold text-primary">
                        {order.order_number}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {order.customer_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <OrderStatusBadge status={order.status} />
                      <p className="text-sm font-semibold mt-1">
                        {formatPrice(order.total_amount)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
