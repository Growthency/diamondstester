import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SectionDivider } from '@/components/home/SectionDivider'
import { Reveal, Stagger } from '@/components/motion/Reveal'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { stats } from '@/lib/content/site-data'

export const metadata = {
  title: 'About',
  description:
    'CaratIQ was founded by certified gemologists tired of jeweller markups and unreliable tester pens. Meet the lab, the methodology and the people behind every verdict.',
}

const values = [
  {
    title: 'Honest before flattering',
    body: 'If your stone is lab-grown, a simulant, or worth less than you hoped, we say so plainly. A straight answer is the whole product.',
    icon: 'ShieldCheck',
  },
  {
    title: 'Evidence over opinion',
    body: 'Every verdict traces back to a measurable tell — conductivity, refractive index, spectroscopy or benchmarked optics — not a salesperson’s hunch.',
    icon: 'Microscope',
  },
  {
    title: 'No markup, no theatre',
    body: 'We don’t sell diamonds, so we have no reason to talk yours up or down. You pay for the test, never for an agenda.',
    icon: 'FileCheck2',
  },
  {
    title: 'Your stone, your data',
    body: 'Photos and samples are never sold or shared. Lab pieces are insured and tracked from the moment they leave your hands.',
    icon: 'Lock',
  },
]

const team = [
  {
    name: 'Dr. Helena Voss',
    role: 'Founder & Chief Gemologist',
    cred: 'GIA Graduate Gemologist · PhD, Mineral Physics',
    bio: 'Spent twelve years grading for an Antwerp trading house before founding CaratIQ. Helena built our optical benchmarking framework against thousands of GIA-graded reference stones.',
  },
  {
    name: 'Nathan Cole',
    role: 'Head of Laboratory',
    cred: 'IGI Certified Diamond Grader · FGA',
    bio: 'Runs the instrument floor — conductivity staging, FTIR and UV fluorescence. Nathan’s protocols are why a moissanite has never once slipped past a CaratIQ lab report.',
  },
  {
    name: 'Amara Okafor',
    role: 'Senior Gemologist, Origin & Treatment',
    cred: 'GIA Graduate Gemologist · DipGEM',
    bio: 'Specialises in separating natural from lab-grown and detecting HPHT treatment. Amara reviews every borderline origin call before it reaches a certificate.',
  },
  {
    name: 'Tomás Reyes',
    role: 'Lead, Photo Verification',
    cred: 'FGA · Applied Optics, MSc',
    bio: 'Trains and audits the model that powers our instant photo screen, calibrating it stone-by-stone against the lab’s graded outcomes.',
  },
]

