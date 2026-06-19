import Link from 'next/link'
import {
  ArrowUpRight,
  Eye,
  FileText,
  Gem,
  ImageIcon,
  Inbox,
  Mail,
  PenLine,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createAdminClient, hasSupabaseConfig } from '@/lib/supabase/server'
import { seedPosts } from '@/lib/content/posts'
import { formatDate } from '@/lib/utils'

interface ContactRow {
  id: number
  name: string
  email: string
  subject: string | null
  message: string
  status: string
  created_at: string
}

interface TestRow {
  id: number
  name: string
  email: string
  method: string
  carat: string | null
  status: string
  created_at: string
}

interface DashboardData {
  publishedPosts: number
  draftPosts: number
  totalMessages: number
  newMessages: number
  totalTestRequests: number
  newTestRequests: number
  mediaCount: number
  views7d: number
  subscribers: number
  recentMessages: ContactRow[]
  recentTests: TestRow[]
}

const EMPTY: DashboardData = {
  publishedPosts: 0,
  draftPosts: 0,
  totalMessages: 0,
  newMessages: 0,
  totalTestRequests: 0,
  newTestRequests: 0,
  mediaCount: 0,
  views7d: 0,
  subscribers: 0,
  recentMessages: [],
  recentTests: [],
}

async function loadDashboard(): Promise<DashboardData> {
  if (!hasSupabaseConfig()) {
    // Seed fallback — show post counts from bundled content, everything else zero.
    return {
      ...EMPTY,
      publishedPosts: seedPosts.filter((p) => p.status === 'published').length,
      draftPosts: seedPosts.filter((p) => p.status === 'draft').length,
    }
  }

  try {
    const supabase = createAdminClient()
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const headCount = { count: 'exact' as const, head: true }

    const [
      published,
      draft,
      messagesTotal,
      messagesNew,
      testsTotal,
      testsNew,
      media,
      views,
      subs,
      recentMessages,
      recentTests,
    ] = await Promise.all([
      supabase.from('blog_posts').select('id', headCount).eq('status', 'published'),
      supabase.from('blog_posts').select('id', headCount).eq('status', 'draft'),
      supabase.from('contact_submissions').select('id', headCount),
      supabase.from('contact_submissions').select('id', headCount).eq('status', 'new'),
      supabase.from('test_requests').select('id', headCount),
      supabase.from('test_requests').select('id', headCount).eq('status', 'new'),
      supabase.from('media').select('id', headCount),
      supabase.from('page_views').select('id', headCount).gte('created_at', sevenDaysAgo),
      supabase.from('subscribers').select('id', headCount),
      supabase
        .from('contact_submissions')
        .select('id,name,email,subject,message,status,created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('test_requests')
        .select('id,name,email,method,carat,status,created_at')
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    return {
      publishedPosts: published.count ?? 0,
      draftPosts: draft.count ?? 0,
      totalMessages: messagesTotal.count ?? 0,
      newMessages: messagesNew.count ?? 0,
      totalTestRequests: testsTotal.count ?? 0,
      newTestRequests: testsNew.count ?? 0,
      mediaCount: media.count ?? 0,
      views7d: views.count ?? 0,
      subscribers: subs.count ?? 0,
      recentMessages: (recentMessages.data as ContactRow[] | null) ?? [],
      recentTests: (recentTests.data as TestRow[] | null) ?? [],
    }
  } catch {
    return EMPTY
  }
}

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  trend,
}: {
  label: string
  value: number | string
  icon: typeof FileText
  href?: string
  trend?: string
}) {
  const body = (
    <div className="card-luxe group h-full rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-brilliant-soft text-brilliant-cyan">
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
            <TrendingUp className="h-3 w-3" /> {trend}
          </span>
        )}
        {href && !trend && (
          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-brilliant-cyan" />
        )}
      </div>
      <p className="mt-4 font-display text-3xl font-bold tracking-tight text-platinum">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  )
  return href ? <Link href={href}>{body}</Link> : body
}

export default async function AdminDashboardPage() {
  const data = await loadDashboard()
  const configured = hasSupabaseConfig()

  return (
    <div className="space-y-7">
      {!configured && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <Inbox className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p>
            Connect Supabase in <code className="rounded bg-ink/40 px-1.5 py-0.5 text-xs">.env.local</code>{' '}
            to see live data. Showing bundled content until then.
          </p>
        </div>
      )}

      {/* Stat grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Published posts"
          value={data.publishedPosts}
          icon={FileText}
          href="/admin/blog"
        />
        <StatCard
          label="Draft posts"
          value={data.draftPosts}
          icon={PenLine}
          href="/admin/blog"
        />
        <StatCard
          label={`Messages${data.newMessages ? ` · ${data.newMessages} new` : ''}`}
          value={data.totalMessages}
          icon={Mail}
          href="/admin/messages"
          trend={data.newMessages ? `${data.newMessages} new` : undefined}
        />
        <StatCard
          label={`Test requests${data.newTestRequests ? ` · ${data.newTestRequests} new` : ''}`}
          value={data.totalTestRequests}
          icon={Gem}
          href="/admin/test-requests"
          trend={data.newTestRequests ? `${data.newTestRequests} new` : undefined}
        />
        <StatCard label="Media files" value={data.mediaCount} icon={ImageIcon} href="/admin/media" />
        <StatCard label="Views (7 days)" value={data.views7d} icon={Eye} href="/admin/analytics" />
        <StatCard label="Subscribers" value={data.subscribers} icon={Users} href="/admin/settings" />
        <div className="card-luxe flex flex-col justify-center gap-2 rounded-2xl p-5">
          <p className="text-sm font-medium text-platinum">Quick actions</p>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href="/admin/blog">
                <PenLine className="h-4 w-4" /> New post
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/" target="_blank">
                View site
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Recent lists */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Messages */}
        <section className="card-luxe rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-platinum">
              <Mail className="h-4 w-4 text-brilliant-cyan" /> Recent messages
            </h2>
            <Link
              href="/admin/messages"
              className="text-xs text-muted-foreground transition-colors hover:text-brilliant-cyan"
            >
              View all
            </Link>
          </div>
          <div className="mt-4 divide-y divide-border/60">
            {data.recentMessages.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No messages yet.</p>
            ) : (
              data.recentMessages.map((m) => (
                <div key={m.id} className="flex items-start gap-3 py-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary/60 text-xs font-semibold text-platinum-muted">
                    {m.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-platinum">{m.name}</p>
                      {m.status === 'new' && (
                        <Badge variant="default" className="px-2 py-0 text-[10px]">
                          new
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {m.subject || m.message}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {formatDate(m.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Test requests */}
        <section className="card-luxe rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-platinum">
              <Gem className="h-4 w-4 text-brilliant-cyan" /> Recent test requests
            </h2>
            <Link
              href="/admin/test-requests"
              className="text-xs text-muted-foreground transition-colors hover:text-brilliant-cyan"
            >
              View all
            </Link>
          </div>
          <div className="mt-4 divide-y divide-border/60">
            {data.recentTests.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No requests yet.</p>
            ) : (
              data.recentTests.map((t) => (
                <div key={t.id} className="flex items-start gap-3 py-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary/60 text-brilliant-cyan">
                    <Gem className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-platinum">{t.name}</p>
                      {t.status === 'new' && (
                        <Badge variant="default" className="px-2 py-0 text-[10px]">
                          new
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.method}
                      {t.carat ? ` · ${t.carat} ct` : ''} · {t.email}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {formatDate(t.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
