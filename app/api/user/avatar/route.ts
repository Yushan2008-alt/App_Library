import { getServerUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

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
    return NextResponse.json({ error: 'Format tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.' }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Ukuran file maksimal 5MB.' }, { status: 400 })
  }

  const ext = file.type.split('/')[1].replace('jpeg', 'jpg')
  const filename = `${user.id}.${ext}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
  const filepath = path.join(uploadDir, filename)

  // Delete old avatar file if it's a locally uploaded one (different extension)
  if (user.avatarUrl?.startsWith('/uploads/avatars/')) {
    const oldFilename = path.basename(user.avatarUrl)
    const oldPath = path.join(uploadDir, oldFilename)
    if (oldFilename !== filename && existsSync(oldPath)) {
      await unlink(oldPath).catch(() => {})
    }
  }

  const bytes = await file.arrayBuffer()
  await writeFile(filepath, Buffer.from(bytes))

  const avatarUrl = `/uploads/avatars/${filename}`
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { avatarUrl },
  })

  return NextResponse.json({ avatarUrl: updated.avatarUrl })
}
