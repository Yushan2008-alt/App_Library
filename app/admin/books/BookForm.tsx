'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Category { id: string; name: string }
interface BookData {
  title?: string; author?: string; description?: string
  externalUrl?: string; stock?: number; categoryId?: string; coverImage?: string | null
}

export default function BookForm({
  categories,
  initialData,
  bookId,
}: {
  categories: Category[]
  initialData?: BookData
  bookId?: string
}) {
  const router = useRouter()
  const [form, setForm] = useState({
    title: initialData?.title ?? '',
    author: initialData?.author ?? '',
    description: initialData?.description ?? '',
    externalUrl: initialData?.externalUrl ?? '',
    stock: String(initialData?.stock ?? 1),
    categoryId: initialData?.categoryId ?? '',
  })
  const [cover, setCover] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(initialData?.coverImage ?? null)
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(
    initialData?.coverImage?.startsWith('http') ? initialData.coverImage : null
  )
  const [fetchingCover, setFetchingCover] = useState(false)
  const [coverFetchMsg, setCoverFetchMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const urlFetchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCover(file)
    setCoverImageUrl(null)
    setPreview(URL.createObjectURL(file))
    setCoverFetchMsg('')
  }

  async function fetchOgImage(url: string) {
    if (!url || !url.startsWith('http')) return
    setFetchingCover(true)
    setCoverFetchMsg('Mengambil cover dari link...')
    try {
      const res = await fetch(`/api/og-image?url=${encodeURIComponent(url)}`)
      const data = await res.json()
      if (data.image) {
        setPreview(data.image)
        setCoverImageUrl(data.image)
        setCover(null)
        setCoverFetchMsg('Cover berhasil diambil dari link!')
      } else {
        setCoverFetchMsg('Cover tidak ditemukan di link tersebut.')
      }
    } catch {
      setCoverFetchMsg('Gagal mengambil cover.')
    } finally {
      setFetchingCover(false)
    }
  }

  function handleUrlChange(value: string) {
    setForm({ ...form, externalUrl: value })
    // Debounce auto-fetch
    if (urlFetchTimeout.current) clearTimeout(urlFetchTimeout.current)
    if (value.startsWith('http')) {
      urlFetchTimeout.current = setTimeout(() => {
        if (!cover) fetchOgImage(value)
      }, 1200)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    if (cover) {
      fd.append('cover', cover)
    } else if (coverImageUrl) {
      fd.append('coverImageUrl', coverImageUrl)
    } else {
      fd.append('coverImageUrl', '')
    }

    const url = bookId ? `/api/books/${bookId}` : '/api/books'
    const method = bookId ? 'PUT' : 'POST'

    const res = await fetch(url, { method, body: fd })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Gagal menyimpan')
      return
    }

    router.push('/admin/books')
    router.refresh()
  }

  const inputStyle = { background: 'rgba(9,22,48,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0F4FF' }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
          {error}
        </div>
      )}

      {/* Cover Preview */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#8899BB' }}>Cover Buku</label>
        <div className="flex items-start gap-4">
          <div className="w-20 h-28 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(14,34,72,0.8)' }}>
            {preview ? (
              <Image src={preview} alt="preview" width={80} height={112} className="object-cover w-full h-full" unoptimized />
            ) : (
              <span className="text-3xl">📚</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="cursor-pointer px-4 py-2 rounded-xl text-sm font-medium transition-colors" style={{ background: 'rgba(79,156,249,0.1)', color: '#4F9CF9', border: '1px dashed rgba(79,156,249,0.3)' }}>
              Upload Manual
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
            {form.externalUrl && (
              <button
                type="button"
                onClick={() => fetchOgImage(form.externalUrl)}
                disabled={fetchingCover}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#34D399', border: '1px dashed rgba(16,185,129,0.3)', cursor: fetchingCover ? 'not-allowed' : 'pointer' }}
              >
                {fetchingCover ? '⏳ Mengambil...' : '🔗 Ambil dari Link'}
              </button>
            )}
            {coverFetchMsg && (
              <p className="text-xs" style={{ color: coverFetchMsg.includes('berhasil') ? '#34D399' : '#8899BB' }}>
                {coverFetchMsg}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#8899BB' }}>Judul Buku</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          placeholder="Masukkan judul buku"
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = '#4F9CF9'}
          onBlur={(e) => e.target.style.borderColor = '#1E2E45'}
        />
      </div>

      {/* Author */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#8899BB' }}>Pengarang</label>
        <input
          type="text"
          value={form.author}
          onChange={(e) => setForm({ ...form, author: e.target.value })}
          required
          placeholder="Nama pengarang"
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = '#4F9CF9'}
          onBlur={(e) => e.target.style.borderColor = '#1E2E45'}
        />
      </div>

      {/* External URL with auto OG fetch */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#8899BB' }}>
          Link Akses Buku (URL)
          <span className="ml-2 text-xs font-normal" style={{ color: '#34D399' }}>
            Cover akan otomatis diambil dari link ini
          </span>
        </label>
        <input
          type="url"
          value={form.externalUrl}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://..."
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = '#4F9CF9'}
          onBlur={(e) => e.target.style.borderColor = '#1E2E45'}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#8899BB' }}>Deskripsi</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
          rows={4}
          placeholder="Deskripsi singkat buku..."
          className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = '#4F9CF9'}
          onBlur={(e) => e.target.style.borderColor = '#1E2E45'}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#8899BB' }}>Kategori</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            required
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={inputStyle}
          >
            <option value="">Pilih kategori</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#8899BB' }}>Stok</label>
          <input
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            required
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = '#4F9CF9'}
            onBlur={(e) => e.target.style.borderColor = '#1E2E45'}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 rounded-full text-sm font-medium transition-colors"
          style={{ background: '#1E2E45', color: '#8899BB' }}
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 rounded-full text-sm font-semibold text-white transition-all duration-300"
          style={{
            background: loading ? '#243552' : 'linear-gradient(135deg, #4F9CF9, #2563eb)',
            boxShadow: loading ? 'none' : '0 0 20px rgba(79,156,249,0.3)',
          }}
        >
          {loading ? 'Menyimpan...' : bookId ? 'Simpan Perubahan' : 'Tambah Buku'}
        </button>
      </div>
    </form>
  )
}
