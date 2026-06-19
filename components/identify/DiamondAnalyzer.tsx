'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Camera, Sparkles, Scan, Gem } from 'lucide-react'
import { cn } from '@/lib/utils'

/* Scanning steps shown during analysis */
const SCAN_STEPS = [
  'Processing your photos…',
  'Reading brilliance & fire…',
  'Mapping facet geometry…',
  'Screening for simulants…',
  'Compiling your verdict…',
]

/* The four ideal capture angles, drawn as on-brand SVG (no raster images). */
const ANGLES: { label: string; draw: 'table' | 'crown' | 'read' | 'girdle' }[] = [
  { label: 'Top', draw: 'table' },
  { label: 'Side', draw: 'crown' },
  { label: 'Through', draw: 'read' },
  { label: 'Girdle', draw: 'girdle' },
]

function AngleArt({ kind }: { kind: 'table' | 'crown' | 'read' | 'girdle' }) {
  const stroke = 'hsl(var(--brilliant-cyan))'
  return (
    <svg viewBox="0 0 60 60" className="h-full w-full">
      <rect width="60" height="60" rx="10" fill="hsl(var(--ink-soft))" />
      <g stroke={stroke} strokeWidth="1.4" fill="none" opacity="0.9">
        {kind === 'table' && (<>
          <polygon points="30,14 46,24 30,46 14,24" fill="hsl(var(--brilliant-indigo)/0.25)" />
          <path d="M14 24 H46 M30 14 L22 24 M30 14 L38 24" />
        </>)}
        {kind === 'crown' && (<>
          <path d="M14 26 H46 L30 48 Z" fill="hsl(var(--brilliant-indigo)/0.25)" />
          <path d="M18 20 H42 L46 26 H14 Z" />
        </>)}
        {kind === 'read' && (<>
          <polygon points="30,16 44,26 30,44 16,26" fill="hsl(var(--brilliant-indigo)/0.18)" />
          <path d="M22 30 h16 M24 35 h12" strokeWidth="1" opacity="0.6" />
        </>)}
        {kind === 'girdle' && (<>
          <ellipse cx="30" cy="28" rx="18" ry="7" fill="hsl(var(--brilliant-indigo)/0.22)" />
          <path d="M12 28 L30 46 L48 28" />
        </>)}
      </g>
    </svg>
  )
}

function resizeToDataUrl(file: File, max = 1100): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let w = img.width
        let h = img.height
        if (w > max || h > max) {
          if (w > h) { h = (h / w) * max; w = max } else { w = (w / h) * max; h = max }
        }
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

