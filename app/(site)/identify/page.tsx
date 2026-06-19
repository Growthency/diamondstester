import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Camera, ScanLine, ShieldCheck, Sparkles } from 'lucide-react'
import { DiamondAnalyzer } from '@/components/identify/DiamondAnalyzer'
import { SectionDivider } from '@/components/home/SectionDivider'
import { Reveal, Stagger } from '@/components/motion/Reveal'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Test My Diamond — Instant AI Photo Analysis',
  description:
    'Upload a photo of your diamond and get an instant, gemologist-trained verdict on whether it’s a real diamond, lab-grown, or a simulant like moissanite or CZ — free.',
}

const steps = [
  { icon: 'Camera', title: 'Photograph', body: 'Take 1–3 clear, well-lit shots of your stone — top, side and through the table if you can.' },
  { icon: 'ScanLine', title: 'Analyze', body: 'Our gemologist-trained vision model reads brilliance, fire, facet geometry and inclusions in seconds.' },
  { icon: 'ShieldCheck', title: 'Get your verdict', body: 'See a clear diamond-vs-simulant call, an authenticity score, estimated 4Cs and the smart next step.' },
]

export default function IdentifyPage() {
  return (
    <>
      <section className="section pt-32">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow"><Sparkles className="h-3.5 w-3.5 text-brilliant-cyan" /> Instant AI diamond test</span>
            <h1 className="mt-5 font-display text-4xl font-extrabold sm:text-6xl">
              Is it a real diamond? <span className="text-gradient">Find out now.</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Upload a photo and our gemologist-trained AI screens it for the tells that separate a
              real diamond from moissanite, cubic zirconia and glass — free, in under a minute.
            </p>
          </Reveal>

          <Reveal delay={1} className="mx-auto mt-10 max-w-3xl">
            <DiamondAnalyzer />
          </Reveal>
        </div>
      </section>

      <SectionDivider />

      <section className="section bg-ink-soft/30">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">How the photo test works</span>
            <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">Three steps, one clear answer</h2>
          </Reveal>
          <Stagger className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.title}>
                <div className="card-luxe h-full rounded-2xl p-7 text-center">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brilliant-soft text-brilliant-cyan">
                    {s.icon === 'Camera' && <Camera className="h-7 w-7" />}
                    {s.icon === 'ScanLine' && <ScanLine className="h-7 w-7" />}
                    {s.icon === 'ShieldCheck' && <ShieldCheck className="h-7 w-7" />}
                  </div>
                  <div className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Step {i + 1}</div>
                  <h3 className="mt-1 font-display text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </Stagger>

          <Reveal className="mx-auto mt-12 max-w-2xl rounded-2xl border border-border bg-secondary/20 p-6 text-center">
            <h3 className="font-display text-lg font-semibold">Need a result you can insure?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              A photo screen is a fast guide — but separating natural from lab-grown, or certifying value,
              needs instruments. Our lab does exactly that, with a numbered certificate.
            </p>
            <Button asChild className="mt-5">
              <Link href="/verify">Book a lab test <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  )
}
