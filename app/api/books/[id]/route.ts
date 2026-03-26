import { prisma } from '@/lib/prisma'
import { getServerUser } from '@/lib/auth'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/** Extract storage path from a Supabase Storage public URL */
function extractStoragePath(url: string, bucket: string): string | null {
  try {
    const marker = `/storage/v1/object/public/${bucket}/`
    const idx = url.indexOf(marker)
    if (idx === -1) return null
    // Strip query string (cache-buster)
    return url.slice(idx + marker.length).split('?')[0]
  } catch {
    return null
  }
}

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
  const user = await getServerUser()
  if (!user || user.role !== 'ADMIN') {
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
    const coverImageUrl = formData.get('coverImageUrl') as string | null

    if (isNaN(stock) || stock < 0) {
      return Response.json({ error: 'Stok tidak valid' }, { status: 400 })
    }

    const existing = await prisma.book.findUnique({ where: { id } })
    if (!existing) return Response.json({ error: 'Buku tidak ditemukan' }, { status: 404 })

    let coverImage = coverImageUrl !== null ? (coverImageUrl || null) : existing.coverImage

    if (coverFile && coverFile.size > 0) {
      const supabase = await createClient()
      const ext = coverFile.name.split('.').pop()?.toLowerCase() || 'jpg'
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const bytes = await coverFile.arrayBuffer()
      const { error: uploadError } = await supabase.storage
        .from('book-covers')
        .upload(filename, bytes, { contentType: coverFile.type, upsert: false })

      if (uploadError) {
        console.error('Cover upload error:', uploadError)
        return Response.json({ error: 'Gagal mengupload cover buku.' }, { status: 500 })
      }

      // Hapus cover lama dari Supabase Storage (jika ada)
      if (existing.coverImage) {
        const oldPath = extractStoragePath(existing.coverImage, 'book-covers')
        if (oldPath) {
          await supabase.storage.from('book-covers').remove([oldPath]).catch(() => {})
        }
      }

      const { data: urlData } = supabase.storage.from('book-covers').getPublicUrl(filename)
      coverImage = urlData.publicUrl
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
  const user = await getServerUser()
  if (!user || user.role !== 'ADMIN') {
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

  // Hapus cover dari Supabase Storage jika ada
  if (existing.coverImage) {
    const oldPath = extractStoragePath(existing.coverImage, 'book-covers')
    if (oldPath) {
      const supabase = await createClient()
      await supabase.storage.from('book-covers').remove([oldPath]).catch(() => {})
    }
  }

  await prisma.book.delete({ where: { id } })
  return Response.json({ success: true })
}
