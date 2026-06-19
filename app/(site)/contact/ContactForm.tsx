'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

type Status = 'idle' | 'submitting' | 'success'

const SUBJECTS = [
  'Photo verification',
  'Lab certification',
  'Mail-in testing',
  'Insurance & appraisal',
  'Something else',
] as const

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'submitting') return

    const form = e.currentTarget
    const data = new FormData(form)
    const payload = {
      name: String(data.get('name') || '').trim(),
      email: String(data.get('email') || '').trim(),
      phone: String(data.get('phone') || '').trim(),
      subject: String(data.get('subject') || '').trim(),
      message: String(data.get('message') || '').trim(),
    }

    if (!payload.name || !payload.email || !payload.subject || payload.message.length < 10) {
      toast.error('Please fill in your name, email, subject and a message (10+ characters).')
      return
    }

    setStatus('submitting')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || json?.ok === false) {
        throw new Error(json?.error || 'Something went wrong.')
      }
      setStatus('success')
      toast.success('Message sent — we’ll reply within one business day.')
      form.reset()
    } catch (err) {
      setStatus('idle')
      toast.error(err instanceof Error ? err.message : 'Could not send your message. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-6 py-12 text-center"
      >
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-400">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="mt-5 font-display text-xl font-semibold text-platinum">Message received</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Thanks for reaching out. A member of our gemology team will get back to you within one
          business day. For anything urgent, message us on WhatsApp.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setStatus('idle')}>
          Send another message
        </Button>
      </motion.div>
    )
  }

  const submitting = status === 'submitting'

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" autoComplete="name" placeholder="Jordan Avery" className="mt-2" required />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            className="mt-2"
            required
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+1 (555) 000-0000"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="subject">Subject *</Label>
          <select
            id="subject"
            name="subject"
            required
            defaultValue=""
            className="mt-2 flex h-11 w-full rounded-xl border border-input bg-secondary/30 px-4 py-2 text-sm text-foreground shadow-sm transition-colors focus-visible:border-brilliant-cyan/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <option value="" disabled>
              Choose a topic…
            </option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Tell us about your stone, your timeline, or your question…"
          className="mt-2"
          required
        />
      </div>

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Sending…
          </>
        ) : (
          <>
            Send message <Send className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  )
}
