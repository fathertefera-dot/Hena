import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/products/ProductCard'
import { BannerCarousel } from '@/components/banner/BannerCarousel'
import { getSettings } from '@/actions/settings'
import { getActiveBanners } from '@/actions/banners'
import { getFeaturedProducts } from '@/actions/products'
import { getCategories } from '@/actions/categories'
import type { SiteSettings, Banner, Category, Product } from '@/types'

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  return {
    title: s.meta_title || 'Iku Sweet Cake',
    description: s.meta_description || 'Order beautiful custom cakes online.',
  }
}

export default async function HomePage() {
  const [settings, banners, featuredProducts, categories] = await Promise.all([
    getSettings(),
    getActiveBanners(),
    getFeaturedProducts(8),
    getCategories(),
  ])

  return (
    <div className="min-h-screen bg-background">
      <HeroSection banners={banners} settings={settings} />
      {categories.length > 0 && <CategoriesSection categories={categories} />}
      {featuredProducts.length > 0 && <FeaturedProductsSection products={featuredProducts} />}
    </div>
  )
}

// ============================================================
// HERO SECTION (Using Carousel)
// ============================================================

function HeroSection({ banners, settings }: { banners: Banner[]; settings: SiteSettings }) {
  return <BannerCarousel banners={banners} settings={settings} />
}

// ============================================================
// CATEGORIES SECTION — Premium / Apple × Shopify × Stripe UI
// ============================================================

function CategoriesSection({ categories }: { categories: Category[] }) {
  return (
    <section className="container mx-auto px-4 py-14 md:py-20">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-8 md:mb-10">
        <div className="space-y-1.5">
          <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
            Shop by Category
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Discover handcrafted cakes for every celebration.
          </p>
        </div>

        <Link
          href="/products"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 shrink-0"
        >
          View All
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className="group relative flex flex-col rounded-3xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-border hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_20px_40px_-12px_rgba(0,0,0,0.16)] overflow-hidden"
          >
            {/* Image */}
            <div className="relative aspect-[5/4] overflow-hidden rounded-t-3xl bg-muted">
              {cat.image_url ? (
                <Image
                  src={cat.image_url}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-accent/10 to-primary/15 flex items-center justify-center">
                  <span className="text-4xl">🎂</span>
                </div>
              )}

              {/* Bottom gradient for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0" />

              {/* Soft shine sweep on hover */}
              <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1100ms] ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent" />

              {/* Subtle top glass highlight */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Text */}
            <div className="flex items-center justify-between gap-2 px-4 py-3.5">
              <div className="min-w-0">
                <p className="text-sm md:text-base font-semibold text-foreground truncate">
                  {cat.name}
                </p>
                <span className="text-xs text-muted-foreground inline-flex items-center gap-1 transition-colors duration-200 group-hover:text-primary">
                  Explore Collection
                  <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ============================================================
// FEATURED PRODUCTS SECTION (Compact)
// ============================================================

function FeaturedProductsSection({ products }: { products: Product[] }) {
  return (
    <section className="container mx-auto px-4 pb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold text-foreground">Featured</h2>
        <Link href="/products" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
          See all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
