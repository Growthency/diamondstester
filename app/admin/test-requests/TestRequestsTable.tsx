'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  ChevronDown,
  FlaskConical,
  Loader2,
  Mail,
  Phone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn, formatDate } from '@/lib/utils'

interface TestRequest {
  id: number | string
  name: string
  email: string
  phone: string | null
  method: string
  carat: string | null
  details: string | null
  image_url: string | null
  status: string
  result: string | null
  created_at: string
}

const STATUS_FILTERS = ['all', 'new', 'in-review', 'completed'] as const
type StatusFilter = (typeof STATUS_FILTERS)[number]

const STATUS_OPTIONS = ['new', 'in-review', 'completed'] as const

function statusVariant(status: string) {
  switch (status) {
    case 'new':
      return 'default' as const
    case 'in-review':
      return 'warning' as const
    case 'completed':
      return 'success' as const
    default:
      return 'outline' as const
  }
}

export function TestRequestsTable() {
  const [requests, setRequests] = useState<TestRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [expanded, setExpanded] = useState<TestRequest['id'] | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<TestRequest['id'] | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/admin/test-requests', { cache: 'no-store' })
        const data = await res.json()
        setRequests(Array.isArray(data) ? data : [])
      } catch {
        setRequests([])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const newCount = useMemo(
    () => requests.filter((r) => r.status === 'new').length,
    [requests],
  )

  const filtered = useMemo(
    () => (filter === 'all' ? requests : requests.filter((r) => r.status === filter)),
    [requests, filter],
  )

  const patch = useCallback(
    async (id: TestRequest['id'], payload: { status?: string; result?: string }) => {
      const prev = requests
      setRequests((cur) => cur.map((r) => (r.id === id ? { ...r, ...payload } : r)))
      try {
        const res = await fetch('/api/admin/test-requests', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...payload }),
        })
        const data = await res.json()
        if (!res.ok || data?.error) {
          setRequests(prev)
          toast.error(data?.error || 'Could not save changes.')
          return false
        }
        return true
      } catch {
        setRequests(prev)
        toast.error('Could not save changes.')
        return false
      }
    },
    [requests],
  )

  const setStatus = useCallback(
    async (id: TestRequest['id'], status: string) => {
      if (await patch(id, { status })) toast.success(`Status set to ${status}.`)
    },
    [patch],
  )

  const saveResult = useCallback(
    async (id: TestRequest['id']) => {
      setSaving(id)
      const result = drafts[String(id)] ?? ''
      if (await patch(id, { result })) toast.success('Result note saved.')
      setSaving(null)
    },
    [patch, drafts],
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading requests…
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors',
              filter === f
                ? 'border-transparent bg-brilliant text-white'
                : 'border-border text-muted-foreground hover:text-platinum',
            )}
          >
            {f}
            {f === 'new' && newCount > 0 ? ` (${newCount})` : ''}
          </button>
        ))}
        {newCount > 0 && (
          <Badge variant="default" className="ml-auto">
            {newCount} new
          </Badge>
        )}
      </div>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <FlaskConical className="h-10 w-10 text-muted-foreground" />
          <p className="font-medium text-platinum">No test requests</p>
          <p className="text-sm text-muted-foreground">
            {filter === 'all'
              ? 'Verification requests submitted by clients will appear here.'
              : `No ${filter} requests.`}
          </p>
        </Card>
      ) : (
        <Card className="divide-y divide-border overflow-hidden">
          {filtered.map((r) => {
            const open = expanded === r.id
            const draft = drafts[String(r.id)] ?? r.result ?? ''
            return (
              <div key={r.id}>
                <button
                  type="button"
                  onClick={() => setExpanded((cur) => (cur === r.id ? null : r.id))}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/30"
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary/40">
                    {r.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.image_url}
                        alt={`${r.name} sample`}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <FlaskConical className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-platinum">{r.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{r.email}</p>
                  </div>
                  <div className="hidden text-xs text-muted-foreground sm:block">
                    <p className="capitalize text-platinum">{r.method}</p>
                    <p>{r.carat ? `${r.carat} ct` : '—'}</p>
                  </div>
                  <Badge variant={statusVariant(r.status)} className="capitalize">
                    {r.status}
                  </Badge>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="hidden md:inline">{formatDate(r.created_at)}</span>
                    <ChevronDown
                      className={cn('h-4 w-4 transition-transform', open && 'rotate-180')}
                    />
                  </div>
                </button>

                {open && (
                  <div className="grid gap-5 border-t border-border bg-secondary/20 px-4 py-4 md:grid-cols-[200px_1fr]">
                    <div className="space-y-3">
                      {r.image_url ? (
                        <a href={r.image_url} target="_blank" rel="noreferrer">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={r.image_url}
                            alt={`${r.name} sample`}
                            className="w-full rounded-lg border border-border object-cover"
                          />
                        </a>
                      ) : (
                        <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                      <div className="space-y-1 text-sm">
                        <a
                          href={`mailto:${r.email}`}
                          className="flex items-center gap-1.5 text-brilliant-cyan hover:underline"
                        >
                          <Mail className="h-3.5 w-3.5" /> {r.email}
                        </a>
                        {r.phone && (
                          <a
                            href={`tel:${r.phone}`}
                            className="flex items-center gap-1.5 text-brilliant-cyan hover:underline"
                          >
                            <Phone className="h-3.5 w-3.5" /> {r.phone}
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Method
                          </p>
                          <p className="capitalize text-platinum">{r.method}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Carat
                          </p>
                          <p className="text-platinum">{r.carat || '—'}</p>
                        </div>
                      </div>

                      {r.details && (
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Details
                          </p>
                          <p className="whitespace-pre-wrap text-sm text-platinum">
                            {r.details}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                          Status
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {STATUS_OPTIONS.map((s) => (
                            <Button
                              key={s}
                              type="button"
                              variant={r.status === s ? 'default' : 'outline'}
                              size="sm"
                              className="capitalize"
                              onClick={() => setStatus(r.id, s)}
                            >
                              {s}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`result-${r.id}`}>Result note</Label>
                        <Textarea
                          id={`result-${r.id}`}
                          rows={4}
                          value={draft}
                          placeholder="Write the verification result or notes for this request…"
                          onChange={(e) =>
                            setDrafts((d) => ({ ...d, [String(r.id)]: e.target.value }))
                          }
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => saveResult(r.id)}
                          disabled={saving === r.id}
                        >
                          {saving === r.id && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          )}
                          Save result
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </Card>
      )}
    </div>
  )
}
