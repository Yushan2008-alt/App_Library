import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import BookForm from '../../BookForm'

export default async function EditBookPage(props: PageProps<'/admin/books/[id]/edit'>) {
  const { id } = await props.params
  let book: Awaited<ReturnType<typeof prisma.book.findUnique>> = null
  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = []
  try {
    ;[book, categories] = await Promise.all([
      prisma.book.findUnique({ where: { id } }),
      prisma.category.findMany({ orderBy: { name: 'asc' } }),
    ])
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
