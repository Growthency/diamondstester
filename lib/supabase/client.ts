import { createBrowserClient } from '@supabase/ssr'

/**
 * Public Supabase connection details. The project URL and the *publishable*
 * (anon) key are designed to live in the browser — Row-Level Security is what
 * actually protects the data — so we keep them as in-code fallbacks. This keeps
 * the app working even on hosts that don't inline NEXT_PUBLIC_* build variables.
 */
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://szdrooxgqbcsgokusfgy.supabase.co'
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_TEladWDFhpW68YDxtRmNcw_q_rjD1R7'

/**
 * Browser Supabase client. When connection details are absent, return a no-op
 * stub so auth-aware UI (Navbar account button, dashboard) renders without
 * crashing instead of throwing.
 */
export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    const noopChain: any = new Proxy(function () {}, {
      get: () => noopChain,
      apply: () => Promise.resolve({ data: null, error: null }),
    })
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase is not configured yet.' } }),
        signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase is not configured yet.' } }),
        signOut: () => Promise.resolve({ error: null }),
        updateUser: () => Promise.resolve({ data: null, error: null }),
      },
      from: () => noopChain,
      storage: { from: () => noopChain },
      rpc: () => Promise.resolve({ data: null, error: null }),
    } as any
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
