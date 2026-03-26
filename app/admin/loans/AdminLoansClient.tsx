'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate, formatRupiah } from '@/lib/utils'

interface Loan {
  id: string; status: string; requestedAt: Date | string; approvedAt: Date | string | null
  dueDate: Date | string | null; returnedAt: Date | string | null; fine: number
  user: { name: string; email: string }
  book: { title: string; author: string; category: { name: string } }
}

const STATUS = {
  PENDING:  { bg: 'rgba(245,158,11,0.15)',  text: '#fbbf24', label: 'Menunggu' },
  APPROVED: { bg: 'rgba(16,185,129,0.15)',  text: '#34d399', label: 'Disetujui' },
  REJECTED: { bg: 'rgba(239,68,68,0.15)',   text: '#fca5a5', label: 'Ditolak' },
  RETURNED: { bg: 'rgba(79,156,249,0.15)',  text: '#93c5fd', label: 'Dikembalikan' },
} as const

const PAGE_SIZE = 15

export default function AdminLoansClient({ initialLoans }: { initialLoans: Loan[] }) {
  const router = useRouter()
  const [loans, setLoans] = useState(initialLoans)
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const filtered = filter === 'ALL' ? loans : loans.filter((l) => l.status === filter)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function handleFilterChange(tab: string) {
    setFilter(tab)
    setPage(1)
  }

  async function action(id: string, type: 'approve' | 'reject' | 'return') {
    setLoading(id + type)
    const res = await fetch(`/api/loans/${id}/${type}`, { method: 'PATCH' })
    const data = await res.json()
    setLoading(null)
    if (!res.ok) { alert(data.error ?? 'Gagal'); return }
    setLoans((prev) => prev.map((l) => (l.id === id ? { ...l, ...data.loan } : l)))
    router.refresh()
  }

  const tabs = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'RETURNED']

  return (
    <>
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((tab) => {
          const count = tab === 'ALL' ? loans.length : loans.filter((l) => l.status === tab).length
          const active = filter === tab
          return (
            <button
              key={tab}
              onClick={() => handleFilterChange(tab)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                background: active ? 'rgba(79,156,249,0.2)' : '#162236',
                color: active ? '#4F9CF9' : '#8899BB',
                border: active ? '1px solid rgba(79,156,249,0.4)' : '1px solid #1E2E45',
              }}
            >
              {tab === 'ALL' ? 'Semua' : STATUS[tab as keyof typeof STATUS]?.label ?? tab} ({count})
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: '#162236', borderColor: '#1E2E45' }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr style={{ borderBottom: '1px solid #1E2E45' }}>
                {['Pengguna', 'Buku', 'Tanggal', 'Jatuh Tempo', 'Denda', 'Status', 'Aksi'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8899BB' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-sm" style={{ color: '#8899BB' }}>Tidak ada data</td></tr>
              ) : (
                paginated.map((loan) => {
                  const s = STATUS[loan.status as keyof typeof STATUS] ?? STATUS.PENDING
                  const isOverdue = loan.status === 'APPROVED' && loan.dueDate && new Date(loan.dueDate) < new Date()
                  return (
                    <tr key={loan.id} style={{ borderBottom: '1px solid #1E2E45' }}>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium" style={{ color: '#F0F4FF' }}>{loan.user.name}</p>
                        <p className="text-xs" style={{ color: '#8899BB' }}>{loan.user.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium" style={{ color: '#F0F4FF' }}>{loan.book.title}</p>
                        <p className="text-xs" style={{ color: '#8899BB' }}>{loan.book.author}</p>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: '#8899BB' }}>{formatDate(loan.requestedAt)}</td>
                      <td className="px-4 py-3">
                        {loan.dueDate ? (
                          <span className="text-xs" style={{ color: isOverdue ? '#fca5a5' : '#8899BB' }}>
                            {formatDate(loan.dueDate)} {isOverdue && '⚠️'}
                          </span>
                        ) : <span style={{ color: '#8899BB' }}>-</span>}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: loan.fine > 0 ? '#fbbf24' : '#8899BB' }}>
                        {loan.fine > 0 ? formatRupiah(loan.fine) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: s.bg, color: s.text }}>{s.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 flex-wrap">
                          {loan.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => action(loan.id, 'approve')}
                                disabled={!!loading}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium"
                                style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}
                              >
                                {loading === loan.id + 'approve' ? '...' : '✓ Setuju'}
                              </button>
                              <button
                                onClick={() => action(loan.id, 'reject')}
                                disabled={!!loading}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium"
                                style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5' }}
                              >
                                {loading === loan.id + 'reject' ? '...' : '✗ Tolak'}
                              </button>
                            </>
                          )}
                          {loan.status === 'APPROVED' && (
                            <button
                              onClick={() => action(loan.id, 'return')}
                              disabled={!!loading}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium"
                              style={{ background: 'rgba(79,156,249,0.15)', color: '#93c5fd' }}
                            >
                              {loading === loan.id + 'return' ? '...' : '↩ Kembalikan'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs" style={{ color: '#8899BB' }}>
            Menampilkan {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} dari {filtered.length} pinjaman
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
              style={{ background: '#162236', color: '#8899BB', border: '1px solid #1E2E45' }}
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce<(number | string)[]>((acc, p, idx, arr) => {
                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('…')
                acc.push(p)
                return acc
              }, [])
              .map((p, idx) =>
                typeof p === 'string' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 py-1.5 text-xs" style={{ color: '#8899BB' }}>…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: currentPage === p ? 'rgba(79,156,249,0.2)' : '#162236',
                      color: currentPage === p ? '#4F9CF9' : '#8899BB',
                      border: currentPage === p ? '1px solid rgba(79,156,249,0.4)' : '1px solid #1E2E45',
                    }}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
              style={{ background: '#162236', color: '#8899BB', border: '1px solid #1E2E45' }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </>
  )
}
