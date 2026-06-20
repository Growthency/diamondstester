'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ExternalLink as ExternalLinkIcon,
  Link2,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

type Location = 'footer' | 'header' | 'sidebar'

interface ExternalLinkRow {
  id: number
  label: string
  url: string
  rel: string
  location: Location
  sort_order: number
  active: boolean
  created_at: string
}

interface FormState {
  id?: number
  label: string
  url: string
  rel: string
  location: Location
  sort_order: number
  active: boolean
}

const EMPTY_FORM: FormState = {
  label: '',
  url: '',
  rel: 'nofollow noopener',
  location: 'footer',
  sort_order: 0,
  active: true,
}

const LOCATIONS: Location[] = ['footer', 'header', 'sidebar']

export function ExternalLinksManager({ configured }: { configured: boolean }) {
  const [links, setLinks] = useState<ExternalLinkRow[]>([])
  const [loading, setLoading] = useState(configured)
  const [editing, setEditing] = useState<FormState | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  useEffect(() => {
    if (!configured) {
      setLoading(false)
      return
    }
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/external-links', { cache: 'no-store' })
      const json = await res.json().catch(() => ({}))
      if (res.ok && Array.isArray(json.links)) {
        setLinks(json.links as ExternalLinkRow[])
      } else if (json?.error) {
        toast.error(json.error)
      }
    } catch {
      toast.error('Could not load external links.')
    } finally {
      setLoading(false)
    }
  }

  const grouped = useMemo(() => {
    const map: Record<Location, ExternalLinkRow[]> = { footer: [], header: [], sidebar: [] }
    for (const link of links) {
      ;(map[link.location] ?? map.footer).push(link)
    }
    return map
  }, [links])

  async function handleSave() {
    if (!editing) return
    if (!configured) {
      toast.error('Connect Supabase to manage external links.')
      return
    }
    if (!editing.label.trim() || !editing.url.trim()) {
      toast.error('Label and URL are required.')
      return
    }

    const isUpdate = typeof editing.id === 'number'
    setSaving(true)
    try {
      const res = await fetch('/api/admin/external-links', {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || json?.error) {
        toast.error(json?.error || 'Could not save the link.')
        return
      }
      const saved = json.link as ExternalLinkRow
      setLinks((prev) => {
        const exists = prev.some((l) => l.id === saved.id)
        return exists ? prev.map((l) => (l.id === saved.id ? saved : l)) : [...prev, saved]
      })
      toast.success(isUpdate ? 'Link updated.' : 'Link added.')
      setEditing(null)
    } catch {
      toast.error('Network error — please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(link: ExternalLinkRow) {
    if (!configured) return
    setTogglingId(link.id)
    const prev = links
    setLinks((ls) => ls.map((l) => (l.id === link.id ? { ...l, active: !l.active } : l)))
    try {
      const res = await fetch('/api/admin/external-links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: link.id, active: !link.active }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || json?.error) {
        setLinks(prev)
        toast.error(json?.error || 'Could not update the link.')
      }
    } catch {
      setLinks(prev)
      toast.error('Network error — please try again.')
    } finally {
      setTogglingId(null)
    }
  }

  async function handleDelete(link: ExternalLinkRow) {
    if (!configured) return
    if (!window.confirm(`Delete “${link.label}”? This cannot be undone.`)) return
    setDeletingId(link.id)
    const prev = links
    setLinks((ls) => ls.filter((l) => l.id !== link.id))
    try {
      const res = await fetch(`/api/admin/external-links?id=${link.id}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || json?.error) {
        setLinks(prev)
        toast.error(json?.error || 'Could not delete the link.')
      } else {
        toast.success('Link deleted.')
      }
    } catch {
      setLinks(prev)
      toast.error('Network error — please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  if (!configured) {
    return (
      <div className="card-luxe grid place-items-center rounded-2xl px-6 py-16 text-center">
        <ExternalLinkIcon className="h-10 w-10 text-muted-foreground/60" />
        <p className="mt-3 font-medium text-platinum">Connect Supabase to manage this</p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          External links are stored in your database. Add your Supabase credentials in{' '}
          <code className="rounded bg-ink-soft px-1.5 py-0.5 text-xs">.env.local</code> to start
          adding partner links.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button onClick={() => setEditing({ ...EMPTY_FORM })}>
          <Plus className="h-4 w-4" /> New Link
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading links…
        </div>
      ) : links.length === 0 ? (
        <div className="card-luxe grid place-items-center rounded-2xl px-6 py-16 text-center">
          <Link2 className="h-10 w-10 text-muted-foreground/60" />
          <p className="mt-3 font-medium text-platinum">No external links yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add partner or outbound links to display them on the site.
          </p>
          <Button className="mt-5" onClick={() => setEditing({ ...EMPTY_FORM })}>
            <Plus className="h-4 w-4" /> New Link
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {LOCATIONS.filter((loc) => grouped[loc].length > 0).map((loc) => (
            <div key={loc}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {loc}
              </p>
              <div className="overflow-hidden rounded-2xl border border-border">
                <ul className="divide-y divide-border">
                  {grouped[loc].map((link) => (
                    <li
                      key={link.id}
                      className="grid grid-cols-1 gap-3 bg-card/30 px-5 py-4 transition-colors hover:bg-card/60 lg:grid-cols-[1fr_auto_auto_auto] lg:items-center lg:gap-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-platinum">{link.label}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{link.url}</p>
                      </div>

                      <div className="lg:w-40">
                        <Badge variant="muted" className="font-mono text-[10px]">
                          rel: {link.rel || '—'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 lg:w-28">
                        <Switch
                          checked={link.active}
                          disabled={togglingId === link.id}
                          onCheckedChange={() => toggleActive(link)}
                          aria-label={`Toggle ${link.label}`}
                        />
                        <span className="text-xs text-muted-foreground">
                          {link.active ? 'Active' : 'Hidden'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 lg:justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setEditing({
                              id: link.id,
                              label: link.label,
                              url: link.url,
                              rel: link.rel,
                              location: link.location,
                              sort_order: link.sort_order,
                              active: link.active,
                            })
                          }
                          aria-label={`Edit ${link.label}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="lg:hidden">Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-300 hover:border-destructive/60 hover:text-red-200"
                          onClick={() => handleDelete(link)}
                          disabled={deletingId === link.id}
                          aria-label={`Delete ${link.label}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="lg:hidden">Delete</span>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor dialog */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
            onClick={() => !saving && setEditing(null)}
            aria-hidden
          />
          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-lg font-semibold text-platinum">
                {typeof editing.id === 'number' ? 'Edit Link' : 'New Link'}
              </h2>
              <button
                onClick={() => !saving && setEditing(null)}
                className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-platinum"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div className="space-y-1.5">
                <Label htmlFor="el-label">Label</Label>
                <Input
                  id="el-label"
                  value={editing.label}
                  onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                  placeholder="GIA — Gemological Institute of America"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="el-url">URL</Label>
                <Input
                  id="el-url"
                  value={editing.url}
                  onChange={(e) => setEditing({ ...editing, url: e.target.value })}
                  placeholder="https://www.gia.edu"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="el-location">Location</Label>
                  <select
                    id="el-location"
                    value={editing.location}
                    onChange={(e) =>
                      setEditing({ ...editing, location: e.target.value as Location })
                    }
                    className="flex h-11 w-full rounded-xl border border-input bg-secondary/30 px-4 text-sm text-foreground capitalize shadow-sm transition-colors focus-visible:border-brilliant-cyan/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc} className="bg-card capitalize">
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="el-sort">Sort order</Label>
                  <Input
                    id="el-sort"
                    type="number"
                    value={editing.sort_order}
                    onChange={(e) =>
                      setEditing({ ...editing, sort_order: parseInt(e.target.value, 10) || 0 })
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="el-rel">Rel attribute</Label>
                <Input
                  id="el-rel"
                  value={editing.rel}
                  onChange={(e) => setEditing({ ...editing, rel: e.target.value })}
                  placeholder="nofollow noopener"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Use <code className="rounded bg-ink-soft px-1 py-0.5">nofollow</code> for partner
                  or affiliate links so they pass no SEO equity.
                </p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/20 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-platinum">Active</p>
                  <p className="text-xs text-muted-foreground">Show this link on the site.</p>
                </div>
                <Switch
                  checked={editing.active}
                  onCheckedChange={(checked) => setEditing({ ...editing, active: checked })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
              <Button
                variant="outline"
                onClick={() => setEditing(null)}
                disabled={saving}
                className={cn(saving && 'pointer-events-none')}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {typeof editing.id === 'number' ? 'Save changes' : 'Add link'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
