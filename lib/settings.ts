import { createClient, hasSupabaseConfig } from '@/lib/supabase/server'

/** Reads a single site_settings row's JSON value (server-side), with a fallback. */
export async function getSetting<T = any>(key: string, fallback: T): Promise<T> {
  if (!hasSupabaseConfig()) return fallback
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle()
    const value = data?.value
    return value === null || value === undefined ? fallback : (value as T)
  } catch {
    return fallback
  }
}
