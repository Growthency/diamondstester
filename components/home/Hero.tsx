'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck, Sparkles, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Typewriter } from '@/components/home/Typewriter'
import { DiamondVisual } from '@/components/home/DiamondVisual'
import { stats } from '@/lib/content/site-data'

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-36 sm:pt-44">
      <div className="container-wide grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="eyebrow"
          >
            <Sparkles className="h-3.5 w-3.5 text-brilliant-cyan" />
            Gemologist-grade diamond verification
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-6 font-display text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
          >
            <span className="text-shimmer">Know if your diamond is</span>
            <br />
            <Typewriter words={['real.', 'lab-grown.', 'a fake.', 'worth it.']} />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            Upload a photo or book a lab test and get a clear, expert-backed verdict on
            authenticity, carat, cut and clarity — in minutes, not weeks. No jeweller markup,
            no guesswork, no subscriptions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Button asChild size="lg" className="sheen">
              <Link href="/identify">
                Test my diamond free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/verify">Book a lab test</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-platinum-muted"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brilliant-cyan" /> Free photo screening
            </span>
            <span className="flex items-center gap-2">
              <span className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-brilliant-cyan text-brilliant-cyan" />)}</span>
              Rated 4.9/5 by 2,400+ owners
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <DiamondVisual />
        </motion.div>
      </div>

      {/* stat strip */}
      <div className="container-wide mt-16">
        <div className="card-luxe grid grid-cols-2 gap-px overflow-hidden rounded-2xl md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-card/40 px-6 py-7 text-center backdrop-blur">
              <div className="font-display text-3xl font-bold text-gradient sm:text-4xl">{s.value}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
