'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Info,
  RefreshCw,
  Search,
  ShieldCheck,
  Share2,
  Type,
  Twitter,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/* ─────────────── Types (mirror the API contract) ─────────────── */
type Severity = 'critical' | 'warning' | 'info'

interface Issue {
  check: string
  severity: Severity
  message: string
  fix: string
  category: string
}

interface PageResult {
  path: string
  url: string
  status: number
  title: string
  htmlSize: number
  loadTime: number
  score: number
  issues: Issue[]
}

interface ScanResult {
  score: number
  scanned: number
  categories: Record<string, { passed: number; total: number }>
  pages: PageResult[]
  summary: { critical: number; warnings: number; info: number; passed: number }
  scannedAt: string
}

type Tab = 'overview' | 'pages' | 'global'

/* ─────────────── Helpers ─────────────── */
function scoreTone(score: number): string {
  if (score >= 90) return 'text-emerald-400'
  if (score >= 70) return 'text-amber-400'
  if (score >= 50) return 'text-orange-400'
  return 'text-red-400'
}
function scoreStroke(score: number): string {
  if (score >= 90) return 'hsl(152 60% 50%)'
  if (score >= 70) return 'hsl(38 92% 55%)'
  if (score >= 50) return 'hsl(25 95% 55%)'
  return 'hsl(0 84% 60%)'
}
function barTone(pct: number): string {
  if (pct >= 90) return 'bg-emerald-400'
  if (pct >= 70) return 'bg-amber-400'
  if (pct >= 50) return 'bg-orange-400'
  return 'bg-red-400'
}

const severityIcon = (s: Severity, size = 14) => {
  if (s === 'critical') return <XCircle size={size} className="text-red-400" />
  if (s === 'warning') return <AlertTriangle size={size} className="text-amber-400" />
  return <Info size={size} className="text-brilliant-cyan" />
}

const severityBadge = (s: Severity) => {
  if (s === 'critical') return 'bg-red-500/15 text-red-300'
  if (s === 'warning') return 'bg-amber-500/15 text-amber-300'
  return 'bg-brilliant-soft text-brilliant-cyan'
}

const categoryIcon = (cat: string, size = 16) => {
  switch (cat) {
    case 'Meta Tags':
      return <FileText size={size} />
    case 'Open Graph':
      return <Share2 size={size} />
    case 'Twitter Cards':
      return <Twitter size={size} />
    case 'Headings':
      return <Type size={size} />
    case 'Technical':
      return <ShieldCheck size={size} />
    default:
      return <ImageIcon size={size} />
  }
}

/* ─────────────── Score gauge ─────────────── */
function ScoreRing({ score, size = 168, stroke = 12 }: { score: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="hsl(var(--border))"
        strokeWidth={stroke}
        opacity={0.6}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={scoreStroke(score)}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  )
}

