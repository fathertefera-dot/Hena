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
// CATEGORIES SECTION (Redesigned - Premium UI)
// ============================================================

function CategoriesSection({ categories }: { categories: Category[] }) {
  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
            Shop by Category
          </h2>
          <p className="mt-3 text-base md:text-lg text-muted-foreground font-medium">
            Discover handcrafted cakes for every celebration.
          </p>
        </div>
        
        <Link
          href="/products"
          className="group inline-flex w-fit items-center justify-center gap-2 rounded-full bg-secondary/70 px-6 py-2.5 text-sm font-semibold text-secondary-foreground backdrop-blur-md border border-border/50 shadow-sm transition-all duration-300 ease-out hover:bg-secondary hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          View All
          <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Categories Grid (Mobile: 2, Tablet: 3, Desktop: 4) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-3xl bg-card/60 backdrop-blur-xl border border-border/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-foreground/20 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)]"
          >
            {/* Image Container */}
            <div className="relative aspect-[5/4] w-full overflow-hidden bg-muted/30">
              {cat.image_url ? (
                <Image
                  src={cat.image_url}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                  <span className="text-5xl drop-shadow-sm">🎂</span>
                </div>
              )}

              {/* Bottom Gradient Overlay for depth and premium feel */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Soft Shine Effect Animation */}
              <div className="pointer-events-none absolute inset-0 -translate-x-[150%] skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-[1.5s] ease-in-out group-hover:translate-x-[150%] z-10" />
            </div>

            {/* Text Content Block */}
            <div className="flex grow flex-col justify-between p-5 sm:p-6 bg-gradient-to-b from-transparent to-background/50">
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary line-clamp-1">
                {cat.name}
              </h3>
              
              <div className="mt-3 flex items-center text-sm font-medium text-muted-foreground/80 transition-colors group-hover:text-foreground">
                <span>Explore Collection</span>
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
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
