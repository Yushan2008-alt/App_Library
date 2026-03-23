'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Category { id: string; name: string; slug: string }
interface Book {
  id: string; title: string; author: string; description: string
  coverImage: string | null; stock: number; externalUrl: string | null
  category: Category
}

const CATEGORY_COLORS = ['#4F9CF9', '#7B5EA7', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4']

export default function BooksClient({
  initialBooks,
  categories,
}: {
  initialBooks: Book[]
  categories: Category[]
}) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('')

  const filtered = useMemo(() => {
    return initialBooks.filter((b) => {
      const matchSearch = !search ||
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase())
      const matchCat = !activeCategory || b.category.slug === activeCategory
      return matchSearch && matchCat
    })
  }, [initialBooks, search, activeCategory])

  const grouped = useMemo(() => {
    if (activeCategory || search) return null
    const map: Record<string, Book[]> = {}
    initialBooks.forEach((b) => {
      if (!map[b.category.name]) map[b.category.name] = []
      map[b.category.name].push(b)
    })
    return map
  }, [initialBooks, activeCategory, search])

  return (
    <div>
      {/* Background bubbles */}
      <div className="fixed top-20 right-10 w-64 h-64 rounded-full opacity-5 pointer-events-none" style={{ background: '#4F9CF9', filter: 'blur(80px)' }} />
      <div className="fixed bottom-20 left-10 w-48 h-48 rounded-full opacity-5 pointer-events-none" style={{ background: '#7B5EA7', filter: 'blur(60px)' }} />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#F0F4FF' }}>Koleksi Buku</h1>
        <p className="text-sm mt-1" style={{ color: '#8899BB' }}>{initialBooks.length} buku tersedia</p>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8899BB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul atau pengarang..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: '#162236', border: '1px solid #1E2E45', color: '#F0F4FF' }}
            onFocus={(e) => e.target.style.borderColor = '#4F9CF9'}
            onBlur={(e) => e.target.style.borderColor = '#1E2E45'}
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 mb-8 flex-wrap">
        <button
          onClick={() => setActiveCategory('')}
          className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
          style={{
            background: !activeCategory ? 'rgba(79,156,249,0.2)' : '#162236',
            color: !activeCategory ? '#4F9CF9' : '#8899BB',
            border: !activeCategory ? '1px solid rgba(79,156,249,0.4)' : '1px solid #1E2E45',
          }}
        >
          Semua
        </button>
        {categories.map((cat, i) => {
          const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length]
          const active = activeCategory === cat.slug
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(active ? '' : cat.slug)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: active ? `${color}25` : '#162236',
                color: active ? color : '#8899BB',
                border: active ? `1px solid ${color}60` : '1px solid #1E2E45',
              }}
            >
              {cat.name}
            </button>
          )
        })}
      </div>

      {/* Results / Grouped */}
      {(search || activeCategory) ? (
        <>
          <p className="text-sm mb-4" style={{ color: '#8899BB' }}>{filtered.length} buku ditemukan</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((book, i) => (
              <BookCard key={book.id} book={book} colorIndex={i} />
            ))}
          </div>
        </>
      ) : grouped ? (
        Object.entries(grouped).map(([catName, books], ci) => (
          <div key={catName} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 rounded-full" style={{ background: CATEGORY_COLORS[ci % CATEGORY_COLORS.length] }} />
              <h2 className="text-lg font-semibold" style={{ color: '#F0F4FF' }}>{catName}</h2>
              <span className="text-sm" style={{ color: '#8899BB' }}>{books.length} buku</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {books.map((book, i) => (
                <BookCard key={book.id} book={book} colorIndex={ci * 10 + i} />
              ))}
            </div>
          </div>
        ))
      ) : null}
    </div>
  )
}

function BookCard({ book, colorIndex }: { book: Book; colorIndex: number }) {
  const color = CATEGORY_COLORS[colorIndex % CATEGORY_COLORS.length]

  return (
    <Link
      href={`/user/books/${book.id}`}
      className="group block rounded-2xl border overflow-hidden transition-all duration-300"
      style={{ background: '#162236', borderColor: '#1E2E45' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${color}50`
        e.currentTarget.style.boxShadow = `0 0 20px ${color}20`
        e.currentTarget.style.transform = 'translateY(-4px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#1E2E45'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Cover */}
      <div className="aspect-[3/4] overflow-hidden" style={{ background: '#1E2E45' }}>
        {book.coverImage ? (
          <Image src={book.coverImage} alt={book.title} width={200} height={267} className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <span className="text-4xl">📚</span>
            <div className="w-10 h-0.5 rounded" style={{ background: `${color}40` }} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <span className="inline-block px-2 py-0.5 rounded-full text-xs mb-1.5" style={{ background: `${color}20`, color }}>
          {book.category.name}
        </span>
        <h3 className="text-xs font-semibold leading-tight line-clamp-2 mb-1" style={{ color: '#F0F4FF' }}>{book.title}</h3>
        <p className="text-xs truncate" style={{ color: '#8899BB' }}>{book.author}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs" style={{ color: book.stock > 0 ? '#34d399' : '#fca5a5' }}>
            {book.stock > 0 ? `${book.stock} tersedia` : 'Habis'}
          </span>
        </div>
      </div>
    </Link>
  )
}
