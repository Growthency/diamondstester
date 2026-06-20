import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Reveal, Stagger } from '@/components/motion/Reveal'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SectionDivider } from '@/components/home/SectionDivider'
import { pageMeta, breadcrumbLd } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata = pageMeta({
  title: 'Free Diamond Tools — Carat, Price & Authenticity',
  description:
    'Three free, gemologist-built tools: estimate carat weight from a stone’s measurements, ballpark a diamond price range from the 4Cs, and test if you can spot a real diamond.',
  path: '/tools',
})

const tools = [
  {
    href: '/tools/carat-calculator',
    name: 'Carat Weight Calculator',
    eyebrow: 'Estimate weight',
    icon: 'Gem',
    body: 'Enter your stone’s length, width and depth in millimetres and pick a shape. We apply the industry-standard formula to estimate carat weight in real time — handy when a stone is set and can’t be weighed loose.',
    cta: 'Calculate carat',
  },
  {
    href: '/tools/price-estimator',
    name: 'Diamond Price Estimator',
    eyebrow: 'Ballpark value',
    icon: 'Sparkles',
    body: 'Dial in carat, cut, colour and clarity to see an indicative price range. Built on real market relationships — price climbs faster than weight, and every grade nudges the band up or down.',
    cta: 'Estimate price',
  },
  {
    href: '/tools/quiz',
    name: 'Real-vs-Fake Quiz',
    eyebrow: 'Test yourself',
    icon: 'Search',
    body: 'Six quick questions on the tests that actually separate diamond from moissanite, CZ and glass. Get instant feedback on each, then a verdict on how sharp your eye really is.',
    cta: 'Take the quiz',
  },
] as const

export default function ToolsPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Tools', path: '/tools' }])} />
      <section className="section pt-32">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Free tools</span>
            <h1 className="mt-5 font-display text-4xl font-bold sm:text-6xl">
              Numbers and tells, <span className="text-gradient">no jeweller required</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Three calculators we built for ourselves and opened up to you. They’re fast, free and
              honest about their limits — for an insurance-ready answer, our lab takes it from here.
            </p>
          </Reveal>

          <Stagger className="mt-16 grid gap-6 lg:grid-cols-3">
            {tools.map((t) => (
              <Reveal key={t.href}>
                <Link
                  href={t.href}
                  className="card-luxe group flex h-full flex-col rounded-2xl p-7 transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-brilliant-soft text-brilliant-cyan">
                      <Icon name={t.icon} className="h-6 w-6" />
                    </div>
                    <Badge variant="muted">{t.eyebrow}</Badge>
                  </div>
                  <h2 className="mt-6 font-display text-xl font-semibold transition-colors group-hover:text-brilliant-cyan">
                    {t.name}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-7 text-sm font-semibold text-brilliant-cyan">
                    {t.cta}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </Stagger>
        </div>
      </section>

      <SectionDivider />

      <section className="section bg-ink-soft/30">
        <div className="container-wide">
          <Reveal>
            <div className="card-luxe relative overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-16">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--brilliant-indigo)/0.35),transparent_60%)]" />
              <h2 className="mx-auto max-w-3xl font-display text-3xl font-bold sm:text-4xl">
                Estimates are a great start. <span className="text-gradient">Certainty needs a lab.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                These tools can’t tell natural from lab-grown, or diamond from moissanite. When the
                answer has to be right, send it to us — free photo screening or a numbered certificate.
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
