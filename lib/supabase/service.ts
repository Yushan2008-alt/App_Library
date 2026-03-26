import { createClient } from '@supabase/supabase-js'

/** Service role client — bypasses RLS. Falls back to anon key if service role key is not set. */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
