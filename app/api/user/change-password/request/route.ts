import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendPasswordChangeEmail } from '@/lib/email'
import { randomBytes } from 'crypto'

export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Invalidate previous tokens of same type
  await prisma.verificationToken.deleteMany({
    where: { userId: user.id, type: 'PASSWORD_CHANGE' },
  })

  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  await prisma.verificationToken.create({
    data: { userId: user.id, token, type: 'PASSWORD_CHANGE', expiresAt },
  })

  await sendPasswordChangeEmail(user.email, user.name, token)

  return NextResponse.json({ message: 'Email verifikasi telah dikirim' })
}
