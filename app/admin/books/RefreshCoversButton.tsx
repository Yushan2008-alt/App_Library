'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RefreshCoversButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function handleRefresh() {
    setLoading(true)
    setMsg('')
    try {
      const res = await fetch('/api/admin/refresh-covers', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      setMsg(data.message ?? 'Selesai')
      if (data.updated > 0) router.refresh()
    } catch {
      setMsg('Gagal. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {msg && <span className="text-xs" style={{ color: '#34d399' }}>{msg}</span>}
      <button
        onClick={handleRefresh}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
        style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}
        title="Ambil cover otomatis untuk buku yang belum punya cover"
      >
        {loading ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )}
        {loading ? 'Mengambil...' : 'Refresh Cover'}
      </button>
    </div>
  )
}
