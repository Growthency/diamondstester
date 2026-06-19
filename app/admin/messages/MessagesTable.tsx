'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  ChevronDown,
  Inbox,
  Loader2,
  Mail,
  Phone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn, formatDate } from '@/lib/utils'

interface Message {
  id: number | string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  status: string
  created_at: string
}

const STATUS_FILTERS = ['all', 'new', 'read', 'replied', 'archived'] as const
type StatusFilter = (typeof STATUS_FILTERS)[number]

const STATUS_ACTIONS = ['read', 'replied', 'archived'] as const

function statusVariant(status: string) {
  switch (status) {
    case 'new':
      return 'default' as const
    case 'replied':
      return 'success' as const
    case 'archived':
      return 'muted' as const
    default:
      return 'outline' as const
  }
}

function snippet(text: string, len = 80) {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length > len ? clean.slice(0, len).trimEnd() + '…' : clean
}

export function MessagesTable() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [expanded, setExpanded] = useState<Message['id'] | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/admin/messages', { cache: 'no-store' })
        const data = await res.json()
        setMessages(Array.isArray(data) ? data : [])
      } catch {
        setMessages([])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const newCount = useMemo(
    () => messages.filter((m) => m.status === 'new').length,
    [messages],
  )

  const filtered = useMemo(
    () => (filter === 'all' ? messages : messages.filter((m) => m.status === filter)),
    [messages, filter],
  )

  const setStatus = useCallback(
    async (id: Message['id'], status: string) => {
      const prev = messages
      setMessages((cur) => cur.map((m) => (m.id === id ? { ...m, status } : m)))
      try {
        const res = await fetch('/api/admin/messages', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status }),
        })
        const data = await res.json()
        if (!res.ok || data?.error) {
          setMessages(prev)
          toast.error(data?.error || 'Could not update status.')
          return
        }
        toast.success(`Marked as ${status}.`)
      } catch {
        setMessages(prev)
        toast.error('Could not update status.')
      }
    },
    [messages],
  )

  const toggle = useCallback(
    (m: Message) => {
      setExpanded((cur) => (cur === m.id ? null : m.id))
      if (m.status === 'new') setStatus(m.id, 'read')
    },
    [setStatus],
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading messages…
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
          <Inbox className="h-10 w-10 text-muted-foreground" />
          <p className="font-medium text-platinum">No messages</p>
          <p className="text-sm text-muted-foreground">
            {filter === 'all'
              ? 'Submissions from your contact form will appear here.'
              : `No ${filter} messages.`}
          </p>
        </Card>
      ) : (
        <Card className="divide-y divide-border overflow-hidden">
          {filtered.map((m) => {
            const open = expanded === m.id
            return (
              <div key={m.id}>
                <button
                  type="button"
                  onClick={() => toggle(m)}
                  className="grid w-full grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/30 sm:grid-cols-[1.2fr_1.5fr_auto_auto]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-platinum">{m.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                  </div>
                  <div className="hidden min-w-0 sm:block">
                    <p className="truncate text-sm text-platinum">
                      {m.subject || '(no subject)'}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {snippet(m.message)}
                    </p>
                  </div>
                  <Badge variant={statusVariant(m.status)} className="capitalize">
                    {m.status}
                  </Badge>
                  <div className="flex items-center gap-2 justify-self-end text-xs text-muted-foreground">
                    <span className="hidden md:inline">{formatDate(m.created_at)}</span>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform',
                        open && 'rotate-180',
                      )}
                    />
                  </div>
                </button>

                {open && (
                  <div className="space-y-4 border-t border-border bg-secondary/20 px-4 py-4">
                    <div className="flex flex-wrap gap-4 text-sm">
                      <a
                        href={`mailto:${m.email}`}
                        className="inline-flex items-center gap-1.5 text-brilliant-cyan hover:underline"
                      >
                        <Mail className="h-3.5 w-3.5" /> {m.email}
                      </a>
                      {m.phone && (
                        <a
                          href={`tel:${m.phone}`}
                          className="inline-flex items-center gap-1.5 text-brilliant-cyan hover:underline"
                        >
                          <Phone className="h-3.5 w-3.5" /> {m.phone}
                        </a>
                      )}
                    </div>
                    {m.subject && (
                      <p className="text-sm font-medium text-platinum">{m.subject}</p>
                    )}
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {m.message}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_ACTIONS.map((s) => (
                        <Button
                          key={s}
                          type="button"
                          variant={m.status === s ? 'default' : 'outline'}
                          size="sm"
                          className="capitalize"
                          onClick={() => setStatus(m.id, s)}
                        >
                          Mark {s}
                        </Button>
                      ))}
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
