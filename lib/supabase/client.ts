import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser Supabase client. When Supabase env vars are absent (e.g. local
 * preview before keys are pasted in), return a no-op stub so auth-aware UI
 * (Navbar account button, dashboard) renders without crashing. Production
 * always has env vars and uses the real client.
 */
export function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
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
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
}
