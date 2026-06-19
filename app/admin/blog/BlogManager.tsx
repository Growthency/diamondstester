'use client'

import { useMemo, useState } from 'react'
import {
  CalendarDays,
  Eye,
  FileText,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn, formatDate } from '@/lib/utils'
import type { AdminPost, PostInput } from './types'
import { BlogEditor } from './BlogEditor'

type Filter = 'all' | 'published' | 'draft'

export function BlogManager({
  initialPosts,
  configured,
}: {
  initialPosts: AdminPost[]
  configured: boolean
}) {
  const [posts, setPosts] = useState<AdminPost[]>(initialPosts)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [editing, setEditing] = useState<AdminPost | null>(null)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter((p) => {
      if (filter !== 'all' && p.status !== filter) return false
      if (!q) return true
      return (
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [posts, query, filter])

  const counts = useMemo(
    () => ({
      all: posts.length,
      published: posts.filter((p) => p.status === 'published').length,
      draft: posts.filter((p) => p.status === 'draft').length,
    }),
    [posts],
  )

  async function refresh() {
    if (!configured) return
    try {
      const res = await fetch('/api/admin/blog', { cache: 'no-store' })
      const json = await res.json()
      if (res.ok && Array.isArray(json.posts)) {
        setPosts(json.posts as AdminPost[])
      }
    } catch {
      /* keep optimistic state */
    }
  }

  async function handleSave(input: PostInput): Promise<boolean> {
    if (!configured) {
      toast.error('Supabase not configured — connect it in .env.local to save posts.')
      return false
    }

    const isUpdate = typeof input.id === 'number'
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
        return false
      }

      // Optimistic merge, then reconcile with the server.
      const saved = json.post as AdminPost
      setPosts((prev) => {
        const exists = prev.some((p) => p.id === saved.id)
        return exists
          ? prev.map((p) => (p.id === saved.id ? saved : p))
          : [saved, ...prev]
      })
      toast.success(isUpdate ? 'Post updated.' : 'Post created.', { id: tId })
      void refresh()
      return true
    } catch {
      toast.error('Network error — please try again.', { id: tId })
      return false
    }
  }

  async function handleDelete(post: AdminPost) {
    if (!configured) {
      toast.error('Supabase not configured — connect it in .env.local to delete posts.')
      return
    }
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return

    setDeletingId(post.id)
    const prev = posts
    setPosts((p) => p.filter((x) => x.id !== post.id)) // optimistic

    try {
      const res = await fetch(`/api/admin/blog?id=${post.id}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setPosts(prev) // rollback
        toast.error(json.error || 'Could not delete the post.')
      } else {
        toast.success('Post deleted.')
      }
    } catch {
      setPosts(prev)
      toast.error('Network error — please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'published', label: `Published (${counts.published})` },
    { key: 'draft', label: `Drafts (${counts.draft})` },
  ]

  return (
    <div className="space-y-6">
      {!configured && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Showing bundled seed posts (read-only). Connect Supabase in{' '}
          <code className="rounded bg-ink/40 px-1.5 py-0.5 text-xs">.env.local</code> to create,
          edit, and delete posts.
        </div>
      )}

      {/* Header / actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-platinum">Blog Posts</h2>
          <p className="text-sm text-muted-foreground">Write, edit and publish articles.</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> New Post
        </Button>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, category or tag…"
            className="pl-10"
          />
        </div>
        <div className="inline-flex rounded-full border border-border bg-secondary/40 p-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
                filter === f.key
                  ? 'bg-brilliant text-white shadow-glow'
                  : 'text-muted-foreground hover:text-platinum',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card-luxe grid place-items-center rounded-2xl px-6 py-16 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/60" />
          <p className="mt-3 font-medium text-platinum">No posts found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {query || filter !== 'all'
              ? 'Try clearing your search or filter.'
              : 'Create your first post to get started.'}
          </p>
          {!query && filter === 'all' && (
            <Button className="mt-5" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" /> New Post
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          {/* Desktop table header */}
          <div className="hidden grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-b border-border bg-card/60 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground lg:grid">
            <span>Title</span>
            <span className="w-24">Status</span>
            <span className="w-28">Category</span>
            <span className="w-32">Published</span>
            <span className="w-24 text-right">Actions</span>
          </div>

          <ul className="divide-y divide-border">
            {filtered.map((post) => (
              <li
                key={post.id}
                className="grid grid-cols-1 gap-3 bg-card/30 px-5 py-4 transition-colors hover:bg-card/60 lg:grid-cols-[1fr_auto_auto_auto_auto] lg:items-center lg:gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {post.featured && (
                      <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
                    )}
                    <p className="truncate font-medium text-platinum">{post.title}</p>
                  </div>
                  <p className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {post.views}
                    </span>
                    <span className="truncate">/{post.slug}</span>
                  </p>
                </div>

                <div className="lg:w-24">
                  <Badge variant={post.status === 'published' ? 'success' : 'warning'}>
                    {post.status}
                  </Badge>
                </div>

                <div className="lg:w-28">
                  <Badge variant="muted">{post.category}</Badge>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground lg:w-32">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {post.published_at ? formatDate(post.published_at) : '—'}
                </div>

                <div className="flex items-center gap-2 lg:w-24 lg:justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(post)}
                    aria-label={`Edit ${post.title}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="lg:hidden">Edit</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-300 hover:border-destructive/60 hover:text-red-200"
                    onClick={() => handleDelete(post)}
                    disabled={deletingId === post.id}
                    aria-label={`Delete ${post.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="lg:hidden">Delete</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Editor (create or edit) */}
      {(creating || editing) && (
        <BlogEditor
          post={editing}
          onClose={() => {
            setEditing(null)
            setCreating(false)
          }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
