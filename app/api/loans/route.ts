import { getServerUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { createNotificationsForAdmins } from '@/lib/notifications'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const user = await getServerUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const page = Number(searchParams.get('page') ?? 1)
  const limit = Number(searchParams.get('limit') ?? 20)

  const supabase = await createClient()
  let query = supabase
    .from('Loan')
    .select(
      'id, status, fine, requestedAt, approvedAt, dueDate, returnedAt, user:User!Loan_userId_fkey(id, name, email), book:Book!Loan_bookId_fkey(id, title, author, category:Category!Book_categoryId_fkey(id, name, slug))',
      { count: 'exact' }
    )
    .order('requestedAt', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (user.role !== 'ADMIN') query = query.eq('userId', user.id)
  if (status) query = query.eq('status', status)

  const { data: loans, count } = await query
  return Response.json({ loans: loans ?? [], total: count ?? 0, page, limit })
}

export async function POST(request: NextRequest) {
  const user = await getServerUser()
  if (!user || user.role !== 'USER') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { bookId } = await request.json()
  if (!bookId) return Response.json({ error: 'bookId wajib diisi' }, { status: 400 })

  const supabase = await createClient()

  const { data: book } = await supabase.from('Book').select('id, title, stock').eq('id', bookId).single()
  if (!book) return Response.json({ error: 'Buku tidak ditemukan' }, { status: 404 })
  if (book.stock <= 0) return Response.json({ error: 'Stok buku habis' }, { status: 400 })

  const { data: existing } = await supabase
    .from('Loan')
    .select('id')
    .eq('userId', user.id)
    .eq('bookId', bookId)
    .in('status', ['PENDING', 'APPROVED'])
    .maybeSingle()
  if (existing) return Response.json({ error: 'Kamu sudah meminjam buku ini' }, { status: 400 })

  const { data: loan, error } = await supabase
    .from('Loan')
    .insert({ id: crypto.randomUUID(), userId: user.id, bookId })
    .select('id, status, requestedAt, book:Book!Loan_bookId_fkey(id, title), user:User!Loan_userId_fkey(id, name)')
    .single()

  if (error) {
    console.error('[POST /api/loans] insert error:', error)
    return Response.json({ error: 'Gagal membuat pinjaman' }, { status: 500 })
  }

  await createNotificationsForAdmins(
    `Permintaan pinjam baru: "${book.title}" oleh ${user.name}`
  )

  return Response.json({ loan }, { status: 201 })
}
