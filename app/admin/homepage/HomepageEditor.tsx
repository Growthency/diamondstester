'use client'

import { useEffect, useState } from 'react'
import { Check, Eye, Loader2, RotateCcw, Save, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

interface HomepageContent {
  hero_eyebrow: string
  hero_title: string
  hero_subtitle: string
  cta_label: string
  tester_heading: string
  why_heading: string
  services_heading: string
  faq_heading: string
}

// These mirror the strings currently hardcoded on the public homepage so the
// editor starts from the live copy rather than empty fields. Saving any field
// upserts the whole "homepage" settings object; the public page reads it and
// falls back to these same defaults when a field is blank.
const DEFAULTS: HomepageContent = {
  hero_eyebrow: 'Free · no signup',
  hero_title: 'Know if your diamond is real.',
  hero_subtitle:
    'Upload a photo or book a lab test and get a clear, expert-backed verdict on authenticity, carat, cut and clarity — in minutes, not weeks.',
  cta_label: 'Test your diamond',
  tester_heading: 'Upload a photo — test your diamond now',
  why_heading: 'The cheap pen lies. We don’t.',
  services_heading: 'Pick your level of certainty',
  faq_heading: 'Questions, answered',
}

const FIELDS: {
  key: keyof HomepageContent
  label: string
  help: string
  multiline?: boolean
  rows?: number
}[] = [
  {
    key: 'hero_eyebrow',
    label: 'Hero eyebrow (small pill above the title)',
    help: 'Short label shown above the H1. Leave blank to fall back to the default.',
  },
  {
    key: 'hero_title',
    label: 'Hero title (H1)',
    help: 'The headline at the very top of the homepage. Under ~60 characters reads best.',
    multiline: true,
    rows: 2,
  },
  {
    key: 'hero_subtitle',
    label: 'Hero subtitle',
    help: 'One to three sentences under the headline.',
    multiline: true,
    rows: 4,
  },
  {
    key: 'cta_label',
    label: 'Primary CTA button label',
    help: 'Text on the main hero call-to-action button.',
  },
]

const SECTION_FIELDS: { key: keyof HomepageContent; label: string; help: string }[] = [
  {
    key: 'tester_heading',
    label: 'Tester section heading',
    help: 'Heading above the instant photo tester.',
  },
  {
    key: 'why_heading',
    label: 'Why-us section heading',
    help: 'Heading for the differentiators section.',
  },
  {
    key: 'services_heading',
    label: 'Services section heading',
    help: 'Heading above the verification tiers.',
  },
  {
    key: 'faq_heading',
    label: 'FAQ section heading',
    help: 'Heading above the frequently asked questions.',
  },
]

export function HomepageEditor() {
  const [form, setForm] = useState<HomepageContent>(DEFAULTS)
  const [original, setOriginal] = useState<HomepageContent>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch('/api/admin/settings?key=homepage', { cache: 'no-store' })
        const json = await res.json().catch(() => ({}))
        if (!active) return
        const value = (json?.value ?? {}) as Partial<HomepageContent>
        const merged = { ...DEFAULTS, ...value }
        setForm(merged)
        setOriginal(merged)
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

  function set<K extends keyof HomepageContent>(key: K, value: HomepageContent[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const dirty = JSON.stringify(form) !== JSON.stringify(original)

  async function save() {
    setSaving(true)
    const tId = toast.loading('Saving homepage…')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'homepage', value: form }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || json.error) {
        toast.error(json.error || 'Could not save the homepage.', { id: tId })
        return
      }
      setOriginal(form)
      setSavedAt(Date.now())
      setTimeout(() => setSavedAt(null), 3000)
      toast.success('Homepage saved.', { id: tId })
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
      {/* Hero card */}
      <div className="card-luxe rounded-2xl p-6 sm:p-7">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-platinum">
              <Sparkles className="h-5 w-5 text-brilliant-cyan" /> Hero section
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The headline and intro at the very top of the homepage.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <a href="/" target="_blank" rel="noreferrer">
              <Eye className="h-4 w-4" /> Preview live
            </a>
          </Button>
        </div>

        <div className="space-y-5">
          {FIELDS.map((f) => (
            <div key={f.key} className="space-y-2">
              <Label htmlFor={f.key}>{f.label}</Label>
              {f.multiline ? (
                <Textarea
                  id={f.key}
                  value={form[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                  rows={f.rows ?? 3}
                  placeholder={DEFAULTS[f.key]}
                />
              ) : (
                <Input
                  id={f.key}
                  value={form[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={DEFAULTS[f.key]}
                />
              )}
              <p className="text-xs text-muted-foreground">{f.help}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section headings card */}
      <div className="card-luxe rounded-2xl p-6 sm:p-7">
        <h2 className="font-display text-lg font-semibold text-platinum">Section headings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The headlines for the main blocks further down the homepage.
        </p>
        <Separator className="my-5" />
        <div className="grid gap-5 sm:grid-cols-2">
          {SECTION_FIELDS.map((f) => (
            <div key={f.key} className="space-y-2">
              <Label htmlFor={f.key}>{f.label}</Label>
              <Input
                id={f.key}
                value={form[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
                placeholder={DEFAULTS[f.key]}
              />
              <p className="text-xs text-muted-foreground">{f.help}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Save bar */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button
          variant="ghost"
          onClick={() => setForm(DEFAULTS)}
          disabled={saving || JSON.stringify(form) === JSON.stringify(DEFAULTS)}
        >
          <RotateCcw className="h-4 w-4" /> Reset to defaults
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
              <Save className="h-4 w-4" /> Save homepage
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
