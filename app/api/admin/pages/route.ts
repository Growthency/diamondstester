import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { readSession } from '@/lib/auth/session'
import { createAdminClient, hasSupabaseConfig } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const NOT_CONFIGURED = { error: 'Supabase not configured' }

const pageSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  slug: z.string().trim().optional(),
  content: z.string().optional().default(''),
  status: z.enum(['draft', 'published']).optional().default('draft'),
  seo_title: z.string().trim().nullable().optional(),
  seo_description: z.string().trim().nullable().optional(),
})

const updateSchema = pageSchema.partial().extend({
  id: z.union([z.number(), z.string()]),
})

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// GET — all pages, most recently updated first
export async function GET() {
  if (!(await readSession())) return unauthorized()
  if (!hasSupabaseConfig()) return NextResponse.json({ pages: [] })

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ pages: data ?? [] })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to load pages' },
      { status: 500 },
    )
  }
}

// POST — create a page
export async function POST(req: NextRequest) {
  if (!(await readSession())) return unauthorized()
  if (!hasSupabaseConfig()) return NextResponse.json(NOT_CONFIGURED)

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = pageSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid input' },
      { status: 400 },
    )
  }

  const input = parsed.data
  const slug = input.slug && input.slug.length ? slugify(input.slug) : slugify(input.title)

  const row = {
    slug,
    title: input.title,
    content: input.content ?? '',
    status: input.status,
    seo_title: input.seo_title || null,
    seo_description: input.seo_description || null,
  }

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.from('pages').insert(row).select('*').single()

    if (error) {
      const message =
        error.code === '23505'
          ? 'A page with this slug already exists. Choose a different title or slug.'
          : error.message
      return NextResponse.json({ error: message }, { status: 400 })
    }
    return NextResponse.json({ page: data }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create page' },
      { status: 500 },
    )
  }
}

// PUT — update a page by id
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
  if (input.title !== undefined) update.title = input.title
  if (input.slug !== undefined && input.slug.length) update.slug = slugify(input.slug)
  if (input.content !== undefined) update.content = input.content
  if (input.status !== undefined) update.status = input.status
  if (input.seo_title !== undefined) update.seo_title = input.seo_title || null
  if (input.seo_description !== undefined) update.seo_description = input.seo_description || null

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('pages')
      .update(update)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      const message =
        error.code === '23505'
          ? 'A page with this slug already exists. Choose a different slug.'
          : error.message
      return NextResponse.json({ error: message }, { status: 400 })
    }
    if (!data) return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    return NextResponse.json({ page: data })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update page' },
      { status: 500 },
    )
  }
}

// DELETE — remove a page by ?id=
export async function DELETE(req: NextRequest) {
  if (!(await readSession())) return unauthorized()
  if (!hasSupabaseConfig()) return NextResponse.json(NOT_CONFIGURED)

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('pages').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to delete page' },
      { status: 500 },
    )
  }
}
