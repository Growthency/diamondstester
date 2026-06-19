'use client'

import { useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ *
 * Model coefficients — clearly defined, transparent constants.
 * Price = PER_CARAT_BASE × carat^CARAT_EXPONENT × cut × colour × clarity
 * ------------------------------------------------------------------ */
const PER_CARAT_BASE = 4000 // USD per carat for a 1ct Ideal / D / FL reference
const CARAT_EXPONENT = 1.6 // value grows faster than weight
const BAND = 0.12 // ±12% low/high spread

const CUT = [
  { id: 'Ideal', mult: 1.15 },
  { id: 'Excellent', mult: 1.08 },
  { id: 'Very Good', mult: 1.0 },
  { id: 'Good', mult: 0.9 },
  { id: 'Fair', mult: 0.8 },
  { id: 'Poor', mult: 0.7 },
] as const

const COLOUR = [
  { id: 'D', mult: 1.25 },
  { id: 'E', mult: 1.18 },
  { id: 'F', mult: 1.12 },
  { id: 'G', mult: 1.05 },
  { id: 'H', mult: 1.0 },
  { id: 'I', mult: 0.9 },
  { id: 'J', mult: 0.8 },
  { id: 'K', mult: 0.7 },
] as const

const CLARITY = [
  { id: 'FL', mult: 1.4 },
  { id: 'IF', mult: 1.3 },
  { id: 'VVS1', mult: 1.22 },
  { id: 'VVS2', mult: 1.15 },
  { id: 'VS1', mult: 1.08 },
  { id: 'VS2', mult: 1.0 },
  { id: 'SI1', mult: 0.88 },
  { id: 'SI2', mult: 0.76 },
  { id: 'I1', mult: 0.6 },
] as const

const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function Option<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly { id: T; mult: number }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div>
      <Label className="text-platinum">{label}</Label>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            aria-pressed={value === o.id}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm font-medium transition-all duration-200',
              value === o.id
                ? 'border-brilliant-cyan/60 bg-brilliant-soft text-brilliant-cyan'
                : 'border-border bg-secondary/30 text-platinum-muted hover:border-brilliant-cyan/40 hover:text-platinum',
            )}
          >
            {o.id}
          </button>
        ))}
      </div>
    </div>
  )
}

export function PriceEstimator() {
  const [carat, setCarat] = useState(1.0)
  const [cut, setCut] = useState<(typeof CUT)[number]['id']>('Ideal')
  const [colour, setColour] = useState<(typeof COLOUR)[number]['id']>('F')
  const [clarity, setClarity] = useState<(typeof CLARITY)[number]['id']>('VS1')

  const { low, high, mid } = useMemo(() => {
    const cutMult = CUT.find((c) => c.id === cut)!.mult
    const colourMult = COLOUR.find((c) => c.id === colour)!.mult
    const clarityMult = CLARITY.find((c) => c.id === clarity)!.mult
    const base = PER_CARAT_BASE * Math.pow(carat, CARAT_EXPONENT)
    const mid = base * cutMult * colourMult * clarityMult
    return { low: mid * (1 - BAND), high: mid * (1 + BAND), mid }
  }, [carat, cut, colour, clarity])

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      {/* Inputs */}
      <div className="card-luxe rounded-2xl p-6 sm:p-8">
        <div>
          <div className="flex items-baseline justify-between">
            <Label className="text-platinum">Carat weight</Label>
            <span className="font-display text-lg font-bold text-gradient">{carat.toFixed(2)} ct</span>
          </div>
          <input
            type="range"
            min={0.2}
            max={5}
            step={0.01}
            value={carat}
            onChange={(e) => setCarat(parseFloat(e.target.value))}
            aria-label="Carat weight"
            className="mt-4 w-full cursor-pointer appearance-none rounded-full bg-secondary/60 accent-[hsl(var(--brilliant-cyan))]"
            style={{ height: 6 }}
          />
          <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
            <span>0.20 ct</span>
            <span>5.00 ct</span>
          </div>
        </div>

        <div className="mt-7 space-y-6">
          <Option label="Cut" options={CUT} value={cut} onChange={setCut} />
          <Option label="Colour" options={COLOUR} value={colour} onChange={setColour} />
          <Option label="Clarity" options={CLARITY} value={clarity} onChange={setClarity} />
        </div>
      </div>

      {/* Result */}
      <div className="card-luxe relative flex flex-col items-center justify-center overflow-hidden rounded-2xl p-8 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--brilliant-violet)/0.26),transparent_65%)]" />
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-brilliant-soft text-brilliant-cyan">
          <Sparkles className="h-6 w-6" />
        </div>
        <p className="mt-5 text-xs font-medium uppercase tracking-[0.2em] text-platinum-muted">
          Indicative range
        </p>
        <p className="mt-2 font-display text-4xl font-extrabold leading-tight text-gradient sm:text-[2.6rem]">
          {usd(low)}
        </p>
        <p className="text-sm font-medium text-platinum-muted">to</p>
        <p className="font-display text-4xl font-extrabold leading-tight text-gradient sm:text-[2.6rem]">
          {usd(high)}
        </p>
        <p className="mt-4 text-sm text-muted-foreground">Midpoint ≈ {usd(mid)}</p>
        <p className="mt-6 max-w-xs text-xs leading-relaxed text-muted-foreground">
          Indicative only. Real prices move with fluorescence, exact proportions and live demand —
          this is a starting point, not an appraisal.
        </p>
      </div>
    </div>
  )
}
