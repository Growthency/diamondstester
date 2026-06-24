export const runtime = 'edge'
import type { Metadata } from 'next'
import { createAdminClient, hasSupabaseConfig } from '@/lib/supabase/server'
import type { AdminPage } from './types'
import { PagesManager } from './PagesManager'

export const metadata: Metadata = {
  title: 'Pages — Diamonds Tester',
  robots: { index: false, follow: false },
}

async function loadInitialPages(): Promise<{ pages: AdminPage[]; configured: boolean }> {
  const configured = hasSupabaseConfig()
  if (!configured) return { pages: [], configured }

  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('pages')
      .select('*')
      .order('updated_at', { ascending: false })
    return { pages: (data as AdminPage[] | null) ?? [], configured }
  } catch {
    return { pages: [], configured }
  }
}

export default async function AdminPagesPage() {
  const { pages, configured } = await loadInitialPages()
  return <PagesManager initialPages={pages} configured={configured} />
}
