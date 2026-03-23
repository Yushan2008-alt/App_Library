'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Category { id: string; name: string; slug: string; _count: { books: number } }

export default function CategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter()
  const [categories, setCategories] = useState(initialCategories)
  const [newName, setNewName] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    setCategories([...categories, { ...data.category, _count: { books: 0 } }])
    setNewName('')
  }

  async function handleEdit(id: string) {
    setLoading(true)
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { alert(data.error); return }
    setCategories(categories.map((c) => (c.id === id ? { ...c, ...data.category } : c)))
    setEditId(null)
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus kategori ini?')) return
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { alert(data.error); return }
    setCategories(categories.filter((c) => c.id !== id))
  }

  return (
    <>
      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-3 mb-6">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nama kategori baru..."
          required
          className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: '#162236', border: '1px solid #1E2E45', color: '#F0F4FF' }}
          onFocus={(e) => e.target.style.borderColor = '#4F9CF9'}
          onBlur={(e) => e.target.style.borderColor = '#1E2E45'}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-full text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #4F9CF9, #2563eb)' }}
        >
          Tambah
        </button>
      </form>

      {error && <p className="mb-4 text-sm" style={{ color: '#fca5a5' }}>{error}</p>}

      <div className="rounded-2xl border overflow-hidden" style={{ background: '#162236', borderColor: '#1E2E45' }}>
        {categories.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm" style={{ color: '#8899BB' }}>Belum ada kategori</p>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: '#1E2E45' }}>
              {editId === cat.id ? (
                <div className="flex flex-1 gap-2">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: '#0F1B2D', border: '1px solid #4F9CF9', color: '#F0F4FF' }}
                  />
                  <button onClick={() => handleEdit(cat.id)} className="px-3 py-2 rounded-xl text-xs font-medium" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                    Simpan
                  </button>
                  <button onClick={() => setEditId(null)} className="px-3 py-2 rounded-xl text-xs" style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5' }}>
                    Batal
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: '#F0F4FF' }}>{cat.name}</p>
                    <p className="text-xs" style={{ color: '#8899BB' }}>{cat._count.books} buku</p>
                  </div>
                  <button onClick={() => { setEditId(cat.id); setEditName(cat.name) }} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: 'rgba(79,156,249,0.1)', color: '#4F9CF9' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5' }}>
                    Hapus
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </>
  )
}
