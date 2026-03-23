import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { token, newPassword } = await req.json()

  if (!token || !newPassword) {
    return NextResponse.json({ error: 'Token dan password baru diperlukan' }, { status: 400 })
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'Password minimal 8 karakter' }, { status: 400 })
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } })

  if (!record || record.type !== 'PASSWORD_CHANGE') {
    return NextResponse.json({ error: 'Token tidak valid' }, { status: 400 })
  }
  if (record.expiresAt < new Date()) {
    await prisma.verificationToken.delete({ where: { token } })
    return NextResponse.json({ error: 'Token sudah kedaluwarsa' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: record.userId }, data: { password: hashed } })
  await prisma.verificationToken.delete({ where: { token } })

  return NextResponse.json({ message: 'Password berhasil diperbarui' })
}
