'use client'

import { useState, useEffect, useRef } from 'react'
import { formatDate } from '@/lib/utils'

interface Notification {
  id: string
  message: string
  isRead: boolean
  createdAt: string
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  async function fetchNotifications() {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch {}
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    setUnreadCount((c) => Math.max(0, c - 1))
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl transition-all duration-200"
        style={{ background: open ? 'rgba(79,156,249,0.15)' : 'transparent' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(79,156,249,0.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = open ? 'rgba(79,156,249,0.15)' : 'transparent')}
      >
        <svg className="w-5 h-5" style={{ color: '#8899BB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center font-bold animate-pulse"
            style={{ background: '#ef4444', fontSize: '10px' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 rounded-2xl border overflow-hidden z-50"
          style={{ background: '#162236', borderColor: '#1E2E45', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: '#1E2E45' }}>
            <h3 className="text-sm font-semibold" style={{ color: '#F0F4FF' }}>
              Notifikasi {unreadCount > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs" style={{ background: 'rgba(79,156,249,0.2)', color: '#4F9CF9' }}>{unreadCount}</span>}
            </h3>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm" style={{ color: '#8899BB' }}>Tidak ada notifikasi</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.isRead && markRead(n.id)}
                  className="w-full text-left px-4 py-3 border-b transition-colors"
                  style={{
                    borderColor: '#1E2E45',
                    background: n.isRead ? 'transparent' : 'rgba(79,156,249,0.05)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(79,156,249,0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(79,156,249,0.05)')}
                >
                  <div className="flex gap-2 items-start">
                    {!n.isRead && (
                      <div className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#4F9CF9' }} />
                    )}
                    <div>
                      <p className="text-xs leading-relaxed" style={{ color: n.isRead ? '#8899BB' : '#F0F4FF' }}>{n.message}</p>
                      <p className="text-xs mt-1" style={{ color: '#8899BB' }}>{formatDate(n.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
