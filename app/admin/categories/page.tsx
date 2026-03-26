import { prisma } from '@/lib/prisma'
import CategoriesClient from './CategoriesClient'

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  let categories: Awaited<ReturnType<typeof prisma.category.findMany<{ include: { _count: { select: { books: true } } } }>>> = []
  try {
    categories = await prisma.category.findMany({
      include: { _count: { select: { books: true } } },
      orderBy: { name: 'asc' },
    })
  } catch (e) {
    console.error('[admin/categories] DB error:', e)
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#F0F4FF' }}>Manajemen Kategori</h1>
        <p className="text-sm mt-1" style={{ color: '#8899BB' }}>{categories.length} kategori terdaftar</p>
      </div>
      <CategoriesClient initialCategories={categories} />
    </div>
  )
}
