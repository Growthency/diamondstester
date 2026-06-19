'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShieldCheck, AlertTriangle, Sparkles, RotateCcw, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Observation { feature: string; finding: string }
interface AnalysisResult {
  isGemstone: boolean
  verdict: string
  stoneType: string
  confidence: string
  authenticityScore: number
  summary: string
  observations: Observation[]
  estimated4Cs: { cut?: string; color?: string; clarity?: string; caratHint?: string }
  redFlags: string[]
  recommendation: string
  limitations: string
}

function scoreColor(score: number) {
  if (score >= 80) return { stroke: '#34d399', text: 'text-emerald-400' }
  if (score >= 45) return { stroke: '#fbbf24', text: 'text-amber-400' }
  return { stroke: '#fb7185', text: 'text-red-400' }
}

function Gauge({ score }: { score: number }) {
  const R = 52
  const C = 2 * Math.PI * R
  const c = scoreColor(score)
  return (
    <div className="relative grid h-40 w-40 shrink-0 place-items-center">
      <svg viewBox="0 0 120 120" className="-rotate-90">
        <circle cx="60" cy="60" r={R} fill="none" stroke="hsl(var(--border))" strokeWidth="9" />
        <motion.circle
          cx="60" cy="60" r={R} fill="none" stroke={c.stroke} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={C} initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C - (Math.max(0, Math.min(100, score)) / 100) * C }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute text-center">
        <div className={cn('font-display text-4xl font-bold', c.text)}>{score}</div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">diamond-like</div>
      </div>
    </div>
  )
}

export function ResultView() {
  const router = useRouter()
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const r = localStorage.getItem('ciq_last_result')
      const im = localStorage.getItem('ciq_scan_images')
      if (r) setResult(JSON.parse(r))
      if (im) setImages(JSON.parse(im))
    } catch {}
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready && !result) router.replace('/identify')
  }, [ready, result, router])

  if (!ready || !result) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-brilliant-cyan" />
      </div>
    )
  }

  const score = result.authenticityScore ?? 0
  const positive = score >= 80
  const mid = score >= 45 && score < 80

  return (
    <div className="mx-auto max-w-4xl">
      {images.length > 0 && (
        <div className="mb-6 flex flex-wrap justify-center gap-3">
          {images.map((src, i) => (
            <img key={i} src={src} alt={`Your diamond ${i + 1}`} className="h-24 w-24 rounded-xl border border-border object-cover sm:h-28 sm:w-28" />
          ))}
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card-luxe rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <Gauge score={score} />
          <div className="text-center sm:text-left">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium">
              {positive ? <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> : mid ? <Sparkles className="h-3.5 w-3.5 text-amber-400" /> : <AlertTriangle className="h-3.5 w-3.5 text-red-400" />}
              Confidence: {result.confidence}
            </div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">{result.verdict}</h1>
            <p className="mt-1 text-sm text-brilliant-cyan">Best match: {result.stoneType}</p>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">{result.summary}</p>
          </div>
        </div>

        {!!result.observations?.length && (
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {result.observations.map((o, i) => (
              <div key={i} className="rounded-xl border border-border bg-secondary/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-brilliant-cyan">{o.feature}</p>
                <p className="mt-1 text-sm text-platinum">{o.finding}</p>
              </div>
            ))}
          </div>
        )}

        {result.estimated4Cs && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estimated 4Cs (from photo)</p>
            <div className="flex flex-wrap gap-2">
              {[['Cut', result.estimated4Cs.cut], ['Colour', result.estimated4Cs.color], ['Clarity', result.estimated4Cs.clarity], ['Carat', result.estimated4Cs.caratHint]]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <span key={k as string} className="rounded-full bg-brilliant-soft px-3 py-1.5 text-xs text-platinum">
                    <span className="text-muted-foreground">{k}: </span>{v}
                  </span>
                ))}
            </div>
          </div>
        )}

        {!!result.redFlags?.length && (
          <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-red-300"><AlertTriangle className="h-4 w-4" /> Watch-outs</p>
            <ul className="mt-2 space-y-1">{result.redFlags.map((f, i) => <li key={i} className="text-sm text-red-200/90">• {f}</li>)}</ul>
          </div>
        )}

        <div className="mt-6 rounded-xl border border-border bg-secondary/20 p-4 text-sm">
          <p className="text-platinum"><span className="font-semibold text-brilliant-cyan">Recommended: </span>{result.recommendation}</p>
          <p className="mt-2 text-xs italic text-muted-foreground">{result.limitations}</p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="sheen"><Link href="/verify">Book a definitive lab test <ArrowRight className="h-4 w-4" /></Link></Button>
          <Button asChild variant="outline" size="lg"><Link href="/identify"><RotateCcw className="h-4 w-4" /> Test another stone</Link></Button>
        </div>
        <p className="mt-4 text-center text-[11px] text-muted-foreground">An AI photo screen is a guide, not a certificate. For insurance or resale, confirm with a lab test.</p>
      </motion.div>
    </div>
  )
}
