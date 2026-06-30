'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Search, ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

interface HeaderProps {
  businessName?: string
}

export function Header({
  businessName = 'Iku Sweet Cake',
}: HeaderProps) {
  const { itemCount } = useCart()

  return (
    <header
      className="
        sticky top-0 z-40 w-full
        border-b border-white/10
        bg-brand-chocolate/90
        backdrop-blur-md
        supports-[backdrop-filter]:bg-brand-chocolate/80
        shadow-sm shadow-black/20
      "
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-3">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 shrink-0 transition-transform duration-300 hover:scale-[1.02]"
          >
            <div className="h-11 w-11 overflow-hidden rounded-full bg-white ring-2 ring-primary/20 shadow-sm">
              <Image
                src="/logo.png"
                alt={businessName}
                width={44}
                height={44}
                priority
                className="h-full w-full object-cover"
              />
            </div>

            <div className="leading-none">
              <h1 className="font-display text-base font-bold text-white tracking-wide">
                {businessName}
              </h1>

              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[4px] text-primary">
                Cake Shop
              </p>
            </div>
          </Link>

          {/* Search (Desktop) */}
          <Link
            href="/products"
            className="
              hidden sm:flex
              flex-1 max-w-sm
              items-center gap-2
              h-10
              rounded-xl
              border border-white/15
              bg-white/10
              px-4
              text-sm text-white/60
              transition-all duration-300
              hover:bg-white/15
              hover:border-primary/40
              hover:text-white
            "
          >
            <Search className="h-4 w-4 shrink-0" />
            <span>Search cakes...</span>
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            aria-label={`Cart, ${itemCount} items`}
            className="
              relative
              flex items-center gap-2
              text-white/90
              transition-all duration-300
              hover:text-white
              hover:scale-105
            "
          >
            <div className="relative">
              <ShoppingCart className="h-6 w-6" />

              {itemCount > 0 && (
                <span
                  className="
                    absolute -top-2 -right-2
                    flex h-5 min-w-[20px]
                    items-center justify-center
                    rounded-full
                    border-2 border-brand-chocolate
                    bg-primary
                    px-1
                    text-[10px]
                    font-bold
                    text-white
                  "
                >
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
