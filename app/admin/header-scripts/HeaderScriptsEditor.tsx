'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Check, Eraser, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

const SETTINGS_KEY = 'header_scripts'

export function HeaderScriptsEditor() {
  const [scripts, setScripts] = useState('')
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
        const v = (data?.value ?? {}) as { scripts?: string }
        const initial = typeof v.scripts === 'string' ? v.scripts : ''
        if (active) {
          setScripts(initial)
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

  const dirty = scripts !== original

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: SETTINGS_KEY, value: { scripts } }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data?.error) {
        toast.error(data?.error || 'Could not save header scripts.')
        return
      }
      setOriginal(scripts)
      toast.success('Header scripts saved.')
    } catch {
      toast.error('Could not save header scripts.')
    } finally {
      setSaving(false)
    }
  }

  function clearAll() {
    if (!scripts) return
    if (!window.confirm('Remove all header scripts? You still need to Save afterwards.')) return
    setScripts('')
    taRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault()
      if (!saving && dirty) void save()
    }
  }

  return (
    <div className="space-y-5">
      {/* Warning banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        <p>
          <strong className="text-amber-100">Heads up:</strong> this code is injected raw into the
          page <code className="rounded bg-ink/40 px-1 py-0.5 text-xs">&lt;head&gt;</code> on every
          public page. Only paste snippets from sources you trust — a malformed tag can break the
          site. Changes go live within the cache window (about 60 seconds).
        </p>
      </div>

      <div className="card-luxe overflow-hidden rounded-2xl">
        {/* Editor chrome */}
        <div className="flex items-center justify-between border-b border-border bg-card/60 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-mono text-xs text-muted-foreground">
              head-scripts.html
              {dirty && <span className="ml-1 text-amber-400">•</span>}
            </span>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">
            {scripts.length.toLocaleString()} {scripts.length === 1 ? 'char' : 'chars'}
          </span>
        </div>

        {loading ? (
          <div className="flex h-[420px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-brilliant-cyan" />
          </div>
        ) : (
          <textarea
            ref={taRef}
            value={scripts}
            onChange={(e) => setScripts(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            placeholder={`<!-- Google Analytics, Search Console verification, Meta Pixel, etc. -->
<meta name="google-site-verification" content="..." />
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"></script>`}
            className="block min-h-[420px] w-full resize-y bg-transparent p-5 font-mono text-[13px] leading-relaxed text-platinum placeholder:text-muted-foreground/70 focus:outline-none"
            style={{ tabSize: 2 }}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Stored under the <code className="rounded bg-ink-soft px-1 py-0.5">header_scripts</code>{' '}
          setting. Press <kbd className="rounded border border-border px-1.5 py-0.5 text-[11px]">Ctrl</kbd>
          {' + '}
          <kbd className="rounded border border-border px-1.5 py-0.5 text-[11px]">S</kbd> to save.
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearAll}
            disabled={!scripts || saving}
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
            {dirty ? 'Save scripts' : 'Saved'}
          </Button>
        </div>
      </div>
    </div>
  )
}
