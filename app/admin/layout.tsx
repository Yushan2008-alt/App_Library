import { getServerUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/layout/AdminSidebar'

// Force dynamic rendering — semua halaman admin butuh auth & DB, tidak boleh di-prerender saat build
export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser()
  if (!user || user.role !== 'ADMIN') redirect('/login')

  return (
    <div className="flex min-h-screen">
      <AdminSidebar user={{ name: user.name, email: user.email, username: user.username ?? null, avatarUrl: user.avatarUrl ?? null }} />
      <main className="flex-1 md:ml-64 pt-14 md:pt-0 min-h-screen w-0">
        {children}
      </main>
    </div>
  )
}
