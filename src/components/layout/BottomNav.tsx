'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const pathname = usePathname()
  const { itemCount } = useCart()
  const isCartActive = pathname.startsWith('/cart')

  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-background border-t border-border">
      {/* 4 equal columns: Home · Shop · Cart (raised, floats above the
          bar like AliExpress's center "Choice" button) · Account */}
      <div className="grid grid-cols-4 h-16 items-center">
        <NavItem href="/" label="Home" icon={Home} isActive={pathname === '/'} />
        <NavItem
          href="/products"
          label="Shop"
          icon={ShoppingBag}
          isActive={pathname.startsWith('/products')}
        />

        {/* Raised Cart pill button */}
        <div className="relative flex items-center justify-center">
          <Link
            href="/cart"
            aria-label={`Cart, ${itemCount} items`}
            className="absolute -top-7 flex flex-col items-center gap-1 group"
          >
            <span
              className={cn(
                'relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg shadow-primary/30 ring-4 ring-background transition-transform duration-200 group-active:scale-95',
                isCartActive ? 'bg-primary' : 'bg-primary/90 group-hover:bg-primary'
              )}
            >
              <ShoppingCart className="h-6 w-6 text-white" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-brand-chocolate text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-background">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </span>
            <span
              className={cn(
                'text-[10px] font-medium',
                isCartActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              Cart
            </span>
          </Link>
        </div>

        <NavItem
          href="/account"
          label="Account"
          icon={User}
          isActive={pathname.startsWith('/account')}
        />
      </div>
    </nav>
  )
}

function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string
  label: string
  icon: typeof Home
  isActive: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center justify-center gap-1 transition-colors relative h-full',
        isActive ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[10px] font-medium">{label}</span>
      {isActive && (
        <span className="absolute top-0 inset-x-0 h-0.5 bg-primary rounded-b-full" />
      )}
    </Link>
  )
}
