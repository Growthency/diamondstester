import type { Metadata } from 'next'
import { VaultManager } from './VaultManager'

export const metadata: Metadata = {
  title: 'Vault · CaratIQ Admin',
  description: 'Securely store and manage credentials, encrypted at rest.',
}

export default function VaultPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-platinum">
          Secure Vault
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Store credentials with AES-256-GCM encryption at rest.
        </p>
      </div>
      <VaultManager />
    </div>
  )
}
