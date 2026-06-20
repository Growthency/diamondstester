import type { Metadata } from 'next'
import { CustomCssEditor } from './CustomCssEditor'

export const metadata: Metadata = {
  title: 'Custom CSS — Diamonds Tester',
  robots: { index: false, follow: false },
}

export default function CustomCssPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Customize</p>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-platinum">
          Custom CSS
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Sitewide CSS injected into every page&apos;s{' '}
          <code className="rounded bg-ink-soft px-1.5 py-0.5 text-xs text-platinum-muted">&lt;head&gt;</code>.
          Loaded after the global stylesheet, so your rules win by source order.
        </p>
      </div>
      <CustomCssEditor />
    </div>
  )
}
