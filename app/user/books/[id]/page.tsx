import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BookDetailClient from './BookDetailClient'

export const dynamic = 'force-dynamic'

export default async function BookDetailPage(props: PageProps<'/user/books/[id]'>) {
  const { id } = await props.params
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let book: any = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let existingLoan: any = null

  try {
    const [bookRes, loanRes] = await Promise.all([
      supabase.from('Book').select('id, title, author, description, coverImage, externalUrl, stock, category:Category!Book_categoryId_fkey(id, name, slug)').eq('id', id).single(),
      authUser
        ? supabase.from('Loan').select('id, status').eq('userId', authUser.id).eq('bookId', id).in('status', ['PENDING', 'APPROVED']).maybeSingle()
        : Promise.resolve({ data: null }),
    ])
    book = bookRes.data
    existingLoan = loanRes.data ?? null
  } catch (e) {
    console.error('[user/books/id] DB error:', e)
  }

  if (!book) notFound()

  return <BookDetailClient book={book} existingLoan={existingLoan} />
}
