import { cn } from '@/lib/utils'
import { site } from '@/lib/site'

/**
 * Diamonds Tester logomark — a brilliant-cut diamond built from facets that catch the
 * brand gradient (cyan → indigo → violet). Used standalone or with the wordmark.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label={`${site.name} logo`}>
      <defs>
        <linearGradient id="ciq-facet-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--brilliant-cyan))" />
          <stop offset="100%" stopColor="hsl(var(--brilliant-indigo))" />
        </linearGradient>
        <linearGradient id="ciq-facet-b" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(var(--brilliant-indigo))" />
          <stop offset="100%" stopColor="hsl(var(--brilliant-violet))" />
        </linearGradient>
      </defs>
      {/* crown */}
      <path d="M24 4 L40 16 L24 16 Z" fill="url(#ciq-facet-a)" opacity="0.95" />
      <path d="M24 4 L8 16 L24 16 Z" fill="url(#ciq-facet-b)" opacity="0.8" />
      <path d="M8 16 L24 16 L24 4 Z" fill="none" />
      {/* table line */}
      <path d="M8 16 L40 16" stroke="hsl(var(--brilliant-cyan))" strokeWidth="0.6" opacity="0.5" />
      {/* pavilion */}
      <path d="M8 16 L24 44 L24 16 Z" fill="url(#ciq-facet-a)" />
      <path d="M40 16 L24 44 L24 16 Z" fill="url(#ciq-facet-b)" />
      {/* facet sparkle lines */}
      <path d="M16 16 L24 44 M32 16 L24 44" stroke="hsl(var(--ink))" strokeWidth="0.7" opacity="0.35" />
      <path d="M24 4 L24 16" stroke="hsl(var(--ink))" strokeWidth="0.7" opacity="0.3" />
    </svg>
  )
}

export function Logo({
  className,
  withText = true,
  textClassName,
}: {
  className?: string
  withText?: boolean
  textClassName?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark className="h-8 w-8 drop-shadow-[0_2px_8px_hsl(var(--brilliant-indigo)/0.5)]" />
      {withText && (
        <span className={cn('font-display text-xl font-bold tracking-tight', textClassName)}>
          {(() => {
            const parts = site.name.split(' ')
            const last = parts.pop() ?? ''
            return (
              <>
                {parts.length > 0 && <>{parts.join(' ')} </>}
                <span className="text-gradient">{last}</span>
              </>
            )
          })()}
        </span>
      )}
    </span>
  )
}
