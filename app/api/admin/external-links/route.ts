export const runtime = 'edge'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { readSession } from '@/lib/auth/session'
import { createAdminClient, hasSupabaseConfig } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const NOT_CONFIGURED = { error: 'Supabase not configured' }

const LOCATIONS = ['footer', 'header', 'sidebar'] as const

const createSchema = z.object({
  label: z.string().trim().min(1, 'Label is required'),
  url: z.string().trim().min(1, 'URL is required'),
  rel: z.string().trim().optional().default('nofollow noopener'),
  location: z.enum(LOCATIONS).optional().default('footer'),
  sort_order: z.coerce.number().int().optional().default(0),
  active: z.boolean().optional().default(true),
})

const updateSchema = createSchema.partial().extend({
  id: z.union([z.number(), z.string()]),
})

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// GET — all external links, ordered for management
export async function GET() {
  if (!(await readSession())) return unauthorized()
  if (!hasSupabaseConfig()) return NextResponse.json({ links: [] })

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('external_links')
      .select('*')
      .order('location', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ links: data ?? [] })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to load links' },
      { status: 500 },
    )
  }
}

// POST — create a link
export async function POST(req: NextRequest) {
  if (!(await readSession())) return unauthorized()
  if (!hasSupabaseConfig()) return NextResponse.json(NOT_CONFIGURED)

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = createSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid input' },
      { status: 400 },
    )
  }

  const input = parsed.data
  const row = {
    label: input.label,
    url: input.url,
    rel: input.rel?.trim() || 'nofollow noopener',
    location: input.location,
    sort_order: input.sort_order,
    active: input.active,
  }

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('external_links')
      .insert(row)
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ link: data }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create link' },
      { status: 500 },
    )
  }
}

// PUT — update a link by id (also used for the active toggle)
export async function PUT(req: NextRequest) {
  if (!(await readSession())) return unauthorized()
  if (!hasSupabaseConfig()) return NextResponse.json(NOT_CONFIGURED)

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = updateSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid input' },
      { status: 400 },
    )
  }

  const { id, ...input } = parsed.data

  const update: Record<string, unknown> = {}
  if (input.label !== undefined) update.label = input.label
  if (input.url !== undefined) update.url = input.url
  if (input.rel !== undefined) update.rel = input.rel?.trim() || 'nofollow noopener'
  if (input.location !== undefined) update.location = input.location
  if (input.sort_order !== undefined) update.sort_order = input.sort_order
  if (input.active !== undefined) update.active = input.active

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('external_links')
      .update(update)
      .eq('id', id)
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    if (!data) return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    return NextResponse.json({ link: data })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update link' },
      { status: 500 },
    )
  }
}

// DELETE — remove a link by ?id=
export async function DELETE(req: NextRequest) {
  if (!(await readSession())) return unauthorized()
  if (!hasSupabaseConfig()) return NextResponse.json(NOT_CONFIGURED)

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('external_links').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to delete link' },
      { status: 500 },
    )
  }
}
