import { getServerUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
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
  const supabase = await createClient()

  const { data: category, error } = await supabase
    .from('Category')
    .update({ name, slug })
    .eq('id', id)
    .select('id, name, slug')
    .single()

  if (error) return Response.json({ error: 'Gagal memperbarui kategori' }, { status: 500 })
  return Response.json({ category })
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/categories/[id]'>) {
  const user = await getServerUser()
  if (!user || user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await ctx.params
  const supabase = await createClient()

  const { count: bookCount } = await supabase
    .from('Book')
    .select('*', { count: 'exact', head: true })
    .eq('categoryId', id)

  if (bookCount && bookCount > 0) {
    return Response.json({ error: 'Kategori masih memiliki buku' }, { status: 400 })
  }

  await supabase.from('Category').delete().eq('id', id)
  return Response.json({ success: true })
}
