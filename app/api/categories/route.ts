import { getServerUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('Category')
    .select('id, name, slug, books:Book!Book_categoryId_fkey(id)')
    .order('name', { ascending: true })

  const result = (categories ?? []).map((c) => ({
    ...c,
    _count: { books: Array.isArray(c.books) ? c.books.length : 0 },
    books: undefined,
  }))

  return Response.json({ categories: result })
}

export async function POST(request: NextRequest) {
  const user = await getServerUser()
  if (!user || user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name } = await request.json()
  if (!name) return Response.json({ error: 'Nama kategori wajib diisi' }, { status: 400 })

  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  if (!slug) return Response.json({ error: 'Nama kategori tidak valid' }, { status: 400 })

  const supabase = await createClient()

  const { data: existing } = await supabase.from('Category').select('id').eq('slug', slug).maybeSingle()
  if (existing) return Response.json({ error: 'Kategori sudah ada' }, { status: 400 })

  const { data: category, error } = await supabase
    .from('Category')
    .insert({ name, slug })
    .select('id, name, slug')
    .single()

  if (error) return Response.json({ error: 'Gagal membuat kategori' }, { status: 500 })
  return Response.json({ category }, { status: 201 })
}
