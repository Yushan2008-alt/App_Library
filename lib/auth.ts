import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function getServerUser() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null
    return prisma.user.findUnique({ where: { id: user.id } })
  } catch {
    return null
  }
}
