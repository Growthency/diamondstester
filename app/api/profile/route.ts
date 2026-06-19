import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function hasAuthConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
}

/** POST {full_name?, avatar_url?} → update the signed-in user's profiles row. */
export async function POST(request: NextRequest) {
  if (!hasAuthConfig()) {
    return NextResponse.json({ ok: true })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)

  const updates: { full_name?: string; avatar_url?: string } = {}
  if (typeof body?.full_name === 'string') updates.full_name = body.full_name.trim()
  if (typeof body?.avatar_url === 'string') updates.avatar_url = body.avatar_url.trim()

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select('id, email, full_name, avatar_url')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Could not update your profile.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, profile: data })
}
