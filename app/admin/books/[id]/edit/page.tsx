import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BookForm from '../../BookForm'

export const dynamic = 'force-dynamic'

export default async function EditBookPage(props: PageProps<'/admin/books/[id]/edit'>) {
  const { id } = await props.params
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let book: any = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let categories: any[] = []

  try {
    const [bookRes, catsRes] = await Promise.all([
      supabase.from('Book').select('id, title, author, description, externalUrl, stock, categoryId, coverImage').eq('id', id).single(),
      supabase.from('Category').select('id, name, slug').order('name', { ascending: true }),
    ])
    book = bookRes.data
    categories = catsRes.data ?? []
  } catch (e) {
    console.error('[admin/books/edit] DB error:', e)
  }

  if (!book) notFound()

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#F0F4FF' }}>Edit Buku</h1>
        <p className="text-sm mt-1" style={{ color: '#8899BB' }}>{book.title}</p>
      </div>
      <BookForm
        categories={categories}
        initialData={{
          title: book.title,
          author: book.author,
          description: book.description,
          externalUrl: book.externalUrl ?? '',
          stock: book.stock,
          categoryId: book.categoryId,
          coverImage: book.coverImage,
        }}
        bookId={id}
      />
    </div>
  )
}
