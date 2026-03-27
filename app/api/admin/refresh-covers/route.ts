import { getServerUser } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/service'
import { fetchOgImageFromUrl } from '@/lib/og-fetch'

export async function POST() {
  const user = await getServerUser()
  if (!user || user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Get all books with no cover but has externalUrl
  const { data: books } = await supabase
    .from('Book')
    .select('id, externalUrl')
    .is('coverImage', null)
    .not('externalUrl', 'is', null)

  if (!books || books.length === 0) {
    return Response.json({ updated: 0, message: 'Tidak ada buku yang perlu diperbarui.' })
  }

  let updated = 0
  for (const book of books) {
    if (!book.externalUrl) continue
    const image = await fetchOgImageFromUrl(book.externalUrl)
    if (image) {
      await supabase.from('Book').update({ coverImage: image }).eq('id', book.id)
      updated++
    }
  }

  return Response.json({ updated, total: books.length, message: `${updated} dari ${books.length} cover berhasil diperbarui.` })
}
