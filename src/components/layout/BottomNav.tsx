'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { House, ShoppingBag, ShoppingCart, User } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/products', label: 'Shop', icon: ShoppingBag },
  { href: '/', label: 'Home', icon: House },
  { href: '/cart', label: 'Cart', icon: ShoppingCart },
  { href: '/account', label: 'Account', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()
  const { itemCount } = useCart()

  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div className="grid grid-cols-4 h-16">
        {NAV.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/'
              ? pathname === '/'
              : pathname.startsWith(href)

          const isCart = href === '/cart'
          const isHome = href === '/'

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex flex-col items-center justify-center transition-all duration-300 active:scale-95',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div
                className={cn(
                  'relative flex items-center justify-center transition-all duration-300',
                  isHome
                    ? '-mt-7 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl'
                    : 'h-10 w-10'
                )}
              >
                <Icon
                  className={cn(
                    isHome ? 'h-7 w-7' : 'h-5 w-5',
                    isActive && !isHome && 'scale-110'
                  )}
                />

                {isCart && itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </div>

              <span
                className={cn(
                  'text-[10px] font-medium',
                  isHome && 'mt-1'
                )}
              >
                {label}
              </span>

              {isActive && !isHome && (
                <span className="absolute top-1 h-1 w-6 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
