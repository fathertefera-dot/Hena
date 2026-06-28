import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ProductGrid, ProductGridSkeleton } from '@/components/products/ProductCard'
import { Pagination, EmptyState } from '@/components/shared/index'
import { getProducts } from '@/actions/products'
import { getCategories } from '@/actions/categories'
import { PRODUCTS_PER_PAGE } from '@/lib/utils'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Order Cakes',
  description: 'Browse our full collection of handcrafted custom cakes.',
}

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string
    category?: string
    page?: string
  }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const currentPage = Number(params.page ?? 1)
  const search = params.search ?? ''
  const categorySlug = params.category ?? ''

  const [categories, { data: products, meta }] = await Promise.all([
    getCategories(),
    getProducts({
      search: search || undefined,
      category: categorySlug || undefined,
      page: currentPage,
      perPage: PRODUCTS_PER_PAGE,
    }),
  ])

  const activeCategory = categories.find((c) => c.slug === categorySlug)

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-2">
          {activeCategory ? activeCategory.name : 'Our Cakes'}
        </h1>
        <p className="text-muted-foreground text-sm">
          {meta.total > 0
            ? `${meta.total} ${meta.total === 1 ? 'cake' : 'cakes'} available`
            : 'Browse our collection'}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Search & Filters Row - Mobile First */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form
            method="GET"
            className="relative w-full sm:max-w-sm"
            action="/products"
          >
            {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              name="search"
              placeholder="Search cakes by name..."
              defaultValue={search}
              className="pl-10 pr-4"
            />
          </form>

          {(search || categorySlug) && (
            <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
              <Link href="/products" className="flex items-center justify-center gap-2">
                <SlidersHorizontal className="h-3.5 w-3.5" /> Clear Filters
              </Link>
            </Button>
          )}
        </div>

        {/* Category Pills - Horizontally scrollable on mobile */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Link href={search ? `/products?search=${search}` : '/products'}>
              <Badge
                variant={!categorySlug ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer whitespace-nowrap hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1.5 text-xs',
                  !categorySlug ? '' : 'hover:border-primary'
                )}
              >
                All Cakes
              </Badge>
            </Link>
            {categories.map((cat) => {
              const href = search
                ? `/products?category=${cat.slug}&search=${search}`
                : `/products?category=${cat.slug}`
              return (
                <Link key={cat.id} href={href}>
                  <Badge
                    variant={categorySlug === cat.slug ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer whitespace-nowrap hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1.5 text-xs',
                      categorySlug === cat.slug ? '' : 'hover:border-primary'
                    )}
                  >
                    {cat.name}
                  </Badge>
                </Link>
              )
            })}
          </div>
        )}

        {/* Active search indicator */}
        {search && (
          <p className="text-sm text-muted-foreground">
            Search results for <span className="font-semibold text-foreground">&ldquo;{search}&rdquo;</span>
            {' '}— {meta.total} {meta.total === 1 ? 'result' : 'results'}
          </p>
        )}

        {/* Product Grid - Mobile 2 cols, Desktop 4 cols */}
        <Suspense fallback={<ProductGridSkeleton count={PRODUCTS_PER_PAGE} />}>
          {products.length > 0 ? (
            <>
              <ProductGrid products={products} />
              <Pagination
                currentPage={currentPage}
                totalPages={meta.totalPages}
                baseUrl="/products"
                searchParams={{
                  search: search || undefined,
                  category: categorySlug || undefined,
                }}
              />
            </>
          ) : (
            <EmptyState
              title="No cakes found"
              description={
                search
                  ? `We couldn't find any cakes matching "${search}". Try a different search term.`
                  : 'No cakes are available in this category right now. Check back soon!'
              }
              action={
                search || categorySlug
                  ? { label: 'View All Cakes', href: '/products' }
                  : undefined
              }
            />
          )}
        </Suspense>
      </div>
    </div>
  )
}
