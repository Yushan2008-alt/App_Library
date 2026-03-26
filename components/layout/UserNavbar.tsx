'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import NotificationBell from '@/components/notifications/NotificationBell'

interface UserNavbarProps {
  user: { name: string; email: string; username: string | null; avatarUrl: string | null }
}

export default function UserNavbar({ user }: UserNavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl)

  useEffect(() => {
    function handleAvatarUpdate(e: Event) {
      setAvatarUrl((e as CustomEvent).detail.avatarUrl)
    }
    window.addEventListener('avatarUpdated', handleAvatarUpdate)
    return () => window.removeEventListener('avatarUpdated', handleAvatarUpdate)
  }, [])

  const displayName = user.username || user.name

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    { href: '/user/books', label: 'Koleksi Buku' },
    { href: '/user/loans', label: 'Pinjaman Saya' },
  ]

  return (
    <nav className="glass-dark sticky top-0 z-40" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/user/books" className="flex items-center gap-2 flex-shrink-0 transition-transform duration-200 hover:scale-105">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4F9CF9, #7B5EA7)' }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-sm" style={{ color: '#F0F4FF' }}>Library</span>
          </Link>

          {/* Desktop Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
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

          {/* Right: notification + menu */}
          <div className="flex items-center gap-2">
            <NotificationBell />

            {/* ≡ Menu button (all screens) */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors duration-200"
                style={{ background: menuOpen ? 'rgba(79,156,249,0.18)' : 'rgba(79,156,249,0.08)', color: '#4F9CF9' }}
                onMouseEnter={(e) => { if (!menuOpen) e.currentTarget.style.background = 'rgba(79,156,249,0.15)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = menuOpen ? 'rgba(79,156,249,0.18)' : 'rgba(79,156,249,0.08)' }}
                onMouseDown={(e) => { e.currentTarget.style.background = 'rgba(79,156,249,0.25)' }}
                onMouseUp={(e) => { e.currentTarget.style.background = menuOpen ? 'rgba(79,156,249,0.18)' : 'rgba(79,156,249,0.15)' }}
              >
                {/* Avatar */}
                <div
                  className="flex-shrink-0 overflow-hidden flex items-center justify-center text-sm font-bold"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4F9CF9, #7B5EA7)',
                    color: 'white',
                    border: '2px solid rgba(79,156,249,0.7)',
                    boxShadow: '0 0 0 2px rgba(79,156,249,0.2)',
                  }}
                >
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt={displayName} width={32} height={32} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} unoptimized />
                  ) : displayName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block text-sm font-medium" style={{ color: '#F0F4FF' }}>{displayName}</span>
                {/* Hamburger icon */}
                <svg
                  className="w-4 h-4 transition-transform duration-200"
                  style={{ transform: menuOpen ? 'rotate(90deg)' : 'none', color: '#8899BB' }}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl py-2 z-50 transition-all duration-200"
                  style={{
                    background: 'rgba(12,25,52,0.97)',
                    border: '1px solid rgba(79,156,249,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(79,156,249,0.1)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  {/* User info */}
                  <div className="px-4 py-3 mb-1 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <div
                      className="flex-shrink-0 overflow-hidden flex items-center justify-center text-sm font-bold"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4F9CF9, #7B5EA7)',
                        color: 'white',
                        border: '2.5px solid rgba(79,156,249,0.7)',
                        boxShadow: '0 0 0 2px rgba(79,156,249,0.2)',
                      }}
                    >
                      {avatarUrl ? (
                        <Image src={avatarUrl} alt={displayName} width={40} height={40} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} unoptimized />
                      ) : displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#F0F4FF' }}>{displayName}</p>
                      <p className="text-xs truncate mt-0.5" style={{ color: '#8899BB' }}>{user.email}</p>
                    </div>
                  </div>

                  {/* Mobile nav items */}
                  <div className="md:hidden px-2">
                    {navItems.map((item) => {
                      const active = pathname.startsWith(item.href)
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 active:scale-95"
                          style={{ color: active ? '#4F9CF9' : '#8899BB', background: active ? 'rgba(79,156,249,0.1)' : 'transparent' }}
                        >
                          {item.label}
                        </Link>
                      )
                    })}
                    <div className="my-1" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />
                  </div>

                  {/* Settings */}
                  <div className="px-2">
                    <Link
                      href="/user/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 active:scale-95"
                      style={{ color: pathname.startsWith('/user/settings') ? '#4F9CF9' : '#8899BB' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(79,156,249,0.1)'; (e.currentTarget as HTMLElement).style.color = '#F0F4FF' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = pathname.startsWith('/user/settings') ? '#4F9CF9' : '#8899BB' }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Pengaturan
                    </Link>

                    <button
                      onClick={() => { setMenuOpen(false); handleLogout() }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 active:scale-95"
                      style={{ color: '#8899BB' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#fca5a5' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8899BB' }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
