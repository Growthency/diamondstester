import Link from 'next/link'
import type { Metadata } from 'next'
import {
  Sparkles,
  ScanLine,
  Gem,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  PlugZap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient, hasSupabaseConfig } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Test history — Diamonds Tester',
  robots: { index: false, follow: false },
}

interface AnalysisResult {
  verdict?: string
  stoneType?: string
  confidence?: string | number
  authenticityScore?: number
  summary?: string
}

interface Analysis {
  id: string
  verdict: string | null
  score: number | null
  result: AnalysisResult | null
  image_url: string | null
  created_at: string
}

/** Colour an authenticity score chip: >=80 emerald, 45–79 amber, else red. */
function scoreTone(score: number | null) {
  if (typeof score !== 'number') {
    return {
      Icon: HelpCircle,
      chip: 'border-border bg-secondary/50 text-muted-foreground',
      ring: 'text-muted-foreground',
    }
  }
  if (score >= 80) {
    return {
      Icon: CheckCircle2,
      chip: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
      ring: 'text-emerald-300',
    }
  }
  if (score >= 45) {
    return {
      Icon: HelpCircle,
      chip: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
      ring: 'text-amber-300',
    }
  }
  return {
    Icon: AlertTriangle,
    chip: 'border-destructive/30 bg-destructive/10 text-red-300',
    ring: 'text-red-300',
  }
}

function formatConfidence(confidence: string | number | undefined) {
  if (confidence === undefined || confidence === null) return null
  if (typeof confidence === 'number') return `${Math.round(confidence)}% confidence`
  const trimmed = confidence.trim()
  if (!trimmed) return null
  // Already a sentence or a percentage — keep as-is, else label it.
  return /confidence/i.test(trimmed) ? trimmed : `${trimmed} confidence`
}

export default async function HistoryPage() {
  const configured = hasSupabaseConfig()
  let analyses: Analysis[] = []

  if (configured) {
    try {
      const supabase = await createClient()
      const { data } = await supabase
        .from('analyses')
        .select('*')
        .order('created_at', { ascending: false })
      analyses = (data as Analysis[] | null) ?? []
    } catch {
      analyses = []
    }
  }

  const hasScans = analyses.length > 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <p className="eyebrow">
          <ScanLine className="h-3.5 w-3.5 text-brilliant-cyan" />
          Your vault
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
          Test <span className="text-gradient">history</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Every stone you’ve screened, with its verdict, authenticity score and the details
          our analysis surfaced.
        </p>
      </header>

      {!configured && (
        <div className="card-luxe flex items-start gap-4 rounded-2xl p-6">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brilliant-soft text-brilliant-cyan">
            <PlugZap className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display font-semibold text-platinum">
              Connect your database to see past tests
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Once the connection is live, every diamond you screen will be archived here
              automatically.
            </p>
          </div>
        </div>
      )}

      {hasScans ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {analyses.map((a) => {
            const result = a.result ?? {}
            const score =
              typeof a.score === 'number'
                ? a.score
                : typeof result.authenticityScore === 'number'
                  ? result.authenticityScore
                  : null
            const tone = scoreTone(score)
            const verdict = a.verdict || result.verdict || 'Inconclusive'
            const stoneType = result.stoneType
            const confidence = formatConfidence(result.confidence)

            return (
              <li
                key={a.id}
                className="card-luxe group flex flex-col overflow-hidden rounded-2xl transition-transform duration-300 hover:-translate-y-0.5"
              >
                {/* Thumbnail */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-soft">
                  {a.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.image_url}
                      alt={`Stone tested on ${formatDate(a.created_at)}`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-brilliant-cyan/60">
                      <Gem className="h-9 w-9" />
                    </div>
                  )}
                  {/* Score chip overlay */}
                  {score !== null && (
                    <span
                      className={`absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur-md ${tone.chip}`}
                    >
                      <tone.Icon className="h-3.5 w-3.5" />
                      {score}/100
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-display text-lg font-semibold text-platinum">
                    {verdict}
                  </h2>

                  {(stoneType || confidence) && (
                    <p className="mt-1 text-sm text-platinum-muted">
                      {stoneType}
                      {stoneType && confidence ? ' · ' : ''}
                      {confidence && (
                        <span className="text-muted-foreground">{confidence}</span>
                      )}
                    </p>
                  )}

                  {result.summary && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {result.summary}
                    </p>
                  )}

                  <p className="mt-auto flex items-center gap-1.5 pt-4 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(a.created_at)}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        configured && (
          <div className="card-luxe relative overflow-hidden rounded-2xl px-6 py-12 text-center sm:py-16">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--brilliant-indigo)/0.18),transparent_60%)]" />
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brilliant text-white shadow-glow">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-bold">No tests yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Upload a photo of your stone for an instant, gemologist-trained verdict — real
              diamond, moissanite, cubic zirconia or glass. Your results live here.
            </p>
            <div className="mt-7">
              <Button asChild size="lg" className="sheen">
                <Link href="/#tester">
                  <Sparkles className="h-4 w-4" /> Test a diamond
                </Link>
              </Button>
            </div>
          </div>
        )
      )}
    </div>
  )
}
