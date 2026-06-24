export const runtime = 'edge'
import type { Metadata } from 'next'
import { RankTrackerView } from './RankTrackerView'

export const metadata: Metadata = {
  title: 'Rank Tracker — Diamonds Tester',
  description: 'Track keyword positions and movement for your target search terms.',
  robots: { index: false, follow: false },
}

export default function RankTrackerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-platinum">
          Rank Tracker
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor your search rankings for target keywords. Positions are entered manually so
          you stay in control — log them after each Search Console or SERP check.
        </p>
      </div>
      <RankTrackerView />
    </div>
  )
}
