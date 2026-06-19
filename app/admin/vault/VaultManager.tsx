'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Pencil,
  Plus,
  Search,
  Shield,
  Trash2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface Credential {
  id: number | string
  site_name: string
  site_url: string | null
  username: string | null
  password: string
  notes: string | null
}

interface FormState {
  id: Credential['id'] | null
  site_name: string
  site_url: string
  username: string
  password: string
  notes: string
}

const EMPTY_FORM: FormState = {
  id: null,
  site_name: '',
  site_url: '',
  username: '',
  password: '',
  notes: '',
}

export function VaultManager() {
  const [items, setItems] = useState<Credential[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [editing, setEditing] = useState<FormState | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/credentials', { cache: 'no-store' })
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (c) =>
        c.site_name.toLowerCase().includes(q) ||
        (c.site_url ?? '').toLowerCase().includes(q) ||
        (c.username ?? '').toLowerCase().includes(q) ||
        (c.notes ?? '').toLowerCase().includes(q),
    )
  }, [items, query])

  const toggleReveal = useCallback((id: Credential['id']) => {
    setRevealed((prev) => {
      const next = new Set(prev)
      const key = String(id)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const copy = useCallback(async (value: string, label: string) => {
    if (!value) {
      toast.error(`No ${label} to copy.`)
      return
    }
    try {
      await navigator.clipboard.writeText(value)
      toast.success(`${label} copied to clipboard.`)
    } catch {
      toast.error(`Could not copy ${label}.`)
    }
  }, [])

  const save = useCallback(async () => {
    if (!editing) return
    if (!editing.site_name.trim()) {
      toast.error('Site name is required.')
      return
    }
    setSaving(true)
    const isEdit = editing.id != null
    try {
      const res = await fetch('/api/admin/credentials', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isEdit ? { id: editing.id } : {}),
          site_name: editing.site_name,
          site_url: editing.site_url,
          username: editing.username,
          password: editing.password,
          notes: editing.notes,
        }),
      })
      const data = await res.json()
      if (!res.ok || data?.error) {
        toast.error(data?.error || 'Could not save credential.')
        return
      }
      toast.success(isEdit ? 'Credential updated.' : 'Credential added.')
      setEditing(null)
      await load()
    } catch {
      toast.error('Could not save credential.')
    } finally {
      setSaving(false)
    }
  }, [editing, load])

  const remove = useCallback(
    async (id: Credential['id']) => {
      try {
        const res = await fetch(
          `/api/admin/credentials?id=${encodeURIComponent(String(id))}`,
          { method: 'DELETE' },
        )
        const data = await res.json()
        if (!res.ok || data?.error) {
          toast.error(data?.error || 'Delete failed.')
          return
        }
        setItems((prev) => prev.filter((c) => c.id !== id))
        toast.success('Credential deleted.')
      } catch {
        toast.error('Delete failed.')
      }
    },
    [],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search credentials…"
            className="pl-9"
          />
        </div>
        <Button type="button" onClick={() => setEditing({ ...EMPTY_FORM })}>
          <Plus className="h-4 w-4" /> Add credential
        </Button>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-border bg-brilliant-soft/20 px-4 py-2.5 text-xs text-muted-foreground">
        <Shield className="h-4 w-4 shrink-0 text-brilliant-cyan" />
        Passwords are encrypted at rest with AES-256-GCM. They are only decrypted
        for display inside this authenticated dashboard.
      </div>

      {editing && (
        <Card className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-platinum">
              {editing.id != null ? 'Edit credential' : 'New credential'}
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setEditing(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="v-site">Site name *</Label>
              <Input
                id="v-site"
                value={editing.site_name}
                onChange={(e) =>
                  setEditing((f) => f && { ...f, site_name: e.target.value })
                }
                placeholder="e.g. Supabase"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-url">Site URL</Label>
              <Input
                id="v-url"
                value={editing.site_url}
                onChange={(e) =>
                  setEditing((f) => f && { ...f, site_url: e.target.value })
                }
                placeholder="https://…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-user">Username</Label>
              <Input
                id="v-user"
                value={editing.username}
                onChange={(e) =>
                  setEditing((f) => f && { ...f, username: e.target.value })
                }
                placeholder="username or email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-pass">Password</Label>
              <Input
                id="v-pass"
                type="text"
                value={editing.password}
                onChange={(e) =>
                  setEditing((f) => f && { ...f, password: e.target.value })
                }
                placeholder={
                  editing.id != null ? 'Leave unchanged or enter new' : 'password'
                }
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="v-notes">Notes</Label>
              <Textarea
                id="v-notes"
                rows={3}
                value={editing.notes}
                onChange={(e) =>
                  setEditing((f) => f && { ...f, notes: e.target.value })
                }
                placeholder="Optional notes…"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing.id != null ? 'Save changes' : 'Add credential'}
            </Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading vault…
        </div>
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <Lock className="h-10 w-10 text-muted-foreground" />
          <p className="font-medium text-platinum">
            {query ? 'No matching credentials' : 'Vault is empty'}
          </p>
          <p className="text-sm text-muted-foreground">
            {query
              ? 'Try a different search term.'
              : 'Add your first credential to keep it safe and encrypted.'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((c) => {
            const shown = revealed.has(String(c.id))
            return (
              <Card key={c.id} className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <KeyRound className="h-4 w-4 shrink-0 text-brilliant-cyan" />
                      <p className="truncate font-medium text-platinum">
                        {c.site_name}
                      </p>
                    </div>
                    {c.site_url && (
                      <a
                        href={c.site_url}
                        target="_blank"
                        rel="noreferrer"
                        className="block truncate text-xs text-brilliant-cyan hover:underline"
                      >
                        {c.site_url}
                      </a>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Edit"
                      onClick={() =>
                        setEditing({
                          id: c.id,
                          site_name: c.site_name,
                          site_url: c.site_url ?? '',
                          username: c.username ?? '',
                          password: c.password ?? '',
                          notes: c.notes ?? '',
                        })
                      }
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      title="Delete"
                      onClick={() => remove(c.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-20 shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
                      User
                    </span>
                    <span className="min-w-0 flex-1 truncate text-platinum">
                      {c.username || '—'}
                    </span>
                    {c.username && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title="Copy username"
                        onClick={() => copy(c.username ?? '', 'Username')}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-20 shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
                      Pass
                    </span>
                    <span className="min-w-0 flex-1 truncate font-mono text-platinum">
                      {c.password ? (shown ? c.password : '••••••••••') : '—'}
                    </span>
                    {c.password && (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title={shown ? 'Hide' : 'Reveal'}
                          onClick={() => toggleReveal(c.id)}
                        >
                          {shown ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="Copy password"
                          onClick={() => copy(c.password, 'Password')}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {c.notes && (
                  <p className="whitespace-pre-wrap border-t border-border pt-2 text-xs text-muted-foreground">
                    {c.notes}
                  </p>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
