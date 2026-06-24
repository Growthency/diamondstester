export const runtime = 'edge'
import Link from 'next/link'
import { ArrowRight, Check, Quote } from 'lucide-react'
import { Hero } from '@/components/home/Hero'
import { DiamondAnalyzer } from '@/components/identify/DiamondAnalyzer'
import { SectionDivider } from '@/components/home/SectionDivider'
import { TestimonialMarquee } from '@/components/home/TestimonialMarquee'
import { Reveal, Stagger } from '@/components/motion/Reveal'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import {
  services, process, differentiators, fourCs, realVsFake, faqs, trustLogos,
  photoTips, comparison, limits,
} from '@/lib/content/site-data'
import { getAllPosts } from '@/lib/blog'
import { coverFor } from '@/lib/content/covers'
import { formatDate } from '@/lib/utils'
import { JsonLd } from '@/components/seo/JsonLd'
import { organizationLd, websiteLd, localBusinessLd, pageMeta } from '@/lib/seo'
import { SiteChrome } from '@/components/layout/SiteChrome'

export const metadata = pageMeta({
  title: 'Diamonds Tester — Know if your diamond is real',
  description:
    'Upload a photo for an instant AI verdict or book expert lab certification. Diamonds Tester checks authenticity, carat, cut and clarity — real diamond vs lab-grown vs moissanite — in minutes.',
  path: '/',
})

