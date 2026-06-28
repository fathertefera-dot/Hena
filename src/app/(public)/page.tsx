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
// CATEGORIES SECTION (Mobile-First & Compact)
// ============================================================

function CategoriesSection({ categories }: { categories: Category[] }) {
  return (
    <section className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold text-foreground">
          Shop by Category
        </h2>
        <Link
          href="/products"
          className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
        >
          All <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Responsive Grid: Mobile 2 cols, Tablet 3 cols, Desktop 4 cols */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className="group relative rounded-xl overflow-hidden bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all duration-200"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              {cat.image_url ? (
                <Image
                  src={cat.image_url}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <span className="text-4xl">🎂</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            <div className="px-3 py-2.5 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {cat.name}
              </p>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
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
