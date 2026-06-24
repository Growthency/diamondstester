export const runtime = 'edge'
import Link from 'next/link'
import { ArrowRight, Check, Minus } from 'lucide-react'
import { SectionDivider } from '@/components/home/SectionDivider'
import { Reveal, Stagger } from '@/components/motion/Reveal'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import { services, faqs } from '@/lib/content/site-data'
import { pageMeta, breadcrumbLd } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata = pageMeta({
  title: 'Diamond Testing Services | Photo, Mail-In & Lab Cert',
  description:
    'Three ways to verify a diamond: a free instant photo screen, insured mail-in testing, and full lab certification. Compare turnaround, pricing and what each report includes.',
  path: '/services',
})

/** Per-service deep detail keyed by the shared data id. */
const detail: Record<
  string,
  { turnaround: string; bestFor: string; included: string[] }
> = {
  photo: {
    turnaround: 'Near-instant · verdict in ~38 seconds',
    bestFor:
      'A quick gut-check before you buy, sell or insure — and ruling out obvious simulants like CZ and glass.',
    included: [
      'Brilliance & dispersion analysis from your photos',
      'Simulant screening (moissanite, CZ, glass, white sapphire)',
      'Facet symmetry and cut-grade hints',
      'Confidence score on the natural / lab-grown / simulant call',
      'Shareable PDF summary you keep forever',
    ],
  },
  'mail-in': {
    turnaround: '~3 business days from arrival · insured both ways',
    bestFor:
      'Owners who want a hands-on, instrument-backed verdict fast, without committing to a full graded certificate.',
    included: [
      'Prepaid, insured, tamper-evident shipping mailer',
      'Hand-testing by a certified gemologist',
      'Thermal + electrical conductivity staging',
      'Authenticity verdict with estimated market value',
      'Concise written report, returned with your stone',
    ],
  },
  lab: {
    turnaround: '5–7 business days · plus insured shipping each way',
    bestFor:
      'Anything you’ll insure, resell or pass down — where a numbered, gradeable certificate is non-negotiable.',
    included: [
      'Full instrument testing: conductivity, RI, fluorescence, spectroscopy',
      'Complete 4C grading report (cut, colour, clarity, carat)',
      'Definitive natural vs. lab-grown origin call',
      'Plotted clarity map of inclusions',
      'Tamper-proof numbered certificate recognised by insurers',
    ],
  },
}

const comparison = [
  { label: 'Starting price', photo: 'Free', mailin: 'from $39', lab: 'from $79' },
  { label: 'Turnaround', photo: '~38 seconds', mailin: '~3 business days', lab: '5–7 business days' },
  { label: 'Simulant screening', photo: true, mailin: true, lab: true },
  { label: 'Natural vs. lab-grown', photo: 'Indicative', mailin: 'Indicative', lab: 'Definitive' },
  { label: 'Full 4C grading', photo: false, mailin: 'Estimated', lab: true },
  { label: 'Estimated market value', photo: false, mailin: true, lab: true },
  { label: 'Numbered certificate', photo: false, mailin: false, lab: true },
  { label: 'Insurance-ready', photo: false, mailin: false, lab: true },
  { label: 'Ship your stone in', photo: false, mailin: true, lab: true },
]

function Cell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="mx-auto h-5 w-5 text-brilliant-cyan" />
  if (value === false) return <Minus className="mx-auto h-5 w-5 text-muted-foreground/50" />
  return <span className="text-sm text-platinum">{value}</span>
}

