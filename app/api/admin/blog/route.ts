import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { readSession } from '@/lib/auth/session'
import { createAdminClient, hasSupabaseConfig } from '@/lib/supabase/server'
import { readingTime, slugify } from '@/lib/utils'

const NOT_CONFIGURED = { error: 'Supabase not configured' }

const postSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  slug: z.string().trim().optional(),
  excerpt: z.string().optional().default(''),
  content: z.string().optional().default(''),
  cover_image: z.string().trim().nullable().optional(),
  author: z.string().trim().optional().default('CaratIQ Team'),
  author_role: z.string().trim().optional().default('Gemologist'),
  category: z.string().trim().optional().default('Guides'),
  tags: z.array(z.string()).optional().default([]),
  status: z.enum(['draft', 'published']).optional().default('draft'),
  featured: z.boolean().optional().default(false),
  seo_title: z.string().trim().nullable().optional(),
  seo_description: z.string().trim().nullable().optional(),
})

const updateSchema = postSchema.partial().extend({
  id: z.union([z.number(), z.string()]),
})

async function requireSession() {
  const session = await readSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

// GET — all posts, newest first
export async function GET() {
  const unauth = await requireSession()
  if (unauth) return unauth

  if (!hasSupabaseConfig()) {
    return NextResponse.json(NOT_CONFIGURED, { status: 400 })
  }

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ posts: data ?? [] })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to load posts' },
      { status: 500 },
    )
  }
}

// POST — create a post
export async function POST(req: NextRequest) {
  const unauth = await requireSession()
  if (unauth) return unauth

  if (!hasSupabaseConfig()) {
    return NextResponse.json(NOT_CONFIGURED, { status: 400 })
  }

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = postSchema.safeParse(json)
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
    excerpt: input.excerpt,
    content: input.content,
    cover_image: input.cover_image || null,
    author: input.author,
    author_role: input.author_role,
    category: input.category,
    tags: input.tags,
    status: input.status,
    featured: input.featured,
    seo_title: input.seo_title || null,
    seo_description: input.seo_description || null,
    read_minutes: readingTime(input.content || ''),
    published_at: input.status === 'published' ? new Date().toISOString() : null,
  }

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.from('blog_posts').insert(row).select('*').single()

    if (error) {
      const message =
        error.code === '23505'
          ? 'A post with this slug already exists. Choose a different title or slug.'
          : error.message
      return NextResponse.json({ error: message }, { status: 400 })
    }
    return NextResponse.json({ post: data }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create post' },
      { status: 500 },
    )
  }
}

// PUT — update a post by id
export async function PUT(req: NextRequest) {
  const unauth = await requireSession()
  if (unauth) return unauth

  if (!hasSupabaseConfig()) {
    return NextResponse.json(NOT_CONFIGURED, { status: 400 })
  }

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

  try {
    const supabase = createAdminClient()

    // Fetch current row to know prior status & published_at for transition logic.
    const { data: existing, error: fetchError } = await supabase
      .from('blog_posts')
      .select('status, published_at')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const update: Record<string, unknown> = {}
    if (input.title !== undefined) update.title = input.title
    if (input.slug !== undefined && input.slug.length) update.slug = slugify(input.slug)
    if (input.excerpt !== undefined) update.excerpt = input.excerpt
    if (input.content !== undefined) {
      update.content = input.content
      update.read_minutes = readingTime(input.content || '')
    }
    if (input.cover_image !== undefined) update.cover_image = input.cover_image || null
    if (input.author !== undefined) update.author = input.author
    if (input.author_role !== undefined) update.author_role = input.author_role
    if (input.category !== undefined) update.category = input.category
    if (input.tags !== undefined) update.tags = input.tags
    if (input.featured !== undefined) update.featured = input.featured
    if (input.seo_title !== undefined) update.seo_title = input.seo_title || null
    if (input.seo_description !== undefined) update.seo_description = input.seo_description || null

    if (input.status !== undefined) {
      update.status = input.status
      // Stamp published_at the first time a post transitions to published.
      if (input.status === 'published' && !existing.published_at) {
        update.published_at = new Date().toISOString()
      }
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .update(update)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      const message =
        error.code === '23505'
          ? 'A post with this slug already exists. Choose a different slug.'
          : error.message
      return NextResponse.json({ error: message }, { status: 400 })
    }
    return NextResponse.json({ post: data })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update post' },
      { status: 500 },
    )
  }
}

// DELETE — remove a post by ?id=
export async function DELETE(req: NextRequest) {
  const unauth = await requireSession()
  if (unauth) return unauth

  if (!hasSupabaseConfig()) {
    return NextResponse.json(NOT_CONFIGURED, { status: 400 })
  }

  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('blog_posts').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to delete post' },
      { status: 500 },
    )
  }
}
