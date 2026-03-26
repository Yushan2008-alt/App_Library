# App-Library — Perpustakaan Digital

Aplikasi manajemen perpustakaan digital berbasis web, dibangun dengan Next.js 16, Prisma, MariaDB, dan NextAuth. Mendukung peminjaman buku, verifikasi email, notifikasi, dan manajemen lengkap via panel admin.

---

## Fitur Utama

### Halaman User
- **Koleksi Buku** — filter per kategori, pencarian judul/pengarang, detail buku, tombol pinjam
- **Pinjaman Saya** — riwayat pinjaman, status (Menunggu / Disetujui / Ditolak / Dikembalikan), info jatuh tempo & denda
- **Notifikasi** — pemberitahuan real-time saat pinjaman disetujui/ditolak
- **Pengaturan Akun** — ubah password & email via link verifikasi yang dikirim ke email
- **Dashboard** — ringkasan pinjaman aktif, menunggu approval, notif belum dibaca
- **Hamburger Menu** — navbar responsif untuk mobile

### Halaman Admin
- **Dashboard** — statistik live (total buku, pengguna, pinjaman aktif, terlambat, total denda)
- **Manajemen Buku** — tambah, edit, hapus buku; upload cover; stok otomatis
- **Manajemen Peminjaman** — approve/reject/return; kalkulasi denda otomatis
- **Manajemen Pengguna** — lihat semua user terdaftar
- **Manajemen Kategori** — tambah & kelola kategori buku

### Sistem Auth & Email
- **Registrasi** → email verifikasi dikirim via Resend; akun aktif setelah konfirmasi
- **Login** — validasi email terverifikasi, pesan error spesifik
- **Ubah Password / Email** — link verifikasi berbatas waktu (24 jam) dikirim ke email lama

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16.2.1 (App Router, Turbopack) |
| Database | MariaDB / MySQL via `@prisma/adapter-mariadb` |
| ORM | Prisma 7.5.0 |
| Auth | NextAuth v4 (JWT strategy, CredentialsProvider) |
| Email | Resend API |
| Styling | Tailwind CSS v4, glassmorphism |
| Language | TypeScript |

---

## Kategori Buku

| Kategori | Deskripsi |
|---|---|
| Fiksi | Novel dan karya sastra |
| Sains | Astronomi, kimia, fisika, biologi |
| Sejarah | Sejarah dunia dan Indonesia |
| Seni & Budaya | Desain, seni, budaya |
| Teknologi | Programming, software engineering |
| Komik & Manga | Manga action, romance, thriller |
| Filsafat | Filsafat Barat, Timur, dan modern |

---

## Setup Lokal (XAMPP / MySQL)

### 1. Prasyarat
- Node.js 18+
- XAMPP (MySQL / MariaDB) **atau** Docker

### 2. Clone & Install
```bash
git clone <repo-url>
cd app-library
npm install
```

### 3. Konfigurasi Environment
```bash
cp .env.example .env
# Edit .env sesuai konfigurasi lokal
```

### 4. Jalankan MySQL
Buka XAMPP Control Panel → klik **Start** pada MySQL.

### 5. Buat Database
```sql
CREATE DATABASE app_library CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 6. Migrate & Seed
```bash
npx prisma db push        # Sinkronisasi schema ke database
npm run db:seed           # Isi data awal (buku, kategori, akun demo)
```

### 7. Jalankan Dev Server
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## Setup dengan Docker (Rekomendasi untuk deployment)

Tidak perlu install MySQL secara manual — semua dijalankan via Docker.

### 1. Prasyarat
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 2. Konfigurasi
```bash
cp .env.example .env.docker
# Edit RESEND_API_KEY dan NEXTAUTH_SECRET di .env.docker
```

### 3. Jalankan
```bash
docker compose up -d
```

Buka [http://localhost:3000](http://localhost:3000)

### 4. Seed Data (pertama kali)
```bash
docker compose exec app npm run db:seed
```

### 5. Stop
```bash
docker compose down
```

---

## Environment Variables

Lihat `.env.example` untuk template lengkap.

| Variable | Deskripsi | Contoh |
|---|---|---|
| `DATABASE_URL` | Koneksi MySQL | `mysql://root:@127.0.0.1:3306/app_library` |
| `NEXTAUTH_SECRET` | Secret JWT (wajib random di production) | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL publik aplikasi | `http://localhost:3000` |
| `FINE_PER_DAY` | Denda per hari (Rupiah) | `5000` |
| `RESEND_API_KEY` | API key dari resend.com | `re_xxxx` |
| `RESEND_FROM_EMAIL` | Alamat pengirim email | `noreply@domain.com` |

---

## Akun Default (setelah seed)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@library.com` | `Adm!nL1br@ry#24` |
| User | `user@library.com` | `user123` |

> **Penting:** Ganti password admin sebelum deploy ke production.

---

## Deployment ke Production

### Opsi 1 — Vercel + Railway/PlanetScale

1. Push ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Buat database MySQL di [Railway](https://railway.app) atau [PlanetScale](https://planetscale.com)
4. Set environment variables di dashboard Vercel
5. Jalankan `npx prisma db push` & seed via Railway/PlanetScale console

### Opsi 2 — VPS (Ubuntu/Debian)

```bash
# Install Node.js & MySQL
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs mysql-server

# Setup aplikasi
git clone <repo> && cd app-library
npm install
cp .env.example .env  # Edit sesuai server
npx prisma db push
npm run db:seed
npm run build
npm start  # atau gunakan PM2: pm2 start npm -- start
```

### Opsi 3 — Docker Compose (Paling mudah)
Lihat bagian [Setup dengan Docker](#setup-dengan-docker-rekomendasi-untuk-deployment) di atas.

---

## Scripts

```bash
npm run dev          # Development server (Turbopack)
npm run build        # Build production
npm run start        # Jalankan production build
npm run db:seed      # Seed database dengan data awal
npx prisma db push   # Sync schema ke database
npx prisma studio    # GUI untuk database
```

---

## Struktur Proyek

```
app-library/
├── app/
│   ├── admin/          # Halaman admin (dashboard, books, loans, users, categories)
│   ├── api/            # API routes (auth, books, loans, categories, notifications)
│   ├── user/           # Halaman user (dashboard, books, loans, settings)
│   ├── login/          # Halaman login
│   ├── register/       # Halaman registrasi
│   └── verify-email/   # Halaman verifikasi email
├── components/
│   └── layout/         # Navbar, WaveBackground
├── lib/
│   ├── auth.ts         # Konfigurasi NextAuth
│   ├── email.ts        # Fungsi kirim email via Resend
│   ├── prisma.ts       # Prisma client singleton
│   └── utils.ts        # Utilitas (format rupiah, tanggal)
├── prisma/
│   ├── schema.prisma   # Schema database
│   └── seed.ts         # Data awal
├── proxy.ts            # Middleware routing (auth guard)
├── docker-compose.yml  # Docker setup
├── Dockerfile          # Docker image
└── .env.example        # Template environment variables
```
