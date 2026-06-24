export const runtime = 'edge'
import Link from 'next/link'
import { ArrowRight, Check, AlertTriangle } from 'lucide-react'
import { SectionDivider } from '@/components/home/SectionDivider'
import { Reveal, Stagger } from '@/components/motion/Reveal'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/button'
import { process } from '@/lib/content/site-data'
import { pageMeta, breadcrumbLd } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata = pageMeta({
  title: 'How Diamond Verification Works | Photo & Lab Flow',
  description:
    'From photo to verdict, step by step. See how the photo flow and the lab flow work, what your report contains, and an honest look at what each method can and cannot tell you.',
  path: '/how-it-works',
})

const photoFlow = [
  {
    title: 'Capture three angles',
    body: 'Shoot the table (top), the profile (side) and the girdle (edge) in soft, even light against a plain background. Steady hands beat fancy gear.',
  },
  {
    title: 'Upload in seconds',
    body: 'Drag your photos into the verify form — any format works, and we convert each image to optimized WebP automatically for a sharp, fast read.',
  },
  {
    title: 'Optical analysis runs',
    body: 'Our gemologist-trained model scores brilliance, dispersion and facet geometry against thousands of GIA-graded reference stones.',
  },
  {
    title: 'Read your verdict',
    body: 'In about half a minute you get a plain-English call — likely natural, lab-grown or simulant — with a confidence score and a PDF to keep.',
  },
]

const labFlow = [
  {
    title: 'Request an insured mailer',
    body: 'We send a prepaid, tamper-evident, fully insured shipping kit. Your stone is tracked from the moment it leaves your hands.',
  },
  {
    title: 'Instrument testing',
    body: 'On the lab floor we run thermal and electrical conductivity, refractive index, UV fluorescence and spectroscopy — the tells that separate diamond from moissanite and natural from lab-grown.',
  },
  {
    title: 'Gemologist grading',
    body: 'A certified gemologist grades the full 4Cs, plots inclusions, and makes the definitive origin and treatment call. No certificate ships on a machine reading alone.',
  },
  {
    title: 'Certificate & safe return',
    body: 'You receive a numbered, tamper-proof certificate recognised by insurers and jewellers — and your stone comes home insured, exactly as it left.',
  },
]

const reportContents = [
  { t: 'Authenticity verdict', d: 'Natural, lab-grown or simulant — stated plainly, with a confidence level.' },
  { t: 'The 4Cs', d: 'Cut, colour, clarity and carat, measured where the method allows.' },
  { t: 'Origin & treatment', d: 'Earth-mined vs. lab-grown, and any detectable treatment such as HPHT.' },
  { t: 'Clarity plot', d: 'A mapped diagram of inclusions and surface characteristics (lab tier).' },
  { t: 'Estimated market value', d: 'A grounded value range based on the grade and current market.' },
  { t: 'Your keepsake PDF', d: 'A clean, shareable document — yours forever, no subscription.' },
]

const limitations = [
  {
    t: 'A photo can’t do everything',
    d: 'Optics rule out obvious simulants and flag likely cases, but a definitive natural-vs-lab-grown call needs instruments. We’ll always tell you when a photo isn’t enough.',
  },
  {
    t: 'Settings can hide the truth',
    d: 'A stone still in its mount limits what we can measure — closed-back settings block light return and conductivity contact. Loose stones give the cleanest read.',
  },
  {
    t: 'We don’t guess to please',
    d: 'If the evidence is borderline, we say “inconclusive” and tell you the next step, rather than dressing up a low-confidence answer as certainty.',
  },
]

