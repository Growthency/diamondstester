import type { Metadata } from 'next'
import { ThemeColorsEditor } from './ThemeColorsEditor'

export const metadata: Metadata = {
  title: 'Theme Colors — Diamonds Tester',
  robots: { index: false, follow: false },
}

export default function ThemeColorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Customize</p>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-platinum">
          Theme Colors
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Set the three stops of the brand gradient used across buttons, accents, and highlights.
          Changes apply sitewide.
        </p>
      </div>
      <ThemeColorsEditor />
    </div>
  )
}
