import { createServiceClient } from '@/lib/supabase/service'

export async function createNotification(userId: string, message: string) {
  const supabase = createServiceClient()
  await supabase.from('Notification').insert({ userId, message })
}

export async function createNotificationsForAdmins(message: string) {
  const supabase = createServiceClient()
  const { data: admins } = await supabase.from('User').select('id').eq('role', 'ADMIN')
  if (!admins || admins.length === 0) return
  await supabase.from('Notification').insert(
    admins.map((a: { id: string }) => ({ userId: a.id, message }))
  )
}
