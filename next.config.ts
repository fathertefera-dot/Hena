import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      // Must stay >= the 5MB limit enforced in createOrder() (orders.ts)
      // and the "checkout" storage bucket's file_size_limit. It was
      // previously set to 2mb, which silently rejected any payment
      // screenshot between 2MB and 5MB before the app's own size
      // check ever ran — very common with modern phone camera
      // screenshots/photos.
      bodySizeLimit: '6mb',
    },
  },
}

export default nextConfig
