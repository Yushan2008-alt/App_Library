import { createClient } from '@/lib/supabase/server'
import { getServerUser } from '@/lib/auth'
import { formatRupiah, formatDate } from '@/lib/utils'
import Link from 'next/link'
import QuickActions from './QuickActions'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [user, supabase] = await Promise.all([getServerUser(), createClient()])

  let totalBooks = 0, totalUsers = 0, activeLoans = 0, pendingRequests = 0, overdueLoans = 0, totalFine = 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recentLoans: any[] = []

  try {
    const [booksRes, usersRes, activeRes, pendingRes, overdueRes, finesRes, recentRes] = await Promise.all([
      supabase.from('Book').select('*', { count: 'exact', head: true }),
      supabase.from('User').select('*', { count: 'exact', head: true }).eq('role', 'USER'),
      supabase.from('Loan').select('*', { count: 'exact', head: true }).eq('status', 'APPROVED'),
      supabase.from('Loan').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
      supabase.from('Loan').select('*', { count: 'exact', head: true }).eq('status', 'APPROVED').lt('dueDate', new Date().toISOString()),
      supabase.from('Loan').select('fine').eq('status', 'RETURNED'),
      supabase.from('Loan').select('id, status, requestedAt, user:User!Loan_userId_fkey(name), book:Book!Loan_bookId_fkey(title)').order('requestedAt', { ascending: false }).limit(5),
    ])
    totalBooks = booksRes.count ?? 0
    totalUsers = usersRes.count ?? 0
    activeLoans = activeRes.count ?? 0
    pendingRequests = pendingRes.count ?? 0
    overdueLoans = overdueRes.count ?? 0
    totalFine = (finesRes.data ?? []).reduce((sum: number, l: { fine: number }) => sum + (l.fine ?? 0), 0)
    recentLoans = recentRes.data ?? []
  } catch (e) {
    console.error('[admin/dashboard] DB error:', e)
  }

  const stats = [
    { label: 'Total Buku', value: totalBooks, icon: '📚', color: '#4F9CF9', bg: 'rgba(79,156,249,0.12)' },
    { label: 'Total Pengguna', value: totalUsers, icon: '👥', color: '#7B5EA7', bg: 'rgba(123,94,167,0.12)' },
    { label: 'Pinjaman Aktif', value: activeLoans, icon: '📖', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'Menunggu Approval', value: pendingRequests, icon: '⏳', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { label: 'Terlambat', value: overdueLoans, icon: '⚠️', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    { label: 'Total Denda', value: formatRupiah(totalFine), icon: '💰', color: '#4F9CF9', bg: 'rgba(79,156,249,0.12)' },
  ]

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    PENDING:  { bg: 'rgba(245,158,11,0.15)',  text: '#fbbf24', label: 'Menunggu' },
    APPROVED: { bg: 'rgba(16,185,129,0.15)',  text: '#34d399', label: 'Disetujui' },
    REJECTED: { bg: 'rgba(239,68,68,0.15)',   text: '#fca5a5', label: 'Ditolak' },
    RETURNED: { bg: 'rgba(79,156,249,0.15)',  text: '#93c5fd', label: 'Dikembalikan' },
  }

  return (
    <div className="px-4 py-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#F0F4FF' }}>
          Selamat datang, {user?.name} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: '#8899BB' }}>Berikut ringkasan aktivitas perpustakaan hari ini</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <div className="px-2 py-1 rounded-lg text-xs" style={{ background: stat.bg, color: stat.color }}>Live</div>
            </div>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs mt-1" style={{ color: '#8899BB' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="font-semibold text-sm" style={{ color: '#F0F4FF' }}>Pinjaman Terbaru</h2>
            <Link href="/admin/loans" className="text-xs hover:underline" style={{ color: '#4F9CF9' }}>Lihat semua</Link>
          </div>
          <div>
            {recentLoans.length === 0 ? (
              <p className="px-5 py-6 text-sm text-center" style={{ color: '#8899BB' }}>Belum ada pinjaman</p>
            ) : (
              recentLoans.map((loan) => {
                const s = statusColors[loan.status] ?? statusColors.PENDING
                return (
                  <div key={loan.id} className="px-5 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'rgba(79,156,249,0.18)', color: '#4F9CF9' }}>
                      {loan.user?.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: '#F0F4FF' }}>{loan.book?.title}</p>
                      <p className="text-xs" style={{ color: '#8899BB' }}>{loan.user?.name} · {formatDate(loan.requestedAt)}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs flex-shrink-0" style={{ background: s.bg, color: s.text }}>{s.label}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold text-sm mb-4" style={{ color: '#F0F4FF' }}>Aksi Cepat</h2>
          <QuickActions pendingRequests={pendingRequests} />
        </div>
      </div>
    </div>
  )
}
