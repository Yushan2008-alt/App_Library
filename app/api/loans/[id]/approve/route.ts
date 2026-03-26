import { prisma } from '@/lib/prisma'
import { getServerUser } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'
import { addDays, formatDate } from '@/lib/utils'
import { NextRequest } from 'next/server'

export async function PATCH(_req: NextRequest, ctx: RouteContext<'/api/loans/[id]/approve'>) {
  const user = await getServerUser()
  if (!user || user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await ctx.params

  const loan = await prisma.loan.findUnique({
    where: { id },
    include: { book: true, user: { select: { id: true, name: true } } },
  })

  if (!loan) return Response.json({ error: 'Pinjaman tidak ditemukan' }, { status: 404 })
  if (loan.status !== 'PENDING') {
    return Response.json({ error: 'Pinjaman tidak dalam status PENDING' }, { status: 400 })
  }

  const dueDate = addDays(new Date(), 7)

  let updatedLoan
  try {
    ;[updatedLoan] = await prisma.$transaction(async (tx) => {
      const book = await tx.book.findUnique({ where: { id: loan.bookId } })
      if (!book || book.stock <= 0) {
        throw new Error('STOCK_EMPTY')
      }
      return Promise.all([
        tx.loan.update({
          where: { id },
          data: { status: 'APPROVED', approvedAt: new Date(), dueDate },
          include: { book: true, user: { select: { id: true, name: true } } },
        }),
        tx.book.update({
          where: { id: loan.bookId },
          data: { stock: { decrement: 1 } },
        }),
      ])
    })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'STOCK_EMPTY') {
      return Response.json({ error: 'Stok buku habis' }, { status: 400 })
    }
    throw err
  }

  await createNotification(
    loan.user.id,
    `Pinjaman "${loan.book.title}" disetujui. Jatuh tempo: ${formatDate(dueDate)}`
  )

  return Response.json({ loan: updatedLoan })
}
