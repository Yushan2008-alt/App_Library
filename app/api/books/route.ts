import { getServerUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { fetchOgImageFromUrl } from '@/lib/og-fetch'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') ?? ''
  const category = searchParams.get('category') ?? ''
  const page = Number(searchParams.get('page') ?? 1)
  const limit = Number(searchParams.get('limit') ?? 12)

  const supabase = await createClient()

  let categoryId: string | null = null
  if (category) {
    const { data: cat } = await supabase.from('Category').select('id').eq('slug', category).single()
    categoryId = cat?.id ?? null
  }

  let query = supabase
    .from('Book')
    .select('id, title, author, description, coverImage, externalUrl, stock, categoryId, createdAt, category:Category!Book_categoryId_fkey(id, name, slug)', { count: 'exact' })
    .order('createdAt', { ascending: false })

  if (search) query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`)
  if (categoryId) query = query.eq('categoryId', categoryId)

  const { data: books, count } = await query.range((page - 1) * limit, page * limit - 1)

  return Response.json({ books: books ?? [], total: count ?? 0, page, limit })
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

    const supabase = await createClient()
    let coverImage: string | null = coverImageUrl || null

    // Server-side OG fallback: if no cover provided but externalUrl exists, auto-fetch
    if (!coverImage && !coverFile && externalUrl) {
      coverImage = await fetchOgImageFromUrl(externalUrl)
    }

    if (coverFile && coverFile.size > 0) {
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

    const { data: book, error } = await supabase
      .from('Book')
      .insert({ id: crypto.randomUUID(), title, author, description, externalUrl: externalUrl || null, stock, categoryId, coverImage })
      .select('id, title, author, description, coverImage, externalUrl, stock, categoryId, category:Category!Book_categoryId_fkey(id, name, slug)')
      .single()

    if (error) {
      console.error('[POST /api/books] insert error:', error)
      return Response.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
    }

    return Response.json({ book }, { status: 201 })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
