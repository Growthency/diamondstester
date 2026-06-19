'use client'

import { BarChart3, Eye, Calendar, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'

export interface AnalyticsData {
  total: number
  last7: number
  last30: number
  daily: { date: string; label: string; count: number }[]
  topPages: { path: string; count: number }[]
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Eye
  label: string
  value: number
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-brilliant-cyan" />
      </div>
      <p className="mt-2 font-display text-3xl font-semibold text-platinum">
        {value.toLocaleString()}
      </p>
    </Card>
  )
}

export function AnalyticsView({ data }: { data: AnalyticsData | null }) {
  if (!data) {
    return (
      <Card className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <BarChart3 className="h-10 w-10 text-muted-foreground" />
        <p className="font-medium text-platinum">Connect Supabase to view analytics</p>
        <p className="text-sm text-muted-foreground">
          Once configured, page view data will appear here.
        </p>
      </Card>
    )
  }

  const maxCount = Math.max(1, ...data.daily.map((d) => d.count))
  const hasData = data.total > 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={Eye} label="Total views (90d)" value={data.total} />
        <Stat icon={Calendar} label="Last 7 days" value={data.last7} />
        <Stat icon={TrendingUp} label="Last 30 days" value={data.last30} />
      </div>

      <Card className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-brilliant-cyan" />
          <h2 className="font-display text-lg font-semibold text-platinum">
            Daily views — last 14 days
          </h2>
        </div>

        {hasData ? (
          <div className="flex h-48 items-end justify-between gap-1.5 sm:gap-2">
            {data.daily.map((d) => {
              const pct = (d.count / maxCount) * 100
              return (
                <div
                  key={d.date}
                  className="group flex flex-1 flex-col items-center gap-2"
                >
                  <div className="relative flex h-40 w-full items-end">
                    <div
                      className="w-full rounded-t-md bg-brilliant transition-all duration-300 group-hover:opacity-80"
                      style={{ height: `${Math.max(pct, d.count > 0 ? 4 : 0)}%` }}
                      title={`${d.label}: ${d.count} view${d.count === 1 ? '' : 's'}`}
                    />
                    <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-medium text-platinum opacity-0 transition-opacity group-hover:opacity-100">
                      {d.count}
                    </span>
                  </div>
                  <span className="rotate-0 text-[10px] text-muted-foreground sm:text-xs">
                    {d.label}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
            <Eye className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No page views recorded yet.
            </p>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-platinum">
          Top pages
        </h2>
        {data.topPages.length > 0 ? (
          <ul className="space-y-2">
            {data.topPages.map((p) => {
              const pct = (p.count / data.topPages[0].count) * 100
              return (
                <li key={p.path} className="space-y-1">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate font-mono text-platinum" title={p.path}>
                      {p.path}
                    </span>
                    <span className="shrink-0 text-muted-foreground">
                      {p.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/50">
                    <div
                      className="h-full rounded-full bg-brilliant"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No page data yet.
          </p>
        )}
      </Card>
    </div>
  )
}
