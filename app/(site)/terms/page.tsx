import type { Metadata } from 'next'
import Link from 'next/link'
import { Reveal } from '@/components/motion/Reveal'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The terms governing your use of Diamonds Tester’s diamond testing and verification services, including scope, accuracy, liability for mailed stones, payment and governing law.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <section className="section pt-32">
      <div className="container-wide">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">Legal</span>
          <h1 className="mt-5 font-display text-4xl font-bold sm:text-5xl">
            Terms of <span className="text-gradient">Service</span>
          </h1>
          <p className="mt-4 text-sm text-platinum-muted">Last updated: June 2026</p>
        </Reveal>

        <article className="mx-auto mt-14 max-w-3xl space-y-10 text-platinum-muted">
          <p className="text-base leading-relaxed">
            These Terms of Service (“Terms”) govern your use of the website and services provided by{' '}
            {site.legalName} (“Diamonds Tester”, “we”, “us”). By uploading a photo, purchasing a service or
            mailing us a stone, you agree to these Terms. Please read them carefully — they include
            important limits on our liability.
          </p>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-platinum">1. Scope of service</h2>
            <p className="leading-relaxed">
              Diamonds Tester provides diamond testing, authenticity screening and verification, and, where
              purchased, laboratory grading and certification. Our services include free photo
              verification, insured mail-in testing, and full lab certification. We assess
              authenticity (natural, lab-grown or simulant) and, where measurable, the 4Cs of cut,
              colour, clarity and carat. Photo-based screening is a first-pass indication only and is
              not a substitute for instrument-based laboratory testing.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-platinum">2. Accuracy and no guarantee of value</h2>
            <p className="leading-relaxed">
              We apply professional gemological methods and stand behind the accuracy of our
              instrument-based lab testing to the tolerances stated on each report. However, our
              certificates and reports are technical opinions, not appraisals or guarantees of resale
              or insurance value. Any estimated value, price range or figure produced by our website
              tools (including the carat calculator and price estimator) is indicative only, may
              differ materially from an actual transaction, and must not be relied upon as a formal
              valuation. Market prices fluctuate and depend on factors outside our control. You are
              responsible for your own purchase, sale and insurance decisions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-platinum">3. Mailed-in stones and insurance</h2>
            <p className="leading-relaxed">
              When you use our mail-in or certification service, you must ship your item using the
              insured, tamper-evident mailer and instructions we provide. While a stone is in our
              custody it is handled by certified gemologists, tracked and insured up to the declared
              value covered by our shipping and handling policy. Our liability for any loss, theft or
              damage to a mailed item is limited to that declared insured value. We are not liable for
              loss or damage occurring before an item reaches us or after it leaves our custody on
              return, nor for items shipped outside our provided mailer or without a declared value.
              You confirm you are the lawful owner of, or are authorised to submit, any item you send.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-platinum">4. Limitation of liability</h2>
            <p className="leading-relaxed">
              To the fullest extent permitted by law, Diamonds Tester is not liable for indirect, incidental,
              special or consequential losses, or for loss of profit, opportunity or anticipated
              savings, arising from your use of our services or reliance on our reports or tools. Our
              total aggregate liability in connection with any service is limited to the greater of
              the fee you paid for that service or, for a lost or damaged mailed item, its declared
              insured value. Nothing in these Terms excludes liability that cannot lawfully be
              excluded, including liability for death or personal injury caused by our negligence or
              for fraud.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-platinum">5. Payment</h2>
            <p className="leading-relaxed">
              Fees for paid services are shown before you confirm an order and are payable in advance
              unless we agree otherwise. Payments are handled by our third-party payment provider.
              Photo verification is provided free of charge. Except where required by law or expressly
              stated, fees for completed testing are non-refundable; if we are unable to perform a
              purchased test, we will refund the corresponding fee.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-platinum">6. Acceptable use</h2>
            <p className="leading-relaxed">
              You agree not to misuse the service, submit items you have no right to submit, attempt
              to interfere with the website’s security or operation, or use our reports to deceive
              third parties. We may decline or discontinue service for any item or user where we
              reasonably suspect unlawful activity or a breach of these Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-platinum">7. Intellectual property</h2>
            <p className="leading-relaxed">
              The Diamonds Tester name, logo, website, content, methodology and report formats are owned by us
              and protected by intellectual-property laws. The certificate or report we issue for your
              stone is yours to keep and use for insurance, resale and personal records. You may not
              copy, alter, resell or misrepresent our reports, or reproduce our website content for
              commercial purposes, without our written permission.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-platinum">8. Privacy</h2>
            <p className="leading-relaxed">
              Our handling of your personal data, photos and mailed items is described in our{' '}
              <Link href="/privacy" className="text-brilliant-cyan hover:underline">
                Privacy Policy
              </Link>
              , which forms part of these Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-platinum">9. Governing law</h2>
            <p className="leading-relaxed">
              These Terms and any dispute arising from them are governed by the laws of England and
              Wales, and the courts of England and Wales have exclusive jurisdiction, save that
              consumers may benefit from any mandatory protections of the country in which they live.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-platinum">10. Changes and contact</h2>
            <p className="leading-relaxed">
              We may update these Terms from time to time; the “last updated” date above shows the
              current version, and continued use after a change means you accept it. Questions about
              these Terms can be sent to{' '}
              <a href={`mailto:${site.contact.email}`} className="text-brilliant-cyan hover:underline">
                {site.contact.email}
              </a>{' '}
              or via our{' '}
              <Link href="/contact" className="text-brilliant-cyan hover:underline">
                contact page
              </Link>
              .
            </p>
          </section>
        </article>
      </div>
    </section>
  )
}
