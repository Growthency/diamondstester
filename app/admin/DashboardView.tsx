'use client'
import { useCallback, useEffect, useState } from 'react'
import {
  Users, UserPlus, Activity, Eye, MousePointerClick, Globe2, Search,
  RefreshCw, TrendingUp, Loader2, FileText, BarChart3, CheckCircle2, XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Stats {
  period: string
  range: { startDate: string; endDate: string }
  googleConnected: boolean
  searchConsoleConnected: boolean
  supabaseConnected: boolean
  scannedAt: string
  cards: {
    activeUsers: number; sessions: number; pageViews: number; newUsers: number
    users7d: number; usersToday: number; totalActiveUsers: number; totalScans: number
  }
  daily: { date: string; users: number }[]
  topPages: { path: string; title: string; views: number }[]
  topCountries: { country: string; users: number }[]
  searchKeywords: { query: string; clicks: number; impressions: number; ctr: number; position: number }[]
  searchPages: { page: string; clicks: number; impressions: number; ctr: number; position: number }[]
}

const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: 'Last 7 Days' },
  { key: '30d', label: 'Last 30 Days' },
  { key: '90d', label: 'Last 90 Days' },
]

const nf = (n: number) => new Intl.NumberFormat('en-US').format(Math.round(n || 0))

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <div className="card-luxe rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-brilliant-cyan" />
      </div>
      <p className="mt-3 font-display text-3xl font-bold text-platinum">{nf(value)}</p>
    </div>
  )
}

