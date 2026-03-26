import { createClient } from '@/lib/supabase/server'
import CategoriesClient from './CategoriesClient'

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let categories: any[] = []

  try {
    const { data: catsRaw } = await supabase
      .from('Category')
      .select('id, name, slug, books:Book!Book_categoryId_fkey(id)')
      .order('name', { ascending: true })
    categories = (catsRaw ?? []).map((c) => ({ ...c, _count: { books: Array.isArray(c.books) ? c.books.length : 0 } }))
  } catch (e) {
    console.error('[admin/categories] DB error:', e)
  }

  return (
    <div className="px-4 py-6 md:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#F0F4FF' }}>Manajemen Kategori</h1>
        <p className="text-sm mt-1" style={{ color: '#8899BB' }}>{categories.length} kategori terdaftar</p>
      </div>
      <CategoriesClient initialCategories={categories} />
    </div>
  )
}
