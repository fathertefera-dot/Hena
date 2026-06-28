import Link from 'next/link'
import { Cake, MapPin, Clock, Mail, Phone } from 'lucide-react'
import type { SiteSettings } from '@/types'

interface FooterProps {
  settings: SiteSettings
}

export function Footer({ settings }: FooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background">
      {/* Reduced padding for mobile, still clears BottomNav */}
      <div className="container mx-auto px-4 py-4 md:py-6 pb-20 sm:pb-4">
        <div className="flex flex-col gap-3">
          {/* Brand Section - Smaller icon & text */}
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
              <Cake className="h-2.5 w-2.5 text-primary-foreground" />
            </div>
            <span className="font-display text-xs font-bold">{settings.business_name}</span>
          </div>

          {/* Contact Info Card - Tighter padding & gaps */}
          <div className="rounded-lg border border-border bg-card/50 px-3 py-2 flex flex-col gap-1 text-[10px] text-muted-foreground">
            {/* Row 1: Phone & Email */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              {settings.phone && (
                <a href={`tel:${settings.phone}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Phone className="h-3 w-3 shrink-0" />
                  {settings.phone}
                </a>
              )}
              {settings.support_email && (
                <a href={`mailto:${settings.support_email}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Mail className="h-3 w-3 shrink-0" />
                  {settings.support_email}
                </a>
              )}
            </div>
            {/* Row 2: Address & Hours */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              {settings.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {settings.address}
                </span>
              )}
              {settings.business_hours && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 shrink-0" />
                  {settings.business_hours}
                </span>
              )}
            </div>
          </div>

          {/* Copyright & Designed by Hena - Tighter spacing */}
          <div className="mt-1 pt-2 border-t border-border flex flex-wrap items-center justify-between gap-1 text-[9px] text-muted-foreground">
            <span>© {year} {settings.business_name}</span>
            <span className="text-primary/80 font-medium">Designed by Hena💫</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
