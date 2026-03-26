import { prisma } from '@/lib/prisma'
import BooksClient from './BooksClient'

export const dynamic = 'force-dynamic'

export default async function UserBooksPage() {
  let books: Awaited<ReturnType<typeof prisma.book.findMany<{ include: { category: true } }>>> = []
  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = []
  try {
    ;[books, categories] = await Promise.all([
      prisma.book.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } }),
      prisma.category.findMany({ orderBy: { name: 'asc' } }),
    ])
  } catch (e) {
    console.error('[user/books] DB error:', e)
  }

  return <BooksClient initialBooks={books} categories={categories} />
}
