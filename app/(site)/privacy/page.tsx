import type { Metadata } from 'next'
import Link from 'next/link'
import { Reveal } from '@/components/motion/Reveal'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Diamonds Tester collects, uses, protects and retains your personal data, photos and mailed-in stones — and the rights you have over your information.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <section className="section pt-32">
      <div className="container-wide">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">Legal</span>
          <h1 className="mt-5 font-display text-4xl font-bold sm:text-5xl">
            Privacy <span className="text-gradient">Policy</span>
          </h1>
          <p className="mt-4 text-sm text-platinum-muted">Last updated: June 2026</p>
        </Reveal>

        <article className="mx-auto mt-14 max-w-3xl space-y-10 text-platinum-muted">
          <p className="text-base leading-relaxed">
            {site.legalName} (“Diamonds Tester”, “we”, “us”) provides diamond testing and verification
            services. This policy explains what personal information we collect when you use our
            website, submit photos, send us a stone, or contact us — and how we protect it. We take
            privacy seriously because you’re trusting us with both your data and, often, valuable
            possessions.
          </p>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-platinum">1. Information we collect</h2>
            <p className="leading-relaxed">We only collect what we need to deliver a verdict and run our service:</p>
            <ul className="space-y-2 pl-1">
              {[
                ['Contact details', 'your name, email address, phone number and, when you mail in a stone, your postal address for insured return shipping.'],
                ['Stone photographs', 'images you upload for photo verification, including any metadata embedded in those files.'],
                ['Stones mailed to us', 'the physical item itself while it is in our custody, plus the testing measurements and results we generate from it.'],
                ['Order & payment data', 'the services you purchase and transaction references. Card payments are processed by our payment provider — we never see or store full card numbers.'],
                ['Usage data', 'basic analytics such as pages visited and device type, used to keep the site working and improve it.'],
                ['Communications', 'the contents of messages you send us through forms, email, WhatsApp or phone.'],
              ].map(([term, def]) => (
                <li key={term} className="leading-relaxed">
                  <span className="font-semibold text-platinum">{term}:</span> {def}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-platinum">2. How we use your information</h2>
            <p className="leading-relaxed">We use your information to:</p>
            <ul className="space-y-2 pl-1">
              {[
                'produce your authenticity verdict, grading report or certificate;',
                'arrange insured, tracked shipping for stones you mail in and return them safely;',
                'process payments and send you receipts, results and service updates;',
                'respond to your enquiries and provide support;',
                'maintain security, prevent fraud and meet our legal obligations;',
                'improve the accuracy of our testing and the quality of our website.',
              ].map((t) => (
                <li key={t} className="leading-relaxed">
                  <span className="mr-2 text-brilliant-cyan">•</span>
                  {t}
                </li>
              ))}
            </ul>
            <p className="leading-relaxed">
              We rely on your consent, the performance of our contract with you, and our legitimate
              interest in running and improving the service as the legal bases for this processing.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-platinum">3. We never sell your data</h2>
            <p className="leading-relaxed">
              We do not sell, rent or trade your personal information, your photos, or your testing
              results to anyone. Ever. We share data only with the service providers who help us
              operate — for example our insured shipping carriers, payment processor and partner
              laboratory — and only to the extent they need it to perform their role. These partners
              are bound by confidentiality and data-protection obligations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-platinum">4. Your photos and stones</h2>
            <p className="leading-relaxed">
              Photographs you submit are used solely to produce your verdict. We do not publish them
              or use them for marketing without your explicit, separate permission. Stones you mail
              in remain your property at all times; they are handled only by certified gemologists,
              kept insured and tracked end to end, and returned to you in the same secure manner they
              arrived.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-platinum">5. Data retention</h2>
            <p className="leading-relaxed">
              We keep certificate and grading records for as long as needed to support
              re-verification, insurance and resale — typically up to seven years — because a
              certificate has lasting value. Submitted photos are retained only as long as necessary
              to deliver and support your result, and you may ask us to delete them at any time.
              Stones are never retained beyond the testing window: they are returned promptly once
              testing is complete.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-platinum">6. Cookies and analytics</h2>
            <p className="leading-relaxed">
              Our website uses essential cookies to function and a small set of analytics cookies to
              understand how the site is used so we can improve it. You can control or block cookies
              through your browser settings; blocking essential cookies may affect how the site
              works. We do not use cookies to build advertising profiles or to sell your behaviour to
              third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-platinum">7. How we protect your data</h2>
            <p className="leading-relaxed">
              We use encryption in transit, access controls and secure handling procedures for both
              digital records and physical stones. No method of transmission or storage is perfectly
              secure, but we apply safeguards proportionate to the sensitivity of what you entrust to
              us and review them regularly.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-platinum">8. Your rights</h2>
            <p className="leading-relaxed">
              Depending on where you live, you may have the right to access the personal data we hold
              about you, correct it, request its deletion, object to or restrict its processing, and
              receive a copy in a portable format. You can also withdraw consent at any time where we
              rely on it. To exercise any of these rights, contact us using the details below — we’ll
              respond within the time required by applicable law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-platinum">9. Children</h2>
            <p className="leading-relaxed">
              Our service is intended for adults. We do not knowingly collect personal information
              from children under 16. If you believe a child has provided us data, contact us and we
              will delete it.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-platinum">10. Changes to this policy</h2>
            <p className="leading-relaxed">
              We may update this policy as our service evolves or the law changes. When we do, we’ll
              revise the “last updated” date above and, for material changes, take reasonable steps to
              let you know.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-platinum">11. Contact us</h2>
            <p className="leading-relaxed">
              Questions about this policy or your data? Reach our team at{' '}
              <a href={`mailto:${site.contact.email}`} className="text-brilliant-cyan hover:underline">
                {site.contact.email}
              </a>{' '}
              or by post at {site.contact.address}. You can also use our{' '}
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
