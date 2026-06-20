import type { Metadata } from 'next'
import { IndexingView } from './IndexingView'

export const metadata: Metadata = {
  title: 'Indexing Report — Diamonds Tester',
  description: 'Indexability status for every public route on the site.',
  robots: { index: false, follow: false },
}

export default function IndexingReportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-platinum">
          Indexing Report
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Check whether each public route is indexable — no noindex directive and a
          self-referential canonical — so search engines can list it.
        </p>
      </div>
      <IndexingView />
    </div>
  )
}
