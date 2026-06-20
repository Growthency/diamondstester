import type { Metadata } from 'next'
import { MessagesTable } from './MessagesTable'

export const metadata: Metadata = {
  title: 'Messages · Diamonds Tester Admin',
  description: 'Review and manage contact form submissions.',
}

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-platinum">
          Messages
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Contact form submissions from your visitors.
        </p>
      </div>
      <MessagesTable />
    </div>
  )
}
