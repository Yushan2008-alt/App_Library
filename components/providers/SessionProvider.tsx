'use client'

// NextAuth removed — Supabase Auth handles sessions via cookies
export default function SessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
