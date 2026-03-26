import { prisma } from '@/lib/prisma'
import { getServerUser } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'
import { NextRequest } from 'next/server'

export async function PATCH(_req: NextRequest, ctx: RouteContext<'/api/loans/[id]/reject'>) {
  const user = await getServerUser()
  if (!user || user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await ctx.params

  const loan = await prisma.loan.findUnique({
    where: { id },
    include: { book: true, user: { select: { id: true } } },
  })

  if (!loan) return Response.json({ error: 'Pinjaman tidak ditemukan' }, { status: 404 })
  if (loan.status !== 'PENDING') {
    return Response.json({ error: 'Pinjaman tidak dalam status PENDING' }, { status: 400 })
  }

  const updatedLoan = await prisma.loan.update({
    where: { id },
    data: { status: 'REJECTED' },
    include: { book: true },
  })

  await createNotification(loan.user.id, `Pinjaman "${loan.book.title}" ditolak.`)

  return Response.json({ loan: updatedLoan })
}
