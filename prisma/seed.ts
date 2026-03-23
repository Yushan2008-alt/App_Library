import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../app/generated/prisma/client'
import bcrypt from 'bcryptjs'

const url = new URL(process.env.DATABASE_URL ?? 'mysql://root:@localhost:3306/app_library')
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
    prisma.category.upsert({
      where: { slug: 'fiksi' },
      update: {},
      create: { name: 'Fiksi', slug: 'fiksi' },
    }),
    prisma.category.upsert({
      where: { slug: 'teknologi' },
      update: {},
      create: { name: 'Teknologi', slug: 'teknologi' },
    }),
    prisma.category.upsert({
      where: { slug: 'sains' },
      update: {},
      create: { name: 'Sains', slug: 'sains' },
    }),
    prisma.category.upsert({
      where: { slug: 'sejarah' },
      update: {},
      create: { name: 'Sejarah', slug: 'sejarah' },
    }),
    prisma.category.upsert({
      where: { slug: 'seni' },
      update: {},
      create: { name: 'Seni & Budaya', slug: 'seni' },
    }),
  ])

  const [fiksi, teknologi, sains, sejarah, seni] = categories

  // Admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@library.com' },
    update: {},
    create: {
      name: 'Administrator',
      email: 'admin@library.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  // Sample user
  const userPassword = await bcrypt.hash('user123', 12)
  await prisma.user.upsert({
    where: { email: 'user@library.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'user@library.com',
      password: userPassword,
      role: 'USER',
    },
  })

  // Sample books
  const books = [
    {
      title: 'Laskar Pelangi',
      author: 'Andrea Hirata',
      description: 'Novel yang menceritakan perjuangan anak-anak miskin di Belitung untuk mendapatkan pendidikan yang layak. Sebuah kisah inspiratif tentang semangat, persahabatan, dan mimpi.',
      coverImage: null,
      externalUrl: 'https://archive.org/details/laskar-pelangi',
      stock: 3,
      categoryId: fiksi.id,
    },
    {
      title: 'Bumi Manusia',
      author: 'Pramoedya Ananta Toer',
      description: 'Bagian pertama dari Tetralogi Buru. Kisah cinta Minke dan Annelies di zaman kolonial Belanda yang penuh dengan konflik sosial dan budaya.',
      coverImage: null,
      externalUrl: 'https://archive.org/details/bumi-manusia',
      stock: 2,
      categoryId: fiksi.id,
    },
    {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      description: 'Panduan praktis tentang cara menulis kode yang bersih, mudah dibaca, dan mudah dipelihara. Wajib dibaca oleh setiap programmer profesional.',
      coverImage: null,
      externalUrl: 'https://archive.org/details/clean-code',
      stock: 4,
      categoryId: teknologi.id,
    },
    {
      title: 'The Pragmatic Programmer',
      author: 'Andrew Hunt, David Thomas',
      description: 'Buku klasik tentang filosofi dan praktik pengembangan perangkat lunak yang efektif. Berisi tips dan teknik dari programmer berpengalaman.',
      coverImage: null,
      externalUrl: 'https://archive.org/details/pragmatic-programmer',
      stock: 2,
      categoryId: teknologi.id,
    },
    {
      title: 'A Brief History of Time',
      author: 'Stephen Hawking',
      description: 'Eksplorasi mendalam tentang alam semesta, dari Big Bang hingga lubang hitam, ditulis dengan bahasa yang mudah dipahami oleh pembaca awam.',
      coverImage: null,
      externalUrl: 'https://archive.org/details/brief-history-time',
      stock: 3,
      categoryId: sains.id,
    },
    {
      title: 'Sapiens: Riwayat Singkat Umat Manusia',
      author: 'Yuval Noah Harari',
      description: 'Perjalanan manusia dari zaman prasejarah hingga era modern. Buku ini mengeksplorasi bagaimana Homo Sapiens menjadi spesies yang paling berpengaruh di Bumi.',
      coverImage: null,
      externalUrl: 'https://archive.org/details/sapiens-harari',
      stock: 5,
      categoryId: sejarah.id,
    },
    {
      title: 'Sejarah Indonesia Modern',
      author: 'M.C. Ricklefs',
      description: 'Sejarah komprehensif Indonesia dari abad ke-16 hingga era modern. Buku referensi penting bagi siapa saja yang ingin memahami perjalanan bangsa Indonesia.',
      coverImage: null,
      externalUrl: 'https://archive.org/details/sejarah-indonesia',
      stock: 2,
      categoryId: sejarah.id,
    },
    {
      title: 'Filosofi Teras',
      author: 'Henry Manampiring',
      description: 'Penerapan filsafat Stoa dalam kehidupan modern. Buku panduan hidup yang mengajarkan cara menghadapi tantangan dengan ketenangan dan kebijaksanaan.',
      coverImage: null,
      externalUrl: 'https://archive.org/details/filosofi-teras',
      stock: 4,
      categoryId: seni.id,
    },
    {
      title: 'The Design of Everyday Things',
      author: 'Don Norman',
      description: 'Buku klasik tentang desain yang berpusat pada manusia. Mengajarkan bagaimana desain yang baik membuat hidup lebih mudah dan menyenangkan.',
      coverImage: null,
      externalUrl: 'https://archive.org/details/design-everyday',
      stock: 2,
      categoryId: seni.id,
    },
    {
      title: 'Cosmos',
      author: 'Carl Sagan',
      description: 'Perjalanan melalui alam semesta yang luar biasa bersama Carl Sagan. Buku yang menginspirasi jutaan orang untuk mencintai ilmu pengetahuan dan memahami tempat kita di kosmos.',
      coverImage: null,
      externalUrl: 'https://archive.org/details/cosmos-sagan',
      stock: 3,
      categoryId: sains.id,
    },
  ]

  for (const book of books) {
    await prisma.book.create({ data: book })
  }

  console.log('✅ Seed completed!')
  console.log('📧 Admin: admin@library.com / admin123')
  console.log('📧 User: user@library.com / user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
