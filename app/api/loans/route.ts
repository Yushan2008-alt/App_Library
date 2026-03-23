import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createNotificationsForAdmins } from '@/lib/notifications'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const page = Number(searchParams.get('page') ?? 1)
  const limit = Number(searchParams.get('limit') ?? 20)

  const where: Record<string, unknown> =
    session.user.role === 'ADMIN'
      ? status ? { status } : {}
      : { userId: session.user.id, ...(status ? { status } : {}) }

  const [loans, total] = await Promise.all([
    prisma.loan.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        book: { include: { category: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { requestedAt: 'desc' },
    }),
    prisma.loan.count({ where }),
  ])

  return Response.json({ loans, total, page, limit })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'USER') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { bookId } = await request.json()
  if (!bookId) return Response.json({ error: 'bookId wajib diisi' }, { status: 400 })

  const book = await prisma.book.findUnique({ where: { id: bookId } })
  if (!book) return Response.json({ error: 'Buku tidak ditemukan' }, { status: 404 })
  if (book.stock <= 0) return Response.json({ error: 'Stok buku habis' }, { status: 400 })

  const existing = await prisma.loan.findFirst({
    where: {
      userId: session.user.id,
      bookId,
      status: { in: ['PENDING', 'APPROVED'] },
    },
  })
  if (existing) return Response.json({ error: 'Kamu sudah meminjam buku ini' }, { status: 400 })

  const loan = await prisma.loan.create({
    data: { userId: session.user.id, bookId },
    include: { book: true, user: { select: { name: true } } },
  })

  await createNotificationsForAdmins(
    `Permintaan pinjam baru: "${book.title}" oleh ${session.user.name}`
  )

  return Response.json({ loan }, { status: 201 })
}
