import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function getServerUser() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } })

    // Fallback: if DB is unreachable but Supabase session is valid,
    // return minimal user to prevent redirect loop
    if (!dbUser) {
      return {
        id: user.id,
        name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'User',
        username: null as string | null,
        email: user.email ?? '',
        avatarUrl: null as string | null,
        role: (user.user_metadata?.role ?? 'USER') as 'USER' | 'ADMIN',
        createdAt: new Date(),
      }
    }

    return dbUser
  } catch {
    return null
  }
}
