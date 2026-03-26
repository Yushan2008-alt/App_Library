import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Parse DATABASE_URL to show what's actually being used
  const dbUrl = process.env.DATABASE_URL ?? ''
  const urlMatch = dbUrl.match(/^(?:postgres(?:ql)?):\/\/([^:]+):(.+)@([^@:/]+):(\d+)\/([^?]+)/)
  const parsed = urlMatch ? {
    user: urlMatch[1],
    host: urlMatch[3],
    port: urlMatch[4],
    database: urlMatch[5],
    password_len: decodeURIComponent(urlMatch[2]).length,
  } : { error: 'could not parse DATABASE_URL' }

  const checks = {
    env: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      DATABASE_URL_raw_start: dbUrl.slice(0, 60),
      DIRECT_URL: !!process.env.DIRECT_URL,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      parsed,
    },
    db_raw: null as string | null,
    prisma_books: null as string | null,
    supabase: null as string | null,
  }

  // Test raw pg connection using DATABASE_URL only (same as lib/prisma.ts)
  try {
    const { Pool } = await import('pg')
    const pool = new Pool(urlMatch ? {
      user: decodeURIComponent(urlMatch[1]),
      password: decodeURIComponent(urlMatch[2]),
      host: urlMatch[3],
      port: parseInt(urlMatch[4]),
      database: urlMatch[5],
      ssl: { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 8000,
    } : {
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 8000,
    })
    const client = await pool.connect()
    const result = await client.query('SELECT COUNT(*) as cnt FROM "Book"')
    client.release()
    await pool.end()
    checks.db_raw = `OK — ${result.rows[0].cnt} books`
  } catch (e) {
    checks.db_raw = String(e).slice(0, 300)
  }

  // Test Prisma
  try {
    const count = await prisma.book.count()
    checks.prisma_books = `OK — ${count} books`
  } catch (e) {
    checks.prisma_books = String(e).slice(0, 200)
  }

  // Test Supabase connection
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (url) {
      const res = await fetch(`${url}/auth/v1/settings`, {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '' },
        signal: AbortSignal.timeout(5000),
      })
      checks.supabase = res.ok ? `OK (${res.status})` : `Error ${res.status}`
    } else {
      checks.supabase = 'SUPABASE_URL not set'
    }
  } catch (e) {
    checks.supabase = String(e).slice(0, 200)
  }

  return NextResponse.json(checks)
}
