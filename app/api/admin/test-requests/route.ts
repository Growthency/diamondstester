export const runtime = 'edge'
import { NextResponse } from 'next/server'
import { readSession } from '@/lib/auth/session'
import { createAdminClient, hasSupabaseConfig } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const STATUSES = ['new', 'in-review', 'completed'] as const

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function GET() {
  if (!(await readSession())) return unauthorized()
  if (!hasSupabaseConfig()) return NextResponse.json([])

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('test_requests')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      console.error('[admin/test-requests] list failed:', error.message)
      return NextResponse.json([])
    }
    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error('[admin/test-requests] unexpected error:', err)
    return NextResponse.json([])
  }
}

export async function PATCH(request: Request) {
  if (!(await readSession())) return unauthorized()
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ error: 'Supabase not configured' })
  }

  let body: { id?: string | number; status?: string; result?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (body.id == null) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const update: Record<string, unknown> = {}
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status as (typeof STATUSES)[number])) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    update.status = body.status
  }
  if (body.result !== undefined) {
    update.result = body.result?.trim() || null
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('test_requests')
      .update(update)
      .eq('id', body.id)
    if (error) {
      console.error('[admin/test-requests] update failed:', error.message)
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin/test-requests] unexpected error:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
