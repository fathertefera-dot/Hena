import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Package, Phone, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Order Placed Successfully',
}

interface OrderSuccessPageProps {
  searchParams: Promise<{ order?: string }>
}

export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const { order } = await searchParams

  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
      <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
        </div>

        {/* Heading */}
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground mb-2">
            Order Placed! 🎉
          </h1>
          <p className="text-muted-foreground">
            Thank you for your order. We'll contact you shortly to confirm the details.
          </p>
        </div>

        {/* Order Number */}
        {order && (
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Your Order Number
            </p>
            <p className="font-mono text-2xl font-bold text-primary">{order}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Save this to track your order
            </p>
          </div>
        )}

        <Separator />

        {/* Next Steps */}
        <div className="text-left space-y-3">
          <p className="font-semibold text-sm text-foreground">What happens next?</p>
          {[
            { icon: Phone, text: 'Our team will call/message to confirm your order and delivery time.' },
            { icon: Package, text: 'Your cake will be freshly prepared as per your order.' },
            { icon: CheckCircle2, text: 'We deliver to your specified address.' },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {order && (
            <Button size="lg" asChild className="w-full">
              <Link href={`/track-order?order=${order}`} className="flex items-center gap-2">
                Track My Order
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
          <Button variant="outline" size="lg" asChild className="w-full">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
