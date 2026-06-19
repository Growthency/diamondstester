'use client'
import { useEffect, useState } from 'react'

export function Typewriter({
  words,
  className,
}: {
  words: string[]
  className?: string
}) {
  const [index, setIndex] = useState(0)
  const [sub, setSub] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = words[index % words.length]
    if (!deleting && sub === current.length) {
      const t = setTimeout(() => setDeleting(true), 1600)
      return () => clearTimeout(t)
    }
    if (deleting && sub === 0) {
      setDeleting(false)
      setIndex((i) => (i + 1) % words.length)
      return
    }
    const t = setTimeout(() => {
      setSub((s) => s + (deleting ? -1 : 1))
    }, deleting ? 45 : 90)
    return () => clearTimeout(t)
  }, [sub, deleting, index, words])

  const current = words[index % words.length]
  return (
    <span className={className}>
      <span className="text-gradient">{current.substring(0, sub)}</span>
      <span className="ml-0.5 inline-block w-[3px] -translate-y-1 animate-pulse bg-brilliant-cyan align-middle" style={{ height: '0.9em' }} />
    </span>
  )
}
