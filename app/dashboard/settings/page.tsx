import type { Metadata } from 'next'
import { Settings2 } from 'lucide-react'
import { SettingsForm } from './SettingsForm'

export const metadata: Metadata = {
  title: 'Settings — Diamonds Tester',
  robots: { index: false, follow: false },
}

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <p className="eyebrow">
          <Settings2 className="h-3.5 w-3.5 text-brilliant-cyan" />
          Your vault
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
          Account <span className="text-gradient">settings</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your profile and how you appear across Diamonds Tester.
        </p>
      </header>

      <SettingsForm />
    </div>
  )
}
