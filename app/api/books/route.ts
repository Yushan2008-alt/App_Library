import { prisma } from '@/lib/prisma'
import { getServerUser } from '@/lib/auth'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') ?? ''
  const category = searchParams.get('category') ?? ''
  const page = Number(searchParams.get('page') ?? 1)
  const limit = Number(searchParams.get('limit') ?? 12)

  const where = {
    AND: [
      search
        ? {
            OR: [
              { title: { contains: search } },
              { author: { contains: search } },
            ],
          }
        : {},
      category ? { category: { slug: category } } : {},
    ],
  }

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      include: { category: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.book.count({ where }),
  ])

  return Response.json({ books, total, page, limit })
}

export async function POST(request: NextRequest) {
  const user = await getServerUser()
  if (!user || user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

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

    if (!title || !author || !description || !categoryId) {
      return Response.json({ error: 'Field wajib tidak lengkap' }, { status: 400 })
    }
    if (isNaN(stock) || stock < 0) {
      return Response.json({ error: 'Stok tidak valid' }, { status: 400 })
    }

    let coverImage: string | null = coverImageUrl || null

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

      const { data: urlData } = supabase.storage.from('book-covers').getPublicUrl(filename)
      coverImage = urlData.publicUrl
    }

    const book = await prisma.book.create({
      data: { title, author, description, externalUrl: externalUrl || null, stock, categoryId, coverImage },
      include: { category: true },
    })

    return Response.json({ book }, { status: 201 })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
