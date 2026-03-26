import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { redirect } from 'next/navigation'

const STATUS = {
  PENDING:  { bg: 'rgba(245,158,11,0.15)',  text: '#fbbf24', label: 'Menunggu' },
  APPROVED: { bg: 'rgba(16,185,129,0.15)',  text: '#34d399', label: 'Disetujui' },
  REJECTED: { bg: 'rgba(239,68,68,0.15)',   text: '#fca5a5', label: 'Ditolak' },
  RETURNED: { bg: 'rgba(79,156,249,0.15)',  text: '#93c5fd', label: 'Dikembalikan' },
}

export default async function UserDashboard() {
  // Use Supabase directly (fast cookie read, no DB) — layout already ran getServerUser()
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')
  const userId = authUser.id
  const displayName = authUser.user_metadata?.full_name ?? authUser.user_metadata?.name ?? authUser.email?.split('@')[0] ?? 'User'

  let loans: Awaited<ReturnType<typeof prisma.loan.findMany>> = []
  let notifications: Awaited<ReturnType<typeof prisma.notification.findMany>> = []

  try {
    ;[loans, notifications] = await Promise.all([
      prisma.loan.findMany({
        where: { userId, status: { in: ['PENDING', 'APPROVED'] } },
        include: { book: { select: { title: true, author: true } } },
        orderBy: { requestedAt: 'desc' },
      }),
      prisma.notification.findMany({
        where: { userId, isRead: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])
  } catch (e) {
    console.error('[dashboard] DB error:', e)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#F0F4FF' }}>Halo, {displayName} 👋</h1>
        <p className="text-sm mt-1" style={{ color: '#8899BB' }}>Selamat datang di perpustakaan digital</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Pinjaman Aktif', value: loans.filter((l) => l.status === 'APPROVED').length, color: '#4F9CF9' },
          { label: 'Menunggu Approval', value: loans.filter((l) => l.status === 'PENDING').length, color: '#f59e0b' },
          { label: 'Notif Belum Dibaca', value: notifications.length, color: '#7B5EA7' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border p-5" style={{ background: '#162236', borderColor: '#1E2E45' }}>
            <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-sm mt-1" style={{ color: '#8899BB' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Loans */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: '#162236', borderColor: '#1E2E45' }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: '#1E2E45' }}>
            <h2 className="font-semibold text-sm" style={{ color: '#F0F4FF' }}>Pinjaman Saya</h2>
            <Link href="/user/loans" className="text-xs hover:underline" style={{ color: '#4F9CF9' }}>Lihat semua</Link>
          </div>
          {loans.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm mb-3" style={{ color: '#8899BB' }}>Belum ada pinjaman aktif</p>
              <Link href="/user/books" className="px-4 py-2 rounded-full text-sm font-medium" style={{ background: 'rgba(79,156,249,0.15)', color: '#4F9CF9' }}>
                Cari Buku
              </Link>
            </div>
          ) : (
            loans.map((loan) => {
              const s = STATUS[loan.status as keyof typeof STATUS] ?? STATUS.PENDING
              const isOverdue = loan.status === 'APPROVED' && loan.dueDate && new Date(loan.dueDate) < new Date()
              return (
                <div key={loan.id} className="px-5 py-3.5 border-b" style={{ borderColor: '#1E2E45' }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#F0F4FF' }}>{loan.book.title}</p>
                      <p className="text-xs" style={{ color: '#8899BB' }}>{loan.book.author}</p>
                      {loan.dueDate && (
                        <p className="text-xs mt-0.5" style={{ color: isOverdue ? '#fca5a5' : '#8899BB' }}>
                          Jatuh tempo: {formatDate(loan.dueDate)} {isOverdue && '⚠️ Terlambat!'}
                        </p>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs flex-shrink-0" style={{ background: s.bg, color: s.text }}>{s.label}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Notifications */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: '#162236', borderColor: '#1E2E45' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: '#1E2E45' }}>
            <h2 className="font-semibold text-sm" style={{ color: '#F0F4FF' }}>Notifikasi Terbaru</h2>
          </div>
          {notifications.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm" style={{ color: '#8899BB' }}>Semua notifikasi sudah dibaca</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="px-5 py-3.5 border-b flex gap-2.5 items-start" style={{ borderColor: '#1E2E45' }}>
                <div className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#4F9CF9' }} />
                <div>
                  <p className="text-xs leading-relaxed" style={{ color: '#F0F4FF' }}>{n.message}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#8899BB' }}>{formatDate(n.createdAt)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
