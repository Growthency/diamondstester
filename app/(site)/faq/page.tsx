import Link from 'next/link'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { Reveal } from '@/components/motion/Reveal'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/button'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import { faqs } from '@/lib/content/site-data'
import { whatsappHref } from '@/lib/site'
import { pageMeta, breadcrumbLd, faqLd } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata = pageMeta({
  title: 'Diamond Testing FAQ — Accuracy, Pricing & Shipping',
  description:
    'Answers to the questions diamond owners actually ask — on testing accuracy, pricing and turnaround, shipping and safety, and certificates for insurance and resale.',
  path: '/faq',
})

const pick = (q: string) => faqs.find((f) => f.q === q)!

const categories = [
  {
    name: 'Testing & accuracy',
    icon: 'Microscope',
    items: [
      pick('Can you really tell if a diamond is real from a photo?'),
      pick('What’s the difference between a fake and a lab-grown diamond?'),
      pick('Will a cheap diamond tester pen tell me everything?'),
      {
        q: 'How accurate is your lab testing?',
        a: 'Our instrument-based lab testing matches independent reference grading 99.4% of the time. Conductivity staging, refractive index, fluorescence and spectroscopy together leave very little room for ambiguity — and a certified gemologist reviews every borderline call before it ships.',
      },
      {
        q: 'Can you detect lab-grown (CVD and HPHT) diamonds?',
        a: 'Yes. Lab-grown diamonds carry distinct growth signatures in their fluorescence and spectroscopy that natural stones don’t. Our lab service makes a definitive natural-vs-lab-grown call and flags HPHT treatment where present.',
      },
      {
        q: 'Do I need to take the stone out of its setting?',
        a: 'Not necessarily, but a loose stone gives the cleanest read. Closed-back or bezel settings can block light return and conductivity contact, which limits what we can measure. If a setting gets in the way, we’ll tell you exactly what it affects.',
      },
    ],
  },
  {
    name: 'Pricing & turnaround',
    icon: 'FileCheck2',
    items: [
      pick('How long does certification take?'),
      {
        q: 'How much does it cost?',
        a: 'Photo verification is free. Mail-in testing starts at $39 and full lab certification starts at $79, with the exact price depending on carat weight and the depth of report you need. There are no subscriptions and no hidden fees — you pay once, per stone.',
      },
      {
        q: 'Are there any subscriptions or recurring charges?',
        a: 'No. Diamonds Tester is strictly pay-per-test. You own your report forever and we never charge you again to access it.',
      },
      {
        q: 'Can I upgrade from a photo screen to a full lab test later?',
        a: 'Absolutely. Many owners start with the free photo screen, and if it flags anything — or they simply want certification for insurance — they upgrade to mail-in or lab testing in a couple of clicks. Your earlier result carries over.',
      },
    ],
  },
  {
    name: 'Shipping & safety',
    icon: 'ShieldCheck',
    items: [
      pick('Is my stone safe when I mail it in?'),
      {
        q: 'Is my stone insured while it’s with you?',
        a: 'Yes. Every mailer is fully insured and tamper-evident, with end-to-end tracking in both directions. Your stone is covered from the moment it leaves your hands until it’s back in them.',
      },
      {
        q: 'Which countries do you ship to?',
        a: 'We serve owners in over 60 countries. Insured shipping kits and return logistics are arranged at checkout based on your location, with full tracking throughout.',
      },
      {
        q: 'What happens if my package is lost or damaged?',
        a: 'It’s covered. Because every shipment is insured and tracked, a lost or damaged parcel is reimbursed under the policy. In practice, tamper-evident packaging and signed handovers make this exceedingly rare.',
      },
    ],
  },
  {
    name: 'Certificates & insurance',
    icon: 'BadgeCheck',
    items: [
      {
        q: 'Will insurers accept your certificate?',
        a: 'Yes. Our lab certificates are numbered, tamper-proof and detail the full 4Cs, origin and an estimated market value — exactly what an insurer needs to schedule a piece. Owners routinely use them to get coverage the same week.',
      },
      pick('Do you store or sell my photos?'),
      {
        q: 'Can I use the report to resell my diamond?',
        a: 'Definitely. An independent, instrument-backed certificate is one of the strongest things you can hand a buyer. Because we don’t trade diamonds, the report carries no conflict of interest — it simply states what your stone is.',
      },
      {
        q: 'I lost my certificate. Can I get a replacement?',
        a: 'Yes. Every certificate is numbered and on file. Contact us with your number and we’ll reissue a copy — your report is yours for good.',
      },
    ],
  },
]

export default function FaqPage() {
  const allFaqs = categories.flatMap((cat) => cat.items.map((f) => ({ q: f.q, a: f.a })))

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'FAQ', path: '/faq' }]),
          faqLd(allFaqs),
        ]}
      />
      {/* Hero */}
      <section className="section pt-32">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">
              <Icon name="Search" className="h-3.5 w-3.5 text-brilliant-cyan" />
              Frequently asked
            </span>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Questions, answered <span className="text-gradient">honestly</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              No spin, no upsell. Here’s the straight version of what owners ask us most — about how
              the testing works, what it costs, how we keep your stone safe, and how to put a
              certificate to work.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Categorised FAQs */}
      <section className="section pt-0">
        <div className="container-wide max-w-4xl">
          <div className="space-y-12">
            {categories.map((cat) => (
              <Reveal key={cat.name}>
                <div className="card-luxe rounded-2xl p-6 sm:p-8">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-brilliant-soft text-brilliant-cyan">
                      <Icon name={cat.icon} className="h-5 w-5" />
                    </span>
                    <h2 className="font-display text-2xl font-bold">{cat.name}</h2>
                  </div>
                  <Accordion type="single" collapsible className="mt-4 w-full">
                    {cat.items.map((f, i) => (
                      <AccordionItem key={i} value={`${cat.name}-${i}`}>
                        <AccordionTrigger>{f.q}</AccordionTrigger>
                        <AccordionContent>{f.a}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Still have questions / WhatsApp + CTA */}
      <section className="section pt-0">
        <div className="container-wide">
          <Reveal>
            <div className="card-luxe relative overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-16">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--brilliant-indigo)/0.35),transparent_60%)]" />
              <h2 className="mx-auto max-w-3xl font-display text-4xl font-bold sm:text-5xl">
                Still have <span className="text-gradient">questions?</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Talk to a real gemologist — message us on WhatsApp for a quick, no-pressure answer,
                or start your verification whenever you’re ready.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" variant="outline">
                  <a href={whatsappHref()} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" /> WhatsApp us
                  </a>
                </Button>
                <Button asChild size="lg" className="sheen">
                  <Link href="/verify">Verify my diamond <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
