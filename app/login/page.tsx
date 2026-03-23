'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      if (result.error === 'EMAIL_NOT_VERIFIED') {
        setError('Akun belum diverifikasi. Periksa email kamu untuk link verifikasi.')
      } else {
        setError('Email atau password salah')
      }
      return
    }

    router.push('/')
    router.refresh()
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: '#F0F4FF' }}>App-Library</h1>
          <p className="mt-1 text-sm" style={{ color: '#8899BB' }}>Perpustakaan Digital Modern</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-6" style={{ color: '#F0F4FF' }}>Masuk ke akun</h2>

          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#8899BB' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@contoh.com"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: 'rgba(9,22,48,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0F4FF' }}
                onFocus={(e) => e.target.style.borderColor = '#4F9CF9'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#8899BB' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: 'rgba(9,22,48,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0F4FF' }}
                onFocus={(e) => e.target.style.borderColor = '#4F9CF9'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

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
              {loading ? 'Memuat...' : 'Masuk'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: '#8899BB' }}>
            Belum punya akun?{' '}
            <Link href="/register" className="font-medium transition-colors hover:underline" style={{ color: '#4F9CF9' }}>
              Daftar sekarang
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
