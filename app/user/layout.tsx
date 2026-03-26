import { getServerUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import UserNavbar from '@/components/layout/UserNavbar'

// Force dynamic rendering — semua halaman user butuh auth & DB, tidak boleh di-prerender saat build
export const dynamic = 'force-dynamic'

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser()
  if (!user) redirect('/login')
  if (user.role === 'ADMIN') redirect('/admin/dashboard')

  return (
    <div className="min-h-screen">
      <UserNavbar user={{ name: user.name, email: user.email, username: user.username ?? null, avatarUrl: user.avatarUrl ?? null }} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
