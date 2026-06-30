'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Banner, SiteSettings } from '@/types'

export function BannerCarousel({
  banners,
  settings,
}: {
  banners: Banner[]
  settings: SiteSettings
}) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (banners.length <= 1) return

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length)
    }, 6000)

    return () => clearInterval(timer)
  }, [banners.length])

  if (banners.length === 0) return null

  const goTo = (index: number) => setCurrent(index)
  const prev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length)
  const next = () => setCurrent((prev) => (prev + 1) % banners.length)

  return (
    <section className="relative h-[380px] sm:h-[460px] lg:h-[520px] overflow-hidden bg-brand-chocolate">
      {banners.map((banner, idx) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-all duration-700 ease-out ${
            idx === current
              ? 'opacity-100 translate-y-0 z-10'
              : 'opacity-0 translate-y-1 z-0'
          }`}
        >
          {banner.image_url && (
            <Image
              src={banner.image_url}
              alt={banner.title ?? 'Hero'}
              fill
              priority={idx === 0}
              sizes="100vw"
              className="object-cover opacity-70 scale-[1.02] transition-transform duration-[6000ms] ease-linear"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-brand-chocolate via-brand-chocolate/45 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-chocolate/90 via-brand-chocolate/55 to-transparent" />
          <div className="absolute inset-0 bg-black/10" />
        </div>
      ))}

      <div className="relative z-20 flex h-full items-center">
        <div className="container mx-auto px-5 sm:px-8 lg:px-10">
          <div
            key={current}
            className="max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <p className="mb-3 text-xs sm:text-sm font-semibold tracking-[0.35em] uppercase text-primary/95">
              {settings.business_name}
            </p>

            <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight tracking-tight text-white drop-shadow-sm">
              {banners[current]?.title ?? 'Handcrafted Cakes Delivered to You'}
            </h1>

            <div className="mt-8">
              <Button
                size="lg"
                asChild
                className="group w-fit rounded-xl px-7 py-6 text-base font-semibold shadow-xl transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl"
              >
                <Link
                  href="/products"
                  className="flex items-center gap-2"
                >
                  Order Now
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === current
                    ? 'w-8 bg-primary'
                    : 'w-2.5 bg-white/50 hover:w-4 hover:bg-white/80'
                }`}
              />
            ))}
          </div>

          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/20 p-3 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-black/40"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/20 p-3 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-black/40"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </section>
  )
}
