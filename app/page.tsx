import { getServerUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const user = await getServerUser()

  if (!user) redirect('/login')
  if (user.role === 'ADMIN') redirect('/admin/dashboard')
  redirect('/user/dashboard')
}
