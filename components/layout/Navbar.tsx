'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import { site } from '@/lib/site'
import { cn } from '@/lib/utils'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-3">
      <nav
        className={cn(
          'flex w-full max-w-6xl items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-500',
          scrolled
            ? 'glass shadow-card'
            : 'border border-transparent bg-transparent',
        )}
      >
        <Link href="/" aria-label={site.name}>
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {site.nav.map((it) => {
            const active = pathname === it.href
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  'relative rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'text-platinum'
                    : 'text-platinum-muted hover:text-platinum',
                )}
              >
                {active && (
                  <span className="absolute inset-0 -z-10 rounded-full bg-secondary/60" />
                )}
                {it.label}
              </Link>
            )
          })}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/contact">Talk to an expert</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/identify">Test my diamond</Link>
          </Button>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-full border border-border text-platinum lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-x-4 top-20 z-40 origin-top animate-fade-up rounded-2xl glass p-4 shadow-glow-lg lg:hidden">
          <div className="flex flex-col">
            {site.nav.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className="rounded-xl px-4 py-3 text-base font-medium text-platinum-muted transition-colors hover:bg-secondary/60 hover:text-platinum"
              >
                {it.label}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/contact">Contact</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/identify">Test</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
