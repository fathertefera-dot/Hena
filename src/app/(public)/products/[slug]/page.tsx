import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ProductImageGallery } from '@/components/products/ProductImageGallery'
import { AddToCartForm } from '@/components/products/AddToCartForm'
import { ProductCard } from '@/components/products/ProductCard'
import { getProductBySlug, getProducts, getAllProductSlugs } from '@/actions/products'
import { AVAILABILITY_LABELS } from '@/lib/utils'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return { title: 'Product Not Found' }
  }

  return {
    title: product.name,
    description: product.description ?? `Order ${product.name} online.`,
    openGraph: {
      title: product.name,
      description: product.description ?? `Order ${product.name} online.`,
      images: product.images?.[0]?.url ? [{ url: product.images[0].url }] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) notFound()

  // Fetch related products (same category)
  let relatedProducts: typeof product[] = []
  if (product.category_id) {
    const { data } = await getProducts({
      category: product.category?.slug,
      perPage: 4,
    })
    relatedProducts = data.filter((p) => p.id !== product.id).slice(0, 4)
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      {/* Breadcrumb - Wraps on mobile */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <Link href="/products" className="hover:text-primary transition-colors">Cakes</Link>
        {product.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:text-primary transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="text-foreground font-medium truncate max-w-[150px]">{product.name}</span>
      </nav>

      {/* Product Layout - Stacked on mobile, Side-by-side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12">
        {/* Images - Full width on mobile */}
        <div>
          <ProductImageGallery
            images={product.images ?? []}
            productName={product.name}
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            {product.category && (
              <Link
                href={`/products?category=${product.category.slug}`}
                className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
              >
                <Tag className="h-3.5 w-3.5" />
                {product.category.name}
              </Link>
            )}
            {product.is_featured && (
              <Badge className="bg-accent text-accent-foreground border-0">Featured</Badge>
            )}
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground leading-tight">
            {product.name}
          </h1>

          {product.description && (
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          )}

          <Separator />

          {/* Add to Cart Form (Client Component) - Handles mobile layout internally */}
          <AddToCartForm product={product} />
        </div>
      </div>

      {/* Related Products - Mobile 2 cols */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((related) => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
