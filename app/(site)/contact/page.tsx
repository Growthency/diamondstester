import type { Metadata } from 'next'
import { Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react'
import { Reveal } from '@/components/motion/Reveal'
import { Button } from '@/components/ui/button'
import { site, whatsappHref } from '@/lib/site'
import { ContactForm } from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact Diamonds Tester — Talk to a Gemologist',
  description:
    'Questions about verifying a diamond, mailing in a stone or a certificate? Reach the Diamonds Tester team by message, email, phone or WhatsApp.',
  alternates: { canonical: '/contact' },
}

const socials = [
  { label: 'Instagram', href: site.social.instagram },
  { label: 'Facebook', href: site.social.facebook },
  { label: 'X', href: site.social.x },
  { label: 'LinkedIn', href: site.social.linkedin },
  { label: 'YouTube', href: site.social.youtube },
] as const

export default function ContactPage() {
  const info = [
    { icon: Mail, label: 'Email', value: site.contact.email, href: `mailto:${site.contact.email}` },
    {
      icon: Phone,
      label: 'Phone',
      value: site.contact.phone,
      href: `tel:${site.contact.phone.replace(/[^\d+]/g, '')}`,
    },
    { icon: MapPin, label: 'Studio', value: site.contact.address },
    { icon: Clock, label: 'Hours', value: site.contact.hours },
  ]

  return (
    <section className="section pt-32">
      <div className="container-wide">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Get in touch</span>
          <h1 className="mt-5 font-display text-4xl font-bold sm:text-6xl">
            Talk to a <span className="text-gradient">gemologist</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Whether you’re ready to verify a stone or just have a question about the process, a real
            person on our team will get back to you within one business day.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Form */}
          <Reveal>
            <div className="card-luxe rounded-2xl p-6 sm:p-8">
              <h2 className="font-display text-xl font-semibold">Send a message</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Fields marked with an asterisk are required.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </Reveal>

          {/* Info + map panel */}
          <Reveal delay={1} className="space-y-6">
            <div className="card-luxe rounded-2xl p-6 sm:p-8">
              <h2 className="font-display text-xl font-semibold">Reach us directly</h2>
              <ul className="mt-6 space-y-5">
                {info.map((row) => (
                  <li key={row.label} className="flex gap-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brilliant-soft text-brilliant-cyan">
                      <row.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-platinum-muted">
                        {row.label}
                      </p>
                      {row.href ? (
                        <a
                          href={row.href}
                          className="mt-0.5 block text-sm font-medium text-platinum transition-colors hover:text-brilliant-cyan"
                        >
                          {row.value}
                        </a>
                      ) : (
                        <p className="mt-0.5 text-sm font-medium text-platinum">{row.value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <Button asChild className="mt-7 w-full bg-[#25D366] text-[#0b141a] shadow-none hover:bg-[#1fb959]">
                <a href={whatsappHref()} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
                </a>
              </Button>

              <div className="mt-7 border-t border-border pt-6">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-platinum-muted">
                  Follow
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-border bg-secondary/30 px-3.5 py-1.5 text-xs font-medium text-platinum-muted transition-colors hover:border-brilliant-cyan/50 hover:text-brilliant-cyan"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Stylised location panel — gradient + grid, no raster image */}
            <div className="card-luxe relative overflow-hidden rounded-2xl">
              <div className="relative h-56 w-full bg-grid">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,hsl(var(--brilliant-indigo)/0.45),transparent_60%)]" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                {/* pin */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="absolute -inset-5 animate-ping rounded-full bg-brilliant-cyan/20" />
                  <span className="relative grid h-11 w-11 place-items-center rounded-full bg-brilliant text-white shadow-glow">
                    <MapPin className="h-5 w-5" />
                  </span>
                </div>
                <div className="absolute bottom-4 left-5 right-5">
                  <p className="font-display text-sm font-semibold text-platinum">Diamonds Tester Studio</p>
                  <p className="text-xs text-muted-foreground">{site.contact.address}</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
