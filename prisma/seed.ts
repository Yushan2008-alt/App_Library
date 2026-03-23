import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../app/generated/prisma/client'
import bcrypt from 'bcryptjs'

const url = new URL(process.env.DATABASE_URL ?? 'mysql://root:@127.0.0.1:3306/app_library')
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: parseInt(url.port || '3306'),
  user: decodeURIComponent(url.username) || 'root',
  password: decodeURIComponent(url.password) || '',
  database: url.pathname.slice(1),
})

const prisma = new PrismaClient({ adapter })

async function main() {
  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'fiksi' },     update: {}, create: { name: 'Fiksi',       slug: 'fiksi' } }),
    prisma.category.upsert({ where: { slug: 'teknologi' }, update: {}, create: { name: 'Teknologi',   slug: 'teknologi' } }),
    prisma.category.upsert({ where: { slug: 'sains' },     update: {}, create: { name: 'Sains',       slug: 'sains' } }),
    prisma.category.upsert({ where: { slug: 'sejarah' },   update: {}, create: { name: 'Sejarah',     slug: 'sejarah' } }),
    prisma.category.upsert({ where: { slug: 'seni' },      update: {}, create: { name: 'Seni & Budaya', slug: 'seni' } }),
  ])

  const [fiksi, teknologi, sains, sejarah, seni] = categories

  // Admin user
  const hashedAdmin = await bcrypt.hash('Adm!nL1br@ry#24', 12)
  await prisma.user.upsert({
    where: { email: 'admin@library.com' },
    update: {},
    create: { name: 'Administrator', email: 'admin@library.com', password: hashedAdmin, role: 'ADMIN', isVerified: true },
  })

  // Sample user
  const hashedUser = await bcrypt.hash('user123', 12)
  await prisma.user.upsert({
    where: { email: 'user@library.com' },
    update: {},
    create: { name: 'John Doe', email: 'user@library.com', password: hashedUser, role: 'USER', isVerified: true },
  })

  // Sample books — use upsert on title to avoid duplicates on repeated seed
  const books = [
    {
      title: 'Laskar Pelangi',
      author: 'Andrea Hirata',
      description: 'Novel yang menceritakan perjuangan anak-anak miskin di Belitung untuk mendapatkan pendidikan yang layak. Sebuah kisah inspiratif tentang semangat, persahabatan, dan mimpi.',
      coverImage: 'https://covers.openlibrary.org/b/id/8739161-L.jpg',
      externalUrl: 'https://openlibrary.org/search?q=laskar+pelangi&author=andrea+hirata',
      stock: 3,
      categoryId: fiksi.id,
    },
    {
      title: 'Bumi Manusia',
      author: 'Pramoedya Ananta Toer',
      description: 'Bagian pertama dari Tetralogi Buru. Kisah cinta Minke dan Annelies di zaman kolonial Belanda yang penuh dengan konflik sosial dan budaya.',
      coverImage: 'https://covers.openlibrary.org/b/id/12647532-L.jpg',
      externalUrl: 'https://openlibrary.org/search?q=bumi+manusia&author=pramoedya',
      stock: 2,
      categoryId: fiksi.id,
    },
    {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      description: 'Panduan praktis tentang cara menulis kode yang bersih, mudah dibaca, dan mudah dipelihara. Wajib dibaca oleh setiap programmer profesional.',
      coverImage: 'https://covers.openlibrary.org/b/id/8432472-L.jpg',
      externalUrl: 'https://openlibrary.org/works/OL7353227M',
      stock: 4,
      categoryId: teknologi.id,
    },
    {
      title: 'The Pragmatic Programmer',
      author: 'Andrew Hunt, David Thomas',
      description: 'Buku klasik tentang filosofi dan praktik pengembangan perangkat lunak yang efektif. Berisi tips dan teknik dari programmer berpengalaman.',
      coverImage: 'https://covers.openlibrary.org/b/id/9020148-L.jpg',
      externalUrl: 'https://openlibrary.org/works/OL2900821W',
      stock: 2,
      categoryId: teknologi.id,
    },
    {
      title: 'A Brief History of Time',
      author: 'Stephen Hawking',
      description: 'Eksplorasi mendalam tentang alam semesta, dari Big Bang hingga lubang hitam, ditulis dengan bahasa yang mudah dipahami oleh pembaca awam.',
      coverImage: 'https://covers.openlibrary.org/b/id/8416867-L.jpg',
      externalUrl: 'https://openlibrary.org/works/OL45883W',
      stock: 3,
      categoryId: sains.id,
    },
    {
      title: 'Sapiens: Riwayat Singkat Umat Manusia',
      author: 'Yuval Noah Harari',
      description: 'Perjalanan manusia dari zaman prasejarah hingga era modern. Buku ini mengeksplorasi bagaimana Homo Sapiens menjadi spesies yang paling berpengaruh di Bumi.',
      coverImage: 'https://covers.openlibrary.org/b/id/12771138-L.jpg',
      externalUrl: 'https://openlibrary.org/works/OL17731640W',
      stock: 5,
      categoryId: sejarah.id,
    },
    {
      title: 'Sejarah Indonesia Modern',
      author: 'M.C. Ricklefs',
      description: 'Sejarah komprehensif Indonesia dari abad ke-16 hingga era modern. Buku referensi penting bagi siapa saja yang ingin memahami perjalanan bangsa Indonesia.',
      coverImage: null,
      externalUrl: 'https://openlibrary.org/search?q=sejarah+indonesia+modern+ricklefs',
      stock: 2,
      categoryId: sejarah.id,
    },
    {
      title: 'Filosofi Teras',
      author: 'Henry Manampiring',
      description: 'Penerapan filsafat Stoa dalam kehidupan modern. Buku panduan hidup yang mengajarkan cara menghadapi tantangan dengan ketenangan dan kebijaksanaan.',
      coverImage: null,
      externalUrl: 'https://openlibrary.org/search?q=filosofi+teras+henry+manampiring',
      stock: 4,
      categoryId: seni.id,
    },
    {
      title: 'The Design of Everyday Things',
      author: 'Don Norman',
      description: 'Buku klasik tentang desain yang berpusat pada manusia. Mengajarkan bagaimana desain yang baik membuat hidup lebih mudah dan menyenangkan.',
      coverImage: 'https://covers.openlibrary.org/b/id/8454059-L.jpg',
      externalUrl: 'https://openlibrary.org/works/OL8193866W',
      stock: 2,
      categoryId: seni.id,
    },
    {
      title: 'Cosmos',
      author: 'Carl Sagan',
      description: 'Perjalanan melalui alam semesta yang luar biasa bersama Carl Sagan. Buku yang menginspirasi jutaan orang untuk mencintai ilmu pengetahuan dan memahami tempat kita di kosmos.',
      coverImage: 'https://covers.openlibrary.org/b/id/8447962-L.jpg',
      externalUrl: 'https://openlibrary.org/works/OL18022W',
      stock: 3,
      categoryId: sains.id,
    },
  ]

  for (const book of books) {
    const existing = await prisma.book.findFirst({ where: { title: book.title } })
    if (!existing) {
      await prisma.book.create({ data: book })
    } else {
      // Update external URL and cover for existing books
      await prisma.book.update({
        where: { id: existing.id },
        data: { externalUrl: book.externalUrl, coverImage: book.coverImage ?? existing.coverImage },
      })
    }
  }

  console.log('✅ Seed completed!')
  console.log('📧 Admin: admin@library.com / Adm!nL1br@ry#24')
  console.log('📧 User:  user@library.com / user123')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
