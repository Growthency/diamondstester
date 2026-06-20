import { NextResponse } from 'next/server'
import { readSession } from '@/lib/auth/session'
import { createAdminClient, hasSupabaseConfig } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

/* ── GET — list tracked keywords (newest first) ── */
export async function GET() {
  if (!(await readSession())) return unauthorized()
  if (!hasSupabaseConfig()) return NextResponse.json({ keywords: [] })

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('seo_keywords')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      console.error('[admin/rank-tracker] list failed:', error.message)
      return NextResponse.json({ keywords: [] })
    }
    return NextResponse.json({ keywords: data ?? [] })
  } catch (err) {
    console.error('[admin/rank-tracker] unexpected error:', err)
    return NextResponse.json({ keywords: [] })
  }
}

/* ── POST — add a keyword ── */
export async function POST(request: Request) {
  if (!(await readSession())) return unauthorized()
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ error: 'Supabase not configured' })
  }

  let body: { keyword?: string; target_url?: string; country?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const keyword = body.keyword?.trim()
  if (!keyword) {
    return NextResponse.json({ error: 'Keyword is required' }, { status: 400 })
  }

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('seo_keywords')
      .insert({
        keyword,
        target_url: body.target_url?.trim() || null,
        country: body.country?.trim() || 'US',
      })
      .select()
      .single()
    if (error) {
      console.error('[admin/rank-tracker] insert failed:', error.message)
      return NextResponse.json({ error: 'Could not add keyword' }, { status: 500 })
    }
    return NextResponse.json({ keyword: data })
  } catch (err) {
    console.error('[admin/rank-tracker] unexpected error:', err)
    return NextResponse.json({ error: 'Could not add keyword' }, { status: 500 })
  }
}

/* ── PUT — update a keyword (position, target_url, search_volume) ──
 * When a NEW position is supplied, we copy the current position into
 * prev_position and stamp checked_at = now so the change indicator works.   */
export async function PUT(request: Request) {
  if (!(await readSession())) return unauthorized()
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ error: 'Supabase not configured' })
  }

  let body: {
    id?: number
    position?: number | null
    target_url?: string | null
    search_volume?: number | null
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (body.id == null) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  try {
    const supabase = createAdminClient()
    const update: Record<string, unknown> = {}

    // Only touch position bookkeeping when a position value was sent.
    if ('position' in body) {
      // Read the current row so we can roll the old position into prev_position.
      const { data: existing } = await supabase
        .from('seo_keywords')
        .select('position')
        .eq('id', body.id)
        .maybeSingle()
      update.prev_position = existing?.position ?? null
      update.position = body.position ?? null
      update.checked_at = new Date().toISOString()
    }
    if ('target_url' in body) update.target_url = body.target_url || null
    if ('search_volume' in body) update.search_volume = body.search_volume ?? null

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('seo_keywords')
      .update(update)
      .eq('id', body.id)
      .select()
      .single()
    if (error) {
      console.error('[admin/rank-tracker] update failed:', error.message)
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
    return NextResponse.json({ keyword: data })
  } catch (err) {
    console.error('[admin/rank-tracker] unexpected error:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

/* ── DELETE — remove a keyword by ?id ── */
export async function DELETE(request: Request) {
  if (!(await readSession())) return unauthorized()
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ error: 'Supabase not configured' })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('seo_keywords').delete().eq('id', id)
    if (error) {
      console.error('[admin/rank-tracker] delete failed:', error.message)
      return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin/rank-tracker] unexpected error:', err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