function Flow({
  eyebrow, title, intro, steps,
}: {
  eyebrow: string; title: React.ReactNode; intro: string
  steps: { title: string; body: string }[]
}) {
  return (
    <div className="container-wide">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">{title}</h2>
        <p className="mt-4 text-muted-foreground">{intro}</p>
      </Reveal>
      <Stagger className="relative mt-16 grid gap-8 md:grid-cols-4">
        <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-brilliant-indigo/40 to-transparent md:block" />
        {steps.map((s, i) => (
          <Reveal key={s.title} className="relative text-center md:text-left">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brilliant text-lg font-bold text-white shadow-glow md:mx-0">
              {String(i + 1).padStart(2, '0')}
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </Reveal>
        ))}
      </Stagger>
    </div>
  )
}

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'How It Works', path: '/how-it-works' }])} />
      {/* Hero */}
      <section className="section pt-32">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">
              <Icon name="ScanLine" className="h-3.5 w-3.5 text-brilliant-cyan" />
              How it works
            </span>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              From photo to <span className="text-gradient">verdict</span>, step by step
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Whether you snap a photo or ship your stone to the lab, the path to a clear answer is
              the same four ideas: send it, we test it, you get a plain verdict, and you can certify
              to protect it. Here’s exactly what happens at each stage.
            </p>
          </Reveal>
        </div>
      </section>

      {/* The big four (from process data) */}
      <section className="section pt-0">
        <Flow
          eyebrow="The journey"
          title={<>Four steps to a <span className="text-gradient">clear answer</span></>}
          intro="Every verification — photo or lab — follows this arc. The only thing that changes is how deep the testing goes."
          steps={process.map((p) => ({ title: p.title, body: p.body }))}
        />
      </section>

      <SectionDivider />

      {/* Photo flow */}
      <section className="section bg-ink-soft/30">
        <Flow
          eyebrow="The photo flow"
          title={<>Verify from your <span className="text-gradient">phone, free</span></>}
          intro="Best for a fast first pass and ruling out obvious fakes. No appointment, no shipping — just three good photos."
          steps={photoFlow}
        />
      </section>

      {/* Lab flow */}
      <section className="section">
        <Flow
          eyebrow="The lab flow"
          title={<>Ship it in for the <span className="text-gradient">definitive read</span></>}
          intro="Best for anything you’ll insure, resell or pass down. Instrument-grade testing with a certified gemologist’s signature."
          steps={labFlow}
        />
      </section>

      <SectionDivider flip />

      {/* What the report contains */}
      <section className="section bg-ink-soft/30">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Your report</span>
            <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">
              What you actually <span className="text-gradient">get back</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Every result is written in plain English first, with the technical detail beneath it.
              Depth scales with the service you choose.
            </p>
          </Reveal>
          <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reportContents.map((r) => (
              <Reveal key={r.t}>
                <div className="card-luxe h-full rounded-2xl p-6">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brilliant-soft">
                    <Check className="h-5 w-5 text-brilliant-cyan" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold">{r.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.d}</p>
                </div>
              </Reveal>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Honesty / limitations */}
      <section className="section">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Straight talk</span>
            <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">
              Accuracy, and its <span className="text-gradient">honest limits</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Our lab testing matches reference grading 99.4% of the time — but no method is magic.
              Here’s where the edges are, told straight.
            </p>
          </Reveal>
          <Stagger className="mt-14 grid gap-5 lg:grid-cols-3">
            {limitations.map((l) => (
              <Reveal key={l.t}>
                <div className="card-luxe flex h-full flex-col rounded-2xl p-6">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/15">
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold">{l.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{l.d}</p>
                </div>
              </Reveal>
            ))}
          </Stagger>
        </div>
      </section>

      {/* CTA */}
      <section className="section pt-0">
        <div className="container-wide">
          <Reveal>
            <div className="card-luxe relative overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-16">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--brilliant-indigo)/0.35),transparent_60%)]" />
              <h2 className="mx-auto max-w-3xl font-display text-4xl font-bold sm:text-5xl">
                See it for yourself. <span className="text-gradient">Start now.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Upload three photos and watch the verdict arrive in under a minute — free, with no
                account required.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="sheen">
                  <Link href="/verify">Verify my diamond <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/services">Compare services</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
