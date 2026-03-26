import { getServerUser } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { firstName, lastName, username } = await request.json()

  const name = [firstName, lastName].filter(Boolean).join(' ').trim() || user.name
  const trimmedUsername = username?.trim() || null

  const supabase = createServiceClient()

  if (trimmedUsername && trimmedUsername !== user.username) {
    const { data: existing } = await supabase
      .from('User')
      .select('id')
      .eq('username', trimmedUsername)
      .maybeSingle()
    if (existing) return NextResponse.json({ error: 'Username sudah digunakan.' }, { status: 409 })
  }

  const { data: updated, error } = await supabase
    .from('User')
    .update({ name, username: trimmedUsername })
    .eq('id', user.id)
    .select('name, username')
    .single()

  if (error) return NextResponse.json({ error: 'Gagal memperbarui profil' }, { status: 500 })
  return NextResponse.json({ name: updated.name, username: updated.username })
}
