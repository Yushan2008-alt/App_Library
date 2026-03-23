import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import path from 'path'

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/books/[id]'>) {
  const { id } = await ctx.params
  const book = await prisma.book.findUnique({
    where: { id },
    include: { category: true },
  })
  if (!book) return Response.json({ error: 'Buku tidak ditemukan' }, { status: 404 })
  return Response.json({ book })
}

export async function PUT(request: NextRequest, ctx: RouteContext<'/api/books/[id]'>) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await ctx.params

  try {
    const formData = await request.formData()
    const title = formData.get('title') as string
    const author = formData.get('author') as string
    const description = formData.get('description') as string
    const externalUrl = formData.get('externalUrl') as string
    const stock = Number(formData.get('stock') ?? 1)
    const categoryId = formData.get('categoryId') as string
    const coverFile = formData.get('cover') as File | null

    const existing = await prisma.book.findUnique({ where: { id } })
    if (!existing) return Response.json({ error: 'Buku tidak ditemukan' }, { status: 404 })

    let coverImage = existing.coverImage
    if (coverFile && coverFile.size > 0) {
      const bytes = await coverFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const filename = `${Date.now()}-${coverFile.name.replace(/\s/g, '_')}`
      const uploadPath = path.join(process.cwd(), 'public', 'uploads', filename)
      await writeFile(uploadPath, buffer)
      // Delete old cover
      if (existing.coverImage) {
        try {
          await unlink(path.join(process.cwd(), 'public', existing.coverImage))
        } catch {}
      }
      coverImage = `/uploads/${filename}`
    }

    const book = await prisma.book.update({
      where: { id },
      data: { title, author, description, externalUrl: externalUrl || null, stock, categoryId, coverImage },
      include: { category: true },
    })

    return Response.json({ book })
  } catch {
    return Response.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/books/[id]'>) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await ctx.params

  const existing = await prisma.book.findUnique({ where: { id } })
  if (!existing) return Response.json({ error: 'Buku tidak ditemukan' }, { status: 404 })

  const activeLoans = await prisma.loan.count({
    where: { bookId: id, status: { in: ['PENDING', 'APPROVED'] } },
  })
  if (activeLoans > 0) {
    return Response.json({ error: 'Buku masih memiliki pinjaman aktif' }, { status: 400 })
  }

  if (existing.coverImage) {
    try {
      await unlink(path.join(process.cwd(), 'public', existing.coverImage))
    } catch {}
  }

  await prisma.book.delete({ where: { id } })
  return Response.json({ success: true })
}
