import { getServerUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDate, formatRupiah } from '@/lib/utils'

const STATUS = {
  PENDING:  { bg: 'rgba(245,158,11,0.15)',  text: '#fbbf24', label: 'Menunggu' },
  APPROVED: { bg: 'rgba(16,185,129,0.15)',  text: '#34d399', label: 'Disetujui' },
  REJECTED: { bg: 'rgba(239,68,68,0.15)',   text: '#fca5a5', label: 'Ditolak' },
  RETURNED: { bg: 'rgba(79,156,249,0.15)',  text: '#93c5fd', label: 'Dikembalikan' },
}

export const dynamic = 'force-dynamic'

export default async function UserLoansPage() {
  const user = await getServerUser()

  let loans: Awaited<ReturnType<typeof prisma.loan.findMany<{ include: { book: { include: { category: true } } } }>>> = []
  try {
    loans = await prisma.loan.findMany({
      where: { userId: user!.id },
      include: { book: { include: { category: true } } },
      orderBy: { requestedAt: 'desc' },
    })
  } catch (e) {
    console.error('[user/loans] DB error:', e)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#F0F4FF' }}>Riwayat Pinjaman</h1>
        <p className="text-sm mt-1" style={{ color: '#8899BB' }}>{loans.length} total pinjaman</p>
      </div>

      {loans.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ background: '#162236', borderColor: '#1E2E45' }}>
          <span className="text-4xl">📖</span>
          <p className="mt-3 text-sm" style={{ color: '#8899BB' }}>Kamu belum pernah meminjam buku</p>
        </div>
      ) : (
        <div className="space-y-3">
          {loans.map((loan) => {
            const s = STATUS[loan.status as keyof typeof STATUS] ?? STATUS.PENDING
            const isOverdue = loan.status === 'APPROVED' && loan.dueDate && new Date(loan.dueDate) < new Date()
            return (
              <div key={loan.id} className="rounded-2xl border p-5" style={{ background: '#162236', borderColor: '#1E2E45' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(79,156,249,0.15)', color: '#4F9CF9' }}>
                        {loan.book.category.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: s.bg, color: s.text }}>{s.label}</span>
                    </div>
                    <h3 className="font-semibold" style={{ color: '#F0F4FF' }}>{loan.book.title}</h3>
                    <p className="text-sm" style={{ color: '#8899BB' }}>{loan.book.author}</p>
                    <div className="flex gap-4 mt-2 text-xs" style={{ color: '#8899BB' }}>
                      <span>Dipinjam: {formatDate(loan.requestedAt)}</span>
                      {loan.dueDate && (
                        <span style={{ color: isOverdue ? '#fca5a5' : '#8899BB' }}>
                          Jatuh tempo: {formatDate(loan.dueDate)} {isOverdue && '⚠️'}
                        </span>
                      )}
                      {loan.returnedAt && <span>Dikembalikan: {formatDate(loan.returnedAt)}</span>}
                    </div>
                  </div>
                  {loan.fine > 0 && (
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold" style={{ color: '#f59e0b' }}>{formatRupiah(loan.fine)}</p>
                      <p className="text-xs" style={{ color: '#8899BB' }}>Denda keterlambatan</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
