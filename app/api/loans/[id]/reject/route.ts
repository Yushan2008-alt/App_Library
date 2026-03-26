import { getServerUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'
import { NextRequest } from 'next/server'

export async function PATCH(_req: NextRequest, ctx: RouteContext<'/api/loans/[id]/reject'>) {
  const user = await getServerUser()
  if (!user || user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await ctx.params
  const supabase = await createClient()

  const { data: loan } = await supabase
    .from('Loan')
    .select('id, status, userId, book:Book!Loan_bookId_fkey(id, title), user:User!Loan_userId_fkey(id)')
    .eq('id', id)
    .single()

  if (!loan) return Response.json({ error: 'Pinjaman tidak ditemukan' }, { status: 404 })
  if (loan.status !== 'PENDING') {
    return Response.json({ error: 'Pinjaman tidak dalam status PENDING' }, { status: 400 })
  }

  const { error } = await supabase.from('Loan').update({ status: 'REJECTED' }).eq('id', id)
  if (error) return Response.json({ error: 'Gagal menolak pinjaman' }, { status: 500 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const book = loan.book as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loanUser = loan.user as any
  await createNotification(loanUser.id, `Pinjaman "${book.title}" ditolak.`)

  const { data: updatedLoan } = await supabase
    .from('Loan')
    .select('id, status, book:Book!Loan_bookId_fkey(id, title)')
    .eq('id', id)
    .single()

  return Response.json({ loan: updatedLoan })
}
