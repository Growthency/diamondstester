import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/motion/Reveal'
import { Button } from '@/components/ui/button'
import { pageMeta, breadcrumbLd } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { CaratCalculator } from './CaratCalculator'

export const metadata = pageMeta({
  title: 'Carat Weight Calculator — Estimate Carats from mm',
  description:
    'Estimate a diamond’s carat weight from its length, width and depth in millimetres. Supports round, princess, oval, emerald, cushion and pear shapes with trade formulas.',
  path: '/tools/carat-calculator',
})

export default function CaratCalculatorPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Tools', path: '/tools' },
          { name: 'Carat Weight Calculator', path: '/tools/carat-calculator' },
        ])}
      />
      <section className="section pt-32">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Free tool</span>
            <h1 className="mt-5 font-display text-4xl font-bold sm:text-5xl">
              Carat weight <span className="text-gradient">calculator</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Can’t pull the stone to weigh it? Measure it. Enter the millimetre dimensions and
              shape, and we’ll estimate carat weight using the same proportion formulas the trade uses.
            </p>
          </Reveal>

          <div className="mx-auto mt-14 max-w-4xl">
            <CaratCalculator />
          </div>

          <Reveal className="mx-auto mt-14 max-w-3xl">
            <div className="card-luxe rounded-2xl p-7">
              <h2 className="font-display text-lg font-semibold">How the estimate works</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Carat weight is proportional to a stone’s volume and the density of diamond. For
                round brilliants we use diameter² × depth × 0.0061; fancy shapes use length × width ×
                depth × a shape-specific factor. The result is an approximation: real weight varies
                with girdle thickness, cut precision and exact proportions, so treat it as a guide
                rather than a grading figure.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="pb-24 sm:pb-32">
        <div className="container-wide">
          <Reveal>
            <div className="card-luxe relative overflow-hidden rounded-3xl px-8 py-12 text-center sm:px-16">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--brilliant-indigo)/0.3),transparent_60%)]" />
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                Want the <span className="text-gradient">exact weight and grade?</span>
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                Our lab weighs to the hundredth of a carat and certifies the full 4Cs — plus whether
                your stone is natural, lab-grown or a simulant.
              </p>
              <Button asChild size="lg" className="mt-7 sheen">
                <Link href="/verify">Verify my diamond <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
