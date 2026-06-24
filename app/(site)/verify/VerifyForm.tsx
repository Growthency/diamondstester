'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Upload, CheckCircle2, ArrowRight, X } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/Icon'
import { fileToWebp } from '@/lib/image/client-webp'

type Method = 'photo' | 'lab' | 'mail-in'

const methods: {
  value: Method
  label: string
  icon: string
  blurb: string
}[] = [
  { value: 'photo', label: 'Photo', icon: 'Camera', blurb: 'Upload photos for a free, instant first-pass verdict.' },
  { value: 'mail-in', label: 'Mail-in', icon: 'Package', blurb: 'Send your stone in an insured mailer for hands-on testing.' },
  { value: 'lab', label: 'Lab Cert', icon: 'BadgeCheck', blurb: 'Full instrument testing and a numbered certificate.' },
]

function isMethod(v: string | undefined): v is Method {
  return v === 'photo' || v === 'lab' || v === 'mail-in'
}

export function VerifyForm({ defaultMethod }: { defaultMethod?: string }) {
  const [method, setMethod] = useState<Method>(
    isMethod(defaultMethod) ? defaultMethod : 'photo',
  )
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    if (f && !f.type.startsWith('image/')) {
      toast.error('Please choose an image file.')
      e.target.value = ''
      return
    }
    setFile(f)
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formEl = e.currentTarget
    const data = new FormData(formEl)
    data.set('method', method)

    if (method === 'photo' && !file) {
      toast.error('Add a photo of your stone for a photo verification.')
      return
    }

    if (file) {
      const webp = await fileToWebp(file)
      data.set('image', webp)
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/test-request', {
        method: 'POST',
        body: data,
      })
      if (!res.ok) throw new Error(`Request failed (${res.status})`)
      toast.success('Request received. A gemologist will be in touch shortly.')
      setDone(true)
      formEl.reset()
      setFile(null)
    } catch {
      toast.error('Something went wrong. Please try again or message us on WhatsApp.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="card-luxe rounded-3xl p-8 text-center sm:p-12">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brilliant-soft">
          <CheckCircle2 className="h-8 w-8 text-brilliant-cyan" />
        </span>
        <h2 className="mt-6 font-display text-3xl font-bold">
          You’re <span className="text-gradient">all set</span>
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Your verification request is in. {method === 'photo'
            ? 'Your photo verdict is being prepared and will land in your inbox shortly.'
            : 'We’ll email you an insured shipping kit and next steps within one business day.'}
        </p>
        <Button className="mt-8" onClick={() => setDone(false)}>
          Submit another stone <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="card-luxe rounded-3xl p-6 sm:p-8">
      <Tabs value={method} onValueChange={(v) => setMethod(v as Method)}>
        <div className="flex justify-center">
          <TabsList className="h-auto flex-wrap">
            {methods.map((m) => (
              <TabsTrigger key={m.value} value={m.value} className="gap-2">
                <Icon name={m.icon} className="h-4 w-4" /> {m.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {methods.map((m) => (
          <TabsContent key={m.value} value={m.value} className="mt-5 text-center">
            <p className="text-sm text-muted-foreground">{m.blurb}</p>
          </TabsContent>
        ))}
      </Tabs>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" required autoComplete="name" placeholder="Jane Mercer" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" placeholder="jane@email.com" />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone <span className="text-muted-foreground">(optional)</span></Label>
            <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+1 555 012 3456" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="carat">Carat weight <span className="text-muted-foreground">(optional)</span></Label>
            <Input id="carat" name="carat" inputMode="decimal" placeholder="e.g. 1.05" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="details">Tell us about your stone</Label>
          <Textarea
            id="details"
            name="details"
            placeholder="Shape, setting, where it came from, any paperwork you have, and what you’d like to know."
          />
        </div>

        {method === 'photo' && (
          <div className="space-y-2">
            <Label htmlFor="image">Photo of your stone</Label>
            <label
              htmlFor="image"
              className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input bg-secondary/20 px-6 py-8 text-center transition-colors hover:border-brilliant-cyan/60 hover:bg-secondary/40"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brilliant-soft text-brilliant-cyan">
                <Upload className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-platinum">
                {file ? file.name : 'Click to upload a photo'}
              </span>
              <span className="text-xs text-muted-foreground">
                Any image format — we convert it to optimized WebP automatically.
              </span>
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={onFileChange}
            />
            {file && (
              <button
                type="button"
                onClick={() => setFile(null)}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-brilliant-cyan"
              >
                <X className="h-3.5 w-3.5" /> Remove photo
              </button>
            )}
          </div>
        )}

        <Button type="submit" size="lg" className="sheen w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
            </>
          ) : (
            <>
              {method === 'photo' ? 'Get my free verdict' : 'Request testing'}{' '}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          By submitting you agree we may contact you about your verification. Your photos and stones
          are never sold or shared.
        </p>
      </form>
    </div>
  )
}
