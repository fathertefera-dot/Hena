'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, Bell, User, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { AdminSidebarContent } from './AdminSidebar'
import type { Profile } from '@/types'

interface AdminHeaderProps {
  user: Profile
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length === 0) return 'Dashboard'
    if (segments.length === 1 && segments[0] === 'admin') return 'Dashboard'
    const last = segments[segments.length - 1]
    // ከዚህ በታች 'last' በእርግጥ እንዳለ እናረጋግጣለን
    if (!last) return 'Dashboard'
    if (last === 'new') return 'New Product'
    if (last === '[id]') return 'Edit Product'
    return last.charAt(0).toUpperCase() + last.slice(1)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4 md:px-6">
        {/* Mobile menu button */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <AdminSidebarContent onNavClick={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Page title */}
        <h1 className="font-display text-lg font-semibold md:text-xl truncate">
          {getPageTitle()}
        </h1>

        <div className="flex-1" />

        {/* Search (desktop only) */}
        <div className="hidden md:flex items-center gap-2 relative max-w-sm">
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-9 h-9 w-full bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>

        {/* User menu */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
          </Button>
          <div className="flex items-center gap-2 rounded-full bg-muted px-2 py-1">
            <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
              {user.full_name?.charAt(0) || 'A'}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-foreground truncate max-w-[100px]">
              {user.full_name || user.email}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
