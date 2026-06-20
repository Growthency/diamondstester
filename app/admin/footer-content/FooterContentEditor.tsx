'use client'

import { useEffect, useState } from 'react'
import { Check, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const SETTINGS_KEY = 'footer'

interface FooterData {
  tagline: string
  about: string
  contact_email: string
  contact_phone: string
  contact_address: string
  instagram: string
  facebook: string
  x: string
  linkedin: string
  youtube: string
}

const EMPTY: FooterData = {
  tagline: '',
  about: '',
  contact_email: '',
  contact_phone: '',
  contact_address: '',
  instagram: '',
  facebook: '',
  x: '',
  linkedin: '',
  youtube: '',
}

const SOCIALS: { key: keyof FooterData; label: string; placeholder: string }[] = [
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/diamondstester' },
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/diamondstester' },
  { key: 'x', label: 'X (Twitter)', placeholder: 'https://x.com/diamondstester' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/diamondstester' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@diamondstester' },
]

export function FooterContentEditor() {
  const [data, setData] = useState<FooterData>({ ...EMPTY })
  const [original, setOriginal] = useState<FooterData>({ ...EMPTY })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch(`/api/admin/settings?key=${SETTINGS_KEY}`, {
          cache: 'no-store',
        })
        const json = await res.json().catch(() => ({ value: {} }))
        const v = (json?.value ?? {}) as Partial<FooterData>
        const next = { ...EMPTY, ...v }
        if (active) {
          setData(next)
          setOriginal(next)
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

  const dirty = JSON.stringify(data) !== JSON.stringify(original)

  function update(key: keyof FooterData, value: string) {
    setData((d) => ({ ...d, [key]: value }))
  }

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: SETTINGS_KEY, value: data }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || json?.error) {
        toast.error(json?.error || 'Could not save footer content.')
        return
      }
      setOriginal(data)
      toast.success('Footer content saved.')
    } catch {
      toast.error('Could not save footer content.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading footer content…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* About */}
      <Card className="space-y-4 p-6">
        <h2 className="font-display text-lg font-semibold text-platinum">About &amp; tagline</h2>
        <div className="space-y-1.5">
          <Label htmlFor="footer-tagline">Tagline</Label>
          <Input
            id="footer-tagline"
            value={data.tagline}
            onChange={(e) => update('tagline', e.target.value)}
            placeholder="Independent diamond verification you can trust"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="footer-about">About text</Label>
          <Textarea
            id="footer-about"
            rows={3}
            value={data.about}
            onChange={(e) => update('about', e.target.value)}
            placeholder="A short paragraph describing Diamonds Tester for the footer."
          />
        </div>
      </Card>

      {/* Contact */}
      <Card className="space-y-4 p-6">
        <h2 className="font-display text-lg font-semibold text-platinum">Contact</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="footer-email">Email</Label>
            <Input
              id="footer-email"
              type="email"
              value={data.contact_email}
              onChange={(e) => update('contact_email', e.target.value)}
              placeholder="hello@diamondstester.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="footer-phone">Phone</Label>
            <Input
              id="footer-phone"
              value={data.contact_phone}
              onChange={(e) => update('contact_phone', e.target.value)}
              placeholder="+1 555 0100"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="footer-address">Address</Label>
            <Input
              id="footer-address"
              value={data.contact_address}
              onChange={(e) => update('contact_address', e.target.value)}
              placeholder="580 Fifth Avenue, New York, NY 10036"
            />
          </div>
        </div>
      </Card>

      {/* Social */}
      <Card className="space-y-4 p-6">
        <h2 className="font-display text-lg font-semibold text-platinum">Social links</h2>
        <p className="text-sm text-muted-foreground">
          Leave a field blank to hide that icon in the footer.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {SOCIALS.map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={`footer-${key}`}>{label}</Label>
              <Input
                id={`footer-${key}`}
                value={data[key]}
                onChange={(e) => update(key, e.target.value)}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <p className="mr-auto text-xs text-muted-foreground">
          Stored under the <code className="rounded bg-ink-soft px-1 py-0.5">footer</code> setting.
        </p>
        <Button type="button" onClick={save} disabled={!dirty || saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : dirty ? (
            <Save className="h-4 w-4" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          {dirty ? 'Save footer' : 'Saved'}
        </Button>
      </div>
    </div>
  )
}
