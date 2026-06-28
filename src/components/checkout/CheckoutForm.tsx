'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, CreditCard, Banknote, Smartphone, Upload, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { createOrder } from '@/actions/orders'
import { checkoutSchema, type CheckoutFormValues } from '@/lib/validations'
import { PAYMENT_METHOD_LABELS, formatPrice } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'
import { cn } from '@/lib/utils'
import type { SiteSettings } from '@/types'
import Image from 'next/image'
import { compressImage } from '@/lib/compressImage' // ✅ ተጨምሯል

const PAYMENT_ICONS = {
  cash_on_delivery: Banknote,
  telebirr: Smartphone,
  bank_transfer: CreditCard,
}

interface CheckoutFormProps {
  settings: SiteSettings
}

export function CheckoutForm({ settings }: CheckoutFormProps) {
  const router = useRouter()
  const { items, totalAmount, clearCart, refresh } = useCart()
  const [isPending, startTransition] = useTransition()
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const enabledPaymentMethods = [
    settings.payment_cod && 'cash_on_delivery',
    settings.payment_telebirr && 'telebirr',
    settings.payment_bank_transfer && 'bank_transfer',
  ].filter(Boolean) as Array<'cash_on_delivery' | 'telebirr' | 'bank_transfer'>

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { payment_method: enabledPaymentMethods[0] },
  })

  const selectedPayment = watch('payment_method')
  const needsScreenshot = selectedPayment === 'telebirr' || selectedPayment === 'bank_transfer'

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // ✅ ምስሉን ከመላኩ በፊት ጨምቀው
      const compressedFile = await compressImage(file, 1.5, 1200)
      setScreenshotFile(compressedFile)
      setScreenshotPreview(URL.createObjectURL(compressedFile))
    }
  }

  const onSubmit = (data: CheckoutFormValues) => {
    if (needsScreenshot && !screenshotFile) {
      toast.error('Missing Payment Screenshot', {
        description: 'Please upload a screenshot of your payment confirmation.',
        icon: <XCircle className="h-4 w-4 text-destructive" />,
      })
      return
    }

    startTransition(async () => {
      const result = await createOrder(data, screenshotFile)
      if (result.success) {
        await clearCart()
        await refresh()
        toast.success('Order Placed Successfully!', {
          description: `Your order #${result.data.order_number} has been received. We will contact you soon.`,
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        })
        router.push(`/order-success?order=${result.data.order_number}`)
      } else {
        toast.error('Order Failed', {
          description: result.error || 'Something went wrong. Please try again.',
          icon: <XCircle className="h-4 w-4 text-destructive" />,
        })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="font-display text-xl font-semibold">Delivery Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Full Name *</Label>
            <Input {...register('full_name')} />
            {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Phone Number *</Label>
            <Input type="tel" {...register('phone')} />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Delivery Address *</Label>
          <Textarea {...register('delivery_address')} className="h-24" />
          {errors.delivery_address && <p className="text-xs text-destructive">{errors.delivery_address.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Order Note</Label>
          <Textarea {...register('order_note')} className="h-20" />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="font-display text-xl font-semibold">Payment Method</h2>
        <div className="space-y-2">
          {enabledPaymentMethods.map((method) => {
            const Icon = PAYMENT_ICONS[method]
            const isSelected = selectedPayment === method
            return (
              <button
                key={method}
                type="button"
                onClick={() => setValue('payment_method', method)}
                className={cn('w-full flex items-center gap-4 rounded-lg border-2 px-4 py-3.5 transition-all text-left', isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/40 hover:bg-muted/30')}
              >
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{PAYMENT_METHOD_LABELS[method]}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {method === 'cash_on_delivery' && 'Pay when your cake is delivered'}
                    {method === 'telebirr' && 'Pay via Telebirr mobile money'}
                    {method === 'bank_transfer' && 'Direct bank transfer'}
                  </p>
                </div>
                <div className="ml-auto">
                  <div className={cn('h-4 w-4 rounded-full border-2 flex items-center justify-center', isSelected ? 'border-primary' : 'border-muted-foreground')}>
                    {isSelected && <div className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        {errors.payment_method && <p className="text-xs text-destructive">{errors.payment_method.message}</p>}
      </div>

      {needsScreenshot && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-display text-xl font-semibold">Payment Confirmation</h2>
          <p className="text-sm text-muted-foreground">Please upload a screenshot of your payment confirmation.</p>
          <div className="space-y-2">
            <Label>Upload Screenshot</Label>
            <div className="relative flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors overflow-hidden" onClick={() => fileInputRef.current?.click()}>
              {screenshotPreview ? <Image src={screenshotPreview} alt="Preview" fill className="object-contain" /> : <div className="flex flex-col items-center gap-1 text-muted-foreground"><Upload className="h-6 w-6" /><span className="text-xs">Click to upload</span></div>}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h2 className="font-display text-xl font-semibold">Order Summary</h2>
        <Separator />
        {items.map((item) => <div key={item.id} className="flex justify-between text-sm"><span className="text-muted-foreground">{item.product.name} ({item.variant.name}) × {item.quantity}</span><span className="font-medium">{formatPrice(item.variant.price * item.quantity)}</span></div>)}
        <Separator />
        <div className="flex justify-between items-center"><span className="font-semibold">Total</span><span className="font-display text-2xl font-bold text-foreground">{formatPrice(totalAmount)}</span></div>
      </div>

      <Button type="submit" size="xl" className="w-full" disabled={isPending || items.length === 0}>
        {isPending ? <><Loader2 className="h-5 w-5 animate-spin" /> Placing Order...</> : `Place Order — ${formatPrice(totalAmount)}`}
      </Button>
      <p className="text-xs text-muted-foreground text-center">By placing your order, you agree to be contacted by our team to confirm delivery details.</p>
    </form>
  )
}
