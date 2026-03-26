import { prisma } from '@/lib/prisma'
import BooksClient from './BooksClient'

export const dynamic = 'force-dynamic'

export default async function UserBooksPage() {
  let books: Awaited<ReturnType<typeof prisma.book.findMany<{ include: { category: true } }>>> = []
  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = []
  let dbError: string | null = null
  try {
    ;[books, categories] = await Promise.all([
      prisma.book.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } }),
      prisma.category.findMany({ orderBy: { name: 'asc' } }),
    ])
  } catch (e) {
    dbError = String(e).slice(0, 300)
    console.error('[user/books] DB error:', e)
  }

  if (dbError) {
    return (
      <div className="p-8">
        <p className="text-sm font-mono p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
          DB Error: {dbError}
        </p>
      </div>
    )
  }

  return <BooksClient initialBooks={books} categories={categories} />
}
