'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Dict = Record<string, string>

const SECTION_KEYS = ['general', 'footer', 'header_scripts', 'theme'] as const
type SectionKey = (typeof SECTION_KEYS)[number]

const DEFAULT_THEME = {
  cyan: '#22d3ee',
  indigo: '#6366f1',
  violet: '#8b5cf6',
}

export function SettingsForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<SectionKey | null>(null)

  const [general, setGeneral] = useState<Dict>({
    tagline: '',
    contact_email: '',
    phone: '',
    whatsapp: '',
    address: '',
  })
  const [footer, setFooter] = useState<Dict>({
    text: '',
    column1: '',
    column2: '',
  })
  const [headerScripts, setHeaderScripts] = useState('')
  const [theme, setTheme] = useState<Dict>({ ...DEFAULT_THEME })

  useEffect(() => {
    ;(async () => {
      try {
        const results = await Promise.all(
          SECTION_KEYS.map(async (key) => {
            const res = await fetch(
              `/api/admin/settings?key=${encodeURIComponent(key)}`,
              { cache: 'no-store' },
            )
            const data = await res.json().catch(() => ({ value: {} }))
            return [key, data?.value ?? {}] as const
          }),
        )
        for (const [key, value] of results) {
          if (key === 'general') {
            setGeneral((g) => ({ ...g, ...(value as Dict) }))
          } else if (key === 'footer') {
            setFooter((f) => ({ ...f, ...(value as Dict) }))
          } else if (key === 'header_scripts') {
            const v = value as { scripts?: string }
            setHeaderScripts(typeof v?.scripts === 'string' ? v.scripts : '')
          } else if (key === 'theme') {
            setTheme((t) => ({ ...t, ...(value as Dict) }))
          }
        }
      } catch {
        // keep defaults
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const save = useCallback(async (key: SectionKey, value: unknown) => {
    setSaving(key)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      })
      const data = await res.json()
      if (!res.ok || data?.error) {
        toast.error(data?.error || 'Could not save settings.')
        return
      }
      toast.success('Settings saved.')
    } catch {
      toast.error('Could not save settings.')
    } finally {
      setSaving(null)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading settings…
      </div>
    )
  }

  return (
    <Tabs defaultValue="general">
      <TabsList className="flex-wrap">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="footer">Footer</TabsTrigger>
        <TabsTrigger value="scripts">Header Scripts</TabsTrigger>
        <TabsTrigger value="theme">Theme</TabsTrigger>
      </TabsList>

      {/* GENERAL */}
      <TabsContent value="general">
        <Card className="space-y-4 p-6">
          <div className="space-y-1.5">
            <Label htmlFor="s-tagline">Site tagline</Label>
            <Input
              id="s-tagline"
              value={general.tagline}
              onChange={(e) => setGeneral((g) => ({ ...g, tagline: e.target.value }))}
              placeholder="Trusted diamond verification"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="s-email">Contact email</Label>
              <Input
                id="s-email"
                type="email"
                value={general.contact_email}
                onChange={(e) =>
                  setGeneral((g) => ({ ...g, contact_email: e.target.value }))
                }
                placeholder="hello@caratiq.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-phone">Phone</Label>
              <Input
                id="s-phone"
                value={general.phone}
                onChange={(e) => setGeneral((g) => ({ ...g, phone: e.target.value }))}
                placeholder="+1 555 0100"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-whatsapp">WhatsApp number</Label>
              <Input
                id="s-whatsapp"
                value={general.whatsapp}
                onChange={(e) =>
                  setGeneral((g) => ({ ...g, whatsapp: e.target.value }))
                }
                placeholder="+1 555 0100"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-address">Address</Label>
              <Input
                id="s-address"
                value={general.address}
                onChange={(e) =>
                  setGeneral((g) => ({ ...g, address: e.target.value }))
                }
                placeholder="123 Gem St, NY"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => save('general', general)}
              disabled={saving === 'general'}
            >
              {saving === 'general' && <Loader2 className="h-4 w-4 animate-spin" />}
              Save general
            </Button>
          </div>
        </Card>
      </TabsContent>

      {/* FOOTER */}
      <TabsContent value="footer">
        <Card className="space-y-4 p-6">
          <div className="space-y-1.5">
            <Label htmlFor="f-text">Footer text</Label>
            <Textarea
              id="f-text"
              rows={3}
              value={footer.text}
              onChange={(e) => setFooter((f) => ({ ...f, text: e.target.value }))}
              placeholder="© CaratIQ. All rights reserved."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="f-col1">Column 1 (one link per line)</Label>
              <Textarea
                id="f-col1"
                rows={4}
                value={footer.column1}
                onChange={(e) =>
                  setFooter((f) => ({ ...f, column1: e.target.value }))
                }
                placeholder={'About\nServices\nContact'}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-col2">Column 2 (one link per line)</Label>
              <Textarea
                id="f-col2"
                rows={4}
                value={footer.column2}
                onChange={(e) =>
                  setFooter((f) => ({ ...f, column2: e.target.value }))
                }
                placeholder={'Privacy\nTerms\nFAQ'}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => save('footer', footer)}
              disabled={saving === 'footer'}
            >
              {saving === 'footer' && <Loader2 className="h-4 w-4 animate-spin" />}
              Save footer
            </Button>
          </div>
        </Card>
      </TabsContent>

      {/* HEADER SCRIPTS */}
      <TabsContent value="scripts">
        <Card className="space-y-4 p-6">
          <div className="space-y-1.5">
            <Label htmlFor="h-scripts">Custom &lt;head&gt; scripts</Label>
            <Textarea
              id="h-scripts"
              rows={10}
              value={headerScripts}
              onChange={(e) => setHeaderScripts(e.target.value)}
              placeholder="<!-- Analytics, verification tags, etc. -->"
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Injected into the site &lt;head&gt;. Use for analytics or verification
              tags. Stored for future use.
            </p>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => save('header_scripts', { scripts: headerScripts })}
              disabled={saving === 'header_scripts'}
            >
              {saving === 'header_scripts' && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Save scripts
            </Button>
          </div>
        </Card>
      </TabsContent>

      {/* THEME */}
      <TabsContent value="theme">
        <Card className="space-y-5 p-6">
          <div className="grid gap-5 sm:grid-cols-3">
            {(['cyan', 'indigo', 'violet'] as const).map((name) => (
              <div key={name} className="space-y-2">
                <Label htmlFor={`t-${name}`} className="capitalize">
                  {name}
                </Label>
                <div className="flex items-center gap-3">
                  <span
                    className="h-10 w-10 shrink-0 rounded-lg border border-border"
                    style={{ backgroundColor: theme[name] || '#000000' }}
                  />
                  <Input
                    id={`t-${name}`}
                    value={theme[name] ?? ''}
                    onChange={(e) =>
                      setTheme((t) => ({ ...t, [name]: e.target.value }))
                    }
                    placeholder="#22d3ee"
                    className="font-mono"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Live preview
            </p>
            <div
              className="flex h-20 items-center justify-center rounded-xl border border-border font-display text-lg font-semibold text-white"
              style={{
                backgroundImage: `linear-gradient(120deg, ${theme.cyan || '#22d3ee'}, ${theme.indigo || '#6366f1'}, ${theme.violet || '#8b5cf6'})`,
              }}
            >
              CaratIQ
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => save('theme', theme)}
              disabled={saving === 'theme'}
            >
              {saving === 'theme' && <Loader2 className="h-4 w-4 animate-spin" />}
              Save theme
            </Button>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
