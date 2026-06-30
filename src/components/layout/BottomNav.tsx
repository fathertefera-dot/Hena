'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/',         label: 'Home',    pillLabel: 'Home', icon: Home         },
  { href: '/products', label: 'Shop',    pillLabel: 'Shop', icon: ShoppingBag  },
  { href: '/cart',     label: 'Cart',    pillLabel: 'Cart', icon: ShoppingCart },
  { href: '/account',  label: 'Account', pillLabel: 'Me',   icon: User         },
] as const

export function BottomNav() {
  const pathname  = usePathname()
  const { itemCount } = useCart()

  return (
    <nav
      aria-label="Main navigation"
      className="sm:hidden fixed bottom-0 inset-x-0 z-50"
    >
      {/* ── Glass shell ────────────────────────────────────────────── */}
      <div
        className={cn(
          'relative overflow-hidden',
          'bg-white/[0.92] backdrop-blur-2xl',
          'border-t border-white/60',
          'rounded-t-[22px]',
          'shadow-[0_-8px_32px_-4px_rgba(196,123,110,0.18),0_-1px_0_rgba(0,0,0,0.04)]',
        )}
        style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom, 0px))' }}
      >
        {/* Subtle rosewood shimmer on top edge */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        {/* ── Tab grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-4 px-1 pt-[10px] pb-[6px]">
          {NAV.map(({ href, label, pillLabel, icon: Icon }) => {
            const isActive = href === '/'
              ? pathname === '/'
              : pathname.startsWith(href)
            const isCart = href === '/cart'

            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                className="flex flex-col items-center justify-center min-h-[52px] cursor-pointer select-none active:scale-[0.91] transition-transform duration-[80ms] ease-out"
              >
                {/* ── Pill row ─────────────────────────────────────── */}
                <div
                  className={cn(
                    'flex items-center rounded-full',
                    // spring easing for pill expand/collapse
                    'transition-all duration-[300ms] ease-[cubic-bezier(0.34,1.4,0.64,1)]',
                    isActive
                      ? 'bg-primary/[0.12] gap-[5px] px-[12px] py-[7px]'
                      : 'bg-transparent gap-0     px-[10px] py-[7px]',
                  )}
                >
                  {/* Icon — subtly scales down when pill is open */}
                  <div
                    className={cn(
                      'relative flex-shrink-0',
                      'transition-transform duration-[300ms] ease-out',
                      isActive ? 'scale-[0.90]' : 'scale-100',
                    )}
                  >
                    <Icon
                      size={20}
                      strokeWidth={1.85}
                      className={cn(
                        'transition-colors duration-[280ms]',
                        isActive ? 'text-primary' : 'text-[#A08880]',
                      )}
                    />

                    {/* Cart badge */}
                    {isCart && itemCount > 0 && (
                      <span
                        className={cn(
                          'absolute -top-[9px] flex items-center justify-center',
                          'rounded-full bg-destructive text-white font-bold leading-none',
                          'ring-[1.5px] ring-white transition-all duration-200',
                          itemCount > 9
                            ? '-right-[14px] h-4 min-w-[22px] px-[3px] text-[8px]'
                            : '-right-[10px] h-4 w-4 text-[9px]',
                        )}
                      >
                        {itemCount > 99 ? '99+' : itemCount}
                      </span>
                    )}
                  </div>

                  {/* Pill label — slides in from left on activation */}
                  <span
                    className={cn(
                      'font-semibold text-primary whitespace-nowrap overflow-hidden',
                      'transition-all duration-[280ms] ease-out',
                      isActive
                        ? 'text-[11px] max-w-[52px] opacity-100'
                        : 'text-[0px]  max-w-0      opacity-0',
                    )}
                    aria-hidden="true"
                  >
                    {pillLabel}
                  </span>
                </div>

                {/* Inactive label below icon */}
                <span
                  className={cn(
                    'text-[10px] font-medium leading-none h-3',
                    'transition-opacity duration-[220ms]',
                    isActive
                      ? 'opacity-0'
                      : 'opacity-100 text-[#A08880] mt-[3px]',
                  )}
                  aria-hidden={isActive}
                >
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