/* ─────────────── Main view ─────────────── */
export function SeoHealthView() {
  const [data, setData] = useState<ScanResult | null>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('overview')
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const runScan = useCallback(async () => {
    setScanning(true)
    setError('')
    const tId = toast.loading('Auditing every page…')
    try {
      const res = await fetch('/api/admin/seo-health', { method: 'GET', cache: 'no-store' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json.error || 'Scan failed.')
        toast.error(json.error || 'Scan failed.', { id: tId })
        return
      }
      setData(json as ScanResult)
      setTab('overview')
      toast.success(`Scanned ${json.scanned} pages.`, { id: tId })
    } catch {
      setError('Network error — please try again.')
      toast.error('Network error — please try again.', { id: tId })
    } finally {
      setScanning(false)
    }
  }, [])

  const filteredPages = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    const sorted = [...data.pages].sort((a, b) => a.score - b.score)
    if (!q) return sorted
    return sorted.filter(
      (p) => p.path.toLowerCase().includes(q) || p.title.toLowerCase().includes(q),
    )
  }, [data, query])

  /* Global checks: per-check pass rate across all live pages. */
  const globalChecks = useMemo(() => {
    if (!data) return []
    const live = data.pages.filter((p) => p.status === 200)
    const defs: { check: string; label: string; severity: Severity; category: string }[] = [
      { check: 'title', label: 'Title tag present & 30–60 chars', severity: 'critical', category: 'Meta Tags' },
      { check: 'description', label: 'Meta description present & 70–160 chars', severity: 'critical', category: 'Meta Tags' },
      { check: 'og-title-missing', label: 'Open Graph title set', severity: 'warning', category: 'Open Graph' },
      { check: 'og-image-missing', label: 'Open Graph image set', severity: 'warning', category: 'Open Graph' },
      { check: 'twitter-card-missing', label: 'Twitter card set', severity: 'info', category: 'Twitter Cards' },
      { check: 'h1', label: 'Exactly one <h1> heading', severity: 'critical', category: 'Headings' },
      { check: 'canonical-missing', label: 'Canonical link present', severity: 'warning', category: 'Technical' },
      { check: 'viewport-missing', label: 'Viewport meta present', severity: 'critical', category: 'Technical' },
    ]
    return defs.map((def) => {
      const failing = live.filter((p) =>
        p.issues.some((i) => {
          if (def.check === 'title') return i.check === 'title-missing' || i.check === 'title-length'
          if (def.check === 'description')
            return i.check === 'description-missing' || i.check === 'description-length'
          if (def.check === 'h1') return i.check === 'h1-missing' || i.check === 'h1-multiple'
          return i.check === def.check
        }),
      ).length
      return {
        ...def,
        passing: live.length - failing,
        total: live.length,
        failing,
      }
    })
  }, [data])

  const exportCSV = useCallback(() => {
    if (!data) return
    const rows: string[][] = []
    rows.push(['Path', 'URL', 'Score', 'Status', 'Size (KB)', 'Critical', 'Warnings', 'Info', 'Issues'])
    for (const p of [...data.pages].sort((a, b) => a.score - b.score)) {
      const crit = p.issues.filter((i) => i.severity === 'critical').length
      const warn = p.issues.filter((i) => i.severity === 'warning').length
      const inf = p.issues.filter((i) => i.severity === 'info').length
      const detail = p.issues
        .map((i) => `[${i.severity.toUpperCase()}] ${i.category}: ${i.message} → ${i.fix}`)
        .join(' | ')
      rows.push([
        p.path || '/',
        p.url,
        String(p.score),
        String(p.status),
        String(Math.round(p.htmlSize / 1024)),
        String(crit),
        String(warn),
        String(inf),
        detail || 'All checks passed',
      ])
    }
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `seo-health-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [data])

  const summaryCards = data
    ? [
        { label: 'Critical', count: data.summary.critical, icon: <XCircle size={18} />, tone: 'text-red-400', ring: 'bg-red-500/15' },
        { label: 'Warnings', count: data.summary.warnings, icon: <AlertTriangle size={18} />, tone: 'text-amber-400', ring: 'bg-amber-500/15' },
        { label: 'Info', count: data.summary.info, icon: <Info size={18} />, tone: 'text-brilliant-cyan', ring: 'bg-brilliant-soft' },
        { label: 'Pages Passed', count: data.summary.passed, icon: <CheckCircle2 size={18} />, tone: 'text-emerald-400', ring: 'bg-emerald-500/15' },
      ]
    : []

  return (
    <div className="space-y-6">
      {/* ── Action bar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {data?.scannedAt ? (
            <span>
              Last scanned{' '}
              <span className="text-platinum-muted">
                {new Date(data.scannedAt).toLocaleString()}
              </span>{' '}
              · {data.scanned} pages
            </span>
          ) : (
            <span>Run a scan to audit every public page.</span>
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

      {/* ── Empty / loading state ── */}
      {!data && (
        <div className="card-luxe grid place-items-center rounded-2xl px-6 py-16 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brilliant-soft">
            {scanning ? (
              <RefreshCw className="h-7 w-7 animate-spin text-brilliant-cyan" />
            ) : (
              <ShieldCheck className="h-7 w-7 text-brilliant-cyan" />
            )}
          </div>
          <p className="mt-4 font-display text-lg font-semibold text-platinum">
            {scanning ? 'Auditing your site…' : 'Ready to audit'}
          </p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {scanning
              ? 'Fetching every page and running technical SEO checks. This takes a few seconds.'
              : 'We’ll crawl every public route plus all published articles, then grade meta tags, Open Graph, Twitter Cards, headings and technical signals.'}
          </p>
          {!scanning && (
            <Button className="mt-5" onClick={runScan}>
              <ShieldCheck className="h-4 w-4" /> Start SEO Audit
            </Button>
          )}
        </div>
      )}

      {data && (
        <>
          {/* ── Score hero ── */}
          <div className="card-luxe rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col items-center gap-8 md:flex-row">
              <div className="relative shrink-0">
                <ScoreRing score={data.score} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={cn('font-display text-4xl font-bold', scoreTone(data.score))}>
                    {data.score}
                  </span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="font-display text-xl font-bold text-platinum">
                  {data.score >= 90
                    ? 'Excellent'
                    : data.score >= 70
                      ? 'Good'
                      : data.score >= 50
                        ? 'Needs Work'
                        : 'Critical Issues'}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {data.scanned} pages scanned ·{' '}
                  {data.summary.critical + data.summary.warnings + data.summary.info} issues found
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                  <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-300">
                    {data.summary.critical} Critical
                  </span>
                  <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300">
                    {data.summary.warnings} Warnings
                  </span>
                  <span className="rounded-full bg-brilliant-soft px-3 py-1 text-xs font-semibold text-brilliant-cyan">
                    {data.summary.info} Info
                  </span>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                    {data.summary.passed} Passed
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Summary stat cards ── */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {summaryCards.map((c) => (
              <div key={c.label} className="card-luxe rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className={cn('grid h-8 w-8 place-items-center rounded-lg', c.ring, c.tone)}>
                    {c.icon}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{c.label}</span>
                </div>
                <p className={cn('mt-2 font-display text-2xl font-bold', c.tone)}>{c.count}</p>
              </div>
            ))}
          </div>

          {/* ── Tabs ── */}
          <div className="inline-flex w-full rounded-full border border-border bg-secondary/40 p-1 sm:w-auto">
            {(
              [
                ['overview', 'Overview'],
                ['pages', `Pages (${data.scanned})`],
                ['global', `Global Checks (${globalChecks.length})`],
              ] as [Tab, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={cn(
                  'flex-1 rounded-full px-4 py-1.5 text-xs font-medium transition-colors sm:flex-none',
                  tab === key
                    ? 'bg-brilliant text-white shadow-glow'
                    : 'text-muted-foreground hover:text-platinum',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ══════════ Overview ══════════ */}
          {tab === 'overview' && (
            <div>
              <h3 className="mb-4 text-sm font-semibold text-platinum">Category Breakdown</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(data.categories).map(([cat, { passed, total }]) => {
                  const pct = total > 0 ? Math.round((passed / total) * 100) : 100
                  return (
                    <div key={cat} className="card-luxe rounded-2xl p-5">
                      <div className="mb-3 flex items-center gap-2.5 text-platinum">
                        <span className={scoreTone(pct)}>{categoryIcon(cat)}</span>
                        <span className="text-[13px] font-semibold">{cat}</span>
                      </div>
                      <div className="mb-1.5 flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary/60">
                          <div
                            className={cn('h-full rounded-full transition-all duration-700', barTone(pct))}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className={cn('text-xs font-bold', scoreTone(pct))}>{pct}%</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {passed}/{total} checks passed
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ══════════ Pages ══════════ */}
          {tab === 'pages' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search pages by path or title…"
                  className="pl-10"
                />
              </div>

              <div className="overflow-hidden rounded-2xl border border-border">
                <div className="grid grid-cols-[1fr_56px_56px_56px_56px_44px] items-center gap-2 border-b border-border bg-card/60 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <span>Page</span>
                  <span className="text-center">Score</span>
                  <span className="text-center text-red-400/80">Crit</span>
                  <span className="text-center text-amber-400/80">Warn</span>
                  <span className="text-center text-brilliant-cyan/80">Info</span>
                  <span className="text-center">Status</span>
                </div>

                <div className="max-h-[620px] divide-y divide-border overflow-y-auto">
                  {filteredPages.map((page) => {
                    const crit = page.issues.filter((i) => i.severity === 'critical').length
                    const warn = page.issues.filter((i) => i.severity === 'warning').length
                    const inf = page.issues.filter((i) => i.severity === 'info').length
                    const isOpen = expanded === page.path
                    return (
                      <div key={page.path}>
                        <button
                          onClick={() => setExpanded(isOpen ? null : page.path)}
                          className="grid w-full grid-cols-[1fr_56px_56px_56px_56px_44px] items-center gap-2 bg-card/30 px-5 py-3 text-left transition-colors hover:bg-card/60"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            {isOpen ? (
                              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            )}
                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-medium text-platinum">
                                {page.path || '/'}
                              </p>
                              {page.title && (
                                <p className="truncate text-[11px] text-muted-foreground">
                                  {page.title}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-center">
                            <span
                              className={cn(
                                'inline-block rounded-md px-2 py-0.5 text-xs font-bold',
                                page.score >= 90
                                  ? 'bg-emerald-500/15 text-emerald-300'
                                  : page.score >= 70
                                    ? 'bg-amber-500/15 text-amber-300'
                                    : 'bg-red-500/15 text-red-300',
                              )}
                            >
                              {page.score}
                            </span>
                          </div>
                          <span
                            className={cn(
                              'text-center text-xs font-semibold',
                              crit > 0 ? 'text-red-400' : 'text-muted-foreground/50',
                            )}
                          >
                            {crit}
                          </span>
                          <span
                            className={cn(
                              'text-center text-xs font-semibold',
                              warn > 0 ? 'text-amber-400' : 'text-muted-foreground/50',
                            )}
                          >
                            {warn}
                          </span>
                          <span
                            className={cn(
                              'text-center text-xs font-semibold',
                              inf > 0 ? 'text-brilliant-cyan' : 'text-muted-foreground/50',
                            )}
                          >
                            {inf}
                          </span>
                          <div className="flex justify-center">
                            {page.status === 200 && crit === 0 ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            ) : page.status >= 400 || page.status === 0 ? (
                              <XCircle className="h-4 w-4 text-red-400" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-amber-400" />
                            )}
                          </div>
                        </button>

                        {isOpen && (
                          <div className="bg-ink-soft/40">
                            <div className="flex flex-wrap items-center gap-4 border-b border-border px-8 py-3 text-[11px] text-muted-foreground">
                              <span>
                                Status:{' '}
                                <strong className={page.status === 200 ? 'text-emerald-400' : 'text-red-400'}>
                                  {page.status || 'Error'}
                                </strong>
                              </span>
                              <span>
                                Load:{' '}
                                <strong className="text-platinum-muted">
                                  {page.loadTime > 0 ? `${(page.loadTime / 1000).toFixed(1)}s` : 'N/A'}
                                </strong>
                              </span>
                              <span>
                                Size:{' '}
                                <strong className="text-platinum-muted">
                                  {page.htmlSize > 0 ? `${Math.round(page.htmlSize / 1024)}KB` : 'N/A'}
                                </strong>
                              </span>
                              <a
                                href={page.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-brilliant-cyan hover:underline"
                              >
                                Open page <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                            {page.issues.length === 0 ? (
                              <div className="px-8 py-6 text-center">
                                <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-emerald-400" />
                                <p className="text-sm font-semibold text-emerald-300">All checks passed</p>
                              </div>
                            ) : (
                              <div className="divide-y divide-border">
                                {page.issues
                                  .slice()
                                  .sort(
                                    (a, b) =>
                                      ({ critical: 0, warning: 1, info: 2 }[a.severity] ?? 2) -
                                      ({ critical: 0, warning: 1, info: 2 }[b.severity] ?? 2),
                                  )
                                  .map((issue, idx) => (
                                    <div key={issue.check + idx} className="flex items-start gap-3 px-8 py-3">
                                      <div className="mt-0.5">{severityIcon(issue.severity)}</div>
                                      <div className="min-w-0 flex-1">
                                        <div className="mb-0.5 flex flex-wrap items-center gap-2">
                                          <span className="text-xs font-semibold text-platinum">
                                            {issue.message}
                                          </span>
                                          <span
                                            className={cn(
                                              'rounded px-1.5 py-0.5 text-[10px] font-semibold',
                                              severityBadge(issue.severity),
                                            )}
                                          >
                                            {issue.category}
                                          </span>
                                        </div>
                                        <p className="flex items-start gap-1 text-[11px] text-muted-foreground">
                                          <ArrowUpRight className="mt-0.5 h-3 w-3 shrink-0 text-brilliant-cyan" />
                                          {issue.fix}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {filteredPages.length === 0 && (
                    <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                      No pages match your search.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══════════ Global checks ══════════ */}
          {tab === 'global' && (
            <div className="overflow-hidden rounded-2xl border border-border">
              <div className="divide-y divide-border">
                {globalChecks.map((gc) => {
                  const allPass = gc.failing === 0
                  return (
                    <div key={gc.check} className="flex items-start gap-4 bg-card/30 px-5 py-4">
                      <div className="mt-0.5">
                        {allPass ? (
                          <CheckCircle2 className="h-[18px] w-[18px] text-emerald-400" />
                        ) : (
                          severityIcon(gc.severity, 18)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex flex-wrap items-center gap-2">
                          <span className="text-[13px] font-semibold text-platinum">{gc.label}</span>
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                              allPass ? 'bg-emerald-500/15 text-emerald-300' : severityBadge(gc.severity),
                            )}
                          >
                            {allPass ? 'Passed' : gc.severity}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {gc.passing}/{gc.total} pages pass this check
                          {gc.failing > 0 && ` · ${gc.failing} need attention`}
                        </p>
                      </div>
                    </div>
                  )
                })}
                {globalChecks.length === 0 && (
                  <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                    No global checks to show.
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
