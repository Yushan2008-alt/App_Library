import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../app/generated/prisma/client'

const pool = new Pool({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any)
const prisma = new PrismaClient({ adapter })

async function main() {
  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'fiksi' },     update: {}, create: { name: 'Fiksi',        slug: 'fiksi' } }),
    prisma.category.upsert({ where: { slug: 'teknologi' }, update: {}, create: { name: 'Teknologi',    slug: 'teknologi' } }),
    prisma.category.upsert({ where: { slug: 'sains' },     update: {}, create: { name: 'Sains',        slug: 'sains' } }),
    prisma.category.upsert({ where: { slug: 'sejarah' },   update: {}, create: { name: 'Sejarah',      slug: 'sejarah' } }),
    prisma.category.upsert({ where: { slug: 'seni' },      update: {}, create: { name: 'Seni & Budaya', slug: 'seni' } }),
    prisma.category.upsert({ where: { slug: 'komik' },     update: {}, create: { name: 'Komik & Manga', slug: 'komik' } }),
    prisma.category.upsert({ where: { slug: 'filsafat' },  update: {}, create: { name: 'Filsafat',     slug: 'filsafat' } }),
  ])

  const [fiksi, teknologi, sains, sejarah, seni, komik, filsafat] = categories

  // Books — upsert by title to avoid duplicates on repeated seed
  const books = [
    // ── FIKSI ─────────────────────────────────────────────────────────────────
    {
      title: 'Laskar Pelangi',
      author: 'Andrea Hirata',
      description: 'Novel yang menceritakan perjuangan anak-anak miskin di Belitung untuk mendapatkan pendidikan yang layak. Sebuah kisah inspiratif tentang semangat, persahabatan, dan mimpi.',
      coverImage: null,
      externalUrl: 'https://openlibrary.org/search?q=laskar+pelangi&author=andrea+hirata',
      stock: 3,
      categoryId: fiksi.id,
    },
    {
      title: 'Bumi Manusia',
      author: 'Pramoedya Ananta Toer',
      description: 'Bagian pertama dari Tetralogi Buru. Kisah cinta Minke dan Annelies di zaman kolonial Belanda yang penuh dengan konflik sosial dan budaya.',
      coverImage: 'https://covers.openlibrary.org/b/isbn/0140256350-L.jpg',
      externalUrl: 'https://openlibrary.org/search?q=bumi+manusia&author=pramoedya',
      stock: 2,
      categoryId: fiksi.id,
    },
    {
      title: "Sophie's World",
      author: 'Jostein Gaarder',
      description: 'Novel filsafat yang menceritakan perjalanan Sophie Amundsen mempelajari sejarah filsafat dari seorang guru misterius. Cara paling menyenangkan untuk belajar filsafat.',
      coverImage: 'https://covers.openlibrary.org/b/isbn/0374530718-L.jpg',
      externalUrl: 'https://openlibrary.org/works/OL54829W',
      stock: 3,
      categoryId: fiksi.id,
    },

    // ── TEKNOLOGI ──────────────────────────────────────────────────────────────
    {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      description: 'Panduan praktis tentang cara menulis kode yang bersih, mudah dibaca, dan mudah dipelihara. Wajib dibaca oleh setiap programmer profesional.',
      coverImage: 'https://covers.openlibrary.org/b/isbn/0132350882-L.jpg',
      externalUrl: 'https://openlibrary.org/works/OL7353227M',
      stock: 4,
      categoryId: teknologi.id,
    },
    {
      title: 'The Pragmatic Programmer',
      author: 'Andrew Hunt, David Thomas',
      description: 'Buku klasik tentang filosofi dan praktik pengembangan perangkat lunak yang efektif. Berisi tips dan teknik dari programmer berpengalaman.',
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg',
      externalUrl: 'https://openlibrary.org/works/OL2900821W',
      stock: 2,
      categoryId: teknologi.id,
    },

    // ── SAINS ──────────────────────────────────────────────────────────────────
    {
      title: 'A Brief History of Time',
      author: 'Stephen Hawking',
      description: 'Eksplorasi mendalam tentang alam semesta, dari Big Bang hingga lubang hitam, ditulis dengan bahasa yang mudah dipahami oleh pembaca awam.',
      coverImage: 'https://covers.openlibrary.org/b/isbn/0553380168-L.jpg',
      externalUrl: 'https://openlibrary.org/works/OL45883W',
      stock: 3,
      categoryId: sains.id,
    },
    {
      title: 'Cosmos',
      author: 'Carl Sagan',
      description: 'Perjalanan melalui alam semesta yang luar biasa bersama Carl Sagan. Buku yang menginspirasi jutaan orang untuk mencintai ilmu pengetahuan dan memahami tempat kita di kosmos.',
      coverImage: 'https://covers.openlibrary.org/b/isbn/0345331354-L.jpg',
      externalUrl: 'https://openlibrary.org/works/OL18022W',
      stock: 3,
      categoryId: sains.id,
    },
    {
      title: 'Pale Blue Dot',
      author: 'Carl Sagan',
      description: 'Carl Sagan mengajak pembaca merenungkan tempat manusia di alam semesta yang luas. Terinspirasi dari foto Bumi yang diambil dari jarak 6 miliar kilometer oleh Voyager 1.',
      coverImage: 'https://covers.openlibrary.org/b/isbn/0345376595-L.jpg',
      externalUrl: 'https://openlibrary.org/works/OL18023W',
      stock: 3,
      categoryId: sains.id,
    },
    {
      title: 'Astrophysics for People in a Hurry',
      author: 'Neil deGrasse Tyson',
      description: 'Panduan singkat dan padat tentang astrofisika yang ditulis untuk semua orang. Neil deGrasse Tyson menjelaskan konsep-konsep besar alam semesta dengan cara yang mudah dipahami.',
      coverImage: 'https://covers.openlibrary.org/b/isbn/0393609391-L.jpg',
      externalUrl: 'https://openlibrary.org/works/OL17858041W',
      stock: 4,
      categoryId: sains.id,
    },
    {
      title: 'The Elegant Universe',
      author: 'Brian Greene',
      description: 'Perjalanan ke dunia teori string, dimensi tersembunyi, dan kemungkinan adanya alam semesta paralel. Brian Greene menjelaskan fisika modern dengan cara yang memukau.',
      coverImage: 'https://covers.openlibrary.org/b/isbn/0393058581-L.jpg',
      externalUrl: 'https://openlibrary.org/works/OL2637831W',
      stock: 2,
      categoryId: sains.id,
    },
    {
      title: 'The Disappearing Spoon',
      author: 'Sam Kean',
      description: 'Kisah-kisah menarik di balik unsur-unsur dalam tabel periodik. Sam Kean mengungkap sejarah, sains, dan keanehan dari setiap elemen kimia dengan cara yang menghibur.',
      coverImage: 'https://covers.openlibrary.org/b/isbn/0316051640-L.jpg',
      externalUrl: 'https://openlibrary.org/works/OL15537178W',
      stock: 3,
      categoryId: sains.id,
    },
    {
      title: "Napoleon's Buttons",
      author: 'Penny Le Couteur, Jay Burreson',
      description: 'Bagaimana 17 molekul kimia mengubah sejarah dunia. Dari rempah-rempah hingga bahan peledak, buku ini mengungkap peran kimia dalam membentuk peradaban manusia.',
      coverImage: 'https://covers.openlibrary.org/b/isbn/1585423319-L.jpg',
      externalUrl: 'https://openlibrary.org/works/OL8282609W',
      stock: 2,
      categoryId: sains.id,
    },

    // ── SEJARAH ────────────────────────────────────────────────────────────────
    {
      title: 'Sapiens: Riwayat Singkat Umat Manusia',
      author: 'Yuval Noah Harari',
      description: 'Perjalanan manusia dari zaman prasejarah hingga era modern. Buku ini mengeksplorasi bagaimana Homo Sapiens menjadi spesies yang paling berpengaruh di Bumi.',
      coverImage: 'https://covers.openlibrary.org/b/isbn/0062316095-L.jpg',
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

    // ── SENI & BUDAYA ──────────────────────────────────────────────────────────
    {
      title: 'The Design of Everyday Things',
      author: 'Don Norman',
      description: 'Buku klasik tentang desain yang berpusat pada manusia. Mengajarkan bagaimana desain yang baik membuat hidup lebih mudah dan menyenangkan.',
      coverImage: 'https://covers.openlibrary.org/b/isbn/0465050654-L.jpg',
      externalUrl: 'https://openlibrary.org/works/OL8193866W',
      stock: 2,
      categoryId: seni.id,
    },

    // ── KOMIK & MANGA ──────────────────────────────────────────────────────────
    {
      title: 'Naruto, Vol. 1',
      author: 'Masashi Kishimoto',
      description: 'Kisah Naruto Uzumaki, ninja muda bertekad menjadi Hokage di Desa Konoha. Petualangan epik penuh aksi, persahabatan, dan perjuangan yang menginspirasi jutaan penggemar di seluruh dunia.',
      coverImage: 'https://covers.openlibrary.org/b/isbn/1569319006-L.jpg',
      externalUrl: 'https://openlibrary.org/works/OL26324793W',
      stock: 5,
      categoryId: komik.id,
    },
    {
      title: 'One Piece, Vol. 1',
      author: 'Eiichiro Oda',
      description: 'Monkey D. Luffy dan mimpinya menjadi Raja Bajak Laut. Petualangan laut yang penuh humor, aksi, dan persahabatan yang telah menjadi manga terlaris sepanjang masa.',
      coverImage: null,
      externalUrl: 'https://openlibrary.org/search?q=one+piece+eiichiro+oda+vol+1',
      stock: 5,
      categoryId: komik.id,
    },
    {
      title: 'Attack on Titan, Vol. 1',
      author: 'Hajime Isayama',
      description: 'Di dunia di mana manusia hidup di balik tembok raksasa untuk berlindung dari Titan pemangsa manusia, Eren Yeager bersumpah membasmi semua Titan setelah menyaksikan tragedi yang mengerikan.',
      coverImage: 'https://covers.openlibrary.org/b/isbn/1612620248-L.jpg',
      externalUrl: 'https://openlibrary.org/works/OL16797658W',
      stock: 4,
      categoryId: komik.id,
    },
    {
      title: 'Fullmetal Alchemist, Vol. 1',
      author: 'Hiromu Arakawa',
      description: "Dua bersaudara, Edward dan Alphonse Elric, mencari Philosopher's Stone untuk memulihkan tubuh mereka setelah ritual alkimia yang gagal. Petualangan penuh aksi, misteri, dan emosi yang mendalam.",
      coverImage: 'https://covers.openlibrary.org/b/isbn/1591169208-L.jpg',
      externalUrl: 'https://openlibrary.org/works/OL8355344W',
      stock: 3,
      categoryId: komik.id,
    },
    {
      title: 'Death Note, Vol. 1',
      author: 'Tsugumi Ohba, Takeshi Obata',
      description: 'Light Yagami menemukan buku catatan misterius yang dapat membunuh siapa saja yang namanya ditulis di dalamnya. Thriller psikologis tentang keadilan, kekuasaan, dan moralitas.',
      coverImage: 'https://covers.openlibrary.org/b/isbn/1421501694-L.jpg',
      externalUrl: 'https://openlibrary.org/works/OL8121846W',
      stock: 3,
      categoryId: komik.id,
    },
    {
      title: 'Fruits Basket, Vol. 1',
      author: 'Natsuki Takaya',
      description: 'Tohru Honda tinggal bersama keluarga Sohma yang menyimpan rahasia — mereka berubah menjadi hewan-hewan dari zodiak China saat disentuh oleh lawan jenis. Kisah romance yang hangat dan menyentuh hati.',
      coverImage: 'https://covers.openlibrary.org/b/isbn/1591164397-L.jpg',
      externalUrl: 'https://openlibrary.org/works/OL8030044W',
      stock: 4,
      categoryId: komik.id,
    },
    {
      title: 'Kimi ni Todoke, Vol. 1',
      author: 'Karuho Shiina',
      description: 'Sawako Kuronuma, gadis pemalu yang disalahpahami teman-temannya, menemukan cahaya baru dalam hidupnya melalui Kazehaya yang populer dan tulus. Kisah cinta remaja yang manis dan menggemaskan.',
      coverImage: 'https://covers.openlibrary.org/b/isbn/1421527553-L.jpg',
      externalUrl: 'https://openlibrary.org/works/OL14857163W',
      stock: 4,
      categoryId: komik.id,
    },
    {
      title: 'Your Lie in April, Vol. 1',
      author: 'Naoshi Arakawa',
      description: 'Kousei Arima, pianis prodigy yang kehilangan kemampuan mendengar musiknya sendiri, bertemu Kaori Miyazono yang mengubah hidupnya. Kisah cinta yang indah sekaligus mengharukan tentang musik dan kehilangan.',
      coverImage: 'https://covers.openlibrary.org/b/isbn/1632360578-L.jpg',
      externalUrl: 'https://openlibrary.org/works/OL17356613W',
      stock: 3,
      categoryId: komik.id,
    },

    // ── FILSAFAT ───────────────────────────────────────────────────────────────
    {
      title: 'Filosofi Teras',
      author: 'Henry Manampiring',
      description: 'Penerapan filsafat Stoa dalam kehidupan modern oleh penulis Indonesia. Buku panduan hidup yang mengajarkan cara menghadapi tantangan dengan ketenangan dan kebijaksanaan.',
      coverImage: null,
      externalUrl: 'https://openlibrary.org/search?q=filosofi+teras+henry+manampiring',
      stock: 4,
      categoryId: filsafat.id,
    },
    {
      title: 'Meditations',
      author: 'Marcus Aurelius',
      description: 'Catatan pribadi Kaisar Romawi Marcus Aurelius tentang filosofi Stoa. Salah satu karya paling berpengaruh dalam sejarah filsafat Barat yang masih relevan hingga hari ini.',
      coverImage: 'https://covers.openlibrary.org/b/isbn/0140449337-L.jpg',
      externalUrl: 'https://openlibrary.org/works/OL12932W',
      stock: 4,
      categoryId: filsafat.id,
    },
    {
      title: "Man's Search for Meaning",
      author: 'Viktor E. Frankl',
      description: 'Kisah Viktor Frankl sebagai tahanan kamp konsentrasi Nazi dan bagaimana ia menemukan makna hidup di tengah penderitaan. Dasar dari logoterapi, pendekatan psikoterapi yang berfokus pada makna.',
      coverImage: 'https://covers.openlibrary.org/b/isbn/0807014273-L.jpg',
      externalUrl: 'https://openlibrary.org/works/OL67915W',
      stock: 3,
      categoryId: filsafat.id,
    },
    {
      title: 'The Art of War',
      author: 'Sun Tzu',
      description: 'Traktat militer kuno dari China yang ditulis oleh Sun Tzu pada abad ke-5 SM. Ajarannya tentang strategi, kepemimpinan, dan taktik masih diterapkan dalam bisnis, olahraga, dan kehidupan modern.',
      coverImage: 'https://covers.openlibrary.org/b/isbn/1590302257-L.jpg',
      externalUrl: 'https://openlibrary.org/works/OL1429916W',
      stock: 5,
      categoryId: filsafat.id,
    },
  ]

  for (const book of books) {
    const existing = await prisma.book.findFirst({ where: { title: book.title } })
    if (!existing) {
      await prisma.book.create({ data: book })
    } else {
      await prisma.book.update({
        where: { id: existing.id },
        data: {
          externalUrl: book.externalUrl,
          coverImage: book.coverImage ?? existing.coverImage,
          categoryId: book.categoryId,
          description: book.description,
        },
      })
    }
  }

  console.log('✅ Seed completed!')
  console.log(`📚 ${books.length} buku, ${categories.length} kategori`)
  console.log('👤 Admin : admin@library.com  / Adm!nL1br@ry#24')
  console.log('👤 User  : user@library.com   / user123')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect(); await pool.end() })
