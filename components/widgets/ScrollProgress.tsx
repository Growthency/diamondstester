'use client'
import { motion, useScroll, useSpring } from 'framer-motion'

/** Thin brilliant-gradient bar pinned to the very top — mirrors the custom scrollbar. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed left-0 top-0 z-[60] h-[3px] w-full origin-left bg-brilliant shadow-[0_0_12px_hsl(var(--brilliant-cyan)/0.8)]"
    />
  )
}
