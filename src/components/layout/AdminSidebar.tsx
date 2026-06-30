'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ShoppingBag, Package,
  Tag, Image, Settings, Cake, LogOut, ChevronRight,
  ChevronLeft, Truck
} from 'lucide-react'
import { logout } from '@/actions/auth'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin',               label: 'Dashboard',      icon: LayoutDashboard, exact: true },
  { href: '/admin/orders',        label: 'Orders',         icon: ShoppingBag },
  { href: '/admin/products',      label: 'Products',       icon: Package },
  { href: '/admin/categories',    label: 'Categories',     icon: Tag },
  { href: '/admin/banners',       label: 'Banners',        icon: Image },
  { href: '/admin/delivery-zones',label: 'Delivery Zones', icon: Truck },
  { href: '/admin/settings',      label: 'Settings',       icon: Settings },
]

function NavItem({
  href, label, icon: Icon, exact = false, onClick, collapsed = false
}: {
  href: string; label: string; icon: React.ElementType; exact?: boolean; onClick?: () => void; collapsed?: boolean
}) {
  const pathname = usePathname()
  const isActive = exact ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && label}
      {isActive && !collapsed && (
        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
      )}
    </Link>
  )
}

export function AdminSidebarContent({ onNavClick, collapsed = false }: { onNavClick?: () => void; collapsed?: boolean }) {
  return (
    <div className="flex h-full flex-col bg-background">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border shrink-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary">
          <Cake className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-display text-sm font-semibold text-foreground leading-none">Iku Sweet</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 py-3 overflow-y-auto">
        <nav className="flex flex-col gap-0.5 px-2">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.href} {...item} onClick={onNavClick} collapsed={collapsed} />
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Cake className="h-4 w-4" />
          {!collapsed && 'View Store'}
        </Link>
        <button
          type="button"
          onClick={() => logout()}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </div>
  )
}

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex md:flex-col md:fixed md:inset-y-0 md:z-30 bg-background border-r border-border transition-all duration-300',
          collapsed ? 'md:w-16' : 'md:w-56 lg:w-64'
        )}
      >
        <AdminSidebarContent collapsed={collapsed} />

        {/* Toggle button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-16 z-10 h-6 w-6 rounded-full border border-border bg-background flex items-center justify-center hover:bg-muted transition-colors"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      {/* Mobile bottom navigation (visible only on small screens) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background border-t border-border h-14">
        <div className="grid grid-cols-5 h-full">
          {NAV_ITEMS.slice(0, 5).map(({ href, label, icon: Icon }) => {
            const pathname = usePathname()
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[9px] font-medium">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
