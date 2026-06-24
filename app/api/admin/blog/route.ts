export const runtime = 'edge'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import sanitizeHtml from 'sanitize-html'
import { readSession } from '@/lib/auth/session'
import { createAdminClient, hasSupabaseConfig } from '@/lib/supabase/server'
import { readingTime, slugify } from '@/lib/utils'

const NOT_CONFIGURED = { error: 'Supabase not configured' }

const postSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  slug: z.string().trim().optional(),
  excerpt: z.string().optional().default(''),
  content: z.string().optional().default(''),
  content_format: z.enum(['html', 'markdown']).optional().default('markdown'),
  cover_image: z.string().trim().nullable().optional(),
  author: z.string().trim().optional().default('Diamonds Tester Team'),
  author_role: z.string().trim().optional().default('Gemologist'),
  category: z.string().trim().optional().default('Guides'),
  tags: z.array(z.string()).optional().default([]),
  status: z.enum(['draft', 'published']).optional().default('draft'),
  featured: z.boolean().optional().default(false),
  seo_title: z.string().trim().nullable().optional(),
  seo_description: z.string().trim().nullable().optional(),
  layout: z.enum(['with-sidebar', 'full-page']).optional().default('with-sidebar'),
  difficulty: z.string().optional().default('Beginner'),
  topic_focus: z.string().optional().default('Natural'),
  custom_css: z.string().nullable().optional(),
  custom_schema: z.string().nullable().optional(),
})

const updateSchema = postSchema.partial().extend({
  id: z.union([z.number(), z.string()]),
})

// Allowlist sanitizer for rich-editor (content_format="html") posts. Markdown
// posts are sanitized at render time by the public renderer instead.
const STYLE_LENGTH = /^\d+(?:\.\d+)?(?:px|em|rem|%)$/
const STYLE_COLOR = /^(#[0-9a-fA-F]{3,8}|rgba?\([\d.,\s]+\)|[a-zA-Z]+)$/

function sanitizeContentHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4',
      'p', 'br', 'hr',
      'strong', 'b', 'em', 'i', 'u', 's', 'strike',
      'ul', 'ol', 'li',
      'a', 'blockquote', 'pre', 'code',
      'img', 'figure', 'figcaption',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
      'span', 'div',
    ],
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height', 'style'],
      table: ['style', 'colspan', 'rowspan'],
      td: ['style', 'colspan', 'rowspan'],
      th: ['style', 'colspan', 'rowspan'],
      '*': ['style'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedStyles: {
      '*': {
        'text-align': [/^(left|right|center|justify)$/],
        color: [STYLE_COLOR],
        'background-color': [STYLE_COLOR],
        'max-width': [STYLE_LENGTH],
        width: [STYLE_LENGTH],
        height: [STYLE_LENGTH],
        'border-radius': [STYLE_LENGTH],
        margin: [/^[\d.\s a-z%]+$/],
        padding: [/^[\d.\s a-z%]+$/],
      },
    },
    transformTags: {
      // Harden any link that opens a new tab against reverse-tabnabbing.
      a: (tagName, attribs) => {
        if (attribs.target === '_blank') {
          attribs.rel = 'noopener noreferrer'
        }
        return { tagName, attribs }
      },
    },
  })
}

