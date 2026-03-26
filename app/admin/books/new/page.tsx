import { prisma } from '@/lib/prisma'
import BookForm from '../BookForm'

export const dynamic = 'force-dynamic'

export default async function NewBookPage() {
  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = []
  try {
    categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
  } catch (e) {
    console.error('[admin/books/new] DB error:', e)
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#F0F4FF' }}>Tambah Buku Baru</h1>
        <p className="text-sm mt-1" style={{ color: '#8899BB' }}>Isi form berikut untuk menambah buku ke koleksi</p>
      </div>
      <BookForm categories={categories} />
    </div>
  )
}
