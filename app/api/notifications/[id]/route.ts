import { prisma } from '@/lib/prisma'
import { getServerUser } from '@/lib/auth'
import { NextRequest } from 'next/server'

export async function PATCH(_req: NextRequest, ctx: RouteContext<'/api/notifications/[id]'>) {
  const user = await getServerUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params

  const notification = await prisma.notification.findUnique({ where: { id } })
  if (!notification || notification.userId !== user.id) {
    return Response.json({ error: 'Notifikasi tidak ditemukan' }, { status: 404 })
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  })

  return Response.json({ notification: updated })
}
