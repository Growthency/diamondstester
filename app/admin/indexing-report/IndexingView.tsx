'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  CheckCircle2,
  Download,
  ExternalLink,
  FileSearch,
  Globe,
  Info,
  Map as MapIcon,
  RefreshCw,
  Search,
  Shield,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type IndexStatus = 'indexable' | 'blocked' | 'error'

interface IndexRow {
  path: string
  url: string
  status: IndexStatus
  httpStatus: number
  reason: string
  hasNoindex: boolean
  canonical: string | null
  inSitemap: boolean
}

interface Report {
  rows: IndexRow[]
  summary: {
    total: number
    indexable: number
    blocked: number
    errors: number
    inSitemap: number
  }
  scannedAt: string
}

function DonutChart({ indexable, total }: { indexable: number; total: number }) {
  const pct = total > 0 ? (indexable / total) * 100 : 0
  const r = 58
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="180" height="180" viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="14" opacity={0.6} />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="hsl(152 60% 50%)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-bold text-emerald-400">{pct.toFixed(0)}%</span>
        <span className="mt-0.5 text-xs text-muted-foreground">Indexable</span>
      </div>
    </div>
  )
}

const statusMeta: Record<IndexStatus, { label: string; tone: string; icon: typeof CheckCircle2 }> = {
  indexable: { label: 'Indexable', tone: 'bg-emerald-500/15 text-emerald-300', icon: CheckCircle2 },
  blocked: { label: 'Blocked', tone: 'bg-amber-500/15 text-amber-300', icon: XCircle },
  error: { label: 'Error', tone: 'bg-red-500/15 text-red-300', icon: XCircle },
}

