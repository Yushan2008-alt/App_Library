import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const origin = new URL(request.url).origin.replace('0.0.0.0', 'localhost')
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('[auth/callback] exchangeCodeForSession error:', error)
        return NextResponse.redirect(new URL(`/login?error=auth_failed&detail=${encodeURIComponent(error.message)}`, origin))
      }

      if (data.user) {
        const authUser = data.user

        const role: 'ADMIN' | 'USER' = authUser.user_metadata?.role === 'ADMIN' ? 'ADMIN' : 'USER'

        if (!authUser.user_metadata?.role) {
          await supabase.auth.updateUser({ data: { role } })
        }

        try {
          const service = createServiceClient()
          const { data: existingUser } = await service
            .from('User')
            .select('id')
            .eq('id', authUser.id)
            .maybeSingle()

          if (!existingUser) {
            await service.from('User').insert({
              id: authUser.id,
              name: authUser.user_metadata?.name
                ?? authUser.user_metadata?.full_name
                ?? authUser.email?.split('@')[0]
                ?? 'User',
              email: authUser.email!,
              role,
            })
          } else {
            // Sync email in DB in case user verified an email change
            await service.from('User').update({ email: authUser.email! }).eq('id', authUser.id)
          }
        } catch (dbError) {
          // DB failure should not block login — getServerUser() has a fallback
          console.error('[auth/callback] user upsert error (non-fatal):', dbError)
        }

        const redirectTo = role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard'
        return NextResponse.redirect(new URL(next === '/' ? redirectTo : next, origin))
      }
    } catch (err) {
      console.error('[auth/callback] unexpected error:', err)
      return NextResponse.redirect(new URL(`/login?error=unexpected&detail=${encodeURIComponent(String(err))}`, origin))
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth_failed', origin))
}
