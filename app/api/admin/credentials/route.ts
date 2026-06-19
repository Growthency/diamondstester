import { NextResponse } from 'next/server'
import { readSession } from '@/lib/auth/session'
import { createAdminClient, hasSupabaseConfig } from '@/lib/supabase/server'
import { encryptSecret, safeDecrypt } from '@/lib/vault/crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function GET() {
  if (!(await readSession())) return unauthorized()
  if (!hasSupabaseConfig()) return NextResponse.json([])

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('vault_credentials')
      .select('*')
      .order('site_name', { ascending: true })
    if (error) {
      console.error('[admin/credentials] list failed:', error.message)
      return NextResponse.json([])
    }
    const rows = (data ?? []).map((r) => ({
      id: r.id,
      site_name: r.site_name,
      site_url: r.site_url,
      username: r.username,
      password: safeDecrypt(r.password_encrypted),
      notes: r.notes,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }))
    return NextResponse.json(rows)
  } catch (err) {
    console.error('[admin/credentials] unexpected error:', err)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  if (!(await readSession())) return unauthorized()
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ error: 'Supabase not configured' })
  }

  let body: {
    site_name?: string
    site_url?: string
    username?: string
    password?: string
    notes?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.site_name?.trim()) {
    return NextResponse.json({ error: 'Site name is required' }, { status: 400 })
  }

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('vault_credentials')
      .insert({
        site_name: body.site_name.trim(),
        site_url: body.site_url?.trim() || null,
        username: body.username?.trim() || null,
        password_encrypted: encryptSecret(body.password ?? ''),
        notes: body.notes?.trim() || null,
      })
      .select()
      .single()
    if (error) {
      console.error('[admin/credentials] insert failed:', error.message)
      return NextResponse.json({ error: 'Save failed' }, { status: 500 })
    }
    return NextResponse.json({ id: data?.id, ok: true })
  } catch (err) {
    console.error('[admin/credentials] unexpected error:', err)
    return NextResponse.json({ error: 'Save failed' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!(await readSession())) return unauthorized()
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ error: 'Supabase not configured' })
  }

  let body: {
    id?: string | number
    site_name?: string
    site_url?: string
    username?: string
    password?: string
    notes?: string
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
    if (body.site_name !== undefined) update.site_name = body.site_name.trim()
    if (body.site_url !== undefined) update.site_url = body.site_url?.trim() || null
    if (body.username !== undefined) update.username = body.username?.trim() || null
    if (body.notes !== undefined) update.notes = body.notes?.trim() || null
    // re-encrypt only if a password was supplied (non-undefined)
    if (body.password !== undefined) {
      update.password_encrypted = encryptSecret(body.password ?? '')
    }

    const { error } = await supabase
      .from('vault_credentials')
      .update(update)
      .eq('id', body.id)
    if (error) {
      console.error('[admin/credentials] update failed:', error.message)
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin/credentials] unexpected error:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

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
    const { error } = await supabase.from('vault_credentials').delete().eq('id', id)
    if (error) {
      console.error('[admin/credentials] delete failed:', error.message)
      return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin/credentials] unexpected error:', err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
