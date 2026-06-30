'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  House,
  Grid2x2,
  ShoppingBag,
  ShoppingCart,
  User,
} from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/', label: 'Home', icon: House },
  { href: '/#categories', label: 'Categories', icon: Grid2x2 },
  { href: '/products', label: 'Shop', icon: ShoppingBag },
  { href: '/cart', label: 'Cart', icon: ShoppingCart },
  { href: '/account', label: 'Account', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()
  const { itemCount } = useCart()

  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="grid grid-cols-5 h-16">
        {NAV.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/'
              ? pathname === '/'
              : href === '/#categories'
              ? pathname === '/'
              : pathname.startsWith(href)

          const isCart = href === '/cart'

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-95',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'h-5 w-5 transition-transform duration-200',
                    isActive && 'scale-110'
                  )}
                />

                {isCart && itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </div>

              <span className="text-[10px] font-medium">
                {label}
              </span>

              {isActive && (
                <span className="absolute top-1 h-1 w-6 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
