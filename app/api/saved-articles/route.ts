export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/** The cookie-bound client needs the public anon env to talk to Supabase. */
function hasAuthConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
}

/** GET → list the signed-in user's saved articles (most recent first). */
export async function GET() {
  if (!hasAuthConfig()) {
    return NextResponse.json({ items: [] })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('saved_articles')
    .select('id, slug, title, category, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Could not load saved articles.' }, { status: 500 })
  }

  return NextResponse.json({ items: data ?? [] })
}

/** POST {slug,title,category} → save the article (idempotent on user_id+slug). */
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
  const slug = typeof body?.slug === 'string' ? body.slug.trim() : ''
  const title = typeof body?.title === 'string' ? body.title.trim() : ''
  const category = typeof body?.category === 'string' ? body.category.trim() : ''

  if (!slug || !title) {
    return NextResponse.json({ error: 'A slug and title are required.' }, { status: 400 })
  }

  const { error } = await supabase.from('saved_articles').upsert(
    { user_id: user.id, slug, title, category: category || null },
    { onConflict: 'user_id,slug', ignoreDuplicates: true },
  )

  if (error) {
    return NextResponse.json({ error: 'Could not save the article.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, saved: true })
}

/** DELETE ?slug= → remove the article from the signed-in user's saved list. */
export async function DELETE(request: NextRequest) {
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

  const slug = new URL(request.url).searchParams.get('slug')?.trim()
  if (!slug) {
    return NextResponse.json({ error: 'A slug is required.' }, { status: 400 })
  }

  const { error } = await supabase
    .from('saved_articles')
    .delete()
    .eq('user_id', user.id)
    .eq('slug', slug)

  if (error) {
    return NextResponse.json({ error: 'Could not remove the article.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, saved: false })
}
