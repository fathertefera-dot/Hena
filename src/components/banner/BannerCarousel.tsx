'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Banner, SiteSettings } from '@/types'

export function BannerCarousel({ banners, settings }: { banners: Banner[]; settings: SiteSettings }) {
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
            idx === current ? 'opacity-100 z-10 translate-y-0' : 'opacity-0 z-0 translate-y-4'
          }`}
        >
          {banner.image_url && (
            <Image
              src={banner.image_url}
              alt={banner.title ?? 'Hero'}
              fill
              className="object-cover opacity-70 scale-[1.02]"
              priority={idx === 0}
              sizes="100vw"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
      ))}

      <div className="relative z-20 h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8 container mx-auto">
        <p className="text-primary text-sm font-medium tracking-widest uppercase mb-3">
          {settings.business_name}
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-white max-w-2xl leading-tight mb-6">
          {banners[current]?.title ?? 'Handcrafted Cakes Delivered to You'}
        </h1>
        <Button size="lg" asChild className="w-fit rounded-xl h-14 px-8 text-base font-semibold shadow-lg hover:scale-105 transition-transform duration-300">
          <Link href="/products" className="flex items-center gap-2">
            Order Now <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      {banners.length > 1 && (
        <>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
                  idx === current ? 'w-8 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/20 backdrop-blur-md hover:bg-black/40 text-white transition-all duration-300 shadow-lg"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/20 backdrop-blur-md hover:bg-black/40 text-white transition-all duration-300 shadow-lg"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </section>
  )
}
