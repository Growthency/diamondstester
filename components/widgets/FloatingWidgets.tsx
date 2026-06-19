'use client'
import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { whatsappHref, site } from '@/lib/site'

/** Real WhatsApp glyph (brand icon) so it reads as the genuine app, not a generic chat bubble. */
function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden>
      <path d="M16.04 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.6 4.46 1.73 6.4L3.2 28.8l6.56-1.72a12.74 12.74 0 0 0 6.28 1.64h.01c7.06 0 12.8-5.74 12.8-12.8 0-3.42-1.33-6.64-3.75-9.06A12.7 12.7 0 0 0 16.04 3.2Zm0 23.36h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-4.02 1.05 1.07-3.92-.25-.4a10.56 10.56 0 1 1 19.6-5.58c0 5.86-4.77 10.56-10.6 10.56Zm5.8-7.9c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.56-1.58-.95-.84-1.59-1.88-1.77-2.2-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.55-.08-.16-.71-1.72-.98-2.35-.26-.62-.52-.54-.71-.55l-.61-.01c-.21 0-.55.08-.84.4-.29.32-1.1 1.08-1.1 2.63 0 1.55 1.13 3.05 1.29 3.26.16.21 2.22 3.39 5.38 4.76.75.32 1.34.52 1.8.66.76.24 1.44.21 1.98.13.6-.09 1.88-.77 2.14-1.51.26-.74.26-1.38.18-1.51-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  )
}

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
      {/* WhatsApp — bottom-left */}
      <a
        href={whatsappHref()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Chat with ${site.name} on WhatsApp`}
        className="group fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_30px_-4px_rgba(37,211,102,0.6)] transition-transform duration-300 hover:scale-110"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-40 [animation-duration:2.4s]" />
        <WhatsAppGlyph className="relative h-8 w-8" />
        <span className="pointer-events-none absolute left-16 whitespace-nowrap rounded-full bg-ink-elevated px-3 py-1.5 text-xs font-medium text-platinum opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100">
          Chat on WhatsApp
        </span>
      </a>

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
