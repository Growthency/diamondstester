import type { Metadata } from 'next'
import { TestRequestsTable } from './TestRequestsTable'

export const metadata: Metadata = {
  title: 'Test Requests · Diamonds Tester Admin',
  description: 'Review and process diamond verification requests.',
}

export default function TestRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-platinum">
          Test Requests
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Diamond verification and testing requests from clients.
        </p>
      </div>
      <TestRequestsTable />
    </div>
  )
}
