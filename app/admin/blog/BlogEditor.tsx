'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn, slugify } from '@/lib/utils'
import { site } from '@/lib/site'
import {
  CATEGORIES,
  DIFFICULTIES,
  META_DESC_MAX,
  META_TITLE_MAX,
  TOPICS,
  type AdminPost,
  type InterlinkPost,
  type PostDifficulty,
  type PostInput,
  type PostLayout,
  type PostStatus,
  type PostTopic,
} from './types'

// Heavy, browser-only widgets — never server-rendered.
const RichEditor = dynamic(() => import('./RichEditor'), { ssr: false })
const InterlinkChecker = dynamic(
  () => import('./InterlinkChecker').then((m) => m.InterlinkChecker),
  { ssr: false },
)

interface FormState {
  title: string
  slug: string
  excerpt: string
  category: string
  tags: string
  author: string
  author_role: string
  cover_image: string
  content: string
  featured: boolean
  status: PostStatus
  layout: PostLayout
  difficulty: PostDifficulty
  topic_focus: PostTopic
  seo_title: string
  seo_description: string
  custom_css: string
  custom_schema: string
}

function toFormState(post: AdminPost | null): FormState {
  return {
    title: post?.title ?? '',
    slug: post?.slug ?? '',
    excerpt: post?.excerpt ?? '',
    category: post?.category ?? 'Guides',
    tags: post?.tags?.join(', ') ?? '',
    author: post?.author ?? 'Diamonds Tester Team',
    author_role: post?.author_role ?? 'Gemologist',
    cover_image: post?.cover_image ?? '',
    content: post?.content ?? '',
    featured: post?.featured ?? false,
    status: post?.status ?? 'draft',
    layout: post?.layout ?? 'with-sidebar',
    difficulty: post?.difficulty ?? 'Beginner',
    topic_focus: post?.topic_focus ?? 'Natural',
    seo_title: post?.seo_title ?? '',
    seo_description: post?.seo_description ?? '',
    custom_css: post?.custom_css ?? '',
    custom_schema: post?.custom_schema ?? '',
  }
}

/** Counter colour bands for the SEO meta inputs. */
function counterTone(len: number, amberAt: number, max: number): string {
  if (len > max) return 'text-red-300'
  if (len >= amberAt) return 'text-amber-300'
  return 'text-muted-foreground'
}

