'use client'
import { Star } from 'lucide-react'
import { testimonials } from '@/lib/content/site-data'

export function TestimonialMarquee() {
  const row = [...testimonials, ...testimonials]
  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      <div className="flex w-max animate-marquee gap-5 hover:[animation-play-state:paused]">
        {row.map((t, i) => (
          <figure key={i} className="card-luxe w-[340px] shrink-0 rounded-2xl p-6">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, s) => (
                <Star key={s} className="h-4 w-4 fill-brilliant-cyan text-brilliant-cyan" />
              ))}
            </div>
            <blockquote className="mt-4 text-sm leading-relaxed text-platinum">"{t.quote}"</blockquote>
            <figcaption className="mt-4 text-sm">
              <span className="font-semibold text-platinum">{t.name}</span>
              <span className="text-muted-foreground"> · {t.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
