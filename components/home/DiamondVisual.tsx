'use client'
import { motion, useReducedMotion } from 'framer-motion'

/** Animated brilliant-cut diamond — orbiting sparkles, drifting glow, gentle float. */
export function DiamondVisual() {
  const reduce = useReducedMotion()
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px]">
      {/* glow */}
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,hsl(var(--brilliant-indigo)/0.45),transparent_60%)] blur-2xl" />
      {/* rotating facet ring */}
      <motion.div
        className="absolute inset-6 rounded-full border border-brilliant-cyan/20"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
      >
        {[0, 90, 180, 270].map((deg) => (
          <span
            key={deg}
            className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-brilliant-cyan shadow-[0_0_12px_hsl(var(--brilliant-cyan))]"
            style={{ transform: `rotate(${deg}deg) translateY(-1px)` }}
          />
        ))}
      </motion.div>

      <motion.div
        className="absolute inset-0 grid place-items-center"
        animate={reduce ? undefined : { y: [0, -14, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg viewBox="0 0 200 200" className="w-3/4 drop-shadow-[0_20px_60px_hsl(var(--brilliant-indigo)/0.6)]">
          <defs>
            <linearGradient id="hero-a" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(var(--brilliant-cyan))" />
              <stop offset="100%" stopColor="hsl(var(--brilliant-indigo))" />
            </linearGradient>
            <linearGradient id="hero-b" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--brilliant-indigo))" />
              <stop offset="100%" stopColor="hsl(var(--brilliant-violet))" />
            </linearGradient>
            <linearGradient id="hero-c" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--brilliant-violet))" />
              <stop offset="100%" stopColor="hsl(var(--brilliant-cyan))" />
            </linearGradient>
          </defs>
          {/* crown */}
          <polygon points="40,70 100,70 70,40" fill="url(#hero-a)" opacity="0.95" />
          <polygon points="100,70 160,70 130,40" fill="url(#hero-b)" opacity="0.9" />
          <polygon points="70,40 130,40 100,70" fill="url(#hero-c)" opacity="0.85" />
          <polygon points="40,70 70,40 100,70" fill="url(#hero-b)" opacity="0.6" />
          <polygon points="100,70 130,40 160,70" fill="url(#hero-a)" opacity="0.6" />
          {/* pavilion */}
          <polygon points="40,70 100,70 100,170" fill="url(#hero-a)" />
          <polygon points="100,70 160,70 100,170" fill="url(#hero-b)" />
          <polygon points="40,70 100,170 70,70" fill="url(#hero-c)" opacity="0.5" />
          {/* facet lines */}
          <g stroke="hsl(var(--ink))" strokeWidth="1.2" opacity="0.4" fill="none">
            <path d="M40 70 L100 170 L160 70" />
            <path d="M70 70 L100 170 M130 70 L100 170" />
            <path d="M70 40 L100 70 L130 40" />
          </g>
        </svg>
      </motion.div>

      {/* floating sparkles */}
      {!reduce &&
        [
          { x: '8%', y: '18%', d: 0 },
          { x: '86%', y: '30%', d: 1.2 },
          { x: '74%', y: '82%', d: 2.1 },
          { x: '14%', y: '70%', d: 0.6 },
        ].map((s, i) => (
          <motion.span
            key={i}
            className="absolute text-brilliant-cyan"
            style={{ left: s.x, top: s.y }}
            animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: s.d }}
          >
            ✦
          </motion.span>
        ))}
    </div>
  )
}
