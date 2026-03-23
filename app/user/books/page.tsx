import { prisma } from '@/lib/prisma'
import BooksClient from './BooksClient'

export default async function UserBooksPage() {
  const [books, categories] = await Promise.all([
    prisma.book.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  return <BooksClient initialBooks={books} categories={categories} />
}
