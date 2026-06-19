'use client'

import { useMemo, useState } from 'react'
import { Gem } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/** Shape-specific volume coefficients (carat per mm³ of L×W×depth). */
const SHAPES = [
  { id: 'round', label: 'Round', factor: 0.0061, round: true },
  { id: 'princess', label: 'Princess', factor: 0.0083, round: false },
  { id: 'oval', label: 'Oval', factor: 0.0062, round: false },
  { id: 'emerald', label: 'Emerald', factor: 0.008, round: false },
  { id: 'cushion', label: 'Cushion', factor: 0.00815, round: false },
  { id: 'pear', label: 'Pear', factor: 0.00615, round: false },
] as const

type ShapeId = (typeof SHAPES)[number]['id']

function parse(value: string): number {
  const n = parseFloat(value)
  return Number.isFinite(n) && n > 0 ? n : 0
}

export function CaratCalculator() {
  const [shape, setShape] = useState<ShapeId>('round')
  const [length, setLength] = useState('6.5')
  const [width, setWidth] = useState('6.5')
  const [depth, setDepth] = useState('4.0')

  const active = SHAPES.find((s) => s.id === shape)!

  const carat = useMemo(() => {
    const l = parse(length)
    const w = active.round ? l : parse(width)
    const d = parse(depth)
    if (!l || !w || !d) return 0
    if (active.round) {
      // round = diameter² × depth × 0.0061
      return l * l * d * active.factor
    }
    return l * w * d * active.factor
  }, [active, length, width, depth])

  const grams = carat * 0.2
  const hasInput = carat > 0

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      {/* Inputs */}
      <div className="card-luxe rounded-2xl p-6 sm:p-8">
        <div>
          <Label className="text-platinum">Diamond shape</Label>
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            {SHAPES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setShape(s.id)}
                aria-pressed={shape === s.id}
                className={cn(
                  'rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  shape === s.id
                    ? 'border-brilliant-cyan/60 bg-brilliant-soft text-brilliant-cyan shadow-glow'
                    : 'border-border bg-secondary/30 text-platinum-muted hover:border-brilliant-cyan/40 hover:text-platinum',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-3">
          <div>
            <Label htmlFor="length">{active.round ? 'Diameter (mm)' : 'Length (mm)'}</Label>
            <Input
              id="length"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="width" className={active.round ? 'opacity-50' : ''}>
              Width (mm)
            </Label>
            <Input
              id="width"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={active.round ? length : width}
              onChange={(e) => setWidth(e.target.value)}
              disabled={active.round}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="depth">Depth (mm)</Label>
            <Input
              id="depth"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={depth}
              onChange={(e) => setDepth(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>

        {active.round && (
          <p className="mt-4 text-xs text-muted-foreground">
            Round brilliants are symmetrical, so width tracks the diameter automatically.
          </p>
        )}
      </div>

      {/* Result */}
      <div className="card-luxe relative flex flex-col items-center justify-center overflow-hidden rounded-2xl p-8 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--brilliant-indigo)/0.28),transparent_65%)]" />
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-brilliant-soft text-brilliant-cyan">
          <Gem className="h-6 w-6" />
        </div>
        <p className="mt-5 text-xs font-medium uppercase tracking-[0.2em] text-platinum-muted">
          Estimated weight
        </p>
        <p className="mt-2 font-display text-6xl font-extrabold leading-none text-gradient">
          {hasInput ? carat.toFixed(2) : '—'}
        </p>
        <p className="mt-1 text-sm font-medium text-platinum">carats</p>
        {hasInput && (
          <p className="mt-4 text-sm text-muted-foreground">
            ≈ {grams.toFixed(3)} g · {active.label} cut
          </p>
        )}
        <p className="mt-6 max-w-xs text-xs leading-relaxed text-muted-foreground">
          This is an estimate from measurements alone. Cut precision and girdle thickness can shift
          actual weight by several points.
        </p>
      </div>
    </div>
  )
}
