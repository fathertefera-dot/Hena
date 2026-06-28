import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductForm } from '@/components/admin/ProductForm'
import { getAllCategories } from '@/actions/categories'

export const metadata: Metadata = { title: 'New Product' }

export default async function NewProductPage() {
  const categories = await getAllCategories()

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/products" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold">New Product</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Create a new cake product</p>
        </div>
      </div>

      <ProductForm categories={categories} mode="create" />
    </div>
  )
}
