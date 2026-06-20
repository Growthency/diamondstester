import type { Metadata } from 'next'
import { ResultView } from '@/components/identify/ResultView'

export const metadata: Metadata = {
  title: 'Your Diamond Analysis',
  description: 'Your instant AI diamond authenticity result from Diamonds Tester.',
  robots: { index: false, follow: false },
}

export default function ResultPage() {
  return (
    <section className="section pt-32">
      <div className="container-wide">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <span className="eyebrow">Your result</span>
          <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Here’s what the photo screen found</h2>
        </div>
        <ResultView />
      </div>
    </section>
  )
}
