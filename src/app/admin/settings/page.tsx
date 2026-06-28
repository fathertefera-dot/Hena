'use client'

import { useTransition, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { settingsSchema, type SettingsFormValues } from '@/lib/validations'
import { updateSettings, getSettings } from '@/actions/settings'
import type { SiteSettings } from '@/types'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loaded, setLoaded] = useState(false)

  if (!loaded) {
    setLoaded(true)
    getSettings().then(setSettings)
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return <SettingsForm initialSettings={settings} />
}

function SettingsForm({ initialSettings }: { initialSettings: SiteSettings }) {
  const [isPending, startTransition] = useTransition()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      business_name: initialSettings.business_name,
      phone: initialSettings.phone,
      support_email: initialSettings.support_email,
      address: initialSettings.address,
      business_hours: initialSettings.business_hours,
      meta_title: initialSettings.meta_title,
      meta_description: initialSettings.meta_description,
      payment_cod: initialSettings.payment_cod,
      payment_telebirr: initialSettings.payment_telebirr,
      payment_bank_transfer: initialSettings.payment_bank_transfer,
    },
  })

  const onSubmit = (data: SettingsFormValues) => {
    startTransition(async () => {
      const result = await updateSettings(data)
      if (result.success) {
        toast.success('Settings Saved!', {
          description: 'Your store configuration has been updated.',
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        })
      } else {
        toast.error('Save Failed', {
          description: result.error || 'Please check your inputs and try again.',
          icon: <XCircle className="h-4 w-4 text-destructive" />,
        })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your store configuration</p>
        </div>
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4 mr-2" /> Save Settings</>}
        </Button>
      </div>

      {/* General Information */}
      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>Basic store details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Business Name *</Label>
              <Input {...register('business_name')} className={errors.business_name ? 'border-destructive' : ''} />
              {errors.business_name && <p className="text-xs text-destructive">{errors.business_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Phone *</Label>
              <Input type="tel" {...register('phone')} className={errors.phone ? 'border-destructive' : ''} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Support Email</Label>
            <Input type="email" {...register('support_email')} />
          </div>
          <div className="space-y-1.5">
            <Label>Business Hours</Label>
            <Input placeholder="e.g. Mon–Sat: 8:00 AM – 8:00 PM" {...register('business_hours')} />
          </div>
          <div className="space-y-1.5">
            <Label>Address</Label>
            <Textarea {...register('address')} className="h-20" />
          </div>
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Settings</CardTitle>
          <CardDescription>Control how your site appears in search engines</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Meta Title</Label>
            <Input placeholder="Iku Sweet Cake – Custom Cakes" {...register('meta_title')} />
            <p className="text-xs text-muted-foreground">Recommended: 50–60 characters</p>
          </div>
          <div className="space-y-1.5">
            <Label>Meta Description</Label>
            <Textarea placeholder="Order beautiful custom cakes online..." {...register('meta_description')} className="h-24" />
            <p className="text-xs text-muted-foreground">Recommended: 150–160 characters</p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Enable or disable payment options for customers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'payment_cod' as const, label: 'Cash on Delivery', desc: 'Customers pay when their order arrives.' },
            { key: 'payment_telebirr' as const, label: 'Telebirr', desc: 'Accept payments via Telebirr mobile money.' },
            { key: 'payment_bank_transfer' as const, label: 'Bank Transfer', desc: 'Accept direct bank transfers.' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border gap-3">
              <div>
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <Switch checked={watch(key)} onCheckedChange={(v) => setValue(key, v)} />
            </div>
          ))}
        </CardContent>
      </Card>
    </form>
  )
}
