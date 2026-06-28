import { PackageSearch, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ============================================================
// EMPTY STATE
// ============================================================
interface EmptyStateProps {
  icon?: React.ElementType
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

export function EmptyState({
  icon: Icon = PackageSearch,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-display text-xl font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <>
          {action.href ? (
            <Button asChild>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
        </>
      )}
    </div>
  )
}

// ============================================================
// ERROR STATE
// ============================================================
interface ErrorStateProps {
  title?: string
  description?: string
  action?: { label: string; href?: string; onClick?: () => void }
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="font-display text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {action && (
        <>
          {action.href ? (
            <Button variant="outline" asChild>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button variant="outline" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </>
      )}
    </div>
  )
}

// ============================================================
// LOADING SPINNER
// ============================================================
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

export function LoadingSpinner({ size = 'md', className, label }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-10 w-10',
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
    </div>
  )
}

export function PageLoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" label="Loading..." />
    </div>
  )
}

// ============================================================
// PAGINATION
// ============================================================
interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  searchParams?: Record<string, string | undefined>
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null

  const buildUrl = (page: number) => {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== 'page') params.set(key, value)
    }
    if (page > 1) params.set('page', String(page))
    const qs = params.toString()
    return `${baseUrl}${qs ? `?${qs}` : ''}`
  }

  // Generate page range
  const getPages = () => {
    const delta = 2
    const range: (number | '...')[] = []
    let l: number | undefined

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        if (l !== undefined && i - l > 1) range.push('...')
        range.push(i)
        l = i
      }
    }
    return range
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1 mt-8"
    >
      <Button
        variant="outline"
        size="sm"
        asChild
        className={cn(currentPage <= 1 && 'pointer-events-none opacity-50')}
      >
        <Link href={buildUrl(currentPage - 1)} aria-label="Previous page">
          ←
        </Link>
      </Button>

      {getPages().map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-3 py-1 text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? 'default' : 'outline'}
            size="sm"
            asChild
          >
            <Link
              href={buildUrl(page)}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </Link>
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="sm"
        asChild
        className={cn(currentPage >= totalPages && 'pointer-events-none opacity-50')}
      >
        <Link href={buildUrl(currentPage + 1)} aria-label="Next page">
          →
        </Link>
      </Button>
    </nav>
  )
}
