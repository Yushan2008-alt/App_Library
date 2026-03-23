import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  const isAdminRoute = pathname.startsWith('/admin')
  const isUserRoute = pathname.startsWith('/user')
  const isAuthRoute = pathname === '/login' || pathname === '/register'
  const isProtected = isAdminRoute || isUserRoute

  // Redirect logged-in users away from auth pages
  if (token && isAuthRoute) {
    if (token.role === 'ADMIN') return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    return NextResponse.redirect(new URL('/user/dashboard', req.url))
  }

  // Redirect unauthenticated users to login
  if (!token && isProtected) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Role enforcement
  if (token && isAdminRoute && token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/user/dashboard', req.url))
  }
  if (token && isUserRoute && token.role === 'ADMIN') {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*', '/login', '/register'],
}
