'use client'

import { useState } from 'react'
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCover(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    if (cover) fd.append('cover', cover)

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

  const inputStyle = { background: '#0F1B2D', border: '1px solid #1E2E45', color: '#F0F4FF' }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
          {error}
        </div>
      )}

      {/* Cover Upload */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#8899BB' }}>Cover Buku</label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-28 rounded-xl overflow-hidden flex items-center justify-center" style={{ background: '#1E2E45' }}>
            {preview ? (
              <Image src={preview} alt="preview" width={80} height={112} className="object-cover w-full h-full" />
            ) : (
              <span className="text-3xl">📚</span>
            )}
          </div>
          <label className="cursor-pointer px-4 py-2 rounded-xl text-sm font-medium transition-colors" style={{ background: 'rgba(79,156,249,0.1)', color: '#4F9CF9', border: '1px dashed rgba(79,156,249,0.3)' }}>
            Upload Gambar
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
        </div>
      </div>

      {[
        { key: 'title', label: 'Judul Buku', type: 'text', placeholder: 'Masukkan judul buku', required: true },
        { key: 'author', label: 'Pengarang', type: 'text', placeholder: 'Nama pengarang', required: true },
        { key: 'externalUrl', label: 'Link Akses Buku (URL)', type: 'url', placeholder: 'https://...', required: false },
      ].map(({ key, label, type, placeholder, required }) => (
        <div key={key}>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#8899BB' }}>{label}</label>
          <input
            type={type}
            value={form[key as keyof typeof form]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            required={required}
            placeholder={placeholder}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = '#4F9CF9'}
            onBlur={(e) => e.target.style.borderColor = '#1E2E45'}
          />
        </div>
      ))}

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
