import { prisma } from '@/lib/prisma'
import { getServerUser } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'
import { calculateFine, formatRupiah } from '@/lib/utils'
import { NextRequest } from 'next/server'

export async function PATCH(_req: NextRequest, ctx: RouteContext<'/api/loans/[id]/return'>) {
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
  if (loan.status !== 'APPROVED') {
    return Response.json({ error: 'Pinjaman tidak dalam status APPROVED' }, { status: 400 })
  }

  const returnedAt = new Date()
  const fine = loan.dueDate ? calculateFine(loan.dueDate, returnedAt) : 0

  const [updatedLoan] = await prisma.$transaction([
    prisma.loan.update({
      where: { id },
      data: { status: 'RETURNED', returnedAt, fine },
      include: { book: true },
    }),
    prisma.book.update({
      where: { id: loan.bookId },
      data: { stock: { increment: 1 } },
    }),
  ])

  if (fine > 0) {
    await createNotification(
      loan.user.id,
      `Pengembalian terlambat: "${loan.book.title}". Denda: ${formatRupiah(fine)}`
    )
  }

  return Response.json({ loan: updatedLoan, fine })
}
