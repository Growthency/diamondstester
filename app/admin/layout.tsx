import type { Metadata } from 'next'
import { getOptionalSession } from '@/lib/auth/dal'
import { AdminShell } from './AdminShell'
import { LoginScreen } from './LoginScreen'

export const metadata: Metadata = {
  title: 'Admin — CaratIQ',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getOptionalSession()

  if (!session) {
    return <LoginScreen />
  }

  return <AdminShell userEmail={session.email}>{children}</AdminShell>
}
