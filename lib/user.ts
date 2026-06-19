import { createClient, hasSupabaseConfig } from '@/lib/supabase/server'

export interface AppUser {
  id: string
  email: string
}

/** Returns the signed-in Supabase user (server-side) or null. */
export async function getUser(): Promise<AppUser | null> {
  if (!hasSupabaseConfig()) return null
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    if (!data.user) return null
    return { id: data.user.id, email: data.user.email ?? '' }
  } catch {
    return null
  }
}
