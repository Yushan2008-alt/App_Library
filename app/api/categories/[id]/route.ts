import { prisma } from '@/lib/prisma'
import { getServerUser } from '@/lib/auth'
import { NextRequest } from 'next/server'

export async function PUT(request: NextRequest, ctx: RouteContext<'/api/categories/[id]'>) {
  const user = await getServerUser()
  if (!user || user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await ctx.params
  const { name } = await request.json()
  if (!name) return Response.json({ error: 'Nama wajib diisi' }, { status: 400 })

  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const category = await prisma.category.update({ where: { id }, data: { name, slug } })
  return Response.json({ category })
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/categories/[id]'>) {
  const user = await getServerUser()
  if (!user || user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await ctx.params
  const bookCount = await prisma.book.count({ where: { categoryId: id } })
  if (bookCount > 0) {
    return Response.json({ error: 'Kategori masih memiliki buku' }, { status: 400 })
  }

  await prisma.category.delete({ where: { id } })
  return Response.json({ success: true })
}
