import { NextResponse } from 'next/server'
import { readSession } from '@/lib/auth/session'
import { createAdminClient, hasSupabaseConfig } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function GET(request: Request) {
  if (!(await readSession())) return unauthorized()

  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 })

  if (!hasSupabaseConfig()) return NextResponse.json({ value: {} })

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle()
    if (error) {
      console.error('[admin/settings] get failed:', error.message)
      return NextResponse.json({ value: {} })
    }
    return NextResponse.json({ value: data?.value ?? {} })
  } catch (err) {
    console.error('[admin/settings] unexpected error:', err)
    return NextResponse.json({ value: {} })
  }
}

export async function POST(request: Request) {
  if (!(await readSession())) return unauthorized()
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ error: 'Supabase not configured' })
  }

  let body: { key?: string; value?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.key?.trim()) {
    return NextResponse.json({ error: 'Missing key' }, { status: 400 })
  }

  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('site_settings')
      .upsert(
        { key: body.key.trim(), value: body.value ?? {} },
        { onConflict: 'key' },
      )
    if (error) {
      console.error('[admin/settings] upsert failed:', error.message)
      return NextResponse.json({ error: 'Save failed' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin/settings] unexpected error:', err)
    return NextResponse.json({ error: 'Save failed' }, { status: 500 })
  }
}
