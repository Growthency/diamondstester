export const runtime = 'edge'
import type { Metadata } from 'next'
import { site } from '@/lib/site'
import { MenusEditor } from './MenusEditor'

export const metadata: Metadata = {
  title: 'Menus — Diamonds Tester',
  robots: { index: false, follow: false },
}

export default function MenusAdminPage() {
  // Seed the editor from the live nav so it never starts empty; the client
  // island replaces these with saved values when the "menus" setting exists.
  const seed = site.nav.map((n) => ({ label: n.label, href: n.href }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-platinum">Menus</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the header navigation links shown across the site.
        </p>
      </div>
      <MenusEditor seed={seed} />
    </div>
  )
}
