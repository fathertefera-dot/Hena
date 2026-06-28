import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, Clock, Package, Truck, XCircle } from 'lucide-react'
import { ORDER_STATUS_LABELS, formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types'

// ============================================================
// ORDER STATUS BADGE
// ============================================================

interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

const STATUS_CONFIG: Record<OrderStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'; icon: React.ElementType }> = {
  pending: { variant: 'warning', icon: Clock },
  confirmed: { variant: 'info', icon: CheckCircle2 },
  preparing: { variant: 'default', icon: Package },
  delivered: { variant: 'success', icon: Truck },
  cancelled: { variant: 'destructive', icon: XCircle },
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={cn('gap-1.5', className)}>
      <Icon className="h-3 w-3" />
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  )
}

// ============================================================
// ORDER TIMELINE
// ============================================================

const TIMELINE_STEPS: Array<{ status: OrderStatus; label: string; icon: React.ElementType; description: string }> = [
  { status: 'pending', label: 'Order Placed', icon: Circle, description: 'We received your order' },
  { status: 'confirmed', label: 'Confirmed', icon: CheckCircle2, description: 'Your order is confirmed' },
  { status: 'preparing', label: 'Preparing', icon: Package, description: 'Your cake is being made' },
  { status: 'delivered', label: 'Delivered', icon: Truck, description: 'Your order was delivered' },
]

const STATUS_ORDER: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'delivered']

interface OrderTimelineProps {
  status: OrderStatus
  createdAt: string
  updatedAt: string
}

export function OrderTimeline({ status, createdAt, updatedAt }: OrderTimelineProps) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <p className="font-semibold text-destructive">Order Cancelled</p>
          <p className="text-xs text-muted-foreground">{formatDateTime(updatedAt)}</p>
        </div>
      </div>
    )
  }

  const currentStepIndex = STATUS_ORDER.indexOf(status)

  return (
    <div className="relative">
      {TIMELINE_STEPS.map((step, index) => {
        const isCompleted = index < currentStepIndex
        const isCurrent = index === currentStepIndex
        const isPending = index > currentStepIndex
        const Icon = isCurrent ? step.icon : isCompleted ? CheckCircle2 : step.icon

        return (
          <div key={step.status} className="flex items-start gap-4 pb-6 last:pb-0">
            {/* Line */}
            {index < TIMELINE_STEPS.length - 1 && (
              <div
                className={cn(
                  'absolute left-4 top-10 w-0.5 h-12',
                  isCompleted ? 'bg-primary' : 'bg-border'
                )}
                style={{ top: `${index * 64 + 40}px` }}
              />
            )}

            {/* Icon */}
            <div
              className={cn(
                'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2',
                isCompleted
                  ? 'border-primary bg-primary text-primary-foreground'
                  : isCurrent
                  ? 'border-primary bg-background text-primary'
                  : 'border-border bg-background text-muted-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
              <p
                className={cn(
                  'text-sm font-semibold',
                  isPending ? 'text-muted-foreground' : 'text-foreground'
                )}
              >
                {step.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
              {isCurrent && (
                <p className="text-xs text-primary mt-1 font-medium">
                  {index === 0 ? formatDateTime(createdAt) : formatDateTime(updatedAt)}
                </p>
              )}
              {isCompleted && index === 0 && (
                <p className="text-xs text-muted-foreground mt-1">{formatDateTime(createdAt)}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
