import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/app/generated/prisma/client'

/**
 * Parse a PostgreSQL connection string into individual Pool config options.
 * Handles passwords with special characters (#, @, /) that can break pg's URL parser.
 * Works with both URL-encoded (%23, %40) and literal special chars.
 */
function parseDbUrl(url: string) {
  // Match: protocol://user:password@host:port/database
  // Uses greedy .+ for password so the LAST @ before host is used as separator
  const m = url.match(/^(?:postgres(?:ql)?):\/\/([^:]+):(.+)@([^@:/]+):(\d+)\/([^?]+)/)
  if (m) {
    return {
      user: decodeURIComponent(m[1]),
      password: decodeURIComponent(m[2]),
      host: m[3],
      port: parseInt(m[4]),
      database: m[5],
      ssl: { rejectUnauthorized: false },
      max: 1,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 8000,
    }
  }
  // Fallback: pass raw string and hope for the best
  return {
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    max: 1,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 8000,
  }
}

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL ?? ''
  const config = dbUrl ? parseDbUrl(dbUrl) : { connectionString: 'postgresql://localhost/invalid' }
  const pool = new Pool(config)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaPg(pool as any)
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
