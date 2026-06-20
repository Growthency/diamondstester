'use client'
import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export function FloatingWidgets() {
  const [progress, setProgress] = useState(0)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const scrollable = el.scrollHeight - el.clientHeight
      const pct = scrollable > 0 ? (el.scrollTop / scrollable) * 100 : 0
      setProgress(pct)
      setShow(el.scrollTop > 420)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const R = 26
  const C = 2 * Math.PI * R
  const dash = C - (progress / 100) * C

  return (
    <>
      {/* Scroll-to-top with circular % ring — bottom-right */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 ${
          show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
        }`}
      >
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r={R} fill="hsl(var(--ink-soft))" stroke="hsl(var(--border))" strokeWidth="3" />
          <circle
            cx="30"
            cy="30"
            r={R}
            fill="none"
            stroke="url(#ciq-ring)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={dash}
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
          />
          <defs>
            <linearGradient id="ciq-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(var(--brilliant-cyan))" />
              <stop offset="55%" stopColor="hsl(var(--brilliant-indigo))" />
              <stop offset="100%" stopColor="hsl(var(--brilliant-violet))" />
            </linearGradient>
          </defs>
        </svg>
        <ArrowUp className="relative h-5 w-5 text-platinum" />
      </button>
    </>
  )
}
