import { getServerUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { firstName, lastName, username } = await request.json()

  const name = [firstName, lastName].filter(Boolean).join(' ').trim() || user.name
  const trimmedUsername = username?.trim() || null

  // Check username uniqueness (exclude self)
  if (trimmedUsername && trimmedUsername !== user.username) {
    const existing = await prisma.user.findUnique({ where: { username: trimmedUsername } })
    if (existing) return NextResponse.json({ error: 'Username sudah digunakan.' }, { status: 409 })
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name, username: trimmedUsername },
  })

  return NextResponse.json({ name: updated.name, username: updated.username })
}
