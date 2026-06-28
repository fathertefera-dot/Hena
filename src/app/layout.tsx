import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans, DM_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import { CartProvider } from '@/contexts/CartContext'
import { getSettings } from '@/actions/settings'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import InstallPrompt from '@/components/InstallPrompt'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()

  return {
    title: {
      default: settings.meta_title || 'Iku Sweet Cake',
      template: `%s | ${settings.business_name || 'Iku Sweet Cake'}`,
    },
    description: settings.meta_description || 'Order beautiful custom cakes online.',
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    manifest: '/manifest.webmanifest',
    other: {
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'apple-mobile-web-app-title': 'IKU SWEET',
    },
    openGraph: {
      type: 'website',
      siteName: settings.business_name || 'Iku Sweet Cake',
      title: settings.meta_title || 'Iku Sweet Cake',
      description: settings.meta_description || 'Order beautiful custom cakes online.',
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable} ${dmMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <ServiceWorkerRegistration />
        <InstallPrompt />
        <CartProvider>
          {children}
        </CartProvider>
        <Toaster
          position="top-right"
          closeButton
          expand={true}
          duration={5000}
          className="font-sans"
          toastOptions={{
            classNames: {
              toast: 'bg-card border border-border shadow-xl rounded-xl',
              title: 'text-foreground font-semibold text-sm',
              description: 'text-muted-foreground text-xs',
              actionButton: 'bg-primary text-primary-foreground hover:bg-primary/90',
              cancelButton: 'bg-muted text-muted-foreground hover:bg-muted/80',
              success: 'border-l-4 border-green-500',
              error: 'border-l-4 border-destructive',
              info: 'border-l-4 border-blue-500',
              warning: 'border-l-4 border-yellow-500',
            },
          }}
        />
      </body>
    </html>
  )
}
