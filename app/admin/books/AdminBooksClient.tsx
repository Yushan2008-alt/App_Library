'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface Category { id: string; name: string; slug: string }
interface Book {
  id: string; title: string; author: string; stock: number; coverImage: string | null
  externalUrl: string | null; createdAt: Date | string; category: Category
}

const CATEGORY_COLORS = ['#4F9CF9', '#7B5EA7', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4']

export default function AdminBooksClient({
  initialBooks,
  categories,
}: {
  initialBooks: Book[]
  categories: Category[]
}) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const filtered = initialBooks.filter((b) => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCat ? b.category.id === filterCat : true
    return matchSearch && matchCat
  })

  async function handleDelete(id: string) {
    if (!confirm('Hapus buku ini?')) return
    setDeleting(id)
    const res = await fetch(`/api/books/${id}`, { method: 'DELETE' })
    setDeleting(null)
    if (res.ok) router.refresh()
    else {
      const d = await res.json()
      alert(d.error ?? 'Gagal menghapus')
    }
  }

  return (
    <>
      {/* Search & Filter */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8899BB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul atau pengarang..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'rgba(9,22,48,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0F4FF' }}
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'rgba(9,22,48,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0F4FF' }}
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Buku', 'Kategori', 'Stok', 'Aksi'].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8899BB' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-sm" style={{ color: '#8899BB' }}>
                  Tidak ada buku ditemukan
                </td>
              </tr>
            ) : (
              filtered.map((book, i) => {
                const catColor = CATEGORY_COLORS[i % CATEGORY_COLORS.length]
                return (
                  <tr key={book.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'rgba(14,34,72,0.8)' }}>
                          {book.coverImage ? (
                            <Image src={book.coverImage} alt={book.title} width={40} height={56} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">📚</div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#F0F4FF' }}>{book.title}</p>
                          <p className="text-xs" style={{ color: '#8899BB' }}>{book.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: `${catColor}20`, color: catColor }}>
                        {book.category.name}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-medium" style={{ color: book.stock > 0 ? '#34d399' : '#fca5a5' }}>
                        {book.stock} tersisa
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/books/${book.id}/edit`}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          style={{ background: 'rgba(79,156,249,0.1)', color: '#4F9CF9' }}
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(book.id)}
                          disabled={deleting === book.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5' }}
                        >
                          {deleting === book.id ? '...' : 'Hapus'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
