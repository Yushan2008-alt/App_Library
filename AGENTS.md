<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# App-Library — Catatan Sistem untuk AI Agent

## Stack Teknis

- **Next.js 16.2.1** — App Router, Turbopack, Server Components
- **Prisma 7.5.0** — ORM untuk PostgreSQL (Supabase), menggunakan `@prisma/adapter-pg`
- **Supabase** — PostgreSQL database + Auth, project: `bzyuyshzmdcfrajlygvv`, region: `ap-southeast-1`
- **Supabase Auth** — email/password auth dengan verifikasi email built-in (menggantikan NextAuth & Resend)
- **Tailwind CSS v4** — utility class `glass` dan `glass-dark` untuk glassmorphism
- **TypeScript** — seluruh codebase

## File Kritis

| File | Fungsi |
|---|---|
| `proxy.ts` | Middleware (bukan `middleware.ts`!) — auth guard semua route via Supabase |
| `lib/auth.ts` | `getServerUser()` — baca session Supabase lalu fetch User dari Prisma |
| `lib/prisma.ts` | Prisma client singleton dengan `PrismaPg` adapter (DIRECT_URL) |
| `lib/supabase/client.ts` | Supabase browser client (`createBrowserClient`) |
| `lib/supabase/server.ts` | Supabase server client (`createServerClient` + cookies) |
| `app/auth/callback/route.ts` | Handler verifikasi email — exchange code, buat User profile di DB |
| `app/generated/prisma/` | Generated Prisma client — jangan edit manual |
| `prisma/schema.prisma` | Schema database — update lalu `npx prisma generate` |

## Model Database

- **User** — `id (UUID dari Supabase auth.users), name, username (nullable, unique), email, avatarUrl (nullable), role (USER/ADMIN), createdAt`
- **Book** — `id, title, author, description, coverImage, externalUrl, stock, categoryId`
- **Category** — `id, name, slug`
- **Loan** — `id, userId, bookId, status (PENDING/APPROVED/REJECTED/RETURNED), fine, approvedAt, dueDate, returnedAt`
- **Notification** — `id, userId, message, isRead`

## Aturan Penting

1. **Middleware**: file `proxy.ts`, bukan `middleware.ts`.
2. **Auth**: gunakan `getServerUser()` dari `lib/auth.ts` di server components/routes.
3. **Role**: disimpan di `user.user_metadata.role` (Supabase) dan field `role` di tabel `public.User`.
4. **Prisma generate**: setelah edit `schema.prisma`, selalu jalankan `npx prisma generate`.
5. **Image domains**: `covers.openlibrary.org` sudah dikonfigurasi di `next.config.ts`.
6. **Cover images**: gunakan URL berbasis ISBN (`/b/isbn/{isbn}-L.jpg`).
7. **Admin password**: `Adm!nL1br@ry#24` — jangan tampilkan di UI.
8. **DB Connection**: `lib/prisma.ts` menggunakan `DIRECT_URL` (`db.PROJECT_REF.supabase.co:5432`), bukan pooler.

## Alur Verifikasi Email (Supabase)

```
Register → supabase.auth.signUp() → Supabase kirim email verifikasi
→ User klik link → redirect ke /auth/callback?code=xxx
→ exchangeCodeForSession(code) → prisma.user.upsert() → redirect ke dashboard
```

## Konfigurasi Supabase Dashboard (wajib untuk email verifikasi)
- Authentication → URL Configuration → Site URL: `http://localhost:3000`
- Authentication → URL Configuration → Redirect URLs: tambahkan `http://localhost:3000/auth/callback`

## Fitur Auth
- **Email/Password** — login & register dengan verifikasi email via Supabase
- **Google OAuth** — "Lanjutkan dengan Google" di halaman login & register
  - OAuth users: role default `USER`, metadata `role` di-set otomatis di `/auth/callback`
  - Konfigurasi: Supabase Dashboard → Authentication → Providers → Google

## Fitur Buku
- **Link Akses** — field `externalUrl` untuk link baca online, tampil sebagai tombol "Baca Online"
- **Cover OG Auto-fetch** — saat admin input `externalUrl`, sistem otomatis scrape `og:image` dari URL tersebut
  - API endpoint: `GET /api/og-image?url=...` (server-side, bebas CORS)
  - Admin bisa tetap override dengan upload manual
  - Cover tersimpan sebagai URL string di field `coverImage`
- **Upload Cover Manual** — admin bisa upload file gambar, disimpan di `public/uploads/`

## Kategori Buku (7 kategori)
Fiksi, Teknologi, Sains, Sejarah, Seni & Budaya, Komik & Manga, Filsafat

## Konfigurasi Google OAuth (panduan)
1. Buka [Google Cloud Console](https://console.cloud.google.com/) → buat/pilih project
2. APIs & Services → OAuth consent screen → External → isi nama app, email
3. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URI: `https://bzyuyshzmdcfrajlygvv.supabase.co/auth/v1/callback`
4. Copy Client ID dan Client Secret
5. Supabase Dashboard → Authentication → Providers → Google → Enable → paste ID & Secret
6. Supabase Dashboard → Authentication → URL Configuration:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

## Fitur Profil & Pengaturan
- **Edit Profil** — user & admin bisa edit nama depan, nama belakang, dan username di `/user/settings` dan `/admin/settings`
- **Username** — field `username` (nullable, unique) di tabel `User`. Digunakan sebagai nama tampilan di navbar/sidebar jika diset. Jika kosong, fallback ke `name`.
- **Foto Profil** — field `avatarUrl` (nullable) di tabel `User`. Upload via klik avatar di halaman settings.
  - API: `POST /api/user/avatar` (multipart/form-data, field `avatar`) → simpan ke `public/uploads/avatars/{userId}.{ext}`, update DB
  - Format didukung: JPG, PNG, WEBP, GIF. Maks 5MB.
  - Tampil di navbar (UserNavbar) dan sidebar (AdminSidebar) menggantikan inisial huruf.
- **API profil** — `PATCH /api/user/profile` → update `name` (firstName + lastName) dan `username`
- **Navigasi** — "Pengaturan" dipindahkan dari navbar user ke dalam dropdown ≡ (hamburger menu). Admin akses settings via sidebar.
- **Animasi** — semua tombol punya `active:scale-95`, link punya `hover:scale-105`, transisi `duration-200`

## Deployment
Lihat `README.md` untuk instruksi lengkap (lokal, Docker, Vercel, VPS).
