'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Sparkles,
  History,
  Bookmark,
  Settings,
  LogOut,
  Menu,
  X,
  ArrowLeft,
  type LucideIcon,
} from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const NAV: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/#tester', label: 'New Test', icon: Sparkles },
  { href: '/dashboard/history', label: 'Scan History', icon: History },
  { href: '/dashboard/saved', label: 'Saved Articles', icon: Bookmark },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

/** Bottom tab bar shows the most-used destinations on mobile. */
const MOBILE_TABS: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/#tester', label: 'Test', icon: Sparkles },
  { href: '/dashboard/history', label: 'History', icon: History },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard'
  if (href.startsWith('/#')) return false
  return pathname === href || pathname.startsWith(href + '/')
}

function pageTitle(pathname: string) {
  const match = NAV.find((n) => isActive(pathname, n.href))
  return match?.label ?? 'Overview'
}

export function DashboardShell({
  user,
  children,
}: {
  user: { id: string; email: string }
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    if (signingOut) return
    setSigningOut(true)
    try {
      await createClient().auth.signOut()
    } finally {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Aurora backdrop */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-8%] top-[-10%] h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,hsl(var(--brilliant-indigo)/0.18),transparent_62%)] blur-3xl" />
        <div className="absolute right-[-10%] top-1/2 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,hsl(var(--brilliant-violet)/0.14),transparent_60%)] blur-3xl" />
      </div>

      {/* ===== Desktop sidebar ===== */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-ink-soft/60 backdrop-blur-xl lg:flex">
        <SidebarContent
          pathname={pathname}
          onNavigate={() => {}}
        />
      </aside>

      {/* ===== Mobile drawer ===== */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[82%] flex-col border-r border-border bg-ink-soft/95 backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 grid h-9 w-9 place-items-center rounded-lg text-platinum-muted transition-colors hover:bg-secondary/60 hover:text-platinum"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent
              pathname={pathname}
              onNavigate={() => setDrawerOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* ===== Main column ===== */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-platinum-muted transition-colors hover:bg-secondary/60 hover:text-platinum lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <h1 className="truncate font-display text-lg font-semibold text-platinum">
              {pageTitle(pathname)}
            </h1>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <span className="hidden max-w-[200px] truncate text-sm text-muted-foreground sm:inline">
                {user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                disabled={signingOut}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {signingOut ? 'Signing out…' : 'Sign out'}
                </span>
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="px-4 pb-28 pt-6 sm:px-6 sm:pb-10 sm:pt-8 lg:px-10">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>

      {/* ===== Mobile bottom tab bar ===== */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-ink-soft/90 backdrop-blur-xl lg:hidden">
        <ul className="grid grid-cols-4">
          {MOBILE_TABS.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                    active
                      ? 'text-brilliant-cyan'
                      : 'text-platinum-muted hover:text-platinum',
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate: () => void
}) {
  return (
    <>
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href="/dashboard" onClick={onNavigate} aria-label="CaratIQ dashboard">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Account
        </p>
        <ul className="space-y-1">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                    active
                      ? 'bg-brilliant-soft text-brilliant-cyan'
                      : 'text-platinum-muted hover:bg-secondary/50 hover:text-platinum',
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-[18px] w-[18px] shrink-0 transition-colors',
                      active ? 'text-brilliant-cyan' : 'text-muted-foreground group-hover:text-platinum',
                    )}
                  />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-platinum-muted transition-colors hover:bg-secondary/50 hover:text-platinum"
        >
          <ArrowLeft className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
          Back to site
        </Link>
      </div>
    </>
  )
}
