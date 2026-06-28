'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Cake, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { login } from '@/actions/auth'
import { loginSchema, type LoginFormValues } from '@/lib/validations'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') ?? '/'
  const [isPending, startTransition] = useTransition()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginFormValues) => {
    startTransition(async () => {
      const result = await login(data)
      if (result.success) {
        toast.success('Welcome Back!', {
          description: 'You have successfully signed in.',
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        })
        router.push(redirectTo)
        router.refresh()
      } else {
        toast.error('Sign In Failed', {
          description: result.error || 'Invalid email or password. Please try again.',
          icon: <XCircle className="h-4 w-4 text-destructive" />,
        })
      }
    })
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md flex flex-col gap-8 text-center">
        {/* Brand / Header */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
            <Cake className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground text-sm mt-1">Sign in to your account</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm text-left">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email Address</Label>
              <Input type="email" {...register('email')} className={errors.email ? 'border-destructive' : ''} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input type="password" {...register('password')} className={errors.password ? 'border-destructive' : ''} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={isPending}>
              {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : 'Sign In'}
            </Button>
          </form>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-4">
          <Separator />
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Create one
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            You can also{' '}
            <Link href="/products" className="text-primary hover:underline">
              order as a guest
            </Link>{' '}
            without creating an account.
          </p>
        </div>
      </div>
    </div>
  )
}
