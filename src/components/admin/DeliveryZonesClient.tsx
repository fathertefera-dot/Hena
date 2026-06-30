'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2, Loader2, MapPin, CheckCircle2, XCircle, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deliveryZoneFormSchema, type DeliveryZoneFormValues } from '@/lib/validations'
import { createDeliveryZone, updateDeliveryZone, deleteDeliveryZone } from '@/actions/delivery-zones'
import type { DeliveryZone } from '@/types'

interface DeliveryZonesClientProps {
  initialZones: DeliveryZone[]
}

export function DeliveryZonesClient({ initialZones }: DeliveryZonesClientProps) {
  const [zones, setZones] = useState(initialZones)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DeliveryZoneFormValues>({
    resolver: zodResolver(deliveryZoneFormSchema),
    defaultValues: { name: '', sort_order: 0, is_active: true },
  })

  const openCreate = () => {
    setEditingZone(null)
    reset({ name: '', sort_order: zones.length, is_active: true })
    setDialogOpen(true)
  }

  const openEdit = (zone: DeliveryZone) => {
    setEditingZone(zone)
    reset({ name: zone.name, sort_order: zone.sort_order, is_active: zone.is_active })
    setDialogOpen(true)
  }

  const onSubmit = (data: DeliveryZoneFormValues) => {
    startTransition(async () => {
      const result = editingZone
        ? await updateDeliveryZone(editingZone.id, data)
        : await createDeliveryZone(data)

      if (result.success) {
        toast.success(editingZone ? 'Zone Updated!' : 'Zone Created!', {
          description: result.message ?? `"${data.name}" has been saved.`,
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        })
        setDialogOpen(false)
        window.location.reload()
      } else {
        toast.error(editingZone ? 'Update Failed' : 'Creation Failed', {
          description: result.error || 'Please try again.',
          icon: <XCircle className="h-4 w-4 text-destructive" />,
        })
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteDeliveryZone(id)
      if (result.success) {
        toast.success('Zone Deleted', {
          description: 'The delivery zone has been removed.',
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        })
        setZones((prev) => prev.filter((z) => z.id !== id))
      } else {
        toast.error('Delete Failed', {
          description: result.error || 'Please try again.',
          icon: <XCircle className="h-4 w-4 text-destructive" />,
        })
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold">Delivery Zones</h1>
          <p className="text-muted-foreground mt-1">
            {zones.length} {zones.length === 1 ? 'zone' : 'zones'} — shown to customers at checkout
          </p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" /> Add Zone
        </Button>
      </div>

      {zones.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No delivery zones yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add the areas you deliver to (e.g. Bole, Piassa, CMC) so customers can pick one at checkout.
          </p>
          <Button onClick={openCreate} className="mt-4">Add First Zone</Button>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {zones.map((zone) => (
              <div key={zone.id} className="flex items-center gap-3 px-4 py-3">
                <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{zone.name}</p>
                  <p className="text-xs text-muted-foreground">Sort: {zone.sort_order}</p>
                </div>
                <span className={`h-2 w-2 rounded-full shrink-0 ${zone.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                <Button variant="outline" size="sm" onClick={() => openEdit(zone)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Delivery Zone</AlertDialogTitle>
                      <AlertDialogDescription>
                        Delete <strong>{zone.name}</strong>? Past orders that used this zone will keep showing its
                        name, but customers won&apos;t be able to select it anymore.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(zone.id)} className="bg-destructive hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-full max-w-md">
          <DialogHeader>
            <DialogTitle>{editingZone ? 'Edit Delivery Zone' : 'New Delivery Zone'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Zone Name *</Label>
              <Input placeholder="e.g. Bole" {...register('name')} className={errors.name ? 'border-destructive' : ''} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Sort Order</Label>
              <Input type="number" min="0" {...register('sort_order')} className="w-24" />
              <p className="text-xs text-muted-foreground">Lower numbers appear first in the checkout list.</p>
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={watch('is_active')} onCheckedChange={(v) => setValue('is_active', v)} />
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editingZone ? 'Save Changes' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
