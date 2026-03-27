import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AdminBooksClient from './AdminBooksClient'
import RefreshCoversButton from './RefreshCoversButton'

export const dynamic = 'force-dynamic'

export default async function AdminBooksPage() {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let books: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let categories: any[] = []

  try {
    const [booksRes, catsRes] = await Promise.all([
      supabase.from('Book').select('id, title, author, description, coverImage, externalUrl, stock, categoryId, category:Category!Book_categoryId_fkey(id, name, slug)').order('createdAt', { ascending: false }),
      supabase.from('Category').select('id, name, slug').order('name', { ascending: true }),
    ])
    books = booksRes.data ?? []
    categories = catsRes.data ?? []
  } catch (e) {
    console.error('[admin/books] DB error:', e)
  }

  return (
    <div className="px-4 py-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#F0F4FF' }}>Manajemen Buku</h1>
          <p className="text-sm mt-1" style={{ color: '#8899BB' }}>{books.length} buku terdaftar</p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshCoversButton />
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
      </div>
      <AdminBooksClient initialBooks={books} categories={categories} />
    </div>
  )
}