const serviceFaqs = faqs.filter((f) =>
  ['How long does certification take?', 'Is my stone safe when I mail it in?',
   'Will a cheap diamond tester pen tell me everything?'].includes(f.q),
)

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }])} />
      {/* Hero */}
      <section className="section pt-32">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">
              <Icon name="Gem" className="h-3.5 w-3.5 text-brilliant-cyan" />
              Services
            </span>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Choose your level of <span className="text-gradient">certainty</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              From a free instant photo screen to an insurance-ready lab certificate — every option
              is backed by certified gemologists and built to give you a straight answer about your
              stone.
            </p>
          </Reveal>

          {/* Quick anchor nav */}
          <Reveal className="mt-10 flex flex-wrap justify-center gap-3">
            {services.map((s) => (
              <Link
                key={s.id}
                href={`#${s.id}`}
                className="glass rounded-full px-5 py-2 text-sm font-medium text-platinum-muted transition-colors hover:text-brilliant-cyan"
              >
                {s.name}
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Detailed service blocks */}
      {services.map((s, i) => {
        const d = detail[s.id]
        return (
          <section
            key={s.id}
            id={s.id}
            className={`section scroll-mt-28 ${i % 2 === 1 ? 'bg-ink-soft/30' : ''}`}
          >
            <div className="container-wide grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
              <Reveal>
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brilliant-soft text-brilliant-cyan">
                  <Icon name={s.icon} className="h-7 w-7" />
                </div>
                <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-2">
                  <h2 className="font-display text-4xl font-bold sm:text-5xl">{s.name}</h2>
                  <span className="font-display text-2xl font-bold text-gradient">{s.price}</span>
                </div>
                <p className="mt-3 text-base font-medium text-brilliant-cyan">{s.tagline}</p>
                <p className="mt-5 leading-relaxed text-muted-foreground">{s.description}</p>

                <dl className="mt-7 space-y-4">
                  <div className="card-luxe rounded-xl p-5">
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground">Turnaround</dt>
                    <dd className="mt-1 font-display font-semibold text-platinum">{d.turnaround}</dd>
                  </div>
                  <div className="card-luxe rounded-xl p-5">
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground">Best for</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-platinum">{d.bestFor}</dd>
                  </div>
                </dl>

                <Button asChild className="mt-7">
                  <Link href={`/verify?method=${s.id}`}>
                    Start {s.name} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </Reveal>

              <Reveal>
                <div className="card-luxe h-full rounded-2xl p-7">
                  <h3 className="font-display text-lg font-semibold">What’s included</h3>
                  <ul className="mt-5 space-y-3.5">
                    {d.included.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-platinum">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brilliant-soft">
                          <Check className="h-3 w-3 text-brilliant-cyan" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </section>
        )
      })}

      <SectionDivider />

      {/* Comparison table */}
      <section className="section">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Side by side</span>
            <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">
              Compare every <span className="text-gradient">option</span>
            </h2>
          </Reveal>

          <Reveal className="mt-12">
            <div className="card-luxe overflow-hidden rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-center">
                  <thead>
                    <tr className="border-b border-border/60">
                      <th className="px-5 py-5 text-left text-sm font-medium text-muted-foreground">
                        Feature
                      </th>
                      <th className="px-5 py-5 font-display text-base font-semibold">Photo</th>
                      <th className="px-5 py-5 font-display text-base font-semibold">
                        Mail-in
                        <Badge variant="solid" className="ml-2 align-middle">Popular</Badge>
                      </th>
                      <th className="px-5 py-5 font-display text-base font-semibold">Lab Cert</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((row, idx) => (
                      <tr
                        key={row.label}
                        className={`border-b border-border/40 ${idx % 2 === 1 ? 'bg-ink-soft/20' : ''}`}
                      >
                        <td className="px-5 py-4 text-left text-sm text-platinum-muted">{row.label}</td>
                        <td className="px-5 py-4"><Cell value={row.photo} /></td>
                        <td className="px-5 py-4"><Cell value={row.mailin} /></td>
                        <td className="px-5 py-4"><Cell value={row.lab} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <SectionDivider flip />

      {/* FAQ */}
      <section className="section bg-ink-soft/30">
        <div className="container-wide grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <span className="eyebrow">Good to know</span>
            <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">
              Service questions, answered
            </h2>
            <p className="mt-4 text-muted-foreground">
              Want the full list?{' '}
              <Link href="/faq" className="text-brilliant-cyan hover:underline">
                Visit our FAQ →
              </Link>
            </p>
          </Reveal>
          <Reveal>
            <Accordion type="single" collapsible className="w-full">
              {serviceFaqs.map((f, i) => (
                <AccordionItem key={i} value={`svc-faq-${i}`}>
                  <AccordionTrigger>{f.q}</AccordionTrigger>
                  <AccordionContent>{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container-wide">
          <Reveal>
            <div className="card-luxe relative overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-16">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--brilliant-indigo)/0.35),transparent_60%)]" />
              <h2 className="mx-auto max-w-3xl font-display text-4xl font-bold sm:text-5xl">
                Not sure which to pick? <span className="text-gradient">Start free.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Run a free photo screen first — if it flags anything, upgrade to mail-in or lab
                certification in a couple of clicks.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="sheen">
                  <Link href="/verify">Verify my diamond <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/contact">Talk to a gemologist</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
