import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function proxy(req: NextRequest) {
  const res = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = req.nextUrl

  const isAdminRoute = pathname.startsWith('/admin')
  const isUserRoute = pathname.startsWith('/user')
  const isAuthRoute = pathname === '/login' || pathname === '/register'
  const isProtected = isAdminRoute || isUserRoute

  // Redirect logged-in users away from auth pages
  if (user && isAuthRoute) {
    const role = user.user_metadata?.role ?? 'USER'
    if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    return NextResponse.redirect(new URL('/user/dashboard', req.url))
  }

  // Redirect unauthenticated users to login
  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Role enforcement
  if (user) {
    const role = user.user_metadata?.role ?? 'USER'
    if (isAdminRoute && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/user/dashboard', req.url))
    }
    if (isUserRoute && role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*', '/login', '/register'],
}