export function DashboardView() {
  const [period, setPeriod] = useState('30d')
  const [data, setData] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (p: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/stats?period=${p}`, { cache: 'no-store' })
      const json = await res.json()
      if (res.ok) setData(json)
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(period) }, [period, load])

  const maxDaily = Math.max(1, ...(data?.daily ?? []).map((d) => d.users))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Real-time data from Google Analytics &amp; Search Console</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full border border-border bg-secondary/30 p-1">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  period === p.key ? 'bg-brilliant text-white' : 'text-platinum-muted hover:text-platinum',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => load(period)}
            className="grid h-9 w-9 place-items-center rounded-full border border-border text-platinum-muted transition-colors hover:text-brilliant-cyan"
            aria-label="Refresh"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Connection status */}
      <div className="flex flex-wrap gap-2 text-xs">
        <ConnBadge ok={!!data?.googleConnected} label="Google Analytics" />
        <ConnBadge ok={!!data?.searchConsoleConnected} label="Search Console" />
        <ConnBadge ok={!!data?.supabaseConnected} label="Supabase" />
      </div>

      {loading && !data ? (
        <div className="grid h-64 place-items-center"><Loader2 className="h-8 w-8 animate-spin text-brilliant-cyan" /></div>
      ) : data ? (
        <>
          {/* Primary stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label={`Users (${period})`} value={data.cards.activeUsers} icon={Users} />
            <StatCard label="Users (7d)" value={data.cards.users7d} icon={Activity} />
            <StatCard label="Today" value={data.cards.usersToday} icon={UserPlus} />
            <StatCard label={`New Users (${period})`} value={data.cards.newUsers} icon={TrendingUp} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label={`Sessions (${period})`} value={data.cards.sessions} icon={MousePointerClick} />
            <StatCard label={`Page Views (${period})`} value={data.cards.pageViews} icon={Eye} />
            <StatCard label="Total Active Users" value={data.cards.totalActiveUsers} icon={Globe2} />
            <StatCard label="Diamond Scans" value={data.cards.totalScans} icon={BarChart3} />
          </div>

          {/* Daily active users chart */}
          <div className="card-luxe rounded-2xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display font-semibold text-platinum">Daily Active Users — {PERIODS.find((p) => p.key === period)?.label}</p>
              <span className="text-xs text-muted-foreground">{data.googleConnected ? 'from Google Analytics' : 'from page views'}</span>
            </div>
            {data.daily.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No activity yet for this range.</p>
            ) : (
              <div className="flex h-48 items-end gap-1">
                {data.daily.map((d, i) => (
                  <div key={i} className="group relative flex-1" title={`${d.date}: ${d.users}`}>
                    <div
                      className="w-full rounded-t bg-brilliant transition-opacity hover:opacity-80"
                      style={{ height: `${Math.max(2, (d.users / maxDaily) * 100)}%` }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top pages + countries */}
          <div className="grid gap-6 lg:grid-cols-2">
            <RankList
              title="Top 25 Pages"
              note={data.googleConnected ? 'by pageviews' : 'by views'}
              icon={FileText}
              rows={data.topPages.map((p) => ({ label: p.title || p.path, sub: p.path, value: p.views }))}
              max={Math.max(1, ...data.topPages.map((p) => p.views))}
              empty="No page data yet."
            />
            <RankList
              title="Top 25 Countries"
              note={data.googleConnected ? 'Google Analytics' : 'Connect GA for country data'}
              icon={Globe2}
              rows={data.topCountries.map((c) => ({ label: c.country, value: c.users }))}
              max={Math.max(1, ...data.topCountries.map((c) => c.users))}
              empty="Connect Google Analytics to see countries."
            />
          </div>

          {/* Search keywords + pages */}
          <div className="grid gap-6 lg:grid-cols-2">
            <SearchTable
              title="Top 25 Search Keywords"
              note="Google Search Console"
              first="Keyword"
              rows={data.searchKeywords.map((k) => ({ label: k.query, clicks: k.clicks, impressions: k.impressions, ctr: k.ctr, position: k.position }))}
              empty="Connect Search Console to see keywords."
            />
            <SearchTable
              title="Top 25 Search Pages"
              note="by clicks"
              first="Page"
              rows={data.searchPages.map((k) => ({ label: k.page, clicks: k.clicks, impressions: k.impressions, ctr: k.ctr, position: k.position }))}
              empty="Connect Search Console to see search pages."
            />
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Last updated: {new Date(data.scannedAt).toLocaleString()}
          </p>
        </>
      ) : null}
    </div>
  )
}

function ConnBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1', ok ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-border bg-secondary/30 text-muted-foreground')}>
      {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />} {label} {ok ? 'connected' : 'not connected'}
    </span>
  )
}

function RankList({ title, note, icon: Icon, rows, max, empty }: { title: string; note: string; icon: any; rows: { label: string; sub?: string; value: number }[]; max: number; empty: string }) {
  return (
    <div className="card-luxe rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="flex items-center gap-2 font-display font-semibold text-platinum"><Icon className="h-4 w-4 text-brilliant-cyan" /> {title}</p>
        <span className="text-xs text-muted-foreground">{note}</span>
      </div>
      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-2.5">
          {rows.slice(0, 25).map((r, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="w-6 shrink-0 text-xs font-semibold text-muted-foreground">#{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-platinum">{r.label}</p>
                {r.sub && <p className="truncate text-xs text-muted-foreground">{r.sub}</p>}
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-brilliant" style={{ width: `${(r.value / max) * 100}%` }} />
                </div>
              </div>
              <span className="shrink-0 text-sm font-semibold text-brilliant-cyan">{nf(r.value)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SearchTable({ title, note, first, rows, empty }: { title: string; note: string; first: string; rows: { label: string; clicks: number; impressions: number; ctr: number; position: number }[]; empty: string }) {
  return (
    <div className="card-luxe rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="flex items-center gap-2 font-display font-semibold text-platinum"><Search className="h-4 w-4 text-brilliant-cyan" /> {title}</p>
        <span className="text-xs text-muted-foreground">{note}</span>
      </div>
      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-2 font-medium">{first}</th>
                <th className="pb-2 text-right font-medium">Clicks</th>
                <th className="pb-2 text-right font-medium">Impr.</th>
                <th className="pb-2 text-right font-medium">CTR</th>
                <th className="pb-2 text-right font-medium">Pos.</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 25).map((r, i) => (
                <tr key={i} className="border-t border-border/60">
                  <td className="max-w-[180px] truncate py-2 text-platinum">{r.label}</td>
                  <td className="py-2 text-right text-platinum">{nf(r.clicks)}</td>
                  <td className="py-2 text-right text-muted-foreground">{nf(r.impressions)}</td>
                  <td className="py-2 text-right text-brilliant-cyan">{r.ctr}%</td>
                  <td className="py-2 text-right text-muted-foreground">{r.position}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
