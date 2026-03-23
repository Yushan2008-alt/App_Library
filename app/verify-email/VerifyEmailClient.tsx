'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function VerifyEmailClient() {
  const params = useSearchParams()
  const token = params.get('token') ?? ''
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token tidak ditemukan.')
      return
    }
    fetch(`/api/auth/verify-email?token=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setStatus('error'); setMessage(data.error) }
        else { setStatus('success'); setMessage(data.message) }
      })
      .catch(() => { setStatus('error'); setMessage('Terjadi kesalahan. Coba lagi.') })
  }, [token])

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
        </div>

        <div className="glass rounded-2xl p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="w-12 h-12 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p style={{ color: '#8899BB' }}>Memverifikasi email kamu...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <svg className="w-8 h-8" fill="none" stroke="#4ade80" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: '#4ade80' }}>Email Terverifikasi!</h2>
              <p className="text-sm mb-6" style={{ color: '#8899BB' }}>
                Akun kamu sudah aktif. Silakan masuk untuk mulai menggunakan App-Library.
              </p>
              <Link
                href="/login"
                className="inline-block px-8 py-3 rounded-full text-sm font-semibold text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #4F9CF9, #2563eb)', boxShadow: '0 0 20px rgba(79,156,249,0.4)' }}
              >
                Masuk Sekarang
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <svg className="w-8 h-8" fill="none" stroke="#fca5a5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: '#fca5a5' }}>Verifikasi Gagal</h2>
              <p className="text-sm mb-6" style={{ color: '#8899BB' }}>{message}</p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/register"
                  className="inline-block px-6 py-2.5 rounded-full text-sm font-medium text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #4F9CF9, #2563eb)', boxShadow: '0 0 16px rgba(79,156,249,0.3)' }}
                >
                  Daftar Ulang
                </Link>
                <Link href="/login" className="text-sm" style={{ color: '#8899BB' }}>
                  Kembali ke Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
