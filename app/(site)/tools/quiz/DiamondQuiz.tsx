'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Check, RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Question = {
  q: string
  options: string[]
  correct: number
  explain: string
}

const QUESTIONS: Question[] = [
  {
    q: 'A stone passes a cheap “diamond tester” pen. Is it definitely a real diamond?',
    options: [
      'Yes — the pen is conclusive',
      'No — moissanite passes thermal pens too',
      'Only if it also sparkles a lot',
    ],
    correct: 1,
    explain:
      'Most tester pens read thermal conductivity, and moissanite conducts heat almost as well as diamond. You need an electrical-conductivity stage (or lab testing) to separate the two.',
  },
  {
    q: 'You breathe on a stone to fog it. What does a real diamond do?',
    options: [
      'Stays fogged for several seconds',
      'Clears almost instantly',
      'Never fogs at all',
    ],
    correct: 1,
    explain:
      'Diamond disperses heat extremely fast, so the fog clears almost immediately. Glass and cubic zirconia hold the fog noticeably longer.',
  },
  {
    q: 'You place a loose stone over newspaper text (the read-through test). A genuine, well-cut diamond…',
    options: [
      'Lets you read the text clearly',
      'Won’t let you read the text through it',
      'Magnifies the text like a lens',
    ],
    correct: 1,
    explain:
      'A properly cut diamond bends light so sharply that you can’t read print through it. If text shows through clearly, you’re likely looking at glass or quartz.',
  },
  {
    q: 'Looking through the table with a loupe, you see doubled facet edges. What does that suggest?',
    options: [
      'A flawless natural diamond',
      'Double refraction — likely moissanite',
      'Surface scratches',
    ],
    correct: 1,
    explain:
      'Diamond is singly refractive, so its facet edges look crisp and single. Moissanite is doubly refractive — you see a faint doubling of edges, a classic giveaway.',
  },
  {
    q: 'You drop a loose stone into a glass of water. What’s true about the density / water test?',
    options: [
      'A real diamond floats',
      'A real diamond sinks fast; many fakes sink slower or float',
      'All gemstones float',
    ],
    correct: 1,
    explain:
      'Diamond is dense (about 3.5 g/cm³) and sinks quickly. Lighter simulants like glass tend to sink slowly or float — though density alone can’t confirm a diamond.',
  },
  {
    q: 'A jeweller tells you a stone is “lab-grown.” Is it a fake diamond?',
    options: [
      'Yes — lab-grown is just an imitation',
      'No — lab-grown is a real diamond, just made in a lab',
      'Only if it’s colourless',
    ],
    correct: 1,
    explain:
      'A lab-grown diamond is chemically and physically a real diamond — same carbon crystal and hardness. It simply formed in a lab rather than the earth. A “fake” means a simulant like moissanite or CZ.',
  },
]

const TOTAL = QUESTIONS.length

function verdict(score: number) {
  const pct = score / TOTAL
  if (pct >= 0.83)
    return {
      title: 'Sharp eye',
      body: 'You know the tells that separate diamond from its lookalikes. Still — the pen-proof tests (natural vs. lab-grown, diamond vs. moissanite) need a lab to be certain.',
    }
  if (pct >= 0.5)
    return {
      title: 'Solid instincts',
      body: 'You’d catch the obvious fakes, but a few of these tells trip up most buyers. Don’t bet a purchase on the naked eye — verify before you pay.',
    }
  return {
    title: 'Trust, but verify',
    body: 'These tests fool a lot of people, and that’s exactly how overpaying happens. The good news: a free photo screen catches what the eye can’t.',
  }
}

export function DiamondQuiz() {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const question = QUESTIONS[index]
  const answered = selected !== null

  function choose(i: number) {
    if (answered) return
    setSelected(i)
    if (i === question.correct) setScore((s) => s + 1)
  }

  function next() {
    if (index + 1 >= TOTAL) {
      setDone(true)
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
  }

  function restart() {
    setIndex(0)
    setSelected(null)
    setScore(0)
    setDone(false)
  }

  const transition = reduce
    ? { duration: 0 }
    : { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const }

  return (
    <div>
      {/* Progress */}
      {!done && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-platinum-muted">
            <span>
              Question {index + 1} / {TOTAL}
            </span>
            <span>Score {score}</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary/60">
            <motion.div
              className="h-full rounded-full bg-brilliant"
              initial={false}
              animate={{ width: `${((index + (answered ? 1 : 0)) / TOTAL) * 100}%` }}
              transition={transition}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: reduce ? 0 : 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduce ? 0 : -28 }}
            transition={transition}
            className="card-luxe rounded-2xl p-6 sm:p-8"
          >
            <h2 className="font-display text-xl font-semibold leading-snug">{question.q}</h2>

            <div className="mt-6 space-y-3">
              {question.options.map((opt, i) => {
                const isCorrect = i === question.correct
                const isPicked = i === selected
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => choose(i)}
                    disabled={answered}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-all duration-200',
                      !answered &&
                        'border-border bg-secondary/30 text-platinum hover:border-brilliant-cyan/50 hover:bg-secondary/50',
                      answered && isCorrect && 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200',
                      answered &&
                        isPicked &&
                        !isCorrect &&
                        'border-destructive/50 bg-destructive/10 text-red-200',
                      answered && !isCorrect && !isPicked && 'border-border bg-secondary/20 text-muted-foreground',
                    )}
                  >
                    <span>{opt}</span>
                    {answered && isCorrect && <Check className="h-5 w-5 shrink-0 text-emerald-400" />}
                    {answered && isPicked && !isCorrect && (
                      <X className="h-5 w-5 shrink-0 text-red-400" />
                    )}
                  </button>
                )
              })}
            </div>

            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={transition}
                  className="overflow-hidden"
                >
                  <div className="mt-5 rounded-xl border border-border bg-ink-soft/60 p-4">
                    <p
                      className={cn(
                        'text-sm font-semibold',
                        selected === question.correct ? 'text-emerald-300' : 'text-red-300',
                      )}
                    >
                      {selected === question.correct ? 'Correct.' : 'Not quite.'}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {question.explain}
                    </p>
                  </div>
                  <div className="mt-5 flex justify-end">
                    <Button onClick={next}>
                      {index + 1 >= TOTAL ? 'See my result' : 'Next question'}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: reduce ? 0 : 24, scale: reduce ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={transition}
            className="card-luxe relative overflow-hidden rounded-2xl p-8 text-center sm:p-10"
          >
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--brilliant-indigo)/0.32),transparent_60%)]" />
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-platinum-muted">
              Your score
            </p>
            <p className="mt-2 font-display text-6xl font-extrabold leading-none text-gradient">
              {score}
              <span className="text-3xl text-platinum-muted">/{TOTAL}</span>
            </p>
            <h2 className="mt-6 font-display text-2xl font-bold">{verdict(score).title}</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              {verdict(score).body}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="sheen">
                <Link href="/verify">
                  Verify a real diamond <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button onClick={restart} size="lg" variant="outline">
                <RotateCcw className="h-4 w-4" /> Try again
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
