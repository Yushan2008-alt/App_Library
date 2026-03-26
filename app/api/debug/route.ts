import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const checks = {
    env: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      DIRECT_URL: !!process.env.DIRECT_URL,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      using_url: (process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '')
        .replace(/:([^:@]+)@/, ':***@').slice(0, 80),
    },
    db_raw: null as string | null,
    prisma_books: null as string | null,
    supabase: null as string | null,
  }

  // Test raw pg connection
  try {
    const { Pool } = await import('pg')
    const pool = new Pool({
      connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 5000,
    })
    const client = await pool.connect()
    const result = await client.query('SELECT COUNT(*) as cnt FROM "Book"')
    client.release()
    await pool.end()
    checks.db_raw = `OK — ${result.rows[0].cnt} books`
  } catch (e) {
    checks.db_raw = String(e).slice(0, 200)
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
