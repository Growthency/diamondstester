'use client'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * Site-wide living backdrop: drifting gradient "aurora" blobs + a faint grid.
 * Fixed behind everything so every section appears to have moving colour as
 * you scroll. Cheap (transform/opacity only) and respects reduced-motion.
 */
export function AuroraBackground() {
  const reduce = useReducedMotion()
  const drift = reduce ? {} : { className: 'aurora animate-blob-drift' }

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* deep base wash */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_-10%,hsl(var(--ink-soft)),hsl(var(--ink)))]" />
      {/* drifting blobs */}
      <motion.div
        {...drift}
        className="aurora animate-blob-drift left-[-10%] top-[-5%] h-[42vw] w-[42vw] bg-[hsl(var(--brilliant-indigo)/0.5)]"
      />
      <motion.div
        {...drift}
        className="aurora animate-blob-drift right-[-8%] top-[20%] h-[34vw] w-[34vw] bg-[hsl(var(--brilliant-cyan)/0.4)] [animation-delay:-6s]"
      />
      <motion.div
        {...drift}
        className="aurora animate-blob-drift bottom-[-10%] left-[25%] h-[38vw] w-[38vw] bg-[hsl(var(--brilliant-violet)/0.38)] [animation-delay:-12s]"
      />
      {/* grid + vignette */}
      <div className="absolute inset-0 bg-grid opacity-[0.18] mask-fade-b" />
      <div className="absolute inset-0 bg-[radial-gradient(100%_60%_at_50%_120%,hsl(var(--ink)),transparent)]" />
    </div>
  )
}
