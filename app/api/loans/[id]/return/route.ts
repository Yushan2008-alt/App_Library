import { getServerUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'
import { calculateFine, formatRupiah } from '@/lib/utils'
import { NextRequest } from 'next/server'

export async function PATCH(_req: NextRequest, ctx: RouteContext<'/api/loans/[id]/return'>) {
  const user = await getServerUser()
  if (!user || user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await ctx.params
  const supabase = await createClient()

  const { data: loan } = await supabase
    .from('Loan')
    .select('id, status, bookId, dueDate, userId, book:Book!Loan_bookId_fkey(id, title, stock), user:User!Loan_userId_fkey(id)')
    .eq('id', id)
    .single()

  if (!loan) return Response.json({ error: 'Pinjaman tidak ditemukan' }, { status: 404 })
  if (loan.status !== 'APPROVED') {
    return Response.json({ error: 'Pinjaman tidak dalam status APPROVED' }, { status: 400 })
  }

  const returnedAt = new Date()
  const fine = loan.dueDate ? calculateFine(new Date(loan.dueDate), returnedAt) : 0

  const { error: loanErr } = await supabase
    .from('Loan')
    .update({ status: 'RETURNED', returnedAt: returnedAt.toISOString(), fine })
    .eq('id', id)

  if (loanErr) return Response.json({ error: 'Gagal memproses pengembalian' }, { status: 500 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const book = loan.book as any
  await supabase.from('Book').update({ stock: book.stock + 1 }).eq('id', loan.bookId)

  if (fine > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const loanUser = loan.user as any
    await createNotification(
      loanUser.id,
      `Pengembalian terlambat: "${book.title}". Denda: ${formatRupiah(fine)}`
    )
  }

  const { data: updatedLoan } = await supabase
    .from('Loan')
    .select('id, status, returnedAt, fine, book:Book!Loan_bookId_fkey(id, title)')
    .eq('id', id)
    .single()

  return Response.json({ loan: updatedLoan, fine })
}
