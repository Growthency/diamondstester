import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * OAuth / email-confirmation callback. Supabase redirects here with a `?code`
 * after the user clicks the confirmation (or magic) link. We exchange that code
 * for a session cookie, then forward to `?next` (default the dashboard).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  // Only allow same-origin relative redirects.
  const redirectTo = next.startsWith('/') ? next : '/dashboard'

  // No code, or Supabase not configured → bounce to login with an error.
  if (
    !code ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
    }
    return NextResponse.redirect(`${origin}${redirectTo}`)
  } catch {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
  }
}
