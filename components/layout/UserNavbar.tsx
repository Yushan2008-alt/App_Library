'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import NotificationBell from '@/components/notifications/NotificationBell'

interface UserNavbarProps {
  user: { name: string; email: string }
}

export default function UserNavbar({ user }: UserNavbarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { href: '/user/books', label: 'Koleksi Buku' },
    { href: '/user/loans', label: 'Pinjaman Saya' },
    { href: '/user/settings', label: 'Pengaturan' },
  ]

  return (
    <nav className="glass-dark sticky top-0 z-40" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/user/books" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4F9CF9, #7B5EA7)' }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-sm" style={{ color: '#F0F4FF' }}>App-Library</span>
          </Link>

          {/* Desktop Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    background: active ? 'rgba(79,156,249,0.18)' : 'transparent',
                    color: active ? '#4F9CF9' : '#8899BB',
                    boxShadow: active ? '0 0 10px rgba(79,156,249,0.15)' : 'none',
                  }}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <NotificationBell />
            <div className="hidden md:flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #4F9CF9, #7B5EA7)', color: 'white' }}
              >
                {user.name.charAt(0)}
              </div>
              <span className="text-sm" style={{ color: '#F0F4FF' }}>{user.name}</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="hidden md:block px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
              style={{ background: 'rgba(239,68,68,0.12)', color: '#fca5a5' }}
            >
              Keluar
            </button>
            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-xl"
              style={{ background: 'rgba(79,156,249,0.1)', color: '#4F9CF9' }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: active ? 'rgba(79,156,249,0.18)' : 'transparent',
                    color: active ? '#4F9CF9' : '#8899BB',
                  }}
                >
                  {item.label}
                </Link>
              )
            })}
            <div className="pt-2 border-t flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, #4F9CF9, #7B5EA7)', color: 'white' }}>
                  {user.name.charAt(0)}
                </div>
                <span className="text-sm" style={{ color: '#F0F4FF' }}>{user.name}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{ background: 'rgba(239,68,68,0.12)', color: '#fca5a5' }}
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
