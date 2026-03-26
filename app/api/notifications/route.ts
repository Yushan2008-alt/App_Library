import { getServerUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const user = await getServerUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const unreadOnly = searchParams.get('unread') === 'true'

  const supabase = await createClient()

  let query = supabase
    .from('Notification')
    .select('id, message, isRead, createdAt')
    .eq('userId', user.id)
    .order('createdAt', { ascending: false })
    .limit(20)

  if (unreadOnly) query = query.eq('isRead', false)

  const { data: notifications } = await query

  const { count: unreadCount } = await supabase
    .from('Notification')
    .select('*', { count: 'exact', head: true })
    .eq('userId', user.id)
    .eq('isRead', false)

  return Response.json({ notifications: notifications ?? [], unreadCount: unreadCount ?? 0 })
}