export function BlogEditor({
  mode,
  initialPost,
}: {
  mode: 'new' | 'edit'
  initialPost: AdminPost | null
}) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(() => toFormState(initialPost))
  // Only auto-derive the slug from the title until the user edits it themselves.
  const [slugLocked, setSlugLocked] = useState<boolean>(() => Boolean(initialPost?.slug))
  const [resetKey, setResetKey] = useState(0)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [linkPosts, setLinkPosts] = useState<InterlinkPost[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const isEdit = mode === 'edit'
  const domain = useMemo(() => site.url.replace(/^https?:\/\//, '').replace(/\/$/, ''), [])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function onTitleChange(value: string) {
    setForm((f) => ({
      ...f,
      title: value,
      slug: slugLocked ? f.slug : slugify(value),
    }))
  }

  // Published posts feed the interlink suggestions (excluding the current post).
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch('/api/admin/blog', { cache: 'no-store' })
        const json = await res.json().catch(() => ({}))
        if (!active || !res.ok || !Array.isArray(json.posts)) return
        const mapped = (json.posts as AdminPost[])
          .filter((p) => p.status === 'published' && p.id !== initialPost?.id)
          .map((p) => ({ slug: p.slug, title: p.title }))
        setLinkPosts(mapped)
      } catch {
        /* suggestions are optional */
      }
    })()
    return () => {
      active = false
    }
  }, [initialPost?.id])

  // Validate the custom JSON-LD schema as the user types.
  const schemaState = useMemo(() => {
    const raw = form.custom_schema.trim()
    if (!raw) return { ok: true as const, error: '' }
    try {
      JSON.parse(raw)
      return { ok: true as const, error: '' }
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : 'Invalid JSON' }
    }
  }, [form.custom_schema])

  async function uploadImage(file: File): Promise<string | null> {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/media', { method: 'POST', body: fd })
    const json = await res.json().catch(() => ({}))
    if (!res.ok || !json.url) {
      toast.error(json.error || 'Upload failed.')
      return null
    }
    return json.url as string
  }

  async function handleCoverUpload(file: File) {
    setUploading(true)
    const tId = toast.loading('Uploading featured image…')
    try {
      const url = await uploadImage(file)
      if (url) {
        set('cover_image', url)
        toast.success('Featured image uploaded.', { id: tId })
      } else {
        toast.dismiss(tId)
      }
    } catch {
      toast.error('Upload failed — network error.', { id: tId })
    } finally {
      setUploading(false)
    }
  }

  function buildInput(status: PostStatus): PostInput {
    return {
      ...(typeof initialPost?.id === 'number' && initialPost.id > 0 ? { id: initialPost.id } : {}),
      title: form.title.trim(),
      slug: form.slug.trim() ? slugify(form.slug) : slugify(form.title),
      excerpt: form.excerpt.trim(),
      content: form.content,
      content_format: 'html',
      cover_image: form.cover_image.trim() || null,
      author: form.author.trim() || 'Diamonds Tester Team',
      author_role: form.author_role.trim() || 'Gemologist',
      category: form.category.trim() || 'Guides',
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      status,
      featured: form.featured,
      seo_title: form.seo_title.trim() || null,
      seo_description: form.seo_description.trim() || null,
      layout: form.layout,
      difficulty: form.difficulty,
      topic_focus: form.topic_focus,
      custom_css: form.custom_css.trim() || null,
      custom_schema: form.custom_schema.trim() || null,
    }
  }

  async function save(status: PostStatus) {
    if (!form.title.trim()) {
      toast.error('A title is required.')
      return
    }
    if (form.custom_schema.trim() && !schemaState.ok) {
      toast.error(`Fix the custom schema before saving: ${schemaState.error}`)
      return
    }

    const input = buildInput(status)
    const isUpdate = typeof input.id === 'number'
    setSaving(true)
    const tId = toast.loading(isUpdate ? 'Saving changes…' : 'Creating post…')
    try {
      const res = await fetch('/api/admin/blog', {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(json.error || 'Could not save the post.', { id: tId })
        return
      }
      toast.success(isUpdate ? 'Post saved.' : 'Post created.', { id: tId })
      router.push('/admin/blog')
    } catch {
      toast.error('Network error — please try again.', { id: tId })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!isEdit || typeof initialPost?.id !== 'number') return
    if (!window.confirm(`Delete “${initialPost.title}”? This cannot be undone.`)) return

    setDeleting(true)
    const tId = toast.loading('Deleting post…')
    try {
      const res = await fetch(`/api/admin/blog?id=${initialPost.id}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(json.error || 'Could not delete the post.', { id: tId })
        return
      }
      toast.success('Post deleted.', { id: tId })
      router.push('/admin/blog')
    } catch {
      toast.error('Network error — please try again.', { id: tId })
    } finally {
      setDeleting(false)
    }
  }

  const busy = saving || deleting || uploading

  // Category options — keep the post's own category even if it was retired.
  const categoryOptions = useMemo(() => {
    const list = [...CATEGORIES] as string[]
    if (form.category && !list.includes(form.category)) list.unshift(form.category)
    return list
  }, [form.category])

  const titleLen = form.seo_title.length
  const descLen = form.seo_description.length
  const previewTitle = (form.seo_title || form.title || 'Untitled post').slice(0, META_TITLE_MAX)
  const previewTitleEllipsis = (form.seo_title || form.title).length > META_TITLE_MAX ? '…' : ''
  const previewDesc = (form.seo_description || form.excerpt || '').slice(0, META_DESC_MAX)

  return (
    <div className="space-y-6">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-30 -mx-4 flex flex-col gap-3 border-b border-border bg-ink/80 px-4 py-3 backdrop-blur sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <h1 className="font-display text-xl font-bold tracking-tight text-platinum">
          {isEdit ? 'Edit post' : 'New post'}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push('/admin/blog')}
            disabled={busy}
          >
            Cancel
          </Button>
          {isEdit && (
            <Button
              type="button"
              variant="outline"
              className="text-red-300 hover:border-destructive/60 hover:text-red-200"
              onClick={handleDelete}
              disabled={busy}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => save(form.status)}
            disabled={busy}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save
          </Button>
          <Button type="button" onClick={() => save('published')} disabled={busy}>
            {isEdit ? 'Update' : 'Publish'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left column ─────────────────────────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">
          <div className="card-luxe space-y-5 rounded-2xl border border-border bg-card p-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="How to tell if a diamond is real"
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Permalink</Label>
              <div className="flex items-stretch overflow-hidden rounded-lg border border-border bg-secondary/30">
                <span className="grid place-items-center whitespace-nowrap border-r border-border bg-secondary/50 px-3 text-xs text-muted-foreground">
                  /blog/
                </span>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugLocked(true)
                    set('slug', e.target.value)
                  }}
                  placeholder="how-to-tell-if-a-diamond-is-real"
                  className="border-0 bg-transparent focus-visible:ring-0"
                />
              </div>
            </div>

            {/* Featured image */}
            <div className="space-y-2">
              <Label>Featured image</Label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="grid h-28 w-44 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-secondary/30">
                  {form.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.cover_image}
                      alt="Featured preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) void handleCoverUpload(file)
                      e.target.value = ''
                    }}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
                        </>
                      ) : (
                        <>
                          <ImagePlus className="h-4 w-4" /> Upload
                        </>
                      )}
                    </Button>
                    {form.cover_image && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => set('cover_image', '')}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <Input
                    value={form.cover_image}
                    onChange={(e) => set('cover_image', e.target.value)}
                    placeholder="…or paste an image URL"
                    className="h-9 text-xs"
                  />
                  <p className="text-xs text-muted-foreground">Recommended 1200×630 WebP.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rich editor */}
          <div className="card-luxe space-y-2 rounded-2xl border border-border bg-card p-5">
            <Label>Content</Label>
            <RichEditor
              value={form.content}
              onChange={(html) => set('content', html)}
              resetKey={resetKey}
              onUploadImage={uploadImage}
            />
          </div>
        </div>

        {/* ── Right sidebar ───────────────────────────────────────────── */}
        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {/* Status */}
          <div className="card-luxe space-y-3 rounded-2xl border border-border bg-card p-5">
            <Label>Status</Label>
            <div className="inline-flex w-full rounded-full border border-border bg-secondary/40 p-1">
              {(['draft', 'published'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('status', s)}
                  className={cn(
                    'flex-1 rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-colors',
                    form.status === s
                      ? 'bg-brilliant text-white shadow-glow'
                      : 'text-muted-foreground hover:text-platinum',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Layout */}
          <div className="card-luxe space-y-3 rounded-2xl border border-border bg-card p-5">
            <Label>Sitewide layout</Label>
            <div className="inline-flex w-full rounded-full border border-border bg-secondary/40 p-1">
              {([
                { key: 'full-page', label: 'Full Page' },
                { key: 'with-sidebar', label: 'With Sidebar' },
              ] as const).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => set('layout', opt.key)}
                  className={cn(
                    'flex-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                    form.layout === opt.key
                      ? 'bg-brilliant text-white shadow-glow'
                      : 'text-muted-foreground hover:text-platinum',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interlink checker */}
          <div className="card-luxe rounded-2xl border border-border bg-card p-5">
            <InterlinkChecker
              content={form.content}
              posts={linkPosts}
              onApply={(html) => {
                set('content', html)
                setResetKey((k) => k + 1)
              }}
            />
          </div>

          {/* SEO settings */}
          <div className="card-luxe space-y-4 rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              SEO Settings
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="seo_title">Meta Title</Label>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 text-[11px] tabular-nums',
                    counterTone(titleLen, 50, META_TITLE_MAX),
                  )}
                >
                  {titleLen > META_TITLE_MAX ? (
                    <AlertCircle className="h-3 w-3" />
                  ) : (
                    <CheckCircle2 className="h-3 w-3" />
                  )}
                  {titleLen}/{META_TITLE_MAX}
                </span>
              </div>
              <Input
                id="seo_title"
                value={form.seo_title}
                onChange={(e) => set('seo_title', e.target.value)}
                placeholder="Defaults to the post title"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="seo_description">Meta Description</Label>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 text-[11px] tabular-nums',
                    counterTone(descLen, 140, META_DESC_MAX),
                  )}
                >
                  {descLen > META_DESC_MAX ? (
                    <AlertCircle className="h-3 w-3" />
                  ) : (
                    <CheckCircle2 className="h-3 w-3" />
                  )}
                  {descLen}/{META_DESC_MAX}
                </span>
              </div>
              <Textarea
                id="seo_description"
                value={form.seo_description}
                onChange={(e) => set('seo_description', e.target.value)}
                placeholder="Up to ~155 characters for search snippets…"
                className="min-h-[72px]"
              />
            </div>

            {/* Google preview */}
            <div className="space-y-1 rounded-xl border border-border bg-secondary/20 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Search preview
              </p>
              <p className="truncate text-sm text-[#8ab4f8]">
                {previewTitle}
                {previewTitleEllipsis}
              </p>
              <p className="truncate text-xs text-[#5f8a5f]">
                {domain}/blog/{form.slug || '…'}
              </p>
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {previewDesc || 'Your meta description preview appears here.'}
              </p>
            </div>
          </div>

          {/* Author */}
          <div className="card-luxe space-y-4 rounded-2xl border border-border bg-card p-5">
            <div className="space-y-2">
              <Label htmlFor="author">Author Name</Label>
              <Input
                id="author"
                value={form.author}
                onChange={(e) => set('author', e.target.value)}
                placeholder="Dr. Helena Voss"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author_role">Author Role</Label>
              <Input
                id="author_role"
                value={form.author_role}
                onChange={(e) => set('author_role', e.target.value)}
                placeholder="Chief Gemologist, GIA GG"
              />
            </div>
          </div>

          {/* Taxonomy */}
          <div className="card-luxe space-y-4 rounded-2xl border border-border bg-card p-5">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className="flex h-10 w-full rounded-lg border border-border bg-secondary/30 px-3 text-sm text-platinum focus:outline-none focus:ring-2 focus:ring-brilliant/40"
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c} className="bg-ink text-platinum">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <select
                id="difficulty"
                value={form.difficulty}
                onChange={(e) => set('difficulty', e.target.value as PostDifficulty)}
                className="flex h-10 w-full rounded-lg border border-border bg-secondary/30 px-3 text-sm text-platinum focus:outline-none focus:ring-2 focus:ring-brilliant/40"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d} className="bg-ink text-platinum">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic_focus">Topic Focus</Label>
              <select
                id="topic_focus"
                value={form.topic_focus}
                onChange={(e) => set('topic_focus', e.target.value as PostTopic)}
                className="flex h-10 w-full rounded-lg border border-border bg-secondary/30 px-3 text-sm text-platinum focus:outline-none focus:ring-2 focus:ring-brilliant/40"
              >
                {TOPICS.map((t) => (
                  <option key={t} value={t} className="bg-ink text-platinum">
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Featured */}
          <div className="card-luxe rounded-2xl border border-border bg-card p-5">
            <label className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-sm text-platinum-muted">
                Featured
                {form.featured && <Badge variant="default">on</Badge>}
              </span>
              <Switch
                checked={form.featured}
                onCheckedChange={(v) => set('featured', v)}
                aria-label="Featured"
              />
            </label>
          </div>

          {/* Tags + excerpt */}
          <div className="card-luxe space-y-4 rounded-2xl border border-border bg-card p-5">
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={form.tags}
                onChange={(e) => set('tags', e.target.value)}
                placeholder="moissanite, testing, 4cs"
              />
              <p className="text-xs text-muted-foreground">Comma-separated.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={form.excerpt}
                onChange={(e) => set('excerpt', e.target.value)}
                placeholder="A short summary shown in listings…"
                className="min-h-[72px]"
              />
            </div>
          </div>

          {/* Custom CSS */}
          <div className="card-luxe space-y-2 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <Label htmlFor="custom_css">Custom CSS</Label>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {form.custom_css.length} chars
              </span>
            </div>
            <Textarea
              id="custom_css"
              value={form.custom_css}
              onChange={(e) => set('custom_css', e.target.value)}
              placeholder=".post-body h2 { color: #fff; }"
              className="min-h-[96px] font-mono text-[12px] leading-relaxed"
            />
            <p className="text-xs text-muted-foreground">Loads after global CSS.</p>
          </div>

          {/* Custom schema */}
          <div className="card-luxe space-y-2 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <Label htmlFor="custom_schema">Custom Schema (JSON-LD)</Label>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {form.custom_schema.length} chars
              </span>
            </div>
            <Textarea
              id="custom_schema"
              value={form.custom_schema}
              onChange={(e) => set('custom_schema', e.target.value)}
              placeholder='{ "@context": "https://schema.org", "@type": "Article" }'
              className="min-h-[96px] font-mono text-[12px] leading-relaxed"
            />
            {form.custom_schema.trim() ? (
              schemaState.ok ? (
                <p className="flex items-center gap-1.5 text-xs text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Valid JSON — will replace default schema.
                </p>
              ) : (
                <p className="flex items-start gap-1.5 text-xs text-red-300">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Invalid JSON: {schemaState.error}
                </p>
              )
            ) : null}
          </div>

          <Separator className="lg:hidden" />
        </div>
      </div>
    </div>
  )
}
