import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmailChangeEmail } from '@/lib/email'
import { randomBytes } from 'crypto'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { newEmail } = await req.json()
  if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    return NextResponse.json({ error: 'Email tidak valid' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (newEmail === user.email) {
    return NextResponse.json({ error: 'Email baru sama dengan email saat ini' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email: newEmail } })
  if (existing) {
    return NextResponse.json({ error: 'Email sudah digunakan oleh akun lain' }, { status: 400 })
  }

  // Invalidate previous tokens
  await prisma.verificationToken.deleteMany({
    where: { userId: user.id, type: 'EMAIL_CHANGE' },
  })

  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  await prisma.verificationToken.create({
    data: { userId: user.id, token, type: 'EMAIL_CHANGE', newEmail, expiresAt },
  })

  await sendEmailChangeEmail(user.email, user.name, token, newEmail)

  return NextResponse.json({ message: 'Email verifikasi telah dikirim ke email lama kamu' })
}
