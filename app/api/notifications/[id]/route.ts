import { getServerUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function PATCH(_req: NextRequest, ctx: RouteContext<'/api/notifications/[id]'>) {
  const user = await getServerUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const supabase = await createClient()

  const { data: notification } = await supabase
    .from('Notification')
    .select('id, userId')
    .eq('id', id)
    .single()

  if (!notification || notification.userId !== user.id) {
    return Response.json({ error: 'Notifikasi tidak ditemukan' }, { status: 404 })
  }

  const { data: updated } = await supabase
    .from('Notification')
    .update({ isRead: true })
    .eq('id', id)
    .select('id, message, isRead, createdAt')
    .single()

  return Response.json({ notification: updated })
}
