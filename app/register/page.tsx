'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) { setError('Password tidak cocok'); return }
    if (password.length < 8) { setError('Password minimal 8 karakter'); return }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role: 'USER' },
          emailRedirectTo: `${window.location.origin.replace('0.0.0.0', 'localhost')}/auth/callback`,
        },
      })

      if (authError) {
        if (authError.message.toLowerCase().includes('already registered')) {
          setError('Email sudah terdaftar. Coba login.')
        } else {
          setError(authError.message)
        }
        return
      }

      setSent(true)
    } catch {
      setError('Gagal terhubung ke server. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    setGoogleLoading(true)
    try {
      const supabase = createClient()
      const origin = window.location.origin.replace('0.0.0.0', 'localhost')
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      })
      if (authError) setError(authError.message)
    } catch {
      setError('Gagal menghubungkan ke Google.')
    } finally {
      setGoogleLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #4F9CF9, #7B5EA7)' }}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="glass rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-3" style={{ color: '#F0F4FF' }}>Cek Email Kamu!</h2>
            <p className="text-sm mb-4" style={{ color: '#8899BB' }}>
              Link verifikasi telah dikirim ke <strong style={{ color: '#4F9CF9' }}>{email}</strong>.
              Klik link tersebut untuk mengaktifkan akun kamu.
            </p>
            <p className="text-xs mb-6" style={{ color: '#8899BB' }}>
              Tidak menerima email? Periksa folder spam atau coba daftar ulang.
            </p>
            <Link href="/login" className="block w-full py-3 rounded-full font-semibold text-sm text-white text-center" style={{ background: 'linear-gradient(135deg, #4F9CF9, #2563eb)' }}>
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #4F9CF9, #7B5EA7)', boxShadow: '0 0 32px rgba(79,156,249,0.4)' }}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: '#F0F4FF' }}>App-Library</h1>
          <p className="mt-1 text-sm" style={{ color: '#8899BB' }}>Buat akun baru</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-6" style={{ color: '#F0F4FF' }}>Daftar</h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
              {error}
            </div>
          )}

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-3 mb-4 transition-all"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#F0F4FF',
              cursor: googleLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {googleLoading ? (
              <span style={{ color: '#8899BB' }}>Menghubungkan...</span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Daftar dengan Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-xs" style={{ color: '#8899BB' }}>atau</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {([
              { label: 'Nama Lengkap', type: 'text', value: name, set: setName, placeholder: 'John Doe' },
              { label: 'Email', type: 'email', value: email, set: setEmail, placeholder: 'email@contoh.com' },
              { label: 'Password', type: 'password', value: password, set: setPassword, placeholder: '••••••••' },
              { label: 'Konfirmasi Password', type: 'password', value: confirm, set: setConfirm, placeholder: '••••••••' },
            ] as { label: string; type: string; value: string; set: (v: string) => void; placeholder: string }[]).map(({ label, type, value, set, placeholder }) => (
              <div key={label}>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#8899BB' }}>{label}</label>
                <input
                  type={type}
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  required
                  placeholder={placeholder}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: 'rgba(9,22,48,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0F4FF' }}
                  onFocus={(e) => e.target.style.borderColor = '#4F9CF9'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full font-semibold text-sm text-white transition-all duration-300 mt-2"
              style={{
                background: loading ? 'rgba(79,156,249,0.3)' : 'linear-gradient(135deg, #4F9CF9, #2563eb)',
                boxShadow: loading ? 'none' : '0 0 24px rgba(79,156,249,0.4)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: '#8899BB' }}>
            Sudah punya akun?{' '}
            <Link href="/login" className="font-medium hover:underline" style={{ color: '#4F9CF9' }}>
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
