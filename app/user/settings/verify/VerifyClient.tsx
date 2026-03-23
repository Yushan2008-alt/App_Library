'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

type VerifyType = 'password' | 'email'
type Status = 'idle' | 'loading' | 'success' | 'error'

export default function VerifyClient() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token') ?? ''
  const type = (params.get('type') ?? 'password') as VerifyType

  // Password change
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  // For email type, auto-verify on mount
  useEffect(() => {
    if (type === 'email' && token) {
      handleEmailVerify()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleEmailVerify() {
    setStatus('loading')
    try {
      const res = await fetch('/api/user/change-email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (!res.ok) { setStatus('error'); setMessage(data.error); return }
      setStatus('success')
      setMessage(data.message)
      // Sign out so new email takes effect
      setTimeout(() => signOut({ callbackUrl: '/login' }), 3000)
    } catch {
      setStatus('error')
      setMessage('Terjadi kesalahan. Coba lagi.')
    }
  }

  async function handlePasswordVerify(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setMessage('Password tidak cocok')
      setStatus('error')
      return
    }
    if (newPassword.length < 8) {
      setMessage('Password minimal 8 karakter')
      setStatus('error')
      return
    }
    setStatus('loading')
    try {
      const res = await fetch('/api/user/change-password/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) { setStatus('error'); setMessage(data.error); return }
      setStatus('success')
      setMessage(data.message)
      setTimeout(() => router.push('/user/dashboard'), 2500)
    } catch {
      setStatus('error')
      setMessage('Terjadi kesalahan. Coba lagi.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #4F9CF9, #7B5EA7)', boxShadow: '0 0 32px rgba(79,156,249,0.4)' }}
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#F0F4FF' }}>App-Library</h1>
          <p className="text-sm mt-1" style={{ color: '#8899BB' }}>
            {type === 'password' ? 'Atur Password Baru' : 'Konfirmasi Perubahan Email'}
          </p>
        </div>

        <div className="glass rounded-2xl p-8">
          {/* Email verify — auto */}
          {type === 'email' && (
            <>
              {status === 'loading' && (
                <div className="text-center py-6">
                  <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p style={{ color: '#8899BB' }}>Memverifikasi email...</p>
                </div>
              )}
              {status === 'success' && (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(34,197,94,0.15)' }}>
                    <svg className="w-6 h-6" fill="none" stroke="#4ade80" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-semibold mb-1" style={{ color: '#4ade80' }}>Email Berhasil Diperbarui!</p>
                  <p className="text-sm" style={{ color: '#8899BB' }}>Kamu akan diarahkan ke halaman login...</p>
                </div>
              )}
              {status === 'error' && (
                <div>
                  <div className="px-4 py-3 rounded-xl text-sm mb-4" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
                    {message}
                  </div>
                  <Link href="/user/settings" className="text-sm font-medium" style={{ color: '#4F9CF9' }}>
                    ← Kembali ke Pengaturan
                  </Link>
                </div>
              )}
            </>
          )}

          {/* Password verify — form */}
          {type === 'password' && (
            <>
              {status !== 'success' ? (
                <form onSubmit={handlePasswordVerify} className="space-y-4">
                  {status === 'error' && (
                    <div className="px-4 py-2.5 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
                      {message}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#8899BB' }}>Password Baru</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="Minimal 8 karakter"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{ background: 'rgba(9,22,48,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0F4FF' }}
                      onFocus={(e) => e.target.style.borderColor = '#4F9CF9'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#8899BB' }}>Konfirmasi Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Ulangi password baru"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{ background: 'rgba(9,22,48,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0F4FF' }}
                      onFocus={(e) => e.target.style.borderColor = '#4F9CF9'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full py-3 rounded-full font-semibold text-sm text-white transition-all duration-300 mt-1"
                    style={{
                      background: status === 'loading' ? 'rgba(79,156,249,0.3)' : 'linear-gradient(135deg,#4F9CF9,#2563eb)',
                      boxShadow: status === 'loading' ? 'none' : '0 0 24px rgba(79,156,249,0.4)',
                      cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {status === 'loading' ? 'Menyimpan...' : 'Simpan Password Baru'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(34,197,94,0.15)' }}>
                    <svg className="w-6 h-6" fill="none" stroke="#4ade80" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-semibold mb-1" style={{ color: '#4ade80' }}>Password Berhasil Diperbarui!</p>
                  <p className="text-sm" style={{ color: '#8899BB' }}>Mengarahkan ke dashboard...</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
