import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { formatDate, formatRupiah } from '@/lib/utils'
import Link from 'next/link'

const STATUS = {
  PENDING:  { bg: 'rgba(245,158,11,0.15)',  text: '#fbbf24', label: 'Menunggu' },
  APPROVED: { bg: 'rgba(16,185,129,0.15)',  text: '#34d399', label: 'Disetujui' },
  REJECTED: { bg: 'rgba(239,68,68,0.15)',   text: '#fca5a5', label: 'Ditolak' },
  RETURNED: { bg: 'rgba(79,156,249,0.15)',  text: '#93c5fd', label: 'Dikembalikan' },
}

export default async function UserDetailPage(props: PageProps<'/admin/users/[id]'>) {
  const { id } = await props.params
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      loans: {
        include: { book: { select: { title: true, author: true } } },
        orderBy: { requestedAt: 'desc' },
      },
    },
  })

  if (!user || user.role !== 'USER') notFound()

  const totalFine = user.loans.reduce((sum, l) => sum + l.fine, 0)

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/admin/users" className="text-sm hover:underline" style={{ color: '#4F9CF9' }}>← Kembali</Link>
      </div>

      <div className="rounded-2xl border p-6 mb-6 flex items-center gap-4" style={{ background: '#162236', borderColor: '#1E2E45' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #4F9CF9, #7B5EA7)', color: 'white' }}>
          {user.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#F0F4FF' }}>{user.name}</h1>
          <p className="text-sm" style={{ color: '#8899BB' }}>{user.email}</p>
          <p className="text-xs mt-1" style={{ color: '#8899BB' }}>Bergabung {formatDate(user.createdAt)}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{formatRupiah(totalFine)}</p>
          <p className="text-xs" style={{ color: '#8899BB' }}>Total denda</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-4" style={{ color: '#F0F4FF' }}>Riwayat Pinjaman</h2>
      <div className="rounded-2xl border overflow-hidden" style={{ background: '#162236', borderColor: '#1E2E45' }}>
        {user.loans.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm" style={{ color: '#8899BB' }}>Belum ada riwayat pinjaman</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #1E2E45' }}>
                {['Buku', 'Tanggal Pinjam', 'Jatuh Tempo', 'Denda', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8899BB' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {user.loans.map((loan) => {
                const s = STATUS[loan.status as keyof typeof STATUS] ?? STATUS.PENDING
                return (
                  <tr key={loan.id} style={{ borderBottom: '1px solid #1E2E45' }}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium" style={{ color: '#F0F4FF' }}>{loan.book.title}</p>
                      <p className="text-xs" style={{ color: '#8899BB' }}>{loan.book.author}</p>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#8899BB' }}>{formatDate(loan.requestedAt)}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#8899BB' }}>{loan.dueDate ? formatDate(loan.dueDate) : '-'}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: loan.fine > 0 ? '#fbbf24' : '#8899BB' }}>
                      {loan.fine > 0 ? formatRupiah(loan.fine) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs" style={{ background: s.bg, color: s.text }}>{s.label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
