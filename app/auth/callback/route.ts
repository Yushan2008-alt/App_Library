import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const origin = new URL(request.url).origin.replace('0.0.0.0', 'localhost')
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const authUser = data.user

      // Determine role — existing metadata takes priority, otherwise default USER
      const role: 'ADMIN' | 'USER' = authUser.user_metadata?.role === 'ADMIN' ? 'ADMIN' : 'USER'

      // Ensure role is set in user_metadata (important for OAuth users who don't have it)
      if (!authUser.user_metadata?.role) {
        await supabase.auth.updateUser({ data: { role } })
      }

      // Create or sync User profile in DB
      await prisma.user.upsert({
        where: { id: authUser.id },
        update: {},
        create: {
          id: authUser.id,
          name: authUser.user_metadata?.name
            ?? authUser.user_metadata?.full_name
            ?? authUser.email?.split('@')[0]
            ?? 'User',
          email: authUser.email!,
          role,
        },
      })

      const redirectTo = role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard'
      return NextResponse.redirect(new URL(next === '/' ? redirectTo : next, origin))
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth_failed', origin))
}
