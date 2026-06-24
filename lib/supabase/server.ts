import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Public Supabase connection details (project URL + publishable anon key). Safe
 * to keep in code — RLS protects the data. Fallbacks keep the app working when
 * the host doesn't inline NEXT_PUBLIC_* build variables.
 */
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://szdrooxgqbcsgokusfgy.supabase.co'
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_TEladWDFhpW68YDxtRmNcw_q_rjD1R7'

/** Anon, cookie-bound client for server components / route handlers. */
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // called from a Server Component — safe to ignore.
        }
      },
    },
  })
}

/** Service-role client — bypasses RLS. Server-only. Never expose to the browser. */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) {
    throw new Error('Supabase service role env vars are not configured.')
  }
  return createSupabaseClient(SUPABASE_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export function hasSupabaseConfig() {
  // The public URL/anon key always resolve (fallbacks above); the service-role
  // key is the secret that gates admin/database features.
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
}
