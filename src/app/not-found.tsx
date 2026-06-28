import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Cake } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center bg-background">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
        <Cake className="h-10 w-10 text-primary" />
      </div>

      <h1 className="font-display text-6xl font-bold text-primary mb-2">404</h1>
      <h2 className="font-display text-2xl font-semibold text-foreground mb-3">Page Not Found</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Oops! The page you're looking for doesn't exist. It may have been moved or the URL might be incorrect.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button size="lg" asChild>
          <Link href="/">Go Home</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/products">Browse Cakes</Link>
        </Button>
      </div>
    </div>
  )
}
