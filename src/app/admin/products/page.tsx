// src/app/admin/products/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Search, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Pagination, EmptyState } from '@/components/shared/index'
import { getAdminProducts } from '@/actions/products'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'Products' }

interface ProductsPageProps {
  searchParams: Promise<{ search?: string; page?: string }>
}

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-800',
  draft: 'bg-yellow-100 text-yellow-800',
  archived: 'bg-gray-100 text-gray-600',
}

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const page = Number(params.page ?? 1)
  const search = params.search ?? ''

  const { data: products, meta } = await getAdminProducts({ search: search || undefined, page })

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold">Products</h1>
          <p className="text-muted-foreground mt-1">{meta.total} products</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/products/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form method="GET" action="/admin/products" className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input name="search" placeholder="Search products..." defaultValue={search} className="pl-10" />
        </form>
        {search && (
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/products" className="flex items-center gap-2">
              Clear Search
            </Link>
          </Button>
        )}
      </div>

      {/* Product List */}
      {products.length === 0 ? (
        <EmptyState
          title="No products found"
          description={search ? `No products matching "${search}"` : 'Add your first product to get started.'}
          action={{ label: 'Add Product', href: '/admin/products/new' }}
        />
      ) : (
        <Card>
          {/* Desktop Table (hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Product</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Price from</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const image = product.images?.[0]
                  const minPrice = product.variants?.reduce(
                    (min, v) => (v.price < min ? v.price : min),
                    product.variants[0]?.price ?? 0
                  )

                  return (
                    <tr key={product.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                            {image ? (
                              <Image src={image.url} alt={product.name} fill sizes="40px" className="object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-lg">🎂</div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground line-clamp-1">{product.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {product.category?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {minPrice !== undefined ? formatPrice(minPrice) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[product.status]}`}>
                          {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/products/${product.id}`}>
                            <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (visible on smaller screens) */}
          <div className="md:hidden divide-y divide-border">
            {products.map((product) => {
              const image = product.images?.[0]
              const minPrice = product.variants?.reduce(
                (min, v) => (v.price < min ? v.price : min),
                product.variants[0]?.price ?? 0
              )

              return (
                <div key={product.id} className="p-4 flex items-start justify-between gap-3">
                  {/* Left side: Image & Name */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0">
                      {image ? (
                        <Image src={image.url} alt={product.name} fill sizes="48px" className="object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-lg">🎂</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{product.category?.name ?? '—'}</p>
                      <p className="text-xs font-semibold mt-0.5">{minPrice !== undefined ? formatPrice(minPrice) : '—'}</p>
                    </div>
                  </div>

                  {/* Right side: Status & Edit button */}
                  <div className="flex flex-col items-end shrink-0 gap-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[product.status]}`}>
                      {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                    </span>
                    <Button variant="ghost" size="sm" asChild className="h-7 px-2">
                      <Link href={`/admin/products/${product.id}`} className="flex items-center gap-1">
                        <Pencil className="h-3 w-3" /> Edit
                      </Link>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      <Pagination
        currentPage={page}
        totalPages={meta.totalPages}
        baseUrl="/admin/products"
        searchParams={{ search: search || undefined }}
      />
    </div>
  )
}
