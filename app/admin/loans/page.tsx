import { createClient } from '@/lib/supabase/server'
import AdminLoansClient from './AdminLoansClient'

export const dynamic = 'force-dynamic'

export default async function AdminLoansPage() {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let loans: any[] = []

  try {
    const { data } = await supabase
      .from('Loan')
      .select('id, status, fine, requestedAt, approvedAt, dueDate, returnedAt, user:User!Loan_userId_fkey(id, name, email), book:Book!Loan_bookId_fkey(id, title, author, category:Category!Book_categoryId_fkey(id, name, slug))')
      .order('requestedAt', { ascending: false })
    loans = data ?? []
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
