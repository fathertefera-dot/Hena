import type { Metadata } from 'next'
import { getAllCategories } from '@/actions/categories'
import { CategoriesPageClient } from '@/components/admin/CategoriesClient'

export const metadata: Metadata = { title: 'Categories' }

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories()
  return <CategoriesPageClient initialCategories={categories} />
}
