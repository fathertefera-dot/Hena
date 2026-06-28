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
    <section className="relative h-[340px] sm:h-[420px] overflow-hidden bg-brand-chocolate">
      {banners.map((banner, idx) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {banner.image_url && (
            <Image
              src={banner.image_url}
              alt={banner.title ?? 'Hero'}
              fill
              className="object-cover opacity-60"
              priority={idx === 0}
              sizes="100vw"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-chocolate/90 via-brand-chocolate/50 to-transparent" />
        </div>
      ))}

      <div className="relative z-20 h-full flex flex-col justify-center px-4 container mx-auto">
        <p className="text-primary text-sm font-medium tracking-widest uppercase mb-2">
          {settings.business_name}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-white max-w-lg leading-tight mb-4">
          {banners[current]?.title ?? 'Handcrafted Cakes Delivered to You'}
        </h1>
        <Button size="lg" asChild className="w-fit">
          <Link href="/products" className="flex items-center gap-2">
            Order Now <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {banners.length > 1 && (
        <>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === current ? 'w-6 bg-primary' : 'w-2 bg-white/60 hover:bg-white'
                }`}
              />
            ))}
          </div>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </section>
  )
}
