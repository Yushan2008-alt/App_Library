import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notFound } from 'next/navigation'
import BookDetailClient from './BookDetailClient'

export default async function BookDetailPage(props: PageProps<'/user/books/[id]'>) {
  const { id } = await props.params
  const session = await getServerSession(authOptions)

  const [book, existingLoan] = await Promise.all([
    prisma.book.findUnique({ where: { id }, include: { category: true } }),
    prisma.loan.findFirst({
      where: { userId: session!.user.id, bookId: id, status: { in: ['PENDING', 'APPROVED'] } },
    }),
  ])

  if (!book) notFound()

  return <BookDetailClient book={book} existingLoan={existingLoan} />
}
