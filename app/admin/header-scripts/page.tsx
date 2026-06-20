import type { Metadata } from 'next'
import { HeaderScriptsEditor } from './HeaderScriptsEditor'

export const metadata: Metadata = {
  title: 'Header Scripts — Diamonds Tester',
  robots: { index: false, follow: false },
}

export default function HeaderScriptsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Customize</p>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-platinum">
          Header Scripts
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Paste analytics, search-console verification meta, or other snippets to inject into the
          site&apos;s <code className="rounded bg-ink-soft px-1.5 py-0.5 text-xs text-platinum-muted">&lt;head&gt;</code>.
          Applied sitewide.
        </p>
      </div>
      <HeaderScriptsEditor />
    </div>
  )
}
