'use client'

import { useEffect, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Check,
  ExternalLink,
  Link as LinkIcon,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface NavItem {
  label: string
  href: string
}

export function MenusEditor({ seed }: { seed: NavItem[] }) {
  const [items, setItems] = useState<NavItem[]>(seed)
  const [original, setOriginal] = useState<NavItem[]>(seed)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch('/api/admin/settings?key=menus', { cache: 'no-store' })
        const json = await res.json().catch(() => ({}))
        if (!active) return
        const saved = json?.value?.items
        if (Array.isArray(saved) && saved.length) {
          const clean = saved
            .filter((i: unknown): i is NavItem => Boolean(i) && typeof i === 'object')
            .map((i: NavItem) => ({ label: String(i.label ?? ''), href: String(i.href ?? '') }))
          setItems(clean)
          setOriginal(clean)
        }
        // else: keep the seeded nav as both current + original
      } catch {
        /* keep seed */
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const dirty = JSON.stringify(items) !== JSON.stringify(original)

  function update(index: number, patch: Partial<NavItem>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)))
  }

  function add() {
    setItems((prev) => [...prev, { label: '', href: '' }])
  }

  function remove(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function move(index: number, dir: -1 | 1) {
    setItems((prev) => {
      const target = index + dir
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  async function save() {
    // Validate before saving — drop empties, require label + href on the rest.
    const cleaned = items.map((i) => ({ label: i.label.trim(), href: i.href.trim() }))
    const nonEmpty = cleaned.filter((i) => i.label || i.href)
    const invalid = nonEmpty.some((i) => !i.label || !i.href)
    if (invalid) {
      toast.error('Each menu item needs both a label and a URL.')
      return
    }

    setSaving(true)
    const tId = toast.loading('Saving menu…')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'menus', value: { items: nonEmpty } }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || json.error) {
        toast.error(json.error || 'Could not save the menu.', { id: tId })
        return
      }
      setItems(nonEmpty)
      setOriginal(nonEmpty)
      setSavedAt(Date.now())
      setTimeout(() => setSavedAt(null), 3000)
      toast.success('Menu saved.', { id: tId })
    } catch {
      toast.error('Network error — please try again.', { id: tId })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-brilliant-cyan" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card-luxe rounded-2xl p-6 sm:p-7">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-platinum">
              <LinkIcon className="h-5 w-5 text-brilliant-cyan" /> Header navigation
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Reorder, edit, add or remove the links in the top navigation bar.
            </p>
          </div>
          <Button onClick={add} variant="outline" size="sm">
            <Plus className="h-4 w-4" /> Add link
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-border px-6 py-14 text-center">
            <LinkIcon className="h-9 w-9 text-muted-foreground/60" />
            <p className="mt-3 font-medium text-platinum">No menu links</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first navigation link to get started.
            </p>
            <Button className="mt-5" onClick={add}>
              <Plus className="h-4 w-4" /> Add link
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item, i) => {
              const external = /^https?:\/\//i.test(item.href)
              return (
                <li
                  key={i}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-card/40 p-3 sm:flex-row sm:items-center"
                >
                  <div className="flex shrink-0 flex-row gap-1 sm:flex-col">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-platinum disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === items.length - 1}
                      className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-platinum disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid flex-1 gap-2 sm:grid-cols-2">
                    <Input
                      value={item.label}
                      onChange={(e) => update(i, { label: e.target.value })}
                      placeholder="Label (e.g. Services)"
                      aria-label={`Menu item ${i + 1} label`}
                    />
                    <div className="relative">
                      <Input
                        value={item.href}
                        onChange={(e) => update(i, { href: e.target.value })}
                        placeholder="/services or https://…"
                        className="pr-9 font-mono text-[13px]"
                        aria-label={`Menu item ${i + 1} URL`}
                      />
                      {external && (
                        <ExternalLink className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => remove(i)}
                    className="shrink-0 text-red-300 hover:border-destructive/60 hover:text-red-200"
                    aria-label={`Remove ${item.label || 'item'}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Save bar */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button
          variant="ghost"
          onClick={() => setItems(seed)}
          disabled={saving || JSON.stringify(items) === JSON.stringify(seed)}
        >
          <RotateCcw className="h-4 w-4" /> Reset to site default
        </Button>
        <Button onClick={save} disabled={saving || !dirty}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : savedAt ? (
            <>
              <Check className="h-4 w-4" /> Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Save menu
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
