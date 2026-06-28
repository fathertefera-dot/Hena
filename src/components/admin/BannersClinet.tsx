'use client'

import { useState, useTransition, useRef } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2, Loader2, ImageIcon, GripVertical, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { bannerFormSchema, type BannerFormValues } from '@/lib/validations'
import { createBanner, updateBanner, deleteBanner, getAllBanners } from '@/actions/banners'
import { compressImage } from '@/lib/compressImage' // ✅ ተጨምሯል
import type { Banner } from '@/types'

interface BannersClientProps {
  initialBanners: Banner[]
  onRefresh?: () => void
}

export function BannersClient({ initialBanners, onRefresh }: BannersClientProps) {
  const [banners, setBanners] = useState(initialBanners)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<BannerFormValues>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: { title: '', link: '', sort_order: 0, is_active: true },
  })

  const openCreate = () => {
    setEditingBanner(null)
    setSelectedFile(null)
    setPreviewUrl(null)
    reset({ title: '', link: '', sort_order: banners.length, is_active: true })
    setDialogOpen(true)
  }

  const openEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setSelectedFile(null)
    setPreviewUrl(banner.image_url)
    reset({ title: banner.title ?? '', link: banner.link ?? '', sort_order: banner.sort_order, is_active: banner.is_active })
    setDialogOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const onSubmit = (data: BannerFormValues) => {
    if (!editingBanner && !selectedFile) {
      toast.error('Missing Banner Image', {
        description: 'Please upload a banner image.',
        icon: <XCircle className="h-4 w-4 text-destructive" />,
      })
      return
    }

    startTransition(async () => {
      // ✅ ስክሪንሾቱ ካለ ይጨምቁ
      let fileToUpload = selectedFile
      if (fileToUpload) {
        fileToUpload = await compressImage(fileToUpload, 1.5, 1200)
      }

      const result = editingBanner
        ? await updateBanner(editingBanner.id, data, fileToUpload)
        : await createBanner(data, fileToUpload)

      if (result.success) {
        toast.success(editingBanner ? 'Banner Updated!' : 'Banner Created!', {
          description: result.message ?? 'Banner has been saved.',
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        })
        setDialogOpen(false)
        if (onRefresh) onRefresh()
        else window.location.reload()
      } else {
        toast.error(editingBanner ? 'Update Failed' : 'Creation Failed', {
          description: result.error || 'Please try again.',
          icon: <XCircle className="h-4 w-4 text-destructive" />,
        })
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteBanner(id)
      if (result.success) {
        toast.success('Banner Deleted', {
          description: 'The banner has been removed.',
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        })
        setBanners((prev) => prev.filter((b) => b.id !== id))
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
          <h1 className="font-display text-2xl md:text-3xl font-semibold">Banners</h1>
          <p className="text-muted-foreground mt-1">Manage homepage banners</p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" /> Add Banner
        </Button>
      </div>

      {banners.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No banners yet.</p>
          <Button onClick={openCreate} className="mt-4">Add First Banner</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner) => (
            <Card key={banner.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row gap-4 p-4">
                <GripVertical className="h-5 w-5 text-muted-foreground mt-1 shrink-0 hidden sm:block" />
                <div className="relative h-24 w-full sm:w-40 rounded-lg overflow-hidden bg-muted shrink-0">
                  {banner.image_url ? (
                    <Image src={banner.image_url} alt={banner.title ?? 'Banner'} fill sizes="160px" className="object-cover" />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">{banner.title || '(No title)'}</p>
                      {banner.link && <p className="text-xs text-muted-foreground mt-0.5 truncate">{banner.link}</p>}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant={banner.is_active ? 'default' : 'outline'} className="text-xs">
                          {banner.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">Sort: {banner.sort_order}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => openEdit(banner)}>
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
                            <AlertDialogTitle>Delete Banner</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to delete this banner?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(banner.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-full max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingBanner ? 'Edit Banner' : 'New Banner'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Image upload */}
            <div>
              <Label>Banner Image {!editingBanner && '*'}</Label>
              <div
                className="mt-2 relative aspect-[16/5] rounded-xl overflow-hidden border-2 border-dashed border-border hover:border-primary cursor-pointer transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-sm">Click to upload image</span>
                    <span className="text-xs">Recommended: 1920×600px</span>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input placeholder="e.g. Order Custom Cakes" {...register('title')} />
            </div>

            <div className="space-y-1.5">
              <Label>Link URL</Label>
              <Input placeholder="e.g. /products" {...register('link')} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input type="number" min="0" {...register('sort_order')} />
              </div>
              <div className="flex items-end pb-0.5 gap-3">
                <Label>Active</Label>
                <Switch checked={watch('is_active')} onCheckedChange={(v) => setValue('is_active', v)} />
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editingBanner ? 'Save Changes' : 'Create Banner'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
