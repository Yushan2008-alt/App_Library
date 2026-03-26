import { prisma } from '@/lib/prisma'
import { getServerUser } from '@/lib/auth'
import { notFound } from 'next/navigation'
import BookDetailClient from './BookDetailClient'

export default async function BookDetailPage(props: PageProps<'/user/books/[id]'>) {
  const { id } = await props.params
  const user = await getServerUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let book: any = null
  let existingLoan: Awaited<ReturnType<typeof prisma.loan.findFirst>> = null
  try {
    ;[book, existingLoan] = await Promise.all([
      prisma.book.findUnique({ where: { id }, include: { category: true } }),
      prisma.loan.findFirst({
        where: { userId: user!.id, bookId: id, status: { in: ['PENDING', 'APPROVED'] } },
      }),
    ])
  } catch (e) {
    console.error('[user/books/id] DB error:', e)
  }

  if (!book) notFound()

  return <BookDetailClient book={book} existingLoan={existingLoan} />
}