export default async function HomePage() {
  const allPosts = await getAllPosts()
  const posts = allPosts.slice(0, 3)
  const guides = allPosts.slice(0, 8)

  return (
    <SiteChrome>
      <JsonLd data={[organizationLd(), websiteLd(), localBusinessLd()]} />
      <Hero />

      {/* Instant AI diamond tester — the primary action, immediately under the hero */}
      <section id="tester" className="relative scroll-mt-28 pb-8 pt-4 sm:pb-12">
        <div className="container-wide">
          <Reveal className="mx-auto mb-10 max-w-2xl text-center">
            <span className="eyebrow"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brilliant-cyan" /> Free · no signup</span>
            <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">
              Upload a photo — <span className="text-gradient">test your diamond now</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Our gemologist-trained AI reads brilliance, fire and facet geometry to screen real diamond from
              moissanite, cubic zirconia and glass. One to four angles, an instant verdict.
            </p>
          </Reveal>
          <Reveal delay={1}>
            <DiamondAnalyzer />
          </Reveal>
        </div>
      </section>

      {/* Trust marquee */}
      <div className="border-y border-border/60 bg-ink-soft/40 py-6">
        <div className="container-wide flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {trustLogos.map((t) => (
            <span key={t} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brilliant-cyan" /> {t}
            </span>
          ))}
        </div>
      </div>

      {/* Value / differentiators */}
      <section className="section">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Why Diamonds Tester</span>
            <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">
              The <span className="text-gradient">cheap pen lies.</span> We don’t.
            </h2>
            <p className="mt-4 text-muted-foreground">
              A $20 tester checks heat — and moissanite passes it every time. Diamonds Tester reads the
              optical, electrical and structural tells that actually separate real, lab-grown and fake.
            </p>
          </Reveal>

          <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {differentiators.map((d) => (
              <Reveal key={d.title}>
                <div className="card-luxe group h-full rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-brilliant-soft text-brilliant-cyan">
                    <Icon name={d.icon} className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold">{d.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.body}</p>
                </div>
              </Reveal>
            ))}
          </Stagger>
        </div>
      </section>

      <SectionDivider />

      {/* Services */}
      <section id="services" className="section bg-ink-soft/30">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Three ways to verify</span>
            <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">
              Pick your level of <span className="text-gradient">certainty</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              From a free instant photo screen to an insurance-ready lab certificate — choose what your stone deserves.
            </p>
          </Reveal>

          <Stagger className="mt-14 grid gap-6 lg:grid-cols-3">
            {services.map((s, i) => (
              <Reveal key={s.id}>
                <div className={`card-luxe relative flex h-full flex-col rounded-2xl p-7 ${i === 1 ? 'ring-1 ring-brilliant-cyan/40' : ''}`}>
                  {i === 1 && <Badge variant="solid" className="absolute -top-3 left-7">Most popular</Badge>}
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-brilliant-soft text-brilliant-cyan">
                    <Icon name={s.icon} className="h-6 w-6" />
                  </div>
                  <div className="mt-5 flex items-baseline justify-between">
                    <h3 className="font-display text-xl font-semibold">{s.name}</h3>
                    <span className="font-display text-lg font-bold text-gradient">{s.price}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-brilliant-cyan">{s.tagline}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                  <ul className="mt-5 space-y-2.5">
                    {s.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-platinum">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brilliant-cyan" /> {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-7">
                    <Button asChild variant={i === 1 ? 'default' : 'outline'} className="w-full">
                      <Link href="/verify">Choose {s.name.split(' ')[0]} <ArrowRight className="h-4 w-4" /></Link>
                    </Button>
                  </div>
                </div>
              </Reveal>
            ))}
          </Stagger>
        </div>
      </section>

      <SectionDivider flip />

      {/* Process */}
      <section className="section">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">How it works</span>
            <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">
              Four steps to a <span className="text-gradient">clear verdict</span>
            </h2>
          </Reveal>
          <Stagger className="relative mt-16 grid gap-8 md:grid-cols-4">
            <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-brilliant-indigo/40 to-transparent md:block" />
            {process.map((p) => (
              <Reveal key={p.step} className="relative text-center md:text-left">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brilliant text-lg font-bold text-white shadow-glow md:mx-0">
                  {p.step}
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </Reveal>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Best photos for an accurate test */}
      <section className="section bg-ink-soft/30">
        <div className="container-wide grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <img src="/images/cuts.webp" alt="Diamond cut shapes and facets" loading="lazy" className="w-full rounded-2xl border border-border" width={800} height={600} />
          </Reveal>
          <div>
            <Reveal>
              <span className="eyebrow">Best photos = best verdict</span>
              <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">
                Four tips for a <span className="text-gradient">sharper read</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                The AI is only as good as your photos. A minute of care here makes the difference between a confident verdict and an inconclusive one.
              </p>
            </Reveal>
            <Stagger className="mt-8 grid gap-4 sm:grid-cols-2">
              {photoTips.map((t) => (
                <Reveal key={t.title}>
                  <div className="card-luxe h-full rounded-xl p-5">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-brilliant-soft text-brilliant-cyan">
                      <Icon name={t.icon} className="h-5 w-5" />
                    </div>
                    <h3 className="mt-3 font-display font-semibold">{t.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
                  </div>
                </Reveal>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* Real vs Fake */}
      <section className="section">
        <div className="container-wide grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="eyebrow">Real vs. fake</span>
            <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">
              The tells you can <span className="text-gradient">see for yourself</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              At-home checks rule out obvious fakes — but they can’t separate diamond from
              moissanite, or natural from lab-grown. That’s where we come in.
            </p>
            <Button asChild className="mt-7">
              <Link href="/tools/quiz">Take the real-vs-fake quiz <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </Reveal>
          <Stagger className="space-y-3">
            {realVsFake.map((r) => (
              <Reveal key={r.test}>
                <div className="card-luxe rounded-xl p-5">
                  <p className="font-display font-semibold">{r.test}</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <p className="rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-300"><span className="font-semibold">Real:</span> {r.real}</p>
                    <p className="rounded-lg bg-destructive/10 p-3 text-xs text-red-300"><span className="font-semibold">Fake:</span> {r.fake}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </Stagger>
        </div>
      </section>

      <SectionDivider />

      {/* 4Cs */}
      <section className="section">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">The 4Cs</span>
            <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">
              What actually <span className="text-gradient">moves the value</span>
            </h2>
          </Reveal>
          <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {fourCs.map((c) => (
              <Reveal key={c.c}>
                <div className="card-luxe h-full rounded-2xl p-6">
                  <div className="font-display text-5xl font-extrabold text-gradient">{c.c[0]}</div>
                  <h3 className="mt-3 font-display text-lg font-semibold">{c.c}</h3>
                  <p className="text-sm font-medium text-brilliant-cyan">{c.summary}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
                </div>
              </Reveal>
            ))}
          </Stagger>
        </div>
      </section>

      <SectionDivider flip />

      {/* Explore Diamond Guides — the article library, like a knowledge hub */}
      <section className="section bg-ink-soft/30">
        <div className="container-wide">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <Reveal>
              <span className="eyebrow">Diamond knowledge</span>
              <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">
                Explore diamond <span className="text-gradient">guides</span>
              </h2>
              <p className="mt-4 max-w-xl text-muted-foreground">
                Real, gemologist-written guides on testing, the 4Cs, cuts, certificates, pricing and care — everything you need before you buy, sell or insure.
              </p>
            </Reveal>
            <Button asChild variant="outline" className="shrink-0">
              <Link href="/blog">Browse all articles <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>

          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {guides.map((post) => (
              <Reveal key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="card-luxe group flex h-full flex-col overflow-hidden rounded-2xl">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={coverFor(post)} alt={post.title} loading="lazy" width={800} height={600} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute left-3 top-3"><Badge variant="solid">{post.category}</Badge></span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-base font-semibold leading-snug transition-colors group-hover:text-brilliant-cyan">{post.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
                    <p className="mt-auto pt-4 text-xs text-muted-foreground">{post.read_minutes} min read</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Why choose Diamonds Tester — comparison table */}
      <section className="section">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Why choose Diamonds Tester</span>
            <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">
              The clearer way to <span className="text-gradient">know for sure</span>
            </h2>
          </Reveal>
          <Reveal className="mt-12 overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="p-4 text-left font-medium text-muted-foreground"></th>
                  {comparison.columns.map((c, i) => (
                    <th key={c} className={`p-4 text-center font-display font-semibold ${i === 0 ? 'rounded-t-xl bg-brilliant-soft text-brilliant-cyan' : 'text-platinum-muted'}`}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map((row) => (
                  <tr key={row.feature} className="border-t border-border">
                    <td className="p-4 font-medium text-platinum">{row.feature}</td>
                    {row.values.map((v, i) => (
                      <td key={i} className={`p-4 text-center ${i === 0 ? 'bg-brilliant-soft/40' : ''}`}>
                        {v === 'yes' ? <Check className="mx-auto h-5 w-5 text-emerald-400" />
                          : v === 'no' ? <span className="text-red-400/70">—</span>
                          : v === 'maybe' ? <span className="text-amber-400">~</span>
                          : v === 'paid' ? <span className="text-amber-400">£££</span>
                          : <span className="text-platinum-muted">{v}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section bg-ink-soft/30">
        <Reveal className="container-wide mb-12 text-center">
          <span className="eyebrow">Loved by owners & jewellers</span>
          <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">
            Straight answers, <span className="text-gradient">earned trust</span>
          </h2>
        </Reveal>
        <TestimonialMarquee />
      </section>

      {/* Featured blog */}
      <section className="section">
        <div className="container-wide">
          <div className="flex items-end justify-between">
            <Reveal>
              <span className="eyebrow">From the journal</span>
              <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">Learn before you buy</h2>
            </Reveal>
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/blog">All articles <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
            {posts.map((post) => (
              <Reveal key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="card-luxe group block h-full overflow-hidden rounded-2xl">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={coverFor(post)} alt={post.title} loading="lazy" width={800} height={600} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-6">
                    <Badge variant="muted">{post.category}</Badge>
                    <h3 className="mt-3 font-display text-lg font-semibold leading-snug transition-colors group-hover:text-brilliant-cyan">{post.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
                    <p className="mt-4 text-xs text-muted-foreground">{formatDate(post.published_at)} · {post.read_minutes} min read</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Honest limits of a photo test */}
      <section className="section">
        <div className="container-wide grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <img src="/images/certificate.webp" alt="Diamond grading certificate" loading="lazy" width={800} height={600} className="w-full rounded-2xl border border-border" />
          </Reveal>
          <div>
            <Reveal>
              <span className="eyebrow">Honest about the limits</span>
              <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">
                A photo screen is a <span className="text-gradient">guide, not gospel</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                We’d rather tell you the truth than oversell a verdict. Here’s exactly where an instant photo test stops — and why a lab test takes over.
              </p>
            </Reveal>
            <Stagger className="mt-7 space-y-3">
              {limits.map((l, i) => (
                <Reveal key={i}>
                  <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/20 p-4">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brilliant-soft text-xs font-bold text-brilliant-cyan">{i + 1}</span>
                    <p className="text-sm leading-relaxed text-platinum-muted">{l}</p>
                  </div>
                </Reveal>
              ))}
            </Stagger>
            <Button asChild className="mt-7">
              <Link href="/verify">Get a definitive lab test <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-ink-soft/30">
        <div className="container-wide grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <span className="eyebrow">FAQ</span>
            <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">Questions, answered honestly</h2>
            <p className="mt-4 text-muted-foreground">Can’t find what you need? <Link href="/contact" className="text-brilliant-cyan hover:underline">Talk to a gemologist →</Link></p>
          </Reveal>
          <Reveal>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger>{f.q}</AccordionTrigger>
                  <AccordionContent>{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section">
        <div className="container-wide">
          <Reveal>
            <div className="card-luxe relative overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-16">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--brilliant-indigo)/0.35),transparent_60%)]" />
              <Quote className="mx-auto h-8 w-8 text-brilliant-cyan/50" />
              <h2 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-bold sm:text-5xl">
                Stop wondering. <span className="text-gradient">Know for certain.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Free photo screening, expert lab certification, zero subscriptions. Your verdict is minutes away.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="sheen">
                  <Link href="/verify">Verify my diamond <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/contact">Talk to an expert</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteChrome>
  )
}
