import type { Metadata } from 'next'
import { Reveal } from '@/components/motion/Reveal'
import { DiamondQuiz } from './DiamondQuiz'

export const metadata: Metadata = {
  title: 'Can You Spot a Real Diamond? — Authenticity Quiz',
  description:
    'Test your eye with six questions on the tests that actually separate real diamond from moissanite, cubic zirconia and glass. Instant feedback and a final verdict.',
  alternates: { canonical: '/tools/quiz' },
}

export default function QuizPage() {
  return (
    <section className="section pt-32">
      <div className="container-wide">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Free tool</span>
          <h1 className="mt-5 font-display text-4xl font-bold sm:text-5xl">
            Can you spot a <span className="text-gradient">real diamond?</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Six questions on the tells that actually matter. We’ll grade you as you go — and tell you
            honestly whether your eye can be trusted at the counter.
          </p>
        </Reveal>

        <div className="mx-auto mt-12 max-w-2xl">
          <DiamondQuiz />
        </div>
      </div>
    </section>
  )
}
