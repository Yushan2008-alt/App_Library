import { prisma } from '@/lib/prisma'
import { sendRegistrationVerificationEmail } from '@/lib/email'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return Response.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    }
    if (password.length < 6) {
      return Response.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return Response.json({ error: 'Email sudah digunakan' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: 'USER', isVerified: false },
      select: { id: true, name: true, email: true },
    })

    // Create verification token (24 hours)
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.verificationToken.create({
      data: { userId: user.id, token, type: 'EMAIL_VERIFICATION', expiresAt },
    })

    await sendRegistrationVerificationEmail(email, name, token)

    return Response.json({ message: 'Akun berhasil dibuat. Periksa email kamu untuk verifikasi.' }, { status: 201 })
  } catch {
    return Response.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
