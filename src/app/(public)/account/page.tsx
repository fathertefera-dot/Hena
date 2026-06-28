import Link from 'next/link'
import {
  User, Package, MapPin, LogOut, ChevronRight, LogIn, UserPlus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { getCurrentUser } from '@/actions/auth'
import { logout } from '@/actions/auth'

export default async function AccountPage() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-semibold mb-1">My Account</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to view your orders and manage your account
          </p>
        </div>

        <div className="space-y-3">
          <Button size="lg" className="w-full" asChild>
            <Link href="/login" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" /> Sign In
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="w-full" asChild>
            <Link href="/register" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" /> Create Account
            </Link>
          </Button>
        </div>

        <Separator className="my-6" />

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Link
            href="/track-order"
            className="flex items-center justify-between px-4 py-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Track My Order</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-sm">
      <div className="flex items-center gap-4 mb-6 p-4 rounded-xl border border-border bg-card">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground truncate">{user.full_name || 'My Account'}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
        <Link
          href="/track-order"
          className="flex items-center justify-between px-4 py-4 hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Track My Order</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>

        <Link
          href="/products"
          className="flex items-center justify-between px-4 py-4 hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Browse Products</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>

      <form action={logout} className="mt-4">
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/5 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </form>
    </div>
  )
}
