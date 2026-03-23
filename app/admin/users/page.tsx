import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    include: {
      _count: { select: { loans: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#F0F4FF' }}>Manajemen Pengguna</h1>
        <p className="text-sm mt-1" style={{ color: '#8899BB' }}>{users.length} pengguna terdaftar</p>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ background: '#162236', borderColor: '#1E2E45' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid #1E2E45' }}>
              {['Pengguna', 'Email', 'Total Pinjaman', 'Bergabung', 'Aksi'].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8899BB' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-sm" style={{ color: '#8899BB' }}>Belum ada pengguna</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #1E2E45' }}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'linear-gradient(135deg, #4F9CF9, #7B5EA7)', color: 'white' }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-sm font-medium" style={{ color: '#F0F4FF' }}>{user.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: '#8899BB' }}>{user.email}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(79,156,249,0.15)', color: '#4F9CF9' }}>
                      {user._count.loans} pinjaman
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: '#8899BB' }}>{formatDate(user.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/users/${user.id}`} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: 'rgba(79,156,249,0.1)', color: '#4F9CF9' }}>
                      Detail
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
