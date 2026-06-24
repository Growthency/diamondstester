export const runtime = 'edge'
import type { Metadata } from 'next'
import { FooterContentEditor } from './FooterContentEditor'

export const metadata: Metadata = {
  title: 'Footer Content — Diamonds Tester',
  robots: { index: false, follow: false },
}

export default function FooterContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Customize</p>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-platinum">
          Footer Content
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Edit the footer tagline, contact details, and social links shown across the public site.
        </p>
      </div>
      <FooterContentEditor />
    </div>
  )
}
