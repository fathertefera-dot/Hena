'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import {
  Loader2, Plus, Trash2, Upload, X, GripVertical, ImageIcon,
  CheckCircle2, XCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { productFormSchema, type ProductFormValues } from '@/lib/validations'
import {
  createProduct, updateProduct, deleteProduct,
  uploadProductImage, deleteProductImage
} from '@/actions/products'
import { slugify } from '@/lib/utils'
import { compressImage } from '@/lib/compressImage' // ✅ ተጨምሯል
import type { Category, Product, ProductImage } from '@/types'

interface ProductFormProps {
  product?: Product
  categories: Category[]
  mode: 'create' | 'edit'
}

export function ProductForm({ product, categories, mode }: ProductFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDeleting] = useTransition()
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? [])
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name ?? '',
      slug: product?.slug ?? '',
      description: product?.description ?? '',
      category_id: product?.category_id ?? '',
      availability: product?.availability ?? 'available',
      is_featured: product?.is_featured ?? false,
      status: product?.status ?? 'draft',
      variants: product?.variants?.map((v) => ({
        id: v.id,
        name: v.name,
        price: v.price,
        sort_order: v.sort_order,
      })) ?? [{ name: '', price: 0, sort_order: 0 }],
    },
  })

  const { fields: variantFields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  })

  const nameValue = watch('name')

  const handleNameBlur = () => {
    if (mode === 'create' && nameValue && !watch('slug')) {
      setValue('slug', slugify(nameValue))
    }
  }

  const onSubmit = (data: ProductFormValues) => {
    startTransition(async () => {
      const result = mode === 'create'
        ? await createProduct(data)
        : await updateProduct(product!.id, data)

      if (result.success) {
        toast.success(mode === 'create' ? 'Product Created!' : 'Product Updated!', {
          description: result.message || `Product "${data.name}" has been saved successfully.`,
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        })
        if (mode === 'create') {
          const createResult = result as { success: true; data: { id: string }; message?: string }
          router.push(`/admin/products/${createResult.data.id}`)
        }
      } else {
        toast.error(mode === 'create' ? 'Creation Failed' : 'Update Failed', {
          description: result.error || 'Please check your inputs and try again.',
          icon: <XCircle className="h-4 w-4 text-destructive" />,
        })
      }
    })
  }

  const handleDelete = () => {
    if (!product) return
    startDeleting(async () => {
      const result = await deleteProduct(product.id)
      if (result.success) {
        toast.success('Product Deleted', {
          description: `"${product.name}" has been removed.`,
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        })
        router.push('/admin/products')
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
    if (!file || !product) return
    if (images.length >= 10) {
      toast.error('Maximum 10 images per product')
      return
    }

    setUploadingImage(true)

    // ✅ ምስሉን ከመላኩ በፊት ጨምቀው (max 1.5MB, 1200px)
    const compressedFile = await compressImage(file, 1.5, 1200)

    const result = await uploadProductImage(product.id, compressedFile, images.length)
    setUploadingImage(false)

    if (result.success) {
      setImages((prev) => [
        ...prev,
        { id: result.data.id, product_id: product.id, url: result.data.url, sort_order: prev.length, created_at: new Date().toISOString() },
      ])
      toast.success('Image Uploaded!', {
        description: 'Product image has been added.',
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

  const handleDeleteImage = async (imageId: string) => {
    const result = await deleteProductImage(imageId)
    if (result.success) {
      setImages((prev) => prev.filter((i) => i.id !== imageId))
      toast.success('Image Deleted', {
        description: 'Product image has been removed.',
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      })
    } else {
      toast.error('Delete Failed', {
        description: result.error || 'Please try again.',
        icon: <XCircle className="h-4 w-4 text-destructive" />,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Fields */}
        <div className="xl:col-span-2 space-y-5">
          {/* Basic Info */}
          <Card>
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" placeholder="e.g. Chocolate Celebration Cake" {...register('name')} onBlur={handleNameBlur} className={errors.name ? 'border-destructive' : ''} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slug">URL Slug *</Label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-sm text-muted-foreground shrink-0">/products/</span>
                  <Input id="slug" placeholder="chocolate-celebration-cake" {...register('slug')} className={errors.slug ? 'border-destructive' : ''} />
                </div>
                {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe the cake, ingredients, serving size..." {...register('description')} className="h-32" />
              </div>

              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={watch('category_id')} onValueChange={(v) => setValue('category_id', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No category</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle>Variants & Pricing *</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', price: 0, sort_order: variantFields.length })} disabled={variantFields.length >= 20} className="w-full sm:w-auto">
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Variant
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {errors.variants && typeof errors.variants.message === 'string' && (
                <p className="text-xs text-destructive">{errors.variants.message}</p>
              )}
              {variantFields.map((field, index) => (
                <div key={field.id} className="flex flex-col sm:flex-row sm:items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                  <GripVertical className="h-5 w-5 text-muted-foreground mt-2 shrink-0 hidden sm:block" />
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Variant Name *</Label>
                      <Input placeholder="e.g. 1 KG, Small" {...register(`variants.${index}.name`)} className={`h-9 ${errors.variants?.[index]?.name ? 'border-destructive' : ''}`} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Price (ETB) *</Label>
                      <Input type="number" min="0" step="0.01" placeholder="0.00" {...register(`variants.${index}.price`)} className={`h-9 ${errors.variants?.[index]?.price ? 'border-destructive' : ''}`} />
                    </div>
                  </div>
                  {variantFields.length > 1 && (
                    <button type="button" onClick={() => remove(index)} className="mt-2 h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Images (only for edit mode) */}
          {mode === 'edit' && product && (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <CardTitle>Product Images</CardTitle>
                  <Badge variant="outline" className="w-fit">{images.length}/10</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-4">
                  {images.map((img) => (
                    <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden group border border-border">
                      <Image src={img.url} alt="Product image" fill sizes="100px" className="object-cover" />
                      <button type="button" onClick={() => handleDeleteImage(img.id)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  ))}

                  {images.length < 10 && (
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-50">
                      {uploadingImage ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      ) : (
                        <>
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Upload</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageUpload} />
              </CardContent>
            </Card>
          )}
          {mode === 'create' && (
            <div className="rounded-lg bg-muted/50 border border-border p-4 text-sm text-muted-foreground">
              <Upload className="h-4 w-4 inline mr-2" />
              You can upload images after creating the product.
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Publishing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={watch('status')} onValueChange={(v) => setValue('status', v as ProductFormValues['status'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Availability</Label>
                <Select value={watch('availability')} onValueChange={(v) => setValue('availability', v as ProductFormValues['availability'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="pre-order">Pre-Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <Label>Featured Product</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Show on homepage</p>
                </div>
                <Switch checked={watch('is_featured')} onCheckedChange={(v) => setValue('is_featured', v)} />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button type="submit" size="lg" className="w-full" disabled={isPending}>
              {isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
              ) : mode === 'create' ? (
                'Create Product'
              ) : (
                'Save Changes'
              )}
            </Button>

            <Button type="button" variant="outline" size="lg" className="w-full" onClick={() => router.back()}>
              Cancel
            </Button>

            {mode === 'edit' && product && (
              <>
                <Separator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" size="sm" className="w-full" disabled={isDeleting}>
                      {isDeleting ? <><Loader2 className="h-4 w-4 animate-spin" /> Deleting...</> : 'Delete Product'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Product</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete <strong>{product.name}</strong>? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
