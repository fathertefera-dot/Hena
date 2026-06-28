import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductForm } from '@/components/admin/ProductForm'
import { getAdminProductById } from '@/actions/products'
import { getAllCategories } from '@/actions/categories'

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EditProductPageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getAdminProductById(id)
  return { title: product ? `Edit: ${product.name}` : 'Product Not Found' }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    getAdminProductById(id),
    getAllCategories(),
  ])

  if (!product) notFound()

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/products" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl md:text-3xl font-semibold truncate">{product.name}</h1>
            {product.status === 'active' && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/products/${product.slug}`} target="_blank" className="flex items-center gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" /> View
                </Link>
              </Button>
            )}
          </div>
          <p className="text-muted-foreground mt-0.5 text-sm font-mono truncate">/products/{product.slug}</p>
        </div>
      </div>

      <ProductForm product={product} categories={categories} mode="edit" />
    </div>
  )
}
