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
      setError('Email atau password salah')
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#0F1B2D' }}>
      {/* Bubble decorations */}
      <div className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full opacity-10 pointer-events-none" style={{ background: '#4F9CF9', filter: 'blur(60px)' }} />
      <div className="absolute bottom-[-60px] right-[-60px] w-96 h-96 rounded-full opacity-10 pointer-events-none" style={{ background: '#7B5EA7', filter: 'blur(80px)' }} />
      <div className="absolute top-1/3 right-10 w-40 h-40 rounded-full opacity-5 pointer-events-none" style={{ background: '#4F9CF9', filter: 'blur(40px)' }} />

      <div className="relative w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'linear-gradient(135deg, #4F9CF9, #7B5EA7)' }}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: '#F0F4FF' }}>App-Library</h1>
          <p className="mt-1 text-sm" style={{ color: '#8899BB' }}>Perpustakaan Digital Modern</p>
        </div>

        <div className="rounded-2xl p-8 border" style={{ background: '#162236', borderColor: '#1E2E45' }}>
          <h2 className="text-xl font-semibold mb-6" style={{ color: '#F0F4FF' }}>Masuk ke akun</h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
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
                style={{ background: '#0F1B2D', border: '1px solid #1E2E45', color: '#F0F4FF' }}
                onFocus={(e) => e.target.style.borderColor = '#4F9CF9'}
                onBlur={(e) => e.target.style.borderColor = '#1E2E45'}
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
                style={{ background: '#0F1B2D', border: '1px solid #1E2E45', color: '#F0F4FF' }}
                onFocus={(e) => e.target.style.borderColor = '#4F9CF9'}
                onBlur={(e) => e.target.style.borderColor = '#1E2E45'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full font-semibold text-sm text-white transition-all duration-300 mt-2"
              style={{
                background: loading ? '#243552' : 'linear-gradient(135deg, #4F9CF9, #2563eb)',
                boxShadow: loading ? 'none' : '0 0 20px rgba(79,156,249,0.3)',
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

        <p className="text-center text-xs mt-4" style={{ color: '#8899BB' }}>
          Demo: admin@library.com / admin123 · user@library.com / user123
        </p>
      </div>
    </div>
  )
}
