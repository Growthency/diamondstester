'use client'

import { useEffect, useState } from 'react'
import { Loader2, Sparkles, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { slugify } from '@/lib/utils'
import type { AdminPage, PageInput } from './types'

interface FormState {
  title: string
  slug: string
  content: string
  status: 'draft' | 'published'
  seo_title: string
  seo_description: string
}

function toFormState(page: AdminPage | null): FormState {
  return {
    title: page?.title ?? '',
    slug: page?.slug ?? '',
    content: page?.content ?? '',
    status: page?.status ?? 'draft',
    seo_title: page?.seo_title ?? '',
    seo_description: page?.seo_description ?? '',
  }
}

export function PageEditor({
  page,
  onClose,
  onSave,
}: {
  page: AdminPage | null
  onClose: () => void
  onSave: (input: PageInput) => Promise<boolean>
}) {
  const [form, setForm] = useState<FormState>(() => toFormState(page))
  // Only auto-derive the slug from the title for new pages the user hasn't touched.
  const [slugLocked, setSlugLocked] = useState<boolean>(() => Boolean(page?.slug))
  const [saving, setSaving] = useState(false)

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
      if (e.key === 'Escape' && !saving) onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose, saving])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('A title is required.')
      return
    }

    const input: PageInput = {
      ...(typeof page?.id === 'number' && page.id > 0 ? { id: page.id } : {}),
      title: form.title.trim(),
      slug: form.slug.trim() ? slugify(form.slug) : slugify(form.title),
      content: form.content,
      status: form.status,
      seo_title: form.seo_title.trim() || null,
      seo_description: form.seo_description.trim() || null,
    }

    setSaving(true)
    const ok = await onSave(input)
    setSaving(false)
    if (ok) onClose()
  }

  const isEdit = typeof page?.id === 'number' && page.id > 0

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
        onClick={() => !saving && onClose()}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit page' : 'New page'}
        className="relative flex h-full w-full max-w-2xl flex-col border-l border-border bg-card shadow-2xl"
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-6">
          <h2 className="font-display text-lg font-semibold text-platinum">
            {isEdit ? 'Edit page' : 'New page'}
          </h2>
          <button
            onClick={() => !saving && onClose()}
            className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-platinum"
            aria-label="Close editor"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form
          id="page-editor-form"
          onSubmit={handleSubmit}
          className="flex-1 space-y-5 overflow-y-auto px-6 py-6"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="About Diamonds Tester"
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
              placeholder="about"
            />
            <p className="text-xs text-muted-foreground">
              URL: <span className="text-platinum-muted">/{form.slug || '…'}</span>
            </p>
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
              placeholder={'## Section heading\n\nWrite your page in **markdown**…'}
              className="min-h-[300px] font-mono text-[13px] leading-relaxed"
            />
          </div>

          <Separator />

          {/* Status */}
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
                placeholder="Defaults to the page title"
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
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="page-editor-form" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </>
            ) : isEdit ? (
              'Save changes'
            ) : (
              'Create page'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
