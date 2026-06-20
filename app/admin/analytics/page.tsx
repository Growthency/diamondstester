import type { Metadata } from 'next'
import { createAdminClient, hasSupabaseConfig } from '@/lib/supabase/server'
import { AnalyticsView, type AnalyticsData } from './AnalyticsView'

export const metadata: Metadata = {
  title: 'Analytics · Diamonds Tester Admin',
  description: 'Traffic overview and page view insights.',
}

export const dynamic = 'force-dynamic'

interface ViewRow {
  path: string
  created_at: string
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function dayKey(d: Date) {
  return startOfDay(d).toISOString().slice(0, 10)
}

async function getAnalytics(): Promise<AnalyticsData | null> {
  if (!hasSupabaseConfig()) return null

  try {
    const supabase = createAdminClient()
    // pull the last ~90 days of views; enough for totals + 14-day chart + top pages
    const since = new Date()
    since.setDate(since.getDate() - 90)

    const { data, error } = await supabase
      .from('page_views')
      .select('path, created_at')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[admin/analytics] query failed:', error.message)
      return { total: 0, last7: 0, last30: 0, daily: emptyDaily(), topPages: [] }
    }

    const rows = (data ?? []) as ViewRow[]
    const now = Date.now()
    const ms7 = 7 * 24 * 60 * 60 * 1000
    const ms30 = 30 * 24 * 60 * 60 * 1000

    let last7 = 0
    let last30 = 0
    const pathCounts = new Map<string, number>()
    const dayCounts = new Map<string, number>()

    for (const r of rows) {
      const t = new Date(r.created_at).getTime()
      const age = now - t
      if (age <= ms7) last7++
      if (age <= ms30) last30++
      pathCounts.set(r.path, (pathCounts.get(r.path) ?? 0) + 1)
      const key = dayKey(new Date(r.created_at))
      dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1)
    }

    // build 14-day series (oldest → newest)
    const daily: { date: string; label: string; count: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = dayKey(d)
      daily.push({
        date: key,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: dayCounts.get(key) ?? 0,
      })
    }

    const topPages = Array.from(pathCounts.entries())
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return { total: rows.length, last7, last30, daily, topPages }
  } catch (err) {
    console.error('[admin/analytics] unexpected error:', err)
    return { total: 0, last7: 0, last30: 0, daily: emptyDaily(), topPages: [] }
  }
}

function emptyDaily() {
  const daily: { date: string; label: string; count: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    daily.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: 0,
    })
  }
  return daily
}

export default async function AnalyticsPage() {
  const data = await getAnalytics()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-platinum">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Traffic overview based on recorded page views.
        </p>
      </div>
      <AnalyticsView data={data} />
    </div>
  )
}
