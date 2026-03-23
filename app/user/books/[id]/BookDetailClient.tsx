'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface Book {
  id: string; title: string; author: string; description: string
  coverImage: string | null; externalUrl: string | null; stock: number
  category: { name: string; slug: string }
}

interface Loan { id: string; status: string }

export default function BookDetailClient({ book, existingLoan }: { book: Book; existingLoan: Loan | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleLoan() {
    setError('')
    setLoading(true)
    const res = await fetch('/api/loans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId: book.id }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? 'Gagal meminjam'); return }
    setSuccess(true)
    router.refresh()
  }

  const loanStatus: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'Menunggu Persetujuan', color: '#f59e0b' },
    APPROVED: { label: 'Sedang Dipinjam', color: '#10b981' },
  }

  return (
    <div className="max-w-3xl mx-auto relative">
      {/* Bubbles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-5 pointer-events-none" style={{ background: '#4F9CF9', filter: 'blur(50px)' }} />

      <div className="mb-6">
        <Link href="/user/books" className="text-sm hover:underline" style={{ color: '#4F9CF9' }}>← Kembali ke Koleksi</Link>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Cover */}
          <div className="w-full md:w-48 flex-shrink-0" style={{ background: 'rgba(14,34,72,0.9)', minHeight: '200px' }}>
            {book.coverImage ? (
              <Image src={book.coverImage} alt={book.title} width={192} height={280} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ minHeight: '200px' }}>
                <span className="text-6xl">📚</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 p-6">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3" style={{ background: 'rgba(79,156,249,0.15)', color: '#4F9CF9' }}>
              {book.category.name}
            </span>
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#F0F4FF' }}>{book.title}</h1>
            <p className="text-sm mb-4" style={{ color: '#8899BB' }}>oleh {book.author}</p>

            <p className="text-sm leading-relaxed mb-6" style={{ color: '#8899BB' }}>{book.description}</p>

            <div className="flex items-center gap-2 mb-6">
              <span className="text-sm font-medium" style={{ color: book.stock > 0 ? '#34d399' : '#fca5a5' }}>
                {book.stock > 0 ? `✓ ${book.stock} buku tersedia` : '✗ Stok habis'}
              </span>
            </div>

            {/* Feedback */}
            {success && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>
                Permintaan pinjam berhasil dikirim! Tunggu persetujuan admin.
              </div>
            )}
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                {error}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {existingLoan ? (
                <span className="px-5 py-2.5 rounded-full text-sm font-medium" style={{ background: 'rgba(79,156,249,0.1)', color: '#4F9CF9' }}>
                  {loanStatus[existingLoan.status]?.label ?? 'Sudah dipinjam'}
                </span>
              ) : book.stock > 0 ? (
                <button
                  onClick={handleLoan}
                  disabled={loading || success}
                  className="px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-300"
                  style={{
                    background: loading || success ? '#243552' : 'linear-gradient(135deg, #4F9CF9, #2563eb)',
                    boxShadow: loading || success ? 'none' : '0 0 20px rgba(79,156,249,0.3)',
                  }}
                >
                  {loading ? 'Memproses...' : success ? 'Permintaan Terkirim ✓' : 'Pinjam Buku'}
                </button>
              ) : null}

              {book.externalUrl && (
                <a
                  href={book.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
                  style={{ background: 'rgba(123,94,167,0.15)', color: '#9d7bc4', border: '1px solid rgba(123,94,167,0.3)' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Baca Online
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
