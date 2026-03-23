import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest } from 'next/server'

export async function GET() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { books: true } } },
    orderBy: { name: 'asc' },
  })
  return Response.json({ categories })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name } = await request.json()
  if (!name) return Response.json({ error: 'Nama kategori wajib diisi' }, { status: 400 })

  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const existing = await prisma.category.findUnique({ where: { slug } })
  if (existing) return Response.json({ error: 'Kategori sudah ada' }, { status: 400 })

  const category = await prisma.category.create({ data: { name, slug } })
  return Response.json({ category }, { status: 201 })
}