const methodology = [
  {
    title: 'Optical benchmarking',
    body: 'Brilliance, dispersion and facet geometry read from your photos and scored against a library of GIA-graded reference diamonds.',
  },
  {
    title: 'Conductivity staging',
    body: 'Thermal and electrical probes separate diamond from moissanite — the single test cheap pens get wrong every time.',
  },
  {
    title: 'Spectroscopy & fluorescence',
    body: 'FTIR and UV imaging reveal the growth signatures that distinguish natural, HPHT and CVD lab-grown diamonds.',
  },
  {
    title: 'Gemologist review',
    body: 'No certificate ships on a machine reading alone. A certified gemologist signs off on origin, treatment and the full 4Cs.',
  },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="section pt-32">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">
              <Icon name="Gem" className="h-3.5 w-3.5 text-brilliant-cyan" />
              Our story
            </span>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Built by gemologists, <span className="text-gradient">tired of the guesswork</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              CaratIQ began with a simple frustration: a 20-dollar tester pen calls moissanite a
              diamond, and the jeweller down the road wants a fortune just to tell you what you
              already own. We thought owners deserved an answer that was independent, instrument-backed
              and free of anyone’s sales target.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Story / mission */}
      <section className="section bg-ink-soft/30">
        <div className="container-wide grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="eyebrow">Why we exist</span>
            <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">
              An answer you can <span className="text-gradient">actually trust</span>
            </h2>
            <div className="mt-6 space-y-4 text-muted-foreground">
              <p>
                After years inside the trade, our founders watched the same scene play out again and
                again — an inherited ring with no paperwork, a private-sale stone that looked too good,
                a tester pen confidently lighting up green on a piece of moissanite. The tools people
                relied on were either too cheap to be honest or too expensive to be accessible.
              </p>
              <p>
                So we built the lab we wished existed: gemologist-grade testing that meets you where
                you are. Snap a photo for a free first-pass verdict, or send your stone in an insured
                mailer for a full, certificate-ready report. Same rigour either way — and never a
                reason to inflate your stone’s value, because we don’t sell diamonds.
              </p>
            </div>
          </Reveal>
          <Stagger className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: 'ScanLine', t: 'No markup', d: 'We test stones, we don’t trade them.' },
              { icon: 'GraduationCap', t: 'Certified team', d: 'GIA & IGI gemologists on every report.' },
              { icon: 'ShieldCheck', t: 'Simulant-proof', d: 'Electrical staging catches moissanite.' },
              { icon: 'Lock', t: 'Private by default', d: 'Your photos and stones, never shared.' },
            ].map((b) => (
              <Reveal key={b.t}>
                <div className="card-luxe h-full rounded-2xl p-6">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-brilliant-soft text-brilliant-cyan">
                    <Icon name={b.icon} className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold">{b.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.d}</p>
                </div>
              </Reveal>
            ))}
          </Stagger>
        </div>
      </section>

      <SectionDivider />

      {/* The lab & methodology */}
      <section className="section">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Inside the lab</span>
            <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">
              How we reach a <span className="text-gradient">verdict</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Four layers of evidence stack into every result — from a quick optical read to
              full spectroscopy — and a human gemologist has the final word.
            </p>
          </Reveal>
          <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {methodology.map((m, i) => (
              <Reveal key={m.title}>
                <div className="card-luxe h-full rounded-2xl p-6">
                  <div className="font-display text-4xl font-extrabold text-gradient">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold">{m.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.body}</p>
                </div>
              </Reveal>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-ink-soft/30">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">What we stand for</span>
            <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">
              The principles behind <span className="text-gradient">every report</span>
            </h2>
          </Reveal>
          <Stagger className="mt-14 grid gap-5 sm:grid-cols-2">
            {values.map((v) => (
              <Reveal key={v.title}>
                <div className="card-luxe flex h-full gap-5 rounded-2xl p-6">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brilliant-soft text-brilliant-cyan">
                    <Icon name={v.icon} className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold">{v.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </Stagger>
        </div>
      </section>

      <SectionDivider flip />

      {/* Meet the team */}
      <section className="section">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Meet the gemologists</span>
            <h2 className="mt-5 font-display text-4xl font-bold sm:text-5xl">
              The people who <span className="text-gradient">sign your report</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Credentialed, independent and accountable. Every verdict carries a name.
            </p>
          </Reveal>
          <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <Reveal key={member.name}>
                <div className="card-luxe h-full rounded-2xl p-6 text-center">
                  <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-brilliant-soft">
                    <span className="font-display text-2xl font-bold text-gradient">
                      {member.name.split(' ').map((n) => n[0]).slice(-2).join('')}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold">{member.name}</h3>
                  <p className="mt-1 text-sm font-medium text-brilliant-cyan">{member.role}</p>
                  <Badge variant="muted" className="mt-3">{member.cred}</Badge>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{member.bio}</p>
                </div>
              </Reveal>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Stats strip */}
      <section className="section pt-0">
        <div className="container-wide">
          <Reveal>
            <div className="card-luxe grid grid-cols-2 gap-px overflow-hidden rounded-2xl md:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="bg-card/40 px-6 py-8 text-center backdrop-blur">
                  <div className="font-display text-3xl font-bold text-gradient sm:text-4xl">{s.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="section pt-0">
        <div className="container-wide">
          <Reveal>
            <div className="card-luxe relative overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-16">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--brilliant-indigo)/0.35),transparent_60%)]" />
              <h2 className="mx-auto max-w-3xl font-display text-4xl font-bold sm:text-5xl">
                Ready for an answer you can <span className="text-gradient">trust?</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Start with a free photo screen or send your stone to the lab. Either way, a certified
                gemologist stands behind the result.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="sheen">
                  <Link href="/verify">Verify my diamond <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/how-it-works">See how it works</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
