import type { Metadata } from 'next'
import { DashboardView } from './DashboardView'

export const metadata: Metadata = {
  title: 'Dashboard — Diamonds Tester',
  robots: { index: false, follow: false },
}

export default function AdminDashboardPage() {
  return <DashboardView />
}
