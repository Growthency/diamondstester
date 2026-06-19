'use client'

import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Loader2, Sparkles, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { slugify } from '@/lib/utils'
import type { AdminPost, PostInput } from './types'

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
  status: 'draft' | 'published'
  seo_title: string
  seo_description: string
}

function toFormState(post: AdminPost | null): FormState {
  return {
    title: post?.title ?? '',
    slug: post?.slug ?? '',
    excerpt: post?.excerpt ?? '',
    category: post?.category ?? 'Guides',
    tags: post?.tags?.join(', ') ?? '',
    author: post?.author ?? 'CaratIQ Team',
    author_role: post?.author_role ?? 'Gemologist',
    cover_image: post?.cover_image ?? '',
    content: post?.content ?? '',
    featured: post?.featured ?? false,
    status: post?.status ?? 'draft',
    seo_title: post?.seo_title ?? '',
    seo_description: post?.seo_description ?? '',
  }
}

export function BlogEditor({
  post,
  onClose,
  onSave,
}: {
  post: AdminPost | null
  onClose: () => void
  onSave: (input: PostInput) => Promise<boolean>
}) {
  const [form, setForm] = useState<FormState>(() => toFormState(post))
  // Only auto-derive the slug from the title for brand-new posts the user hasn't touched.
  const [slugLocked, setSlugLocked] = useState<boolean>(() => Boolean(post?.slug))
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

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

  // Close on Escape, lock body scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving && !uploading) onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose, saving, uploading])

  async function handleUpload(file: File) {
    setUploading(true)
    const tId = toast.loading('Uploading cover image…')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/media', { method: 'POST', body: fd })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.url) {
        toast.error(json.error || 'Upload failed.', { id: tId })
        return
      }
      set('cover_image', json.url as string)
      toast.success('Cover image uploaded.', { id: tId })
    } catch {
      toast.error('Upload failed — network error.', { id: tId })
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('A title is required.')
      return
    }

    const input: PostInput = {
      ...(typeof post?.id === 'number' && post.id > 0 ? { id: post.id } : {}),
      title: form.title.trim(),
      slug: (form.slug.trim() ? slugify(form.slug) : slugify(form.title)),
      excerpt: form.excerpt.trim(),
      content: form.content,
      cover_image: form.cover_image.trim() || null,
      author: form.author.trim() || 'CaratIQ Team',
      author_role: form.author_role.trim() || 'Gemologist',
      category: form.category.trim() || 'Guides',
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      status: form.status,
      featured: form.featured,
      seo_title: form.seo_title.trim() || null,
      seo_description: form.seo_description.trim() || null,
    }

    setSaving(true)
    const ok = await onSave(input)
    setSaving(false)
    if (ok) onClose()
  }

  const isEdit = typeof post?.id === 'number' && post.id > 0

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
        onClick={() => !saving && !uploading && onClose()}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit post' : 'New post'}
        className="relative flex h-full w-full max-w-2xl flex-col border-l border-border bg-card shadow-2xl"
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-6">
          <h2 className="font-display text-lg font-semibold text-platinum">
            {isEdit ? 'Edit post' : 'New post'}
          </h2>
          <button
            onClick={() => !saving && !uploading && onClose()}
            className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-platinum"
            aria-label="Close editor"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form
          id="blog-editor-form"
          onSubmit={handleSubmit}
          className="flex-1 space-y-5 overflow-y-auto px-6 py-6"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="How to tell if a diamond is real"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => {
                setSlugLocked(true)
                set('slug', e.target.value)
              }}
              placeholder="how-to-tell-if-a-diamond-is-real"
            />
            <p className="text-xs text-muted-foreground">
              URL: <span className="text-platinum-muted">/blog/{form.slug || '…'}</span>
            </p>
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                placeholder="Guides"
              />
            </div>
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
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={form.author}
                onChange={(e) => set('author', e.target.value)}
                placeholder="Dr. Helena Voss"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author_role">Author role</Label>
              <Input
                id="author_role"
                value={form.author_role}
                onChange={(e) => set('author_role', e.target.value)}
                placeholder="Chief Gemologist, GIA GG"
              />
            </div>
          </div>

          {/* Cover image */}
          <div className="space-y-2">
            <Label>Cover image</Label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="grid h-24 w-40 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-secondary/30">
                {form.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.cover_image}
                    alt="Cover preview"
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
                    if (file) void handleUpload(file)
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
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Content</Label>
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Sparkles className="h-3 w-3 text-brilliant-cyan/70" />
                Markdown supported (## headings, **bold**, - lists)
              </span>
            </div>
            <Textarea
              id="content"
              value={form.content}
              onChange={(e) => set('content', e.target.value)}
              placeholder={'## Section heading\n\nWrite your article in **markdown**…'}
              className="min-h-[260px] font-mono text-[13px] leading-relaxed"
            />
          </div>

          <Separator />

          {/* Status + featured */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="inline-flex rounded-full border border-border bg-secondary/40 p-1">
                {(['draft', 'published'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set('status', s)}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-colors ${
                      form.status === s
                        ? 'bg-brilliant text-white shadow-glow'
                        : 'text-muted-foreground hover:text-platinum'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-3">
              <Switch
                checked={form.featured}
                onCheckedChange={(v) => set('featured', v)}
                aria-label="Featured"
              />
              <span className="flex items-center gap-1.5 text-sm text-platinum-muted">
                Featured
                {form.featured && <Badge variant="default">on</Badge>}
              </span>
            </label>
          </div>

          <Separator />

          {/* SEO */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              SEO
            </p>
            <div className="space-y-2">
              <Label htmlFor="seo_title">SEO title</Label>
              <Input
                id="seo_title"
                value={form.seo_title}
                onChange={(e) => set('seo_title', e.target.value)}
                placeholder="Defaults to the post title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo_description">SEO description</Label>
              <Textarea
                id="seo_description"
                value={form.seo_description}
                onChange={(e) => set('seo_description', e.target.value)}
                placeholder="Up to ~160 characters for search snippets…"
                className="min-h-[72px]"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={saving || uploading}
          >
            Cancel
          </Button>
          <Button type="submit" form="blog-editor-form" disabled={saving || uploading}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </>
            ) : isEdit ? (
              'Save changes'
            ) : (
              'Create post'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
