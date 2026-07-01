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
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/10 shadow-[0_2px_8px_-2px_rgba(196,123,110,0.18)]">
        <Icon className="h-[17px] w-[17px] text-primary" strokeWidth={1.75} />
      </span>
      <span className="min-w-0">
        <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/55">
          {label}
        </span>
        <span className="block break-words text-sm font-medium leading-snug text-foreground/85">
          {value}
        </span>
      </span>
    </>
  )

  const cls =
    'flex items-start gap-3.5 rounded-2xl border border-border/50 bg-gradient-to-br from-card to-background/60 p-4 ' +
    'shadow-[0_1px_3px_rgba(196,123,110,0.06),0_4px_16px_-4px_rgba(196,123,110,0.10)] ' +
    'transition-all duration-300 ease-out ' +
    'hover:-translate-y-0.5 hover:border-primary/20 ' +
    'hover:shadow-[0_6px_24px_-4px_rgba(196,123,110,0.18),0_2px_8px_-2px_rgba(196,123,110,0.10)]'

  if (href) {
    return (
      <a href={href} className={cls}>
        {inner}
      </a>
    )
  }
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
      {/* Top shimmer accent line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

      <div className="container mx-auto px-4 py-10 pb-20 sm:pb-10 md:py-14">
        {/* ── Main grid: brand | contact ─────────────────────── */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[260px_1fr] lg:gap-16">

          {/* Brand section */}
          <div className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-left">

            {/* Logo badge — 3D layered effect */}
            <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 ring-1 ring-primary/15 shadow-[0_8px_24px_-4px_rgba(196,123,110,0.26),0_2px_8px_-2px_rgba(196,123,110,0.14)]">
              {/* Inner top highlight — creates physical lift */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-2xl bg-gradient-to-b from-white/40 to-transparent" />
              <Cake className="relative z-10 h-7 w-7 text-primary" strokeWidth={1.6} />
            </div>

            {/* Name + tagline */}
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                {settings.business_name}
              </h2>
              <p className="mt-1.5 text-xs tracking-wide text-muted-foreground/70">
                Freshly baked with love
              </p>
            </div>
          </div>

          {/* Contact cards — 2×2 grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {contacts.map((item) =>
              item.value ? <ContactCard key={item.label} {...item} /> : null
            )}
          </div>
        </div>

        {/* ── Bottom bar ─────────────────────────────────────── */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-5">
          <p className="text-xs text-muted-foreground/65">
            © {year}{' '}
            <span className="font-medium text-foreground/55">{settings.business_name}</span>
          </p>

          {/* Signature badge */}
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary/10 via-accent/15 to-primary/10 px-3 py-1.5 text-[10px] font-semibold tracking-wide text-primary/80 ring-1 ring-primary/10 shadow-[0_1px_4px_rgba(196,123,110,0.12)]">
            ✨ Designed by Hena 💫
          </span>
        </div>
      </div>
    </footer>
  )
}
