import { Cake, MapPin, Clock, Mail, Phone } from 'lucide-react'
import type { SiteSettings } from '@/types'
import type { ElementType } from 'react'

interface FooterProps {
  settings: SiteSettings
}

interface ContactItem {
  icon: ElementType
  label: string
  value: string | null | undefined
  href?: string
}

function ContactCard({ icon: Icon, label, value, href }: ContactItem) {
  const inner = (
    <>
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/10">
        <Icon className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
      </span>
      <span className="min-w-0">
        <span className="mb-0.5 block text-[9px] font-semibold uppercase tracking-[0.10em] text-muted-foreground/50">
          {label}
        </span>
        <span className="block break-words text-xs font-medium leading-snug text-foreground/80">
          {value}
        </span>
      </span>
    </>
  )

  const cls =
    'flex items-center gap-2.5 rounded-xl border border-border/50 bg-gradient-to-br from-card to-background/60 p-2.5 ' +
    'shadow-[0_1px_3px_rgba(196,123,110,0.06),0_3px_10px_-3px_rgba(196,123,110,0.10)] ' +
    'transition-all duration-300 ease-out ' +
    'hover:-translate-y-0.5 hover:border-primary/20 ' +
    'hover:shadow-[0_4px_16px_-3px_rgba(196,123,110,0.16)]'

  if (href) return <a href={href} className={cls}>{inner}</a>
  return <div className={cls}>{inner}</div>
}

export function Footer({ settings }: FooterProps) {
  const year = new Date().getFullYear()

  const contacts: ContactItem[] = [
    {
      icon: Phone,
      label: 'Phone',
      value: settings.phone,
      href: settings.phone ? `tel:${settings.phone}` : undefined,
    },
    {
      icon: Mail,
      label: 'Email',
      value: settings.support_email,
      href: settings.support_email ? `mailto:${settings.support_email}` : undefined,
    },
    {
      icon: MapPin,
      label: 'Address',
      value: settings.address,
    },
    {
      icon: Clock,
      label: 'Hours',
      value: settings.business_hours,
    },
  ]

  return (
    <footer className="relative border-t border-border/40 bg-gradient-to-b from-background to-muted/60">
      {/* Top shimmer accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

      <div className="container mx-auto px-4 py-5 pb-20 sm:pb-6">

        {/* ── Main grid: brand | cards ───────────────────────── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr] lg:gap-10 lg:items-center">

          {/* Brand — horizontal layout saves vertical space */}
          <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-3">

            {/* Badge */}
            <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 ring-1 ring-primary/15 shadow-[0_6px_18px_-4px_rgba(196,123,110,0.24),0_2px_6px_-2px_rgba(196,123,110,0.12)]">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-xl bg-gradient-to-b from-white/40 to-transparent" />
              <Cake className="relative z-10 h-5 w-5 text-primary" strokeWidth={1.6} />
            </div>

            {/* Name + tagline */}
            <div>
              <h2 className="font-display text-base font-semibold tracking-tight text-foreground leading-tight">
                {settings.business_name}
              </h2>
              <p className="mt-0.5 text-[10px] tracking-wide text-muted-foreground/65">
                Freshly baked with love
              </p>
            </div>
          </div>

          {/* Contact cards — 2×2 */}
          <div className="grid grid-cols-2 gap-2">
            {contacts.map((item) =>
              item.value ? <ContactCard key={item.label} {...item} /> : null
            )}
          </div>
        </div>

        {/* ── Bottom bar ─────────────────────────────────────── */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3">
          <p className="text-[10px] text-muted-foreground/60">
            © {year}{' '}
            <span className="font-medium text-foreground/50">{settings.business_name}</span>
          </p>

          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary/10 via-accent/15 to-primary/10 px-2.5 py-1 text-[9px] font-semibold tracking-wide text-primary/75 ring-1 ring-primary/10">
            ✨ Designed by Hena 💫
          </span>
        </div>
      </div>
    </footer>
  )
        }
