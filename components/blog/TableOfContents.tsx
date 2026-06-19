'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { Heading } from '@/lib/markdown'

/**
 * Sticky desktop table of contents. Hidden on mobile. Anchor links jump to the
 * matching heading id (injected by renderMarkdown). The active section is
 * highlighted as the reader scrolls.
 */
export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (!headings.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 },
    )

    const nodes = headings
      .map((h) => document.getElementById(h.id))
      .filter((n): n is HTMLElement => Boolean(n))
    nodes.forEach((n) => observer.observe(n))

    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 2) return null

  return (
    <nav aria-label="Table of contents" className="hidden lg:block">
      <div className="sticky top-28">
        <p className="eyebrow mb-4">On this page</p>
        <ul className="space-y-1 border-l border-border">
          {headings.map((h) => {
            const active = activeId === h.id
            return (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  className={cn(
                    '-ml-px block border-l-2 py-1.5 text-sm transition-colors',
                    h.level === 3 ? 'pl-7' : 'pl-4',
                    active
                      ? 'border-brilliant-cyan font-medium text-brilliant-cyan'
                      : 'border-transparent text-muted-foreground hover:border-border hover:text-platinum',
                  )}
                >
                  {h.text}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
