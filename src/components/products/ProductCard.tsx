import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Eye } from 'lucide-react'
import { formatPrice, AVAILABILITY_LABELS } from '@/lib/utils'
import type { Product } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images?.[0]

  const lowestPrice = product.variants?.reduce(
    (min, v) => (v.price < min ? v.price : min),
    product.variants[0]?.price ?? 0
  ) ?? 0

  const hasMultiplePrices =
    product.variants &&
    product.variants.length > 1 &&
    product.variants.some(
      (v) => v.price !== product.variants![0]!.price
    )

  return (
    <article
      className="
      group relative flex flex-row md:flex-col
      w-full
      rounded-xl border border-border/60
      bg-card
      transition-all duration-500
      hover:-translate-y-1
      hover:border-primary/30
      hover:shadow-lg hover:shadow-primary/10
    "
    >
      {/* IMAGE - Mobile: w-20 h-20 (ትንሽ ትልቅ) */}
      <Link
        href={`/products/${product.slug}`}
        className="
        relative block shrink-0
        w-20 h-20 md:w-full md:aspect-square
        overflow-hidden bg-secondary
        rounded-lg md:rounded-t-xl md:rounded-b-none
        "
        tabIndex={-1}
      >
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={product.name}
            fill
            sizes="(max-width:640px) 80px, (max-width:1024px) 33vw, 25vw"
            className="
              object-cover
              transition-transform duration-700
              group-hover:scale-105
            "
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <span className="text-2xl md:text-5xl">🎂</span>
          </div>
        )}

        {/* Quick View - Desktop only */}
        <div
          className="
          absolute inset-0
          flex items-center justify-center
          opacity-0
          transition-all duration-500
          group-hover:opacity-100
          hidden md:flex
        "
        >
          <span
            className="
            flex items-center gap-2
            rounded-full
            bg-background/90
            px-3 py-1.5
            text-[10px] font-medium
            backdrop-blur-sm
            shadow-lg
          "
          >
            <Eye className="h-3 w-3" />
            Quick View
          </span>
        </div>
      </Link>

      {/* CONTENT - flex-1 ን አስወግደናል, በምትኩ items-center ተጨምሯል */}
      <div className="flex flex-col justify-center min-w-0 p-2 md:p-4">
        {/* Category - small */}
        {product.category && (
          <span
            className="
            mb-0.5 md:mb-2 inline-flex w-fit
            rounded-full bg-primary/10
            px-1.5 py-0.5 md:px-2.5 md:py-1
            text-[9px] md:text-[11px] font-medium text-primary
          "
          >
            {product.category.name}
          </span>
        )}

        {/* Name - small */}
        <Link href={`/products/${product.slug}`}>
          <h3
            className="
            line-clamp-1 md:line-clamp-2
            text-xs md:text-lg font-semibold
            leading-snug transition-colors hover:text-primary
          "
          >
            {product.name}
          </h3>
        </Link>

        {/* Availability - tiny */}
        <div className="mt-0.5 md:mt-2 flex items-center gap-1.5">
          <span
            className={`h-1 w-1 md:h-1.5 md:w-1.5 rounded-full animate-pulse ${
              product.availability === 'available'
                ? 'bg-green-500'
                : 'bg-amber-500'
            }`}
          />
          <span className="text-[9px] md:text-xs text-muted-foreground">
            {AVAILABILITY_LABELS[product.availability]}
          </span>
        </div>

        {/* PRICE + BUTTON - compact */}
        <div className="mt-1 md:mt-3 flex flex-col md:flex-row items-start md:items-end justify-between w-full gap-1 md:gap-3">
          <div className="text-left w-full md:w-auto">
            {lowestPrice > 0 ? (
              <>
                {hasMultiplePrices && (
                  <p className="text-[8px] md:text-[10px] text-muted-foreground leading-tight">
                    Starting from
                  </p>
                )}
                <p className="text-sm md:text-2xl font-bold tracking-tight">
                  {formatPrice(lowestPrice)}
                </p>
              </>
            ) : (
              <p className="text-[10px] md:text-sm text-muted-foreground">
                Contact for price
              </p>
            )}
          </div>

          <Button
            asChild
            className="
            w-fit md:w-full
            h-7 md:h-10
            rounded-lg md:rounded-xl
            shadow-sm transition-all hover:scale-105 hover:shadow-lg
            text-[10px] md:text-base
            px-3 md:px-4
          "
          >
            <Link href={`/products/${product.slug}`}>
              <ShoppingCart className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
              Order
            </Link>
          </Button>
        </div>
      </div>
    </article>
  )
}

// ============================================================
// PRODUCT GRID & SKELETON
// ============================================================

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-row md:flex-col w-full rounded-xl border border-border/60 bg-card overflow-hidden p-2 md:p-4 gap-2">
      <Skeleton className="w-20 h-20 md:w-full md:aspect-square rounded-lg md:rounded-t-xl md:rounded-b-none shrink-0" />
      <div className="flex flex-col justify-center min-w-0 gap-0.5 md:gap-2">
        <Skeleton className="h-2 md:h-3 w-10 md:w-16" />
        <Skeleton className="h-3 md:h-5 w-full" />
        <Skeleton className="h-2 md:h-3 w-12 md:w-24" />
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mt-1 md:mt-3 gap-1 md:gap-2 w-full">
          <Skeleton className="h-4 md:h-6 w-14 md:w-20" />
          <Skeleton className="h-7 md:h-10 w-14 md:w-full rounded-lg md:rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
