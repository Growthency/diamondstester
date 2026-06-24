export const runtime = 'edge'
import type { Metadata } from 'next'
import { SeoHealthView } from './SeoHealthView'

export const metadata: Metadata = {
  title: 'SEO Health — Diamonds Tester',
  description: 'Technical SEO audit across every public page of the site.',
  robots: { index: false, follow: false },
}

export default function SeoHealthPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-platinum">
          SEO Health
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A full technical SEO audit of every public page — meta tags, Open Graph, Twitter
          Cards, headings and technical signals.
        </p>
      </div>
      <SeoHealthView />
    </div>
  )
}