// Derive a ~160-char plain-text excerpt from the post body when none is given.
function deriveExcerpt(content: string, format: 'html' | 'markdown'): string {
  let text: string
  if (format === 'html') {
    text = sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} })
  } else {
    text = content
      .replace(/```[\s\S]*?```/g, ' ') // fenced code
      .replace(/`([^`]*)`/g, '$1') // inline code
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links → text
      .replace(/^\s{0,3}#{1,6}\s+/gm, '') // headings
      .replace(/^\s{0,3}>\s?/gm, '') // blockquotes
      .replace(/^\s{0,3}[-*+]\s+/gm, '') // bullet markers
      .replace(/[*_~]/g, '') // emphasis
  }
  text = text.replace(/\s+/g, ' ').trim()
  if (text.length <= 160) return text
  return text.slice(0, 160).trimEnd() + '…'
}

// Validate an optional custom JSON-LD schema string. Returns the trimmed raw
// string to persist (or null), or an error message if the JSON is malformed.
function validateCustomSchema(raw: string | null | undefined): { value: string | null } | { error: string } {
  if (raw === undefined || raw === null) return { value: null }
  const trimmed = raw.trim()
  if (!trimmed) return { value: null }
  try {
    JSON.parse(trimmed)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { error: 'Custom Schema contains invalid JSON: ' + message }
  }
  return { value: trimmed }
}

async function requireSession() {
  const session = await readSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

// GET — a single post when ?id= is supplied, otherwise all posts (newest first)
export async function GET(req: NextRequest) {
  const unauth = await requireSession()
  if (unauth) return unauth

  if (!hasSupabaseConfig()) {
    return NextResponse.json(NOT_CONFIGURED, { status: 400 })
  }

  const id = req.nextUrl.searchParams.get('id')

  try {
    const supabase = createAdminClient()

    if (id) {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      }
      return NextResponse.json({ post: data })
    }

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

  // HTML posts are sanitized here; markdown is stored as-is (renderer sanitizes).
  const content =
    input.content_format === 'html'
      ? sanitizeContentHtml(input.content || '')
      : input.content || ''

  const schemaResult = validateCustomSchema(input.custom_schema)
  if ('error' in schemaResult) {
    return NextResponse.json({ error: schemaResult.error }, { status: 400 })
  }

  const excerpt =
    input.excerpt && input.excerpt.trim().length
      ? input.excerpt
      : deriveExcerpt(content, input.content_format)

  const row = {
    slug,
    title: input.title,
    excerpt,
    content,
    content_format: input.content_format,
    cover_image: input.cover_image || null,
    author: input.author,
    author_role: input.author_role,
    category: input.category,
    tags: input.tags,
    status: input.status,
    featured: input.featured,
    seo_title: input.seo_title || null,
    seo_description: input.seo_description || null,
    layout: input.layout,
    difficulty: input.difficulty,
    topic_focus: input.topic_focus,
    custom_css: input.custom_css || null,
    custom_schema: schemaResult.value,
    read_minutes: readingTime(content),
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

    // Fetch current row to know prior status, published_at and format for
    // transition + sanitize logic.
    const { data: existing, error: fetchError } = await supabase
      .from('blog_posts')
      .select('status, published_at, content_format')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // The effective format for this update: an incoming value wins, otherwise
    // fall back to whatever the stored post already uses.
    const effectiveFormat: 'html' | 'markdown' =
      input.content_format ?? (existing.content_format === 'html' ? 'html' : 'markdown')

    const schemaResult = validateCustomSchema(input.custom_schema)
    if ('error' in schemaResult) {
      return NextResponse.json({ error: schemaResult.error }, { status: 400 })
    }

    const update: Record<string, unknown> = {}
    if (input.title !== undefined) update.title = input.title
    if (input.slug !== undefined && input.slug.length) update.slug = slugify(input.slug)
    if (input.excerpt !== undefined) update.excerpt = input.excerpt
    if (input.content !== undefined) {
      const content =
        effectiveFormat === 'html' ? sanitizeContentHtml(input.content || '') : input.content || ''
      update.content = content
      update.read_minutes = readingTime(content)
      // Backfill the excerpt when the editor cleared it but sent new content.
      if (input.excerpt !== undefined && !input.excerpt.trim().length) {
        update.excerpt = deriveExcerpt(content, effectiveFormat)
      }
    }
    if (input.content_format !== undefined) update.content_format = input.content_format
    if (input.cover_image !== undefined) update.cover_image = input.cover_image || null
    if (input.author !== undefined) update.author = input.author
    if (input.author_role !== undefined) update.author_role = input.author_role
    if (input.category !== undefined) update.category = input.category
    if (input.tags !== undefined) update.tags = input.tags
    if (input.featured !== undefined) update.featured = input.featured
    if (input.seo_title !== undefined) update.seo_title = input.seo_title || null
    if (input.seo_description !== undefined) update.seo_description = input.seo_description || null
    if (input.layout !== undefined) update.layout = input.layout
    if (input.difficulty !== undefined) update.difficulty = input.difficulty
    if (input.topic_focus !== undefined) update.topic_focus = input.topic_focus
    if (input.custom_css !== undefined) update.custom_css = input.custom_css || null
    if (input.custom_schema !== undefined) update.custom_schema = schemaResult.value

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
