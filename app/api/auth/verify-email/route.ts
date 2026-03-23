import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return Response.json({ error: 'Token diperlukan' }, { status: 400 })

  const record = await prisma.verificationToken.findUnique({ where: { token } })

  if (!record || record.type !== 'EMAIL_VERIFICATION') {
    return Response.json({ error: 'Token tidak valid' }, { status: 400 })
  }
  if (record.expiresAt < new Date()) {
    await prisma.verificationToken.delete({ where: { token } })
    return Response.json({ error: 'Token sudah kedaluwarsa. Silakan daftar ulang.' }, { status: 400 })
  }

  await prisma.user.update({ where: { id: record.userId }, data: { isVerified: true } })
  await prisma.verificationToken.delete({ where: { token } })

  return Response.json({ message: 'Email berhasil diverifikasi! Silakan login.' })
}
