import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [totalBooks, totalUsers, activeLoans, pendingRequests, overdueLoans, fineAggregate] =
    await Promise.all([
      prisma.book.count(),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.loan.count({ where: { status: 'APPROVED' } }),
      prisma.loan.count({ where: { status: 'PENDING' } }),
      prisma.loan.count({
        where: { status: 'APPROVED', dueDate: { lt: new Date() } },
      }),
      prisma.loan.aggregate({
        where: { status: 'RETURNED' },
        _sum: { fine: true },
      }),
    ])

  return Response.json({
    totalBooks,
    totalUsers,
    activeLoans,
    pendingRequests,
    overdueLoans,
    totalFinesCollected: fineAggregate._sum.fine ?? 0,
  })
}
