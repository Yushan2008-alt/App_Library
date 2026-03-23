'use client'

import Link from 'next/link'

interface QuickActionsProps {
  pendingRequests: number
}

const actions = [
  { href: '/admin/books/new', label: 'Tambah Buku', icon: '📚', color: '#4F9CF9' },
  { href: '/admin/loans?status=PENDING', label: 'Review Pinjaman', icon: '⏳', color: '#f59e0b', badgeKey: true },
  { href: '/admin/categories', label: 'Kelola Kategori', icon: '🏷️', color: '#7B5EA7' },
  { href: '/admin/users', label: 'Kelola Pengguna', icon: '👥', color: '#10b981' },
]

export default function QuickActions({ pendingRequests }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="relative flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all duration-200"
          style={{ borderColor: '#1E2E45', background: '#0F1B2D' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = action.color)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1E2E45')}
        >
          {action.badgeKey && pendingRequests > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white flex items-center justify-center text-xs font-bold" style={{ background: '#ef4444' }}>
              {pendingRequests}
            </span>
          )}
          <span className="text-2xl">{action.icon}</span>
          <span className="text-xs font-medium" style={{ color: '#8899BB' }}>{action.label}</span>
        </Link>
      ))}
    </div>
  )
}
