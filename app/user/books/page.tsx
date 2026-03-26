import { createClient } from '@/lib/supabase/server'
import BooksClient from './BooksClient'

export const dynamic = 'force-dynamic'

export default async function UserBooksPage() {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let books: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let categories: any[] = []

  try {
    const [booksRes, catsRes] = await Promise.all([
      supabase.from('Book').select('id, title, author, description, coverImage, stock, externalUrl, category:Category!Book_categoryId_fkey(id, name, slug)').order('createdAt', { ascending: false }),
      supabase.from('Category').select('id, name, slug').order('name', { ascending: true }),
    ])
    books = booksRes.data ?? []
    categories = catsRes.data ?? []
  } catch (e) {
    console.error('[user/books] DB error:', e)
  }

  return <BooksClient initialBooks={books} categories={categories} />
}
