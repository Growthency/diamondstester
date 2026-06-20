import type { Metadata } from 'next'
import { HomepageEditor } from './HomepageEditor'

export const metadata: Metadata = {
  title: 'Homepage — Diamonds Tester',
  robots: { index: false, follow: false },
}

export default function HomepageAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-platinum">
          Homepage
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit the hero and section headings shown on the public homepage. Saved values override the
          built-in defaults.
        </p>
      </div>
      <HomepageEditor />
    </div>
  )
}
