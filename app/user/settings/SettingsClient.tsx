'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useRef } from 'react'
import Image from 'next/image'

interface Props {
  user: { name: string; email: string; username: string | null; avatarUrl: string | null }
}

const inputStyle = {
  background: 'rgba(9,22,48,0.7)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#F0F4FF',
}

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass rounded-2xl p-6 transition-all duration-300 hover:shadow-lg ${className}`}
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
      {children}
    </div>
  )
}

function SaveButton({ loading, label, loadingLabel, color = '#4F9CF9' }: { loading: boolean; label: string; loadingLabel: string; color?: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-200 active:scale-95"
      style={{
        background: loading ? 'rgba(79,156,249,0.3)' : `linear-gradient(135deg, ${color}, #2563eb)`,
        boxShadow: loading ? 'none' : `0 0 16px ${color}55`,
        cursor: loading ? 'not-allowed' : 'pointer',
        transform: loading ? 'none' : undefined,
      }}
    >
      {loading ? loadingLabel : label}
    </button>
  )
}

export default function SettingsClient({ user }: Props) {
  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // Profile state
  const [firstName, setFirstName] = useState(user.name.split(' ')[0] ?? '')
  const [lastName, setLastName] = useState(user.name.split(' ').slice(1).join(' ') ?? '')
  const [username, setUsername] = useState(user.username ?? '')
  const [savedDisplayName, setSavedDisplayName] = useState(user.username || user.name)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState(false)

  // Password change state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  // Email change state
  const [newEmail, setNewEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess(false)
    setProfileLoading(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, username }),
      })
      const data = await res.json()
      if (!res.ok) { setProfileError(data.error ?? 'Gagal menyimpan.'); return }
      setProfileSuccess(true)
      setSavedDisplayName(data.username || data.name || [firstName, lastName].filter(Boolean).join(' '))
    } catch {
      setProfileError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setProfileLoading(false)
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPwError('')
    setPwSuccess(false)
    if (newPassword.length < 8) { setPwError('Password minimal 8 karakter'); return }
    if (newPassword !== confirmPassword) { setPwError('Password tidak cocok'); return }
    setPwLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) { setPwError(error.message); return }
      setPwSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      setPwError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setPwLoading(false)
    }
  }

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault()
    setEmailError('')
    setEmailSent(false)
    setEmailLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser(
        { email: newEmail },
        { emailRedirectTo: `${window.location.origin.replace('0.0.0.0', 'localhost')}/auth/callback` }
      )
      if (error) { setEmailError(error.message); return }
      setEmailSent(true)
    } catch {
      setEmailError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setEmailLoading(false)
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarError('')
    // Preview
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
    // Upload
    setAvatarLoading(true)
    try {
      const form = new FormData()
      form.append('avatar', file)
      const res = await fetch('/api/user/avatar', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) { setAvatarError(data.error ?? 'Gagal upload foto.'); setAvatarPreview(null); return }
      setAvatarUrl(data.avatarUrl)
      window.dispatchEvent(new CustomEvent('avatarUpdated', { detail: { avatarUrl: data.avatarUrl } }))
    } catch {
      setAvatarError('Terjadi kesalahan. Coba lagi.')
      setAvatarPreview(null)
    } finally {
      setAvatarLoading(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }

  const displayName = savedDisplayName

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#F0F4FF' }}>Pengaturan Akun</h1>
          <p className="text-sm mt-1" style={{ color: '#8899BB' }}>Kelola informasi dan keamanan akun kamu</p>
        </div>

        {/* Profile info card */}
        <Section>
          <div className="flex items-center gap-4 mb-6">
            {/* Clickable avatar */}
            <div className="relative flex-shrink-0 group">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarLoading}
                className="w-16 h-16 rounded-2xl overflow-hidden transition-transform duration-200 hover:scale-105 active:scale-95 relative"
                style={{ background: 'linear-gradient(135deg, #4F9CF9, #7B5EA7)' }}
                title="Klik untuk ganti foto"
              >
                {(avatarPreview || avatarUrl) ? (
                  <Image
                    src={avatarPreview || avatarUrl!}
                    alt="Avatar"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="flex items-center justify-center w-full h-full text-2xl font-bold text-white">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
                {/* Overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: 'rgba(0,0,0,0.45)' }}>
                  {avatarLoading ? (
                    <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </div>
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <p className="font-bold text-lg" style={{ color: '#F0F4FF' }}>{displayName}</p>
              <p className="text-sm" style={{ color: '#8899BB' }}>{user.email}</p>
              <p className="text-xs mt-1" style={{ color: '#4F9CF9' }}>Klik foto untuk menggantinya</p>
              {avatarError && <p className="text-xs mt-1" style={{ color: '#FCA5A5' }}>{avatarError}</p>}
            </div>
          </div>

          <h2 className="font-semibold text-base mb-4 flex items-center gap-2" style={{ color: '#F0F4FF' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(79,156,249,0.15)' }}>
              <svg className="w-4 h-4" fill="none" stroke="#4F9CF9" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            Informasi Profil
          </h2>

          {profileSuccess && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm animate-pulse" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
              ✅ Profil berhasil diperbarui!
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-4">
            {profileError && (
              <div className="px-4 py-2.5 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
                {profileError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#8899BB' }}>Nama Depan</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Nama depan"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = '#4F9CF9'; e.target.style.boxShadow = '0 0 0 3px rgba(79,156,249,0.15)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#8899BB' }}>Nama Belakang</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Nama belakang"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = '#4F9CF9'; e.target.style.boxShadow = '0 0 0 3px rgba(79,156,249,0.15)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#8899BB' }}>Email Utama</label>
              <div className="w-full px-4 py-2.5 rounded-xl text-sm flex items-center gap-2"
                style={{ background: 'rgba(9,22,48,0.4)', border: '1px solid rgba(255,255,255,0.06)', color: '#8899BB' }}>
                <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {user.email}
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(79,156,249,0.15)', color: '#4F9CF9' }}>Digunakan untuk login</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#8899BB' }}>
                Username
                <span className="ml-2 font-normal" style={{ color: '#4F9CF9' }}>Nama tampilan di seluruh aplikasi</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username_kamu"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = '#4F9CF9'; e.target.style.boxShadow = '0 0 0 3px rgba(79,156,249,0.15)' }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            <SaveButton loading={profileLoading} label="Simpan Profil" loadingLabel="Menyimpan..." color="#4F9CF9" />
          </form>
        </Section>

        {/* Change Password */}
        <Section>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(79,156,249,0.15)' }}>
              <svg className="w-4 h-4" fill="none" stroke="#4F9CF9" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-base" style={{ color: '#F0F4FF' }}>Ubah Password</h2>
              <p className="text-sm" style={{ color: '#8899BB' }}>Masukkan password baru kamu</p>
            </div>
          </div>

          {pwSuccess && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
              ✅ Password berhasil diubah!
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-3">
            {pwError && (
              <div className="px-4 py-2.5 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
                {pwError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#8899BB' }}>Password Baru</label>
              <input
                type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                required minLength={8} placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = '#4F9CF9'; e.target.style.boxShadow = '0 0 0 3px rgba(79,156,249,0.15)' }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#8899BB' }}>Konfirmasi Password</label>
              <input
                type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                required placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = '#4F9CF9'; e.target.style.boxShadow = '0 0 0 3px rgba(79,156,249,0.15)' }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }}
              />
            </div>
            <SaveButton loading={pwLoading} label="Simpan Password" loadingLabel="Menyimpan..." color="#4F9CF9" />
          </form>
        </Section>

        {/* Change Email */}
        <Section>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(123,94,167,0.15)' }}>
              <svg className="w-4 h-4" fill="none" stroke="#7B5EA7" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-base" style={{ color: '#F0F4FF' }}>Ubah Email</h2>
              <p className="text-sm" style={{ color: '#8899BB' }}>Supabase akan mengirim link verifikasi ke email baru</p>
            </div>
          </div>

          {emailSent ? (
            <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(123,94,167,0.1)', border: '1px solid rgba(123,94,167,0.25)', color: '#c4b5fd' }}>
              ✅ Link verifikasi dikirim ke <strong>{newEmail}</strong>. Klik link tersebut untuk mengkonfirmasi perubahan email.
            </div>
          ) : (
            <form onSubmit={handleEmailChange} className="space-y-3">
              {emailError && (
                <div className="px-4 py-2.5 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
                  {emailError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#8899BB' }}>Email Baru</label>
                <input
                  type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                  required placeholder="emailbaru@contoh.com"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = '#7B5EA7'; e.target.style.boxShadow = '0 0 0 3px rgba(123,94,167,0.15)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              <SaveButton loading={emailLoading} label="Kirim Verifikasi" loadingLabel="Mengirim..." color="#7B5EA7" />
            </form>
          )}
        </Section>
      </div>
    </div>
  )
}
