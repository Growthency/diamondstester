import type { Metadata } from 'next'
import { SettingsForm } from './SettingsForm'

export const metadata: Metadata = {
  title: 'Settings · CaratIQ Admin',
  description: 'Manage site-wide settings, footer, scripts, and theme.',
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-platinum">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure general info, footer, header scripts, and brand theme.
        </p>
      </div>
      <SettingsForm />
    </div>
  )
}
