import { getServerUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'
import { addDays, formatDate } from '@/lib/utils'
import { NextRequest } from 'next/server'

export async function PATCH(_req: NextRequest, ctx: RouteContext<'/api/loans/[id]/approve'>) {
  const user = await getServerUser()
  if (!user || user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await ctx.params
  const supabase = await createClient()

  const { data: loan } = await supabase
    .from('Loan')
    .select('id, status, bookId, userId, book:Book!Loan_bookId_fkey(id, title, stock), user:User!Loan_userId_fkey(id, name)')
    .eq('id', id)
    .single()

  if (!loan) return Response.json({ error: 'Pinjaman tidak ditemukan' }, { status: 404 })
  if (loan.status !== 'PENDING') {
    return Response.json({ error: 'Pinjaman tidak dalam status PENDING' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const book = loan.book as any
  if (!book || book.stock <= 0) {
    return Response.json({ error: 'Stok buku habis' }, { status: 400 })
  }

  const dueDate = addDays(new Date(), 7)

  const { error: loanErr } = await supabase
    .from('Loan')
    .update({ status: 'APPROVED', approvedAt: new Date().toISOString(), dueDate: dueDate.toISOString() })
    .eq('id', id)

  if (loanErr) {
    console.error('[approve] loan update error:', loanErr)
    return Response.json({ error: 'Gagal menyetujui pinjaman' }, { status: 500 })
  }

  await supabase.from('Book').update({ stock: book.stock - 1 }).eq('id', loan.bookId)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loanUser = loan.user as any
  await createNotification(
    loanUser.id,
    `Pinjaman "${book.title}" disetujui. Jatuh tempo: ${formatDate(dueDate)}`
  )

  const { data: updatedLoan } = await supabase
    .from('Loan')
    .select('id, status, approvedAt, dueDate, book:Book!Loan_bookId_fkey(id, title), user:User!Loan_userId_fkey(id, name)')
    .eq('id', id)
    .single()

  return Response.json({ loan: updatedLoan })
}
