'use client'

import { useState, useTransition, useRef } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2, Loader2, ImageIcon, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { categoryFormSchema, type CategoryFormValues } from '@/lib/validations'
import { createCategory, updateCategory, deleteCategory, uploadCategoryImage } from '@/actions/categories'
import { slugify } from '@/lib/utils'
import { compressImage } from '@/lib/compressImage' // ✅ ተጨምሯል
import type { Category } from '@/types'

interface CategoriesPageClientProps {
  initialCategories: Category[]
}

export function CategoriesPageClient({ initialCategories }: CategoriesPageClientProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isPending, startTransition] = useTransition()
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null)

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: '', slug: '', sort_order: 0, is_active: true },
  })

  const openCreate = () => {
    setEditingCategory(null)
    reset({ name: '', slug: '', sort_order: categories.length, is_active: true })
    setDialogOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditingCategory(cat)
    reset({ name: cat.name, slug: cat.slug, sort_order: cat.sort_order, is_active: cat.is_active })
    setDialogOpen(true)
  }

  const onSubmit = (data: CategoryFormValues) => {
    startTransition(async () => {
      const result = editingCategory
        ? await updateCategory(editingCategory.id, data)
        : await createCategory(data)

      if (result.success) {
        toast.success(editingCategory ? 'Category Updated!' : 'Category Created!', {
          description: result.message ?? `"${data.name}" has been saved.`,
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        })
        setDialogOpen(false)
        window.location.reload()
      } else {
        toast.error(editingCategory ? 'Update Failed' : 'Creation Failed', {
          description: result.error || 'Please try again.',
          icon: <XCircle className="h-4 w-4 text-destructive" />,
        })
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteCategory(id)
      if (result.success) {
        toast.success('Category Deleted', {
          description: 'The category has been removed.',
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        })
        setCategories((prev) => prev.filter((c) => c.id !== id))
      } else {
        toast.error('Delete Failed', {
          description: result.error || 'Please try again.',
          icon: <XCircle className="h-4 w-4 text-destructive" />,
        })
      }
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !uploadTargetId) return

    setUploadingId(uploadTargetId)

    // ✅ ምስሉን ከመላኩ በፊት ጨምቀው
    const compressedFile = await compressImage(file, 1.5, 1200)

    const result = await uploadCategoryImage(uploadTargetId, compressedFile)
    setUploadingId(null)

    if (result.success) {
      setCategories((prev) =>
        prev.map((c) => c.id === uploadTargetId ? { ...c, image_url: result.data.url } : c)
      )
      toast.success('Image Uploaded!', {
        description: 'Category image has been updated.',
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      })
    } else {
      toast.error('Upload Failed', {
        description: result.error || 'Please try again.',
        icon: <XCircle className="h-4 w-4 text-destructive" />,
      })
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold">Categories</h1>
          <p className="text-muted-foreground mt-1">{categories.length} categories</p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" /> Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No categories yet.</p>
          <Button onClick={openCreate} className="mt-4">Add First Category</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Card key={cat.id} className="group overflow-hidden">
              <div
                className="relative aspect-video bg-muted cursor-pointer"
                onClick={() => {
                  setUploadTargetId(cat.id)
                  fileInputRef.current?.click()
                }}
              >
                {cat.image_url ? (
                  <Image src={cat.image_url} alt={cat.name} fill sizes="400px" className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-xs">Click to upload image</span>
                  </div>
                )}
                {uploadingId === cat.id && (
                  <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs bg-black/50 px-2 py-1 rounded">Change Image</span>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">{cat.name}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{cat.slug}</p>
                    <p className="text-xs text-muted-foreground mt-1">Sort: {cat.sort_order}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${cat.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(cat)}>
                    <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                          Delete <strong>{cat.name}</strong>? Products in this category will become uncategorised.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(cat.id)} className="bg-destructive hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-full max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'New Category'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Category Name *</Label>
              <Input placeholder="e.g. Wedding Cakes" {...register('name')} onBlur={() => { if (!editingCategory) setValue('slug', slugify(watch('name'))) }} className={errors.name ? 'border-destructive' : ''} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Slug *</Label>
              <Input placeholder="wedding-cakes" {...register('slug')} className={errors.slug ? 'border-destructive' : ''} />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Sort Order</Label>
              <Input type="number" min="0" {...register('sort_order')} className="w-24" />
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={watch('is_active')} onCheckedChange={(v) => setValue('is_active', v)} />
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editingCategory ? 'Save Changes' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
