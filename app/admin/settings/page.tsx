import { getServerUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SettingsClient from '@/app/user/settings/SettingsClient'

export default async function AdminSettingsPage() {
  const user = await getServerUser()
  if (!user || user.role !== 'ADMIN') redirect('/login')

  return <SettingsClient user={{ name: user.name ?? '', email: user.email ?? '', username: user.username ?? null, avatarUrl: user.avatarUrl ?? null }} />
}
