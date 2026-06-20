'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, Loader2, RotateCcw, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const SETTINGS_KEY = 'theme'

type Stop = 'cyan' | 'indigo' | 'violet'

const DEFAULTS: Record<Stop, string> = {
  cyan: '#38E1FF',
  indigo: '#6E72F0',
  violet: '#A855F7',
}

const STOPS: { key: Stop; label: string; hint: string }[] = [
  { key: 'cyan', label: 'Cyan', hint: 'Bright start of the gradient — links and glints.' },
  { key: 'indigo', label: 'Indigo', hint: 'Mid stop — button fills and active states.' },
  { key: 'violet', label: 'Violet', hint: 'Deep end — gradient tails and accents.' },
]

const HEX_RE = /^#[0-9a-fA-F]{6}$/

export function ThemeColorsEditor() {
  const [colors, setColors] = useState<Record<Stop, string>>({ ...DEFAULTS })
  const [original, setOriginal] = useState<Record<Stop, string>>({ ...DEFAULTS })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch(`/api/admin/settings?key=${SETTINGS_KEY}`, {
          cache: 'no-store',
        })
        const data = await res.json().catch(() => ({ value: {} }))
        const v = (data?.value ?? {}) as Partial<Record<Stop, string>>
        const next: Record<Stop, string> = {
          cyan: v.cyan || DEFAULTS.cyan,
          indigo: v.indigo || DEFAULTS.indigo,
          violet: v.violet || DEFAULTS.violet,
        }
        if (active) {
          setColors(next)
          setOriginal(next)
        }
      } catch {
        /* keep defaults */
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const dirty = useMemo(
    () => STOPS.some(({ key }) => colors[key] !== original[key]),
    [colors, original],
  )

  function update(key: Stop, value: string) {
    setColors((c) => ({ ...c, [key]: value }))
  }

  function resetDefaults() {
    setColors({ ...DEFAULTS })
  }

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: SETTINGS_KEY, value: colors }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data?.error) {
        toast.error(data?.error || 'Could not save theme colors.')
        return
      }
      setOriginal(colors)
      toast.success('Theme colors saved.')
    } catch {
      toast.error('Could not save theme colors.')
    } finally {
      setSaving(false)
    }
  }

  const gradient = `linear-gradient(120deg, ${colors.cyan}, ${colors.indigo}, ${colors.violet})`

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading theme…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Gradient preview bar */}
      <div className="card-luxe space-y-3 rounded-2xl p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Gradient preview</p>
        <div
          className="flex h-24 items-center justify-center rounded-xl border border-border font-display text-xl font-semibold text-white shadow-glow"
          style={{ backgroundImage: gradient }}
        >
          Diamonds Tester
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {STOPS.map(({ key }) => (
            <span key={key} className="inline-flex items-center gap-1.5">
              <span
                className="h-3 w-3 rounded-full border border-border"
                style={{ backgroundColor: colors[key] }}
              />
              <span className="font-mono">{colors[key]}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Color inputs */}
      <div className="grid gap-4 sm:grid-cols-3">
        {STOPS.map(({ key, label, hint }) => {
          const value = colors[key]
          const isHex = HEX_RE.test(value)
          return (
            <div key={key} className="card-luxe space-y-3 rounded-2xl p-5">
              <div className="flex items-center gap-2">
                <span
                  className="h-5 w-5 shrink-0 rounded-md border border-border"
                  style={{ backgroundColor: isHex ? value : 'transparent' }}
                />
                <Label htmlFor={`color-${key}`} className="text-platinum">
                  {label}
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">{hint}</p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  aria-label={`Pick ${label} color`}
                  value={isHex ? value : '#000000'}
                  onChange={(e) => update(key, e.target.value)}
                  className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-border bg-transparent p-0"
                />
                <Input
                  id={`color-${key}`}
                  value={value}
                  onChange={(e) => update(key, e.target.value)}
                  placeholder={DEFAULTS[key]}
                  className="font-mono"
                />
              </div>
              {value !== DEFAULTS[key] && (
                <button
                  type="button"
                  onClick={() => update(key, DEFAULTS[key])}
                  className="text-[11px] text-muted-foreground underline-offset-2 hover:text-platinum hover:underline"
                >
                  Reset to default ({DEFAULTS[key]})
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Stored under the <code className="rounded bg-ink-soft px-1 py-0.5">theme</code> setting.
        </p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={resetDefaults} disabled={saving}>
            <RotateCcw className="h-4 w-4" /> Reset all
          </Button>
          <Button type="button" onClick={save} disabled={!dirty || saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : dirty ? (
              <Save className="h-4 w-4" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {dirty ? 'Save colors' : 'Saved'}
          </Button>
        </div>
      </div>
    </div>
  )
}
