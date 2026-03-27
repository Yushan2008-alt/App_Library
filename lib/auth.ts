import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export const getServerUser = cache(async function getServerUser() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null

    // Fallback user from Supabase session — used when DB is unreachable
    const fallback = {
      id: user.id,
      name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'User',
      username: null as string | null,
      email: user.email ?? '',
      avatarUrl: null as string | null,
      role: (user.user_metadata?.role === 'ADMIN' ? 'ADMIN' : 'USER') as 'USER' | 'ADMIN',
      createdAt: new Date(),
    }

    try {
      const service = createServiceClient()
      const { data: dbUser } = await service.from('User').select('*').eq('id', user.id).single()
      if (!dbUser) return fallback
      // Always use Supabase auth email as source of truth (handles email change)
      const currentEmail = user.email ?? dbUser.email
      if (dbUser.email !== currentEmail) {
        service.from('User').update({ email: currentEmail }).eq('id', user.id).then(() => {})
      }
      return { ...dbUser, email: currentEmail }
    } catch {
      return fallback
    }
  } catch {
    return null
  }
})
