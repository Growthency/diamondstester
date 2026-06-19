import Link from 'next/link'
import {
  Sparkles,
  BookOpen,
  ScanLine,
  Bookmark,
  Gauge,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  PlugZap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient, hasSupabaseConfig } from '@/lib/supabase/server'
import { getUser } from '@/lib/user'
import { formatDate } from '@/lib/utils'

interface RecentAnalysis {
  id: string
  verdict: string | null
  score: number | null
  image_url: string | null
  created_at: string
}

function verdictTone(verdict: string | null, score: number | null) {
  const v = (verdict ?? '').toLowerCase()
  const s = typeof score === 'number' ? score : null
  if (v.includes('real') || v.includes('natural') || v.includes('genuine') || v.includes('diamond') || (s !== null && s >= 75)) {
    return {
      Icon: CheckCircle2,
      badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
      dot: 'bg-emerald-400',
    }
  }
  if (v.includes('fake') || v.includes('moissanite') || v.includes('cubic') || v.includes('glass') || v.includes('not') || (s !== null && s < 45)) {
    return {
      Icon: AlertTriangle,
      badge: 'border-destructive/30 bg-destructive/10 text-red-300',
      dot: 'bg-red-400',
    }
  }
  return {
    Icon: HelpCircle,
    badge: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    dot: 'bg-amber-400',
  }
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof ScanLine
  label: string
  value: string | number
  hint: string
}) {
  return (
    <div className="card-luxe rounded-2xl p-6">
      <div className="flex items-start justify-between">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-brilliant-soft text-brilliant-cyan">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-5 font-display text-4xl font-bold text-platinum">{value}</p>
      <p className="mt-1 text-sm font-medium text-platinum-muted">{label}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}

export default async function DashboardOverview() {
  const user = await getUser()
  const email = user?.email ?? ''
  const firstName = email ? email.split('@')[0] : 'there'

  let configured = hasSupabaseConfig()
  let recent: RecentAnalysis[] = []
  let totalScans = 0
  let totalSaved = 0
  let avgScore: number | null = null

  if (configured) {
    try {
      const supabase = await createClient()

      const [recentRes, scansRes, savedRes, scoreRes] = await Promise.all([
        supabase
          .from('analyses')
          .select('id,verdict,score,image_url,created_at')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase.from('analyses').select('id', { count: 'exact', head: true }),
        supabase.from('saved_articles').select('id', { count: 'exact', head: true }),
        supabase.from('analyses').select('score'),
      ])

      recent = (recentRes.data as RecentAnalysis[] | null) ?? []
      totalScans = scansRes.count ?? 0
      totalSaved = savedRes.count ?? 0

      const scores = ((scoreRes.data as { score: number | null }[] | null) ?? [])
        .map((r) => r.score)
        .filter((s): s is number => typeof s === 'number')
      if (scores.length > 0) {
        avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      }
    } catch {
      // Never crash the dashboard — fall back to empty state below.
      recent = []
      totalScans = 0
      totalSaved = 0
      avgScore = null
    }
  }

  const hasScans = totalScans > 0 || recent.length > 0

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <header>
        <p className="eyebrow">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brilliant-cyan" />
          Your vault
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
          Welcome back, <span className="text-gradient">{firstName}</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          {email ? (
            <>Signed in as <span className="text-platinum-muted">{email}</span>. Here’s your testing activity at a glance.</>
          ) : (
            <>Here’s your testing activity at a glance.</>
          )}
        </p>
      </header>

      {!configured && (
        <div className="card-luxe flex items-start gap-4 rounded-2xl p-6">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brilliant-soft text-brilliant-cyan">
            <PlugZap className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display font-semibold text-platinum">Connect Supabase to see your activity</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Once your database is connected, your scan history, saved guides and authenticity scores
              will appear here automatically.
            </p>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={ScanLine}
          label="Total tests"
          value={totalScans}
          hint="Diamonds you’ve screened"
        />
        <StatCard
          icon={Bookmark}
          label="Saved articles"
          value={totalSaved}
          hint="Guides bookmarked to read later"
        />
        <StatCard
          icon={Gauge}
          label="Avg. authenticity"
          value={avgScore !== null ? `${avgScore}%` : '—'}
          hint={avgScore !== null ? 'Across all your tests' : 'Run a test to see this'}
        />
      </section>

      {/* Recent tests */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-platinum">Recent tests</h2>
          {hasScans && (
            <Link
              href="/dashboard/history"
              className="inline-flex items-center gap-1 text-sm font-medium text-brilliant-cyan transition-colors hover:text-platinum"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {hasScans && recent.length > 0 ? (
          <ul className="space-y-3">
            {recent.map((a) => {
              const tone = verdictTone(a.verdict, a.score)
              return (
                <li
                  key={a.id}
                  className="card-luxe flex items-center gap-4 rounded-2xl p-4 sm:p-5"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-ink-soft">
                    {a.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.image_url}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-brilliant-cyan/70">
                        <Sparkles className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${tone.badge}`}>
                        <tone.Icon className="h-3.5 w-3.5" />
                        {a.verdict || 'Inconclusive'}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {formatDate(a.created_at)}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="font-display text-2xl font-bold text-platinum">
                      {typeof a.score === 'number' ? a.score : '—'}
                      {typeof a.score === 'number' && (
                        <span className="text-sm font-semibold text-muted-foreground">/100</span>
                      )}
                    </p>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Authenticity</p>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          /* Empty state */
          <div className="card-luxe relative overflow-hidden rounded-2xl px-6 py-12 text-center sm:py-16">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--brilliant-indigo)/0.18),transparent_60%)]" />
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brilliant text-white shadow-glow">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-display text-2xl font-bold">No tests yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Upload a photo of your stone and get an instant, gemologist-trained verdict — real diamond,
              moissanite, cubic zirconia or glass. It’s free.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="sheen">
                <Link href="/#tester">
                  <Sparkles className="h-4 w-4" /> Test a diamond
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/blog">
                  <BookOpen className="h-4 w-4" /> Browse guides
                </Link>
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Quick links — only when the user already has activity */}
      {hasScans && (
        <section className="grid gap-5 sm:grid-cols-2">
          <Link
            href="/#tester"
            className="card-luxe group flex items-center gap-4 rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-0.5"
          >
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brilliant-soft text-brilliant-cyan">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display font-semibold text-platinum">Run a new test</p>
              <p className="text-sm text-muted-foreground">Screen another stone in seconds</p>
            </div>
            <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-brilliant-cyan" />
          </Link>

          <Link
            href="/blog"
            className="card-luxe group flex items-center gap-4 rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-0.5"
          >
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brilliant-soft text-brilliant-cyan">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display font-semibold text-platinum">Browse guides</p>
              <p className="text-sm text-muted-foreground">Gemologist-written diamond knowledge</p>
            </div>
            <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-brilliant-cyan" />
          </Link>
        </section>
      )}
    </div>
  )
}
