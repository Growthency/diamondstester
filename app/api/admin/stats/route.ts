import { NextRequest, NextResponse } from 'next/server'
import { readSession } from '@/lib/auth/session'
import { createAdminClient, hasSupabaseConfig } from '@/lib/supabase/server'
import { getGoogleDashboard, isGoogleConfigured } from '@/lib/google-analytics'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

function rangeFor(period: string): { startDate: string; endDate: string; days: number } {
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  let end = new Date()
  let start = new Date(end)

  switch (period) {
    case 'today':
      break
    case '7d':
      start.setDate(end.getDate() - 6)
      break
    case 'this-month':
      start = new Date(end.getFullYear(), end.getMonth(), 1)
      break
    case 'last-month':
      start = new Date(end.getFullYear(), end.getMonth() - 1, 1)
      end = new Date(end.getFullYear(), end.getMonth(), 0)
      break
    case '365d':
      start.setDate(end.getDate() - 364)
      break
    case 'lifetime':
      start = new Date('2020-01-01')
      break
    case '30d':
    default:
      start.setDate(end.getDate() - 29)
  }

  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1)
  return { startDate: fmt(start), endDate: fmt(end), days }
}

export async function GET(request: NextRequest) {
  if (!(await readSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const period = request.nextUrl.searchParams.get('period') || '30d'
  const { startDate, endDate, days } = rangeFor(period)

  // 1) Google Analytics + Search Console (real data when connected)
  const google = await getGoogleDashboard(startDate, endDate).catch(() => null)

  // 2) Our own page_views as a fallback / supplement
  let ownViews = 0
  let ownDaily: { date: string; users: number }[] = []
  let ownTopPages: { path: string; title: string; views: number }[] = []
  let totalUsers = 0
  let totalScans = 0

  if (hasSupabaseConfig()) {
    try {
      const supabase = createAdminClient()
      const sinceIso = new Date(Date.now() - days * 86400000).toISOString()

      const [{ data: views }, { count: usersCount }, { count: scansCount }] = await Promise.all([
        supabase.from('page_views').select('path, created_at').gte('created_at', sinceIso).limit(50000),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('analyses').select('id', { count: 'exact', head: true }),
      ])

      ownViews = views?.length ?? 0
      totalUsers = usersCount ?? 0
      totalScans = scansCount ?? 0

      const byDay = new Map<string, number>()
      const byPath = new Map<string, number>()
      for (const v of views ?? []) {
        const day = String(v.created_at).slice(0, 10)
        byDay.set(day, (byDay.get(day) ?? 0) + 1)
        byPath.set(v.path, (byPath.get(v.path) ?? 0) + 1)
      }
      ownDaily = Array.from(byDay.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([date, users]) => ({ date, users }))
      ownTopPages = Array.from(byPath.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 25)
        .map(([path, views]) => ({ path, title: path, views }))
    } catch {
      /* ignore */
    }
  }

  const configured = isGoogleConfigured()

  const payload = {
    period,
    range: { startDate, endDate },
    googleConnected: configured && !!google,
    searchConsoleConnected: !!google?.searchConsoleConnected,
    supabaseConnected: hasSupabaseConfig(),
    scannedAt: new Date().toISOString(),
    cards: {
      activeUsers: google?.activeUsers ?? totalUsers,
      sessions: google?.sessions ?? ownViews,
      pageViews: google?.pageViews ?? ownViews,
      newUsers: google?.newUsers ?? totalUsers,
      users7d: google?.users7d ?? 0,
      usersToday: google?.usersToday ?? 0,
      totalActiveUsers: google?.activeUsers ?? totalUsers,
      totalScans,
    },
    daily: google?.daily?.length ? google.daily : ownDaily,
    dailyClicks: google?.dailyClicks ?? [],
    topPages: google?.topPages?.length ? google.topPages : ownTopPages,
    topCountries: google?.topCountries ?? [],
    searchKeywords: google?.searchKeywords ?? [],
    searchPages: google?.searchPages ?? [],
  }

  return NextResponse.json(payload)
}
