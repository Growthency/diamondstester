import Link from 'next/link'
import { Mail, MapPin, Phone, Instagram, Facebook, Linkedin, Youtube } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { NewsletterForm } from '@/components/layout/NewsletterForm'
import { site, whatsappHref } from '@/lib/site'

const columns = [
  {
    title: 'Service',
    links: [
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Photo verification', href: '/services#photo' },
      { label: 'Lab certification', href: '/services#lab' },
      { label: 'Mail-in testing', href: '/services#mail-in' },
      { label: 'Verify a diamond', href: '/verify' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Diamond tools', href: '/tools' },
      { label: 'Carat calculator', href: '/tools/carat-calculator' },
      { label: 'Price estimator', href: '/tools/price-estimator' },
      { label: 'Real vs. fake quiz', href: '/tools/quiz' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Terms of service', href: '/terms' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border bg-ink-soft/60">
      <div className="container-wide grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-5">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            {site.description}
          </p>
          <div className="space-y-2 text-sm text-platinum-muted">
            <a href={`mailto:${site.contact.email}`} className="flex items-center gap-2 hover:text-platinum">
              <Mail className="h-4 w-4 text-brilliant-cyan" /> {site.contact.email}
            </a>
            <a href={whatsappHref()} className="flex items-center gap-2 hover:text-platinum">
              <Phone className="h-4 w-4 text-brilliant-cyan" /> {site.contact.phone}
            </a>
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-brilliant-cyan" /> {site.contact.address}
            </p>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="mb-4 text-sm font-semibold text-platinum">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-brilliant-cyan">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container-wide pb-12">
        <div className="card-luxe rounded-2xl p-6 sm:flex sm:items-center sm:justify-between sm:gap-8">
          <div className="mb-4 sm:mb-0">
            <h4 className="font-display text-lg font-semibold">Get diamond-smart, monthly.</h4>
            <p className="text-sm text-muted-foreground">Buying guides, lab insights and scam alerts. No spam.</p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-wide flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <a href={site.social.instagram} aria-label="Instagram" className="text-platinum-muted transition-colors hover:text-brilliant-cyan"><Instagram className="h-4 w-4" /></a>
            <a href={site.social.facebook} aria-label="Facebook" className="text-platinum-muted transition-colors hover:text-brilliant-cyan"><Facebook className="h-4 w-4" /></a>
            <a href={site.social.linkedin} aria-label="LinkedIn" className="text-platinum-muted transition-colors hover:text-brilliant-cyan"><Linkedin className="h-4 w-4" /></a>
            <a href={site.social.youtube} aria-label="YouTube" className="text-platinum-muted transition-colors hover:text-brilliant-cyan"><Youtube className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}
