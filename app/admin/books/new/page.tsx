import { createClient } from '@/lib/supabase/server'
import BookForm from '../BookForm'

export const dynamic = 'force-dynamic'

export default async function NewBookPage() {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let categories: any[] = []
  try {
    const { data } = await supabase.from('Category').select('id, name, slug').order('name', { ascending: true })
    categories = data ?? []
  } catch (e) {
    console.error('[admin/books/new] DB error:', e)
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#F0F4FF' }}>Tambah Buku Baru</h1>
        <p className="text-sm mt-1" style={{ color: '#8899BB' }}>Isi form berikut untuk menambah buku ke koleksi</p>
      </div>
      <BookForm categories={categories} />
    </div>
  )
}
