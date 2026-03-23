import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { token } = await req.json()

  if (!token) return NextResponse.json({ error: 'Token diperlukan' }, { status: 400 })

  const record = await prisma.verificationToken.findUnique({ where: { token } })

  if (!record || record.type !== 'EMAIL_CHANGE' || !record.newEmail) {
    return NextResponse.json({ error: 'Token tidak valid' }, { status: 400 })
  }
  if (record.expiresAt < new Date()) {
    await prisma.verificationToken.delete({ where: { token } })
    return NextResponse.json({ error: 'Token sudah kedaluwarsa' }, { status: 400 })
  }

  // Check email not taken by another user
  const existing = await prisma.user.findUnique({ where: { email: record.newEmail } })
  if (existing && existing.id !== record.userId) {
    return NextResponse.json({ error: 'Email sudah digunakan oleh akun lain' }, { status: 400 })
  }

  await prisma.user.update({ where: { id: record.userId }, data: { email: record.newEmail } })
  await prisma.verificationToken.delete({ where: { token } })

  return NextResponse.json({ message: 'Email berhasil diperbarui. Silakan login ulang.' })
}