export function IndexingView() {
  const [data, setData] = useState<Report | null>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  const runScan = useCallback(async () => {
    setScanning(true)
    setError('')
    const tId = toast.loading('Checking indexability…')
    try {
      const res = await fetch('/api/admin/indexing', { method: 'GET', cache: 'no-store' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json.error || 'Scan failed.')
        toast.error(json.error || 'Scan failed.', { id: tId })
        return
      }
      setData(json as Report)
      toast.success(`Checked ${json.summary.total} routes.`, { id: tId })
    } catch {
      setError('Network error — please try again.')
      toast.error('Network error — please try again.', { id: tId })
    } finally {
      setScanning(false)
    }
  }, [])

  const filtered = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    // Blocked/errors first so attention items float to the top.
    const order: Record<IndexStatus, number> = { error: 0, blocked: 1, indexable: 2 }
    const sorted = [...data.rows].sort((a, b) => order[a.status] - order[b.status])
    if (!q) return sorted
    return sorted.filter((r) => r.path.toLowerCase().includes(q))
  }, [data, query])

  const exportCSV = useCallback(() => {
    if (!data) return
    const rows: string[][] = [['Path', 'URL', 'Status', 'HTTP', 'Reason', 'Canonical', 'In Sitemap']]
    for (const r of data.rows) {
      rows.push([
        r.path,
        r.url,
        r.status,
        String(r.httpStatus),
        r.reason,
        r.canonical || '',
        r.inSitemap ? 'yes' : 'no',
      ])
    }
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `indexing-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [data])

  const statCards = data
    ? [
        { label: 'Total URLs', value: data.summary.total, icon: <FileSearch className="h-5 w-5 text-brilliant-cyan" />, ring: 'bg-brilliant-soft' },
        { label: 'Indexable', value: data.summary.indexable, icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />, ring: 'bg-emerald-500/15' },
        { label: 'Blocked', value: data.summary.blocked + data.summary.errors, icon: <XCircle className="h-5 w-5 text-amber-400" />, ring: 'bg-amber-500/15' },
        { label: 'In Sitemap', value: data.summary.inSitemap, icon: <MapIcon className="h-5 w-5 text-platinum-muted" />, ring: 'bg-secondary/60' },
      ]
    : []

  return (
    <div className="space-y-6">
      {/* GSC note */}
      <div className="flex items-start gap-3 rounded-2xl border border-border bg-secondary/30 px-4 py-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brilliant-cyan" />
        <p>
          This report reflects each page’s <span className="font-semibold text-platinum-muted">indexability</span>{' '}
          (noindex directives and canonicals) by fetching the live HTML. Confirming the{' '}
          <span className="font-semibold text-platinum-muted">actual Google index status</span> requires
          Google Search Console — a possible future integration.
        </p>
      </div>

      {/* Action bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          {data?.scannedAt ? (
            <span>
              Last scanned{' '}
              <span className="text-platinum-muted">{new Date(data.scannedAt).toLocaleString()}</span>
            </span>
          ) : (
            <span>Run a scan to check every route’s indexability.</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {data && (
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          )}
          <Button size="sm" onClick={runScan} disabled={scanning}>
            <RefreshCw className={cn('h-4 w-4', scanning && 'animate-spin')} />
            {data ? 'Re-scan' : scanning ? 'Scanning…' : 'Run Scan'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Empty / loading */}
      {!data && (
        <div className="card-luxe grid place-items-center rounded-2xl px-6 py-16 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brilliant-soft">
            {scanning ? (
              <RefreshCw className="h-7 w-7 animate-spin text-brilliant-cyan" />
            ) : (
              <Globe className="h-7 w-7 text-brilliant-cyan" />
            )}
          </div>
          <p className="mt-4 font-display text-lg font-semibold text-platinum">
            {scanning ? 'Checking indexability…' : 'No scan yet'}
          </p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {scanning
              ? 'Fetching every route and reading its robots and canonical signals.'
              : 'Run your first scan to see which routes are indexable and which are blocked.'}
          </p>
          {!scanning && (
            <Button className="mt-5" onClick={runScan}>
              <Shield className="h-4 w-4" /> Run Indexing Scan
            </Button>
          )}
        </div>
      )}

      {data && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {statCards.map((c) => (
              <div key={c.label} className="card-luxe flex items-center gap-4 rounded-2xl p-5">
                <div className={cn('grid h-11 w-11 place-items-center rounded-xl', c.ring)}>{c.icon}</div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {c.label}
                  </p>
                  <p className="font-display text-2xl font-bold text-platinum">{c.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Donut */}
          <div className="card-luxe flex flex-col items-center justify-center rounded-2xl p-6">
            <DonutChart indexable={data.summary.indexable} total={data.summary.total} />
            <div className="mt-4 flex items-center gap-6">
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Indexable ({data.summary.indexable})
              </span>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Blocked (
                {data.summary.blocked + data.summary.errors})
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search routes…"
              className="pl-10"
            />
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-border">
            <div className="hidden grid-cols-[1fr_110px_140px_70px] items-center gap-3 border-b border-border bg-card/60 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground lg:grid">
              <span>URL</span>
              <span>Status</span>
              <span>Reason</span>
              <span className="text-center">Sitemap</span>
            </div>
            <ul className="max-h-[640px] divide-y divide-border overflow-y-auto">
              {filtered.map((row) => {
                const meta = statusMeta[row.status]
                const Icon = meta.icon
                return (
                  <li
                    key={row.path}
                    className="grid grid-cols-1 gap-2 bg-card/30 px-5 py-3.5 transition-colors hover:bg-card/60 lg:grid-cols-[1fr_110px_140px_70px] lg:items-center lg:gap-3"
                  >
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-w-0 items-center gap-1.5 text-sm font-medium text-platinum hover:text-brilliant-cyan"
                    >
                      <span className="truncate">{row.path}</span>
                      <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
                    </a>
                    <div>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
                          meta.tone,
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {meta.label}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground" title={row.reason}>
                      {row.reason}
                    </p>
                    <div className="lg:text-center">
                      {row.inSitemap ? (
                        <CheckCircle2 className="inline h-4 w-4 text-emerald-400" />
                      ) : (
                        <span className="text-xs text-muted-foreground/50">—</span>
                      )}
                    </div>
                  </li>
                )
              })}
              {filtered.length === 0 && (
                <li className="px-5 py-12 text-center text-sm text-muted-foreground">
                  No routes match your search.
                </li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
