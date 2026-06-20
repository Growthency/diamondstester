'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Eraser, Info, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

const SETTINGS_KEY = 'custom_css'

export function CustomCssEditor() {
  const [css, setCss] = useState('')
  const [original, setOriginal] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch(`/api/admin/settings?key=${SETTINGS_KEY}`, {
          cache: 'no-store',
        })
        const data = await res.json().catch(() => ({ value: {} }))
        const v = (data?.value ?? {}) as { css?: string }
        const initial = typeof v.css === 'string' ? v.css : ''
        if (active) {
          setCss(initial)
          setOriginal(initial)
        }
      } catch {
        /* keep empty */
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const dirty = css !== original

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: SETTINGS_KEY, value: { css } }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data?.error) {
        toast.error(data?.error || 'Could not save custom CSS.')
        return
      }
      setOriginal(css)
      toast.success('Custom CSS saved.')
    } catch {
      toast.error('Could not save custom CSS.')
    } finally {
      setSaving(false)
    }
  }

  function clearAll() {
    if (!css) return
    if (!window.confirm('Clear all custom CSS? You still need to Save afterwards.')) return
    setCss('')
    taRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = e.currentTarget
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const next = css.substring(0, start) + '  ' + css.substring(end)
      setCss(next)
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2
      })
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault()
      if (!saving && dirty) void save()
    }
  }

  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-brilliant-cyan/25 bg-brilliant-soft px-4 py-3 text-sm text-platinum-muted">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brilliant-cyan" />
        <p>
          <strong className="text-platinum">Tip:</strong> use{' '}
          <code className="rounded bg-ink/40 px-1 py-0.5 text-xs">!important</code> to override
          Tailwind utility classes. Tab inserts two spaces;{' '}
          <kbd className="rounded border border-border px-1.5 py-0.5 text-[11px]">Ctrl</kbd>
          {' + '}
          <kbd className="rounded border border-border px-1.5 py-0.5 text-[11px]">S</kbd> saves.
        </p>
      </div>

      <div className="card-luxe overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-border bg-card/60 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-mono text-xs text-muted-foreground">
              custom.css
              {dirty && <span className="ml-1 text-amber-400">•</span>}
            </span>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">
            {css.length.toLocaleString()} {css.length === 1 ? 'char' : 'chars'}
          </span>
        </div>

        {loading ? (
          <div className="flex h-[480px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-brilliant-cyan" />
          </div>
        ) : (
          <textarea
            ref={taRef}
            value={css}
            onChange={(e) => setCss(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            placeholder={`/* Example overrides */

/* Tighten the hero headline on large screens */
.hero-title {
  letter-spacing: -0.02em;
}

/* Hide a section on mobile only */
@media (max-width: 640px) {
  .home-marquee { display: none; }
}`}
            className="block min-h-[480px] w-full resize-y bg-transparent p-5 font-mono text-[13px] leading-relaxed text-platinum placeholder:text-muted-foreground/70 focus:outline-none"
            style={{ tabSize: 2 }}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Stored under the <code className="rounded bg-ink-soft px-1 py-0.5">custom_css</code>{' '}
          setting and applied sitewide.
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearAll}
            disabled={!css || saving}
            className="text-red-300 hover:border-destructive/60 hover:text-red-200"
          >
            <Eraser className="h-4 w-4" /> Clear
          </Button>
          <Button type="button" onClick={save} disabled={!dirty || saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : dirty ? (
              <Save className="h-4 w-4" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {dirty ? 'Save CSS' : 'Saved'}
          </Button>
        </div>
      </div>
    </div>
  )
}
