import { prisma } from '@/lib/prisma'
import AdminLoansClient from './AdminLoansClient'

export const dynamic = 'force-dynamic'

export default async function AdminLoansPage() {
  let loans: Awaited<ReturnType<typeof prisma.loan.findMany<{ include: { user: { select: { id: true; name: true; email: true } }; book: { include: { category: true } } } }>>> = []
  try {
    loans = await prisma.loan.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        book: { include: { category: true } },
      },
      orderBy: { requestedAt: 'desc' },
    })
  } catch (e) {
    console.error('[admin/loans] DB error:', e)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#F0F4FF' }}>Manajemen Peminjaman</h1>
        <p className="text-sm mt-1" style={{ color: '#8899BB' }}>{loans.length} total pinjaman</p>
      </div>
      <AdminLoansClient initialLoans={loans} />
    </div>
  )
}
