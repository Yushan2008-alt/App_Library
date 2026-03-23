import type { Metadata } from 'next'
import './globals.css'
import SessionProvider from '@/components/providers/SessionProvider'
import WaveBackground from '@/components/ui/WaveBackground'

export const metadata: Metadata = {
  title: 'App-Library | Perpustakaan Digital',
  description: 'Sistem perpustakaan digital dengan manajemen buku dan peminjaman',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full relative">
        <WaveBackground />
        <div className="relative" style={{ zIndex: 1 }}>
          <SessionProvider>{children}</SessionProvider>
        </div>
      </body>
    </html>
  )
}
