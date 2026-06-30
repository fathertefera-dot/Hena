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
          className={`absolute inset-0 transition-all duration-1000 ease-out ${
            idx === current 
              ? 'opacity-100 z-10 translate-x-0' 
              : 'opacity-0 z-0 translate-x-4 pointer-events-none'
          }`}
        >
          {banner.image_url && (
            <Image
              src={banner.image_url}
              alt={banner.title ?? 'Hero banner'}
              fill
              className={`object-cover opacity-70 transition-transform duration-[8000ms] ease-out ${
                idx === current ? 'scale-[1.02]' : 'scale-100'
              }`}
              priority={idx === 0}
              sizes="100vw"
            />
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-brand-chocolate/95 via-brand-chocolate/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-chocolate/80 via-brand-chocolate/10 to-transparent" />
        </div>
      ))}

      <div className="relative z-20 h-full flex flex-col justify-center px-6 sm:px-12 container mx-auto">
        <div className="max-w-2xl transform transition-all duration-700 delay-100 translate-y-0">
          <p className="text-primary text-sm md:text-base font-semibold tracking-[0.2em] uppercase mb-4 drop-shadow-sm">
            {settings.business_name}
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-8 drop-shadow-md">
            {banners[current]?.title ?? 'Handcrafted Cakes Delivered to You'}
          </h1>
          <Button 
            size="lg" 
            asChild 
            className="w-fit rounded-xl px-8 py-6 text-base shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group"
          >
            <Link href="/products" className="flex items-center gap-2">
              Order Now 
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                  idx === current 
                    ? 'w-8 bg-primary shadow-[0_0_8px_rgba(255,255,255,0.5)]' 
                    : 'w-2 bg-white/40 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/20 backdrop-blur-md hover:bg-black/40 text-white shadow-sm hover:shadow-md transition-all duration-300 border border-white/10"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/20 backdrop-blur-md hover:bg-black/40 text-white shadow-sm hover:shadow-md transition-all duration-300 border border-white/10"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
    </section>
  )
}
