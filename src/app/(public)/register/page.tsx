'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link' // ✅ ይህ መስመር ተጨምሯል
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Cake, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { register as registerAction } from '@/actions/auth'
import { registerSchema, type RegisterFormValues } from '@/lib/validations'

export default function RegisterPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = (data: RegisterFormValues) => {
    startTransition(async () => {
      const result = await registerAction(data)
      if (result.success) {
        toast.success('Account Created!', {
          description: result.message || 'Welcome to Iku Sweet Cake! Please check your email to confirm.',
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        })
        router.push('/login')
      } else {
        toast.error('Registration Failed', {
          description: result.error || 'Please try again with a different email.',
          icon: <XCircle className="h-4 w-4 text-destructive" />,
        })
      }
    })
  }

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center px-4 py-12 max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
            <Cake className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
        <h1 className="font-display text-3xl font-semibold">Create Account</h1>
        <p className="text-muted-foreground text-sm">Join Iku Sweet Cake</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input {...register('full_name')} className={errors.full_name ? 'border-destructive' : ''} />
            {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Email Address</Label>
            <Input type="email" {...register('email')} className={errors.email ? 'border-destructive' : ''} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input type="password" placeholder="Min 8 characters" {...register('password')} className={errors.password ? 'border-destructive' : ''} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Confirm Password</Label>
            <Input type="password" placeholder="Repeat your password" {...register('confirm_password')} className={errors.confirm_password ? 'border-destructive' : ''} />
            {errors.confirm_password && <p className="text-xs text-destructive">{errors.confirm_password.message}</p>}
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={isPending}>
            {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</> : 'Create Account'}
          </Button>
        </form>
        <Separator className="my-5" />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
