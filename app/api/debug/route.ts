import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const checks = {
    env: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      DATABASE_URL_preview: process.env.DATABASE_URL
        ? process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':***@').slice(0, 80)
        : null,
    },
    db: null as string | null,
    supabase: null as string | null,
  }

  // Test DB connection
  try {
    const { Pool } = await import('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 5000,
    })
    const client = await pool.connect()
    await client.query('SELECT 1')
    client.release()
    await pool.end()
    checks.db = 'OK'
  } catch (e) {
    checks.db = String(e).slice(0, 200)
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
