'use client'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === 'dark'
  return (
    <button
      type="button"
      aria-label="Toggle light / dark theme"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'grid h-10 w-10 place-items-center rounded-full border border-border text-platinum-muted transition-colors hover:border-brilliant-cyan/60 hover:text-platinum',
        className,
      )}
    >
      {mounted && !isDark ? <Moon className="h-[1.05rem] w-[1.05rem]" /> : <Sun className="h-[1.05rem] w-[1.05rem]" />}
    </button>
  )
}
