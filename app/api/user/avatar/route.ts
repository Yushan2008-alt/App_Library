import { getServerUser } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('avatar') as File | null

  if (!file || file.size === 0) {
    return NextResponse.json({ error: 'File tidak ditemukan.' }, { status: 400 })
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: 'Format tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.' },
      { status: 400 }
    )
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Ukuran file maksimal 5MB.' }, { status: 400 })
  }

  const ext = file.type.split('/')[1].replace('jpeg', 'jpg')
  const filename = `${user.id}.${ext}`

  const bytes = await file.arrayBuffer()
  const supabase = await createClient()

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filename, bytes, { contentType: file.type, upsert: true })

  if (uploadError) {
    console.error('Storage upload error:', uploadError)
    return NextResponse.json({ error: 'Gagal mengupload foto profil.' }, { status: 500 })
  }

  const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filename)
  const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`

  const service = createServiceClient()
  const { data: updated, error } = await service
    .from('User')
    .update({ avatarUrl })
    .eq('id', user.id)
    .select('avatarUrl')
    .single()

  if (error) return NextResponse.json({ error: 'Gagal menyimpan URL avatar.' }, { status: 500 })
  return NextResponse.json({ avatarUrl: updated.avatarUrl })
}
