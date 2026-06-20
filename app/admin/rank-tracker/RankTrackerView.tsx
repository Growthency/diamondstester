'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Check,
  Clock,
  Minus,
  Plus,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Keyword {
  id: number
  keyword: string
  target_url: string | null
  position: number | null
  prev_position: number | null
  search_volume: number | null
  country: string | null
  checked_at: string | null
  created_at: string
}

function fmtVol(v: number | null): string {
  if (!v) return '—'
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (v >= 1000) return `${(v / 1000).toFixed(1).replace(/\.0$/, '')}K`
  return String(v)
}

function timeAgo(iso: string | null): string {
  if (!iso) return 'Never'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function positionTone(p: number | null): string {
  if (p === null) return 'border-border bg-secondary/40 text-muted-foreground'
  if (p <= 3) return 'border-transparent bg-amber-400/20 text-amber-300'
  if (p <= 10) return 'border-transparent bg-emerald-500/20 text-emerald-300'
  if (p <= 30) return 'border-transparent bg-brilliant-soft text-brilliant-cyan'
  if (p <= 50) return 'border-transparent bg-orange-500/20 text-orange-300'
  return 'border-transparent bg-red-500/20 text-red-300'
}

/* prev → current movement. Lower position number is better, so a drop in the
 * number is an improvement (green up-arrow). */
function ChangeIndicator({ position, prev }: { position: number | null; prev: number | null }) {
  if (position === null || prev === null) return <span className="text-xs text-muted-foreground/50">—</span>
  const delta = prev - position // positive = improved (moved up)
  if (delta > 0)
    return (
      <span className="inline-flex items-center gap-1 text-emerald-400">
        <TrendingUp className="h-3.5 w-3.5" />
        <span className="text-xs font-bold">+{delta}</span>
      </span>
    )
  if (delta < 0)
    return (
      <span className="inline-flex items-center gap-1 text-red-400">
        <TrendingDown className="h-3.5 w-3.5" />
        <span className="text-xs font-bold">{delta}</span>
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground/60">
      <Minus className="h-3.5 w-3.5" />
      <span className="text-xs">0</span>
    </span>
  )
}

export function RankTrackerView() {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [configured, setConfigured] = useState(true)
  const [loading, setLoading] = useState(true)

  // add form
  const [showAdd, setShowAdd] = useState(false)
  const [newKeyword, setNewKeyword] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newCountry, setNewCountry] = useState('US')
  const [adding, setAdding] = useState(false)

  // inline position editing
  const [editingPos, setEditingPos] = useState<number | null>(null)
  const [posInput, setPosInput] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/rank-tracker', { cache: 'no-store' })
      const json = await res.json().catch(() => ({}))
      setKeywords(Array.isArray(json.keywords) ? json.keywords : [])
    } catch {
      /* keep state */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleAdd() {
    const kw = newKeyword.trim()
    if (!kw) return
    setAdding(true)
    const tId = toast.loading('Adding keyword…')
    try {
      const res = await fetch('/api/admin/rank-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: kw, target_url: newUrl.trim(), country: newCountry.trim() || 'US' }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || json.error) {
        if (json.error === 'Supabase not configured') setConfigured(false)
        toast.error(json.error || 'Could not add keyword.', { id: tId })
        return
      }
      setKeywords((prev) => [json.keyword as Keyword, ...prev])
      setNewKeyword('')
      setNewUrl('')
      setNewCountry('US')
      setShowAdd(false)
      toast.success('Keyword added.', { id: tId })
    } catch {
      toast.error('Network error — please try again.', { id: tId })
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(kw: Keyword) {
    if (!window.confirm(`Stop tracking “${kw.keyword}”?`)) return
    const prev = keywords
    setKeywords((p) => p.filter((k) => k.id !== kw.id))
    try {
      const res = await fetch(`/api/admin/rank-tracker?id=${kw.id}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || json.error) {
        setKeywords(prev)
        toast.error(json.error || 'Could not delete.')
      } else {
        toast.success('Keyword removed.')
      }
    } catch {
      setKeywords(prev)
      toast.error('Network error — please try again.')
    }
  }

  async function savePosition(kw: Keyword) {
    const raw = posInput.trim()
    const position = raw === '' ? null : Math.max(1, parseInt(raw.replace(/[^0-9]/g, ''), 10) || 1)
    setEditingPos(null)
    setPosInput('')
    if (position === kw.position) return

    const tId = toast.loading('Saving position…')
    try {
      const res = await fetch('/api/admin/rank-tracker', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: kw.id, position }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || json.error) {
        toast.error(json.error || 'Could not save position.', { id: tId })
        return
      }
      setKeywords((prev) => prev.map((k) => (k.id === kw.id ? (json.keyword as Keyword) : k)))
      toast.success('Position updated.', { id: tId })
    } catch {
      toast.error('Network error — please try again.', { id: tId })
    }
  }

  /* ── Summary stats ── */
  const stats = useMemo(() => {
    const ranked = keywords.filter((k) => k.position !== null)
    const avg =
      ranked.length > 0
        ? Math.round((ranked.reduce((a, k) => a + (k.position || 0), 0) / ranked.length) * 10) / 10
        : 0
    const top10 = keywords.filter((k) => k.position !== null && k.position <= 10).length
    const improved = keywords.filter(
      (k) => k.position !== null && k.prev_position !== null && k.prev_position - k.position > 0,
    ).length
    return { tracked: keywords.length, avg, top10, improved }
  }, [keywords])

  const cards = [
    { label: 'Keywords Tracked', value: stats.tracked, icon: <Target className="h-4 w-4 text-brilliant-cyan" /> },
    { label: 'Avg Position', value: stats.avg > 0 ? `#${stats.avg}` : '—', icon: <TrendingUp className="h-4 w-4 text-emerald-400" /> },
    { label: 'In Top 10', value: stats.top10, icon: <Trophy className="h-4 w-4 text-amber-400" /> },
    { label: 'Improved', value: stats.improved, icon: <TrendingUp className="h-4 w-4 text-emerald-400" /> },
  ]

  return (
    <div className="space-y-6">
      {!configured && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Connect Supabase in <code className="rounded bg-ink/40 px-1.5 py-0.5 text-xs">.env.local</code>{' '}
          to track keyword rankings.
        </div>
      )}

      {/* Manual-entry note */}
      <div className="rounded-2xl border border-border bg-secondary/30 px-4 py-3 text-xs text-muted-foreground">
        Positions are <span className="font-semibold text-platinum-muted">manually entered / estimated</span>.
        Log each keyword’s rank from Google Search Console or a SERP check; the change column compares
        it to the previously saved value.
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card-luxe rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {c.label}
              </span>
              {c.icon}
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-platinum">{c.value}</p>
          </div>
        ))}
      </div>

      {/* ── Add bar ── */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-platinum">Tracked Keywords</h2>
        </div>
        {!showAdd && (
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4" /> Add Keyword
          </Button>
        )}
      </div>

      {showAdd && (
        <div className="card-luxe space-y-3 rounded-2xl p-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_120px]">
            <Input
              autoFocus
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Keyword e.g. diamond tester"
            />
            <Input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Target URL (optional) e.g. /verify"
            />
            <Input
              value={newCountry}
              onChange={(e) => setNewCountry(e.target.value.toUpperCase().slice(0, 2))}
              placeholder="US"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleAdd} disabled={adding || !newKeyword.trim()}>
              {adding ? 'Adding…' : 'Add'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowAdd(false)
                setNewKeyword('')
                setNewUrl('')
                setNewCountry('US')
              }}
            >
              <X className="h-4 w-4" /> Cancel
            </Button>
          </div>
        </div>
      )}

      {/* ── List ── */}
      {loading ? (
        <div className="card-luxe grid place-items-center rounded-2xl px-6 py-16 text-sm text-muted-foreground">
          Loading keywords…
        </div>
      ) : keywords.length === 0 ? (
        <div className="card-luxe grid place-items-center rounded-2xl px-6 py-16 text-center">
          <Target className="h-10 w-10 text-muted-foreground/60" />
          <p className="mt-3 font-medium text-platinum">No keywords yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your target search terms to start tracking their positions.
          </p>
          <Button className="mt-5" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4" /> Add Your First Keyword
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="hidden grid-cols-[1fr_80px_96px_80px_90px_120px_44px] items-center gap-3 border-b border-border bg-card/60 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground lg:grid">
            <span>Keyword</span>
            <span className="text-center">Volume</span>
            <span className="text-center">Position</span>
            <span className="text-center">Change</span>
            <span className="text-center">Country</span>
            <span className="text-center">Checked</span>
            <span className="text-right" />
          </div>

          <ul className="divide-y divide-border">
            {keywords.map((kw) => (
              <li
                key={kw.id}
                className="grid grid-cols-1 gap-3 bg-card/30 px-5 py-4 transition-colors hover:bg-card/60 lg:grid-cols-[1fr_80px_96px_80px_90px_120px_44px] lg:items-center lg:gap-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-platinum">{kw.keyword}</p>
                  {kw.target_url && (
                    <p className="truncate text-xs text-muted-foreground">{kw.target_url}</p>
                  )}
                </div>

                <div className="text-xs text-platinum-muted lg:text-center">
                  <span className="lg:hidden">Volume: </span>
                  {fmtVol(kw.search_volume)}
                </div>

                <div className="lg:flex lg:justify-center">
                  {editingPos === kw.id ? (
                    <input
                      autoFocus
                      value={posInput}
                      onChange={(e) => setPosInput(e.target.value)}
                      onBlur={() => savePosition(kw)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') savePosition(kw)
                        if (e.key === 'Escape') {
                          setEditingPos(null)
                          setPosInput('')
                        }
                      }}
                      placeholder="#"
                      className="w-16 rounded-lg border border-border bg-background px-2 py-1 text-center text-xs text-platinum outline-none focus:border-brilliant-cyan/60"
                    />
                  ) : (
                    <button
                      onClick={() => {
                        setEditingPos(kw.id)
                        setPosInput(kw.position ? String(kw.position) : '')
                      }}
                      title="Click to update position"
                      className={cn(
                        'inline-flex min-w-[3rem] items-center justify-center rounded-lg border px-2.5 py-1 text-sm font-bold transition-colors',
                        positionTone(kw.position),
                      )}
                    >
                      {kw.position !== null ? `#${kw.position}` : 'N/A'}
                    </button>
                  )}
                </div>

                <div className="lg:flex lg:justify-center">
                  <ChangeIndicator position={kw.position} prev={kw.prev_position} />
                </div>

                <div className="text-xs text-muted-foreground lg:text-center">
                  <span className="lg:hidden">Country: </span>
                  {kw.country || 'US'}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground lg:justify-center">
                  <Clock className="h-3.5 w-3.5" />
                  {timeAgo(kw.checked_at)}
                </div>

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-300 hover:border-destructive/60 hover:text-red-200"
                    onClick={() => handleDelete(kw)}
                    aria-label={`Delete ${kw.keyword}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="lg:hidden">Delete</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Position legend ── */}
      {keywords.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-5">
          {[
            { label: 'Top 3', tone: 'bg-amber-400' },
            { label: '4–10', tone: 'bg-emerald-500' },
            { label: '11–30', tone: 'bg-brilliant-cyan' },
            { label: '31–50', tone: 'bg-orange-500' },
            { label: '50+', tone: 'bg-red-500' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-2">
              <span className={cn('h-2.5 w-2.5 rounded-full', l.tone)} />
              <span className="text-xs text-muted-foreground">{l.label}</span>
            </div>
          ))}
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Check className="h-3 w-3 text-emerald-400" /> Click a position to update it
          </span>
        </div>
      )}
    </div>
  )
}
