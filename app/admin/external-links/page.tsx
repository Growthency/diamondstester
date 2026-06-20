import type { Metadata } from 'next'
import { hasSupabaseConfig } from '@/lib/supabase/server'
import { ExternalLinksManager } from './ExternalLinksManager'

export const metadata: Metadata = {
  title: 'External Links — Diamonds Tester',
  robots: { index: false, follow: false },
}

export default function ExternalLinksPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Customize</p>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-platinum">
          External Links
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Manage partner and outbound links rendered in the footer, header, or sidebar. Control the
          rel attribute, display order, and visibility of each link.
        </p>
      </div>
      <ExternalLinksManager configured={hasSupabaseConfig()} />
    </div>
  )
}
