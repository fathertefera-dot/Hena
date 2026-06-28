'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ProductImage } from '@/types'

interface ProductImageGalleryProps {
  images: ProductImage[]
  productName: string
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [zoomed, setZoomed] = useState(false)

  if (images.length === 0) {
    return (
      <div className="aspect-square w-full rounded-xl bg-muted flex items-center justify-center">
        <span className="text-6xl">🎂</span>
      </div>
    )
  }

  const activeImage = images[activeIndex]!

  const prev = () => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1))
  const next = () => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1))

  return (
    <div className="flex flex-col gap-3">
      {/* Main Image */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-secondary group">
        <Image
          src={activeImage.url}
          alt={`${productName} - Image ${activeIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={cn(
            'object-cover transition-transform duration-300',
            zoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in group-hover:scale-105'
          )}
          onClick={() => setZoomed((z) => !z)}
          priority
        />

        {/* Zoom indicator */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm text-foreground text-xs px-2 py-1 rounded-full">
            <ZoomIn className="h-3 w-3" />
            {zoomed ? 'Click to zoom out' : 'Click to zoom'}
          </div>
        </div>

        {/* Navigation arrows (only if multiple images) */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={prev}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={next}
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    i === activeIndex ? 'w-4 bg-primary' : 'w-1.5 bg-white/70 hover:bg-white'
                  )}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {images.map((image, i) => (
            <button
              key={image.id}
              onClick={() => setActiveIndex(i)}
              className={cn(
                'relative shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 transition-all',
                i === activeIndex
                  ? 'border-primary shadow-md'
                  : 'border-border hover:border-primary/50'
              )}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={image.url}
                alt={`${productName} thumbnail ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