export function DiamondAnalyzer() {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [scanStep, setScanStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const progTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  function addFiles(list: FileList | File[]) {
    const incoming = Array.from(list).filter((f) => f.type.startsWith('image/'))
    if (!incoming.length) return
    setFiles((p) => [...p, ...incoming].slice(0, 4))
    setPreviews((p) => [...p, ...incoming.map((f) => URL.createObjectURL(f))].slice(0, 4))
    setError(null)
  }

  function removeFile(i: number) {
    setFiles((p) => p.filter((_, idx) => idx !== i))
    setPreviews((p) => { URL.revokeObjectURL(p[i]); return p.filter((_, idx) => idx !== i) })
  }

  function reset() {
    previews.forEach((u) => URL.revokeObjectURL(u))
    setFiles([])
    setPreviews([])
    setError(null)
  }

  function startScan() {
    setScanStep(0); setProgress(0)
    let s = 0, p = 0
    stepTimer.current = setInterval(() => { s = Math.min(s + 1, SCAN_STEPS.length - 1); setScanStep(s) }, 1700)
    progTimer.current = setInterval(() => { p = p < 88 ? p + 1 : p; setProgress(p) }, 90)
  }
  function stopScan() {
    if (stepTimer.current) clearInterval(stepTimer.current)
    if (progTimer.current) clearInterval(progTimer.current)
    setProgress(100)
  }

  async function analyze() {
    if (!files.length) return
    setAnalyzing(true); setError(null); startScan()
    try {
      const images = await Promise.all(files.map((f) => resizeToDataUrl(f)))
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images }),
      })
      const data = await res.json()
      stopScan()
      if (data.ok && data.result) {
        try {
          localStorage.setItem('ciq_last_result', JSON.stringify(data.result))
          localStorage.setItem('ciq_scan_images', JSON.stringify(images))
        } catch {}
        router.push('/result')
        return
      }
      setError(data.message || data.error || 'Analysis failed. Please try again.')
      setAnalyzing(false)
    } catch {
      stopScan()
      setError('Network error. Please try again.')
      setAnalyzing(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* ── Left: upload panel ── */}
        <div className="card-luxe rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brilliant text-white">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-platinum">Upload Diamond Photos</p>
                <p className="text-xs text-muted-foreground">Multi-angle analysis</p>
              </div>
            </div>
            <span className="rounded-full border border-border bg-brilliant-soft px-3 py-1 text-xs font-semibold text-brilliant-cyan">
              📷 Up to 4
            </span>
          </div>

          {files.length < 4 && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files) }}
              onClick={() => inputRef.current?.click()}
              className={cn(
                'mb-4 cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors',
                dragOver ? 'border-brilliant-cyan bg-brilliant-soft' : 'border-border hover:border-brilliant-cyan/60',
              )}
            >
              <Camera className="mx-auto mb-2 h-8 w-8 text-brilliant-cyan" />
              <p className="text-sm font-semibold text-platinum">Tap to upload photos</p>
              <p className="text-xs text-muted-foreground">{files.length}/4 photos · any format → auto WebP · max 10MB</p>
            </div>
          )}

          {previews.length > 0 && (
            <div className={cn('mb-4 grid gap-2', previews.length === 1 ? 'grid-cols-1' : 'grid-cols-2')}>
              {previews.map((url, i) => (
                <div key={i} className="group relative overflow-hidden rounded-xl" style={{ aspectRatio: '4/3' }}>
                  <img src={url} alt={`Diamond ${i + 1}`} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/30">
                    {!analyzing && (
                      <button onClick={(e) => { e.stopPropagation(); removeFile(i) }} className="grid h-8 w-8 place-items-center rounded-full bg-red-500/90 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">✕</button>
                    )}
                  </div>
                  <div className="absolute left-1.5 top-1.5 rounded-md bg-black/55 px-1.5 py-0.5 text-xs font-bold text-white">{i + 1}</div>
                  {analyzing && (
                    <div className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-white/20">
                      <div className="h-full w-2/5 bg-brilliant-cyan" style={{ animation: 'ciq-scanline 2s ease-in-out infinite' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!analyzing && (
            <div className="mt-2">
              <p className="mb-2 text-xs font-semibold text-brilliant-cyan">📷 For best results, capture these angles:</p>
              <div className="grid grid-cols-4 gap-2">
                {ANGLES.map((a) => (
                  <div key={a.label} className="flex flex-col items-center gap-1">
                    <div className="w-full overflow-hidden rounded-lg" style={{ aspectRatio: '1' }}>
                      <AngleArt kind={a.draw} />
                    </div>
                    <span className="text-xs text-muted-foreground">{a.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!analyzing && files.length > 0 && (
            <div className="mt-4 flex gap-3">
              <button onClick={reset} className="flex-1 rounded-xl border border-border py-3 text-sm font-medium text-platinum transition-colors hover:bg-secondary/60">Clear</button>
              <button onClick={analyze} className="sheen flex flex-1 items-center justify-center gap-2 rounded-xl bg-brilliant py-3 text-sm font-semibold text-white shadow-glow">
                <Sparkles className="h-4 w-4" /> Test {files.length} Photo{files.length > 1 ? 's' : ''}
              </button>
            </div>
          )}

          {analyzing && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-brilliant-cyan/40 bg-brilliant-soft p-3">
              <Scan className="h-4 w-4 shrink-0 animate-pulse text-brilliant-cyan" />
              <p className="text-xs font-medium text-brilliant-cyan">{SCAN_STEPS[scanStep]}</p>
            </div>
          )}
        </div>

        {/* ── Right: scanning animation OR anatomy guide ── */}
        {analyzing ? (
          <div className="relative flex flex-col items-center justify-center rounded-2xl border border-brilliant-cyan/40 bg-card p-8" style={{ minHeight: 360 }}>
            <div className="relative mb-6 flex items-center justify-center">
              <span className="absolute h-28 w-28 animate-ping rounded-full bg-brilliant-cyan/20" />
              <span className="absolute h-20 w-20 animate-pulse rounded-full bg-brilliant-cyan/30" />
              <div className="z-10 grid h-16 w-16 place-items-center rounded-2xl bg-brilliant shadow-glow">
                <Gem className="h-8 w-8 text-white" />
              </div>
              <span className="absolute h-3 w-3 rounded-full bg-brilliant-cyan" style={{ animation: 'ciq-orbit 1.4s linear infinite', transformOrigin: '0 40px' }} />
            </div>
            <p className="mb-1 text-center font-display text-xl font-bold text-platinum">Analyzing your diamond…</p>
            <p className="mb-6 text-center text-sm text-muted-foreground">{SCAN_STEPS[scanStep]}</p>
            <div className="w-full max-w-xs">
              <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                <span>AI Processing</span><span className="text-brilliant-cyan">{progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-secondary">
                <div className="h-full rounded-full bg-brilliant transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-4 flex justify-center gap-1">
                {SCAN_STEPS.map((_, i) => (
                  <div key={i} className="h-1.5 rounded-full transition-all duration-500" style={{ width: i <= scanStep ? 24 : 8, background: i <= scanStep ? 'hsl(var(--brilliant-cyan))' : 'hsl(var(--border))' }} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex flex-1 items-center justify-center p-6">
              <svg viewBox="0 0 200 200" className="w-3/4 max-w-[260px]">
                <defs>
                  <linearGradient id="ciq-guide-a" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="hsl(var(--brilliant-cyan))" /><stop offset="100%" stopColor="hsl(var(--brilliant-indigo))" /></linearGradient>
                  <linearGradient id="ciq-guide-b" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--brilliant-indigo))" /><stop offset="100%" stopColor="hsl(var(--brilliant-violet))" /></linearGradient>
                </defs>
                <polygon points="40,70 100,70 70,40" fill="url(#ciq-guide-a)" opacity="0.9" />
                <polygon points="100,70 160,70 130,40" fill="url(#ciq-guide-b)" opacity="0.9" />
                <polygon points="70,40 130,40 100,70" fill="url(#ciq-guide-a)" opacity="0.75" />
                <polygon points="40,70 100,70 100,170" fill="url(#ciq-guide-a)" />
                <polygon points="100,70 160,70 100,170" fill="url(#ciq-guide-b)" />
                <g stroke="hsl(var(--ink))" strokeWidth="1.2" opacity="0.4" fill="none">
                  <path d="M40 70 L100 170 L160 70 M70 70 L100 170 M130 70 L100 170 M70 40 L100 70 L130 40" />
                </g>
                {/* labels */}
                <g fill="hsl(var(--platinum-muted))" fontSize="8" fontFamily="sans-serif">
                  <text x="100" y="34" textAnchor="middle">Table</text>
                  <text x="168" y="72" textAnchor="start">Crown</text>
                  <text x="100" y="186" textAnchor="middle">Pavilion</text>
                </g>
              </svg>
            </div>
            <div className="border-t border-border bg-secondary/30 px-6 py-4">
              <p className="text-sm font-semibold text-platinum">Diamond Profile</p>
              <p className="text-xs text-muted-foreground">Photograph each labelled part for the most accurate AI read.</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes ciq-scanline { 0% { transform: translateX(-100%) } 100% { transform: translateX(350%) } }
        @keyframes ciq-orbit { from { transform: rotate(0deg) translateX(40px) rotate(0deg) } to { transform: rotate(360deg) translateX(40px) rotate(-360deg) } }
      `}</style>

      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && addFiles(e.target.files)} />
    </div>
  )
}
