import { getServerUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const user = await getServerUser()
  if (!user || user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const now = new Date().toISOString()

  const [booksRes, usersRes, activeLoansRes, pendingRes, overdueRes, finesRes] = await Promise.all([
    supabase.from('Book').select('*', { count: 'exact', head: true }),
    supabase.from('User').select('*', { count: 'exact', head: true }).eq('role', 'USER'),
    supabase.from('Loan').select('*', { count: 'exact', head: true }).eq('status', 'APPROVED'),
    supabase.from('Loan').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
    supabase.from('Loan').select('*', { count: 'exact', head: true }).eq('status', 'APPROVED').lt('dueDate', now),
    supabase.from('Loan').select('fine').eq('status', 'RETURNED'),
  ])

  const totalFinesCollected = (finesRes.data ?? []).reduce(
    (sum: number, l: { fine: number }) => sum + (l.fine ?? 0),
    0
  )

  return Response.json({
    totalBooks: booksRes.count ?? 0,
    totalUsers: usersRes.count ?? 0,
    activeLoans: activeLoansRes.count ?? 0,
    pendingRequests: pendingRes.count ?? 0,
    overdueLoans: overdueRes.count ?? 0,
    totalFinesCollected,
  })
}
