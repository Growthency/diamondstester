'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Smoothly scrolls to in-page anchors (e.g. /#tester):
 *  - when landing on a URL that already has a hash (cross-page nav), and
 *  - when clicking a same-page hash link (App Router otherwise jumps/ignores it).
 * The fixed navbar offset is handled by each target's `scroll-mt-*` class.
 */
export function HashScroll() {
  const pathname = usePathname()

  useEffect(() => {
    const scrollToHash = (hash: string) => {
      const id = hash.replace(/^#/, '')
      if (!id) return
      const el = document.getElementById(id)
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
    }

    // On load / route change with a hash present
    if (window.location.hash) scrollToHash(window.location.hash)

    const onHashChange = () => scrollToHash(window.location.hash)

    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href') || ''
      const match = href.match(/#([\w-]+)$/)
      if (!match) return
      const samePage =
        href.startsWith('#') ||
        href.startsWith('/#') ||
        href.startsWith(window.location.pathname + '#')
      if (!samePage) return
      const el = document.getElementById(match[1])
      if (!el) return
      e.preventDefault()
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      history.replaceState(null, '', `#${match[1]}`)
    }

    window.addEventListener('hashchange', onHashChange)
    document.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('hashchange', onHashChange)
      document.removeEventListener('click', onClick)
    }
  }, [pathname])

  return null
}
