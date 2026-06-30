'use client'

import Link from 'next/link'
import { Search, ShoppingCart, Cake } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

interface HeaderProps {
  businessName?: string
}

export function Header({
  businessName = 'Iku Sweet Cake',
}: HeaderProps) {
  const { itemCount } = useCart()

  return (
    <header className="sticky top-0 z-40 w-full bg-brand-chocolate border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shrink-0">
              <Cake className="h-5 w-5 text-white" />
            </div>

            <div className="leading-tight">
              <h1 className="font-display text-base font-bold text-white truncate max-w-[180px]">
                {businessName}
              </h1>

              <p className="text-[11px] uppercase tracking-[4px] text-primary">
                Cake Shop
              </p>
            </div>
          </Link>

          {/* Search */}
          <Link
            href="/products"
            className="hidden sm:flex flex-1 max-w-sm items-center gap-2 h-9 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3 text-sm text-white/60 transition-colors"
          >
            <Search className="h-4 w-4" />
            Search products...
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex items-center gap-1.5 text-white/90 hover:text-white transition-colors"
            aria-label={`Cart, ${itemCount} items`}
          >
            <div className="relative">
              <ShoppingCart className="h-6 w-6" />

              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center border-2 border-brand-chocolate">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </div>

            <span className="hidden sm:block text-sm font-medium">
              Cart
            </span>
          </Link>

        </div>
      </div>
    </header>
  )
}
