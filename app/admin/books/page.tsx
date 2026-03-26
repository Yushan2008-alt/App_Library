import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import AdminBooksClient from './AdminBooksClient'

export const dynamic = 'force-dynamic'

export default async function AdminBooksPage() {
  let books: Awaited<ReturnType<typeof prisma.book.findMany<{ include: { category: true } }>>> = []
  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = []
  try {
    ;[books, categories] = await Promise.all([
      prisma.book.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } }),
      prisma.category.findMany({ orderBy: { name: 'asc' } }),
    ])
  } catch (e) {
    console.error('[admin/books] DB error:', e)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#F0F4FF' }}>Manajemen Buku</h1>
          <p className="text-sm mt-1" style={{ color: '#8899BB' }}>{books.length} buku terdaftar</p>
        </div>
        <Link
          href="/admin/books/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-300"
          style={{ background: 'linear-gradient(135deg, #4F9CF9, #2563eb)', boxShadow: '0 0 20px rgba(79,156,249,0.3)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Buku
        </Link>
      </div>
      <AdminBooksClient initialBooks={books} categories={categories} />
    </div>
  )
}
