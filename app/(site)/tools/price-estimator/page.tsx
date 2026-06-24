export const runtime = 'edge'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/motion/Reveal'
import { Button } from '@/components/ui/button'
import { pageMeta, breadcrumbLd } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { PriceEstimator } from './PriceEstimator'

export const metadata = pageMeta({
  title: 'Diamond Price Estimator — Value from the 4Cs',
  description:
    'Estimate a diamond’s price range from carat, cut, colour and clarity. A transparent, gemologist-built model that shows how each of the 4Cs moves the value band.',
  path: '/tools/price-estimator',
})

export default function PriceEstimatorPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Tools', path: '/tools' },
          { name: 'Diamond Price Estimator', path: '/tools/price-estimator' },
        ])}
      />
      <section className="section pt-32">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Free tool</span>
            <h1 className="mt-5 font-display text-4xl font-bold sm:text-5xl">
              Diamond price <span className="text-gradient">estimator</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Move the dials for carat, cut, colour and clarity to see an indicative price band.
              It mirrors how the market really behaves: value climbs faster than weight, and every
              grade up the scale shifts the range.
            </p>
          </Reveal>

          <div className="mx-auto mt-14 max-w-4xl">
            <PriceEstimator />
          </div>

          <Reveal className="mx-auto mt-14 max-w-3xl">
            <div className="card-luxe rounded-2xl p-7">
              <h2 className="font-display text-lg font-semibold">Why it’s a range, not a price</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Two diamonds with identical 4Cs can still trade differently depending on fluorescence,
                exact proportions, the strength of inclusions and current demand. Our model starts
                from a per-carat base for a 1-carat ideal stone, scales it by carat to the power of
                1.6 to reflect the premium on larger weights, then applies cut, colour and clarity
                multipliers — and shows a ±12% band to keep you honest about the uncertainty.
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
                Insuring or selling? <span className="text-gradient">Get it certified.</span>
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                An estimate won’t satisfy an insurer or a serious buyer. A numbered lab certificate
                with graded 4Cs and a documented value will.
              </p>
              <Button asChild size="lg" className="mt-7 sheen">
                <Link href="/verify">Get lab certification <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
