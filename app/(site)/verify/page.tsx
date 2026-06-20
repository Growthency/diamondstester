import { Clock, ShieldCheck, FileCheck2, Lock, Star } from 'lucide-react'
import { Reveal } from '@/components/motion/Reveal'
import { Icon } from '@/components/ui/Icon'
import { stats } from '@/lib/content/site-data'
import { pageMeta, breadcrumbLd } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { VerifyForm } from './VerifyForm'

export const metadata = pageMeta({
  title: 'Verify a Diamond | Free Photo, Mail-In & Lab Testing',
  description:
    'Start your diamond verification. Upload a photo for a free instant verdict, or request insured mail-in or full lab testing — backed by certified gemologists, no subscriptions.',
  path: '/verify',
})

const benefits = [
  {
    icon: Clock,
    title: 'A verdict, fast',
    body: 'Photo screens return in about 38 seconds. Mail-in averages three business days from arrival.',
  },
  {
    icon: FileCheck2,
    title: 'A report you keep',
    body: 'Download a clean PDF for insurance, resale or your own records — yours forever, no subscription.',
  },
  {
    icon: ShieldCheck,
    title: 'Gemologist-backed',
    body: 'Every certificate is reviewed and signed by a GIA- or IGI-credentialled gemologist.',
  },
  {
    icon: Lock,
    title: 'Private by default',
    body: 'Your photos and stones are never sold or shared. Lab samples are insured and tracked end to end.',
  },
]

export default function VerifyPage({
  searchParams,
}: {
  searchParams?: { method?: string }
}) {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Verify', path: '/verify' }])} />
      <section className="section pt-32">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">
              <Icon name="ScanLine" className="h-3.5 w-3.5 text-brilliant-cyan" />
              Verify your diamond
            </span>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Get a clear <span className="text-gradient">verdict</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Choose how you’d like to verify your stone, tell us a little about it, and a certified
              gemologist takes it from there. Photo screening is free — and there’s never a
              subscription.
            </p>
          </Reveal>

          <div className="mt-14 grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Form */}
            <Reveal>
              <VerifyForm defaultMethod={searchParams?.method} />
            </Reveal>

            {/* Trust / benefit rail */}
            <Reveal className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold">What you’ll get</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  No accounts, no upsell — just a straight answer about your stone.
                </p>
              </div>

              <div className="space-y-4">
                {benefits.map((b) => (
                  <div key={b.title} className="card-luxe flex gap-4 rounded-2xl p-5">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brilliant-soft text-brilliant-cyan">
                      <b.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-display font-semibold">{b.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card-luxe rounded-2xl p-5">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-brilliant-cyan text-brilliant-cyan" />
                  ))}
                  <span className="ml-2 text-sm font-medium text-platinum">4.9/5</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-platinum-muted">
                  “The photo check flagged my ‘diamond’ as moissanite in under a minute. Saved me from
                  overpaying a private seller by thousands.”
                </p>
                <p className="mt-2 text-xs text-muted-foreground">Marcus T. · Austin, TX</p>
              </div>
            </Reveal>
          </div>

          {/* Stats reassurance */}
          <Reveal className="mt-16">
            <div className="card-luxe grid grid-cols-2 gap-px overflow-hidden rounded-2xl md:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="bg-card/40 px-6 py-7 text-center backdrop-blur">
                  <div className="font-display text-3xl font-bold text-gradient sm:text-4xl">{s.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
