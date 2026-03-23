'use client'

import { useState } from 'react'

interface Props {
  user: { name: string; email: string }
}

export default function SettingsClient({ user }: Props) {
  // Password change state
  const [pwStep, setPwStep] = useState<'idle' | 'sent' | 'done'>('idle')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState('')

  // Email change state
  const [newEmail, setNewEmail] = useState('')
  const [emailStep, setEmailStep] = useState<'idle' | 'sent' | 'done'>('idle')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailError, setEmailError] = useState('')

  async function requestPasswordChange() {
    setPwLoading(true)
    setPwError('')
    try {
      const res = await fetch('/api/user/change-password/request', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setPwError(data.error); return }
      setPwStep('sent')
    } catch {
      setPwError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setPwLoading(false)
    }
  }

  async function requestEmailChange(e: React.FormEvent) {
    e.preventDefault()
    setEmailLoading(true)
    setEmailError('')
    try {
      const res = await fetch('/api/user/change-email/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail }),
      })
      const data = await res.json()
      if (!res.ok) { setEmailError(data.error); return }
      setEmailStep('sent')
    } catch {
      setEmailError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setEmailLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#F0F4FF' }}>Pengaturan Akun</h1>
          <p className="text-sm mt-1" style={{ color: '#8899BB' }}>Kelola informasi dan keamanan akun kamu</p>
        </div>

        {/* Profile info */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold text-base mb-4" style={{ color: '#F0F4FF' }}>Informasi Akun</h2>
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #4F9CF9, #7B5EA7)', color: 'white' }}
            >
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold" style={{ color: '#F0F4FF' }}>{user.name}</p>
              <p className="text-sm" style={{ color: '#8899BB' }}>{user.email}</p>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(79,156,249,0.15)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="#4F9CF9" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-base" style={{ color: '#F0F4FF' }}>Ubah Password</h2>
              <p className="text-sm" style={{ color: '#8899BB' }}>Link verifikasi akan dikirim ke email kamu</p>
            </div>
          </div>

          {pwStep === 'idle' && (
            <>
              {pwError && (
                <div className="mb-3 px-4 py-2.5 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
                  {pwError}
                </div>
              )}
              <button
                onClick={requestPasswordChange}
                disabled={pwLoading}
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-200"
                style={{
                  background: pwLoading ? 'rgba(79,156,249,0.3)' : 'linear-gradient(135deg,#4F9CF9,#2563eb)',
                  boxShadow: pwLoading ? 'none' : '0 0 16px rgba(79,156,249,0.3)',
                  cursor: pwLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {pwLoading ? 'Mengirim...' : 'Kirim Link Verifikasi'}
              </button>
            </>
          )}

          {pwStep === 'sent' && (
            <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(79,156,249,0.1)', border: '1px solid rgba(79,156,249,0.25)', color: '#93c5fd' }}>
              ✅ Link verifikasi dikirim ke <strong>{user.email}</strong>. Periksa inbox kamu dan klik link dalam 10 menit.
            </div>
          )}
        </div>

        {/* Change Email */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(123,94,167,0.15)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="#7B5EA7" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-base" style={{ color: '#F0F4FF' }}>Ubah Email</h2>
              <p className="text-sm" style={{ color: '#8899BB' }}>Link verifikasi akan dikirim ke email lama kamu</p>
            </div>
          </div>

          {emailStep === 'idle' && (
            <form onSubmit={requestEmailChange} className="space-y-3">
              {emailError && (
                <div className="px-4 py-2.5 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
                  {emailError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#8899BB' }}>Email Baru</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  placeholder="emailbaru@contoh.com"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{ background: 'rgba(9,22,48,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0F4FF' }}
                  onFocus={(e) => e.target.style.borderColor = '#4F9CF9'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
              <button
                type="submit"
                disabled={emailLoading}
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-200"
                style={{
                  background: emailLoading ? 'rgba(123,94,167,0.3)' : 'linear-gradient(135deg,#7B5EA7,#4F9CF9)',
                  boxShadow: emailLoading ? 'none' : '0 0 16px rgba(123,94,167,0.3)',
                  cursor: emailLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {emailLoading ? 'Mengirim...' : 'Kirim Link Verifikasi'}
              </button>
            </form>
          )}

          {emailStep === 'sent' && (
            <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(123,94,167,0.1)', border: '1px solid rgba(123,94,167,0.25)', color: '#c4b5fd' }}>
              ✅ Link verifikasi dikirim ke <strong>{user.email}</strong>. Periksa inbox kamu dan klik link dalam 10 menit.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
