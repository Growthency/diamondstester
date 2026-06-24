'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  FileText,
  Gem,
  Home,
  ImageIcon,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Settings,
  ShieldCheck,
  TrendingUp,
  ScanSearch,
  ListTree,
  Code2,
  PanelBottom,
  ExternalLink,
  Palette,
  Paintbrush,
  X,
  type LucideIcon,
} from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { logoutAction } from './actions'

interface NavLink {
  href: string
  label: string
  icon: LucideIcon
}

const NAV: { section: string; links: NavLink[] }[] = [
  {
    section: 'Overview',
    links: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    section: 'Content',
    links: [
      { href: '/admin/blog', label: 'Blog Posts', icon: FileText },
      { href: '/admin/homepage', label: 'Homepage', icon: Home },
      { href: '/admin/media', label: 'Media Library', icon: ImageIcon },
    ],
  },
  {
    section: 'SEO',
    links: [
      { href: '/admin/seo-health', label: 'SEO Health', icon: ShieldCheck },
      { href: '/admin/rank-tracker', label: 'Rank Tracker', icon: TrendingUp },
      { href: '/admin/indexing-report', label: 'Indexing Report', icon: ScanSearch },
    ],
  },
  {
    section: 'Customize',
    links: [
      { href: '/admin/menus', label: 'Menus', icon: ListTree },
      { href: '/admin/header-scripts', label: 'Header Scripts', icon: Code2 },
      { href: '/admin/footer-content', label: 'Footer Content', icon: PanelBottom },
      { href: '/admin/external-links', label: 'External Links', icon: ExternalLink },
      { href: '/admin/theme-colors', label: 'Theme Colors', icon: Palette },
      { href: '/admin/custom-css', label: 'Custom CSS', icon: Paintbrush },
    ],
  },
  {
    section: 'Inbound',
    links: [
      { href: '/admin/messages', label: 'Messages', icon: Mail },
      { href: '/admin/test-requests', label: 'Test Requests', icon: Gem },
    ],
  },
  {
    section: 'System',
    links: [
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
      { href: '/admin/vault', label: 'Vault', icon: KeyRound },
    ],
  },
]

function isActive(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin'
  return pathname === href || pathname.startsWith(href + '/')
}

function pageTitle(pathname: string): string {
  for (const group of NAV) {
    for (const link of group.links) {
      if (isActive(pathname, link.href)) return link.label
    }
  }
  return 'Admin'
}

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
      {NAV.map((group) => (
        <div key={group.section}>
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {group.section}
          </p>
          <ul className="space-y-1">
            {group.links.map((link) => {
              const active = isActive(pathname, link.href)
              const Icon = link.icon
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onNavigate}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-brilliant-soft text-brilliant-cyan shadow-[inset_0_0_0_1px_hsl(var(--brilliant-cyan)/0.25)]'
                        : 'text-muted-foreground hover:bg-secondary/50 hover:text-platinum',
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-[18px] w-[18px] shrink-0 transition-colors',
                        active ? 'text-brilliant-cyan' : 'text-muted-foreground group-hover:text-platinum',
                      )}
                    />
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export function AdminShell({
  userEmail,
  children,
}: {
  userEmail: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const title = pageTitle(pathname)

  return (
    <div className="min-h-screen bg-background text-platinum">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card/70 backdrop-blur lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Link href="/admin" aria-label="Diamonds Tester admin home">
            <Logo />
          </Link>
        </div>
        <SidebarContent pathname={pathname} />
        <div className="border-t border-border px-3 py-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-platinum"
          >
            <Gem className="h-4 w-4 text-brilliant-cyan/70" /> View live site
          </Link>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-border bg-card shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-border px-5">
              <Link href="/admin" aria-label="Diamonds Tester admin home" onClick={() => setMobileOpen(false)}>
                <Logo />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-platinum"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-platinum lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <h1 className="font-display text-lg font-semibold tracking-tight text-platinum">
            {title}
          </h1>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline" title={userEmail}>
              {userEmail}
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brilliant-soft text-sm font-semibold text-brilliant-cyan sm:hidden">
              {userEmail.charAt(0).toUpperCase()}
            </span>
            <form action={logoutAction}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Log out</span>
              </Button>
            </form>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  )
}
