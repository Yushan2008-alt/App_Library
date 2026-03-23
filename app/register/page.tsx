'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Password tidak cocok')
      return
    }
    if (form.password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }

    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error); return }
    setSentEmail(form.email)
    setDone(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
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
          <p className="mt-1 text-sm" style={{ color: '#8899BB' }}>Buat akun baru</p>
        </div>

        {done ? (
          /* Email sent state */
          <div className="glass rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(79,156,249,0.15)' }}>
              <svg className="w-8 h-8" fill="none" stroke="#4F9CF9" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: '#F0F4FF' }}>Cek Email Kamu!</h2>
            <p className="text-sm mb-4" style={{ color: '#8899BB' }}>
              Kami mengirim link verifikasi ke
            </p>
            <p className="font-semibold mb-4" style={{ color: '#4F9CF9' }}>{sentEmail}</p>
            <p className="text-sm mb-6" style={{ color: '#8899BB' }}>
              Klik link dalam email untuk mengaktifkan akunmu. Link berlaku selama <strong style={{ color: '#F0F4FF' }}>24 jam</strong>.
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #4F9CF9, #2563eb)', boxShadow: '0 0 20px rgba(79,156,249,0.3)' }}
            >
              Ke Halaman Login
            </Link>
          </div>
        ) : (
          /* Register form */
          <div className="glass rounded-2xl p-8">
            <h2 className="text-xl font-semibold mb-6" style={{ color: '#F0F4FF' }}>Daftar akun</h2>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { key: 'name', label: 'Nama Lengkap', type: 'text', placeholder: 'John Doe' },
                { key: 'email', label: 'Email', type: 'email', placeholder: 'email@contoh.com' },
                { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
                { key: 'confirmPassword', label: 'Konfirmasi Password', type: 'password', placeholder: '••••••••' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#8899BB' }}>{label}</label>
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
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
                {loading ? 'Mendaftarkan...' : 'Daftar'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm" style={{ color: '#8899BB' }}>
              Sudah punya akun?{' '}
              <Link href="/login" className="font-medium hover:underline" style={{ color: '#4F9CF9' }}>Masuk</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
