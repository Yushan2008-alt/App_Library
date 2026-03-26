import { prisma } from '@/lib/prisma'
import { getServerUser } from '@/lib/auth'
import { notFound } from 'next/navigation'
import BookDetailClient from './BookDetailClient'

export default async function BookDetailPage(props: PageProps<'/user/books/[id]'>) {
  const { id } = await props.params
  const user = await getServerUser()

  const [book, existingLoan] = await Promise.all([
    prisma.book.findUnique({ where: { id }, include: { category: true } }),
    prisma.loan.findFirst({
      where: { userId: user!.id, bookId: id, status: { in: ['PENDING', 'APPROVED'] } },
    }),
  ])

  if (!book) notFound()

  return <BookDetailClient book={book} existingLoan={existingLoan} />
}
