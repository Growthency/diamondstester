'use client'

import { Check, Link2, Linkedin, Facebook } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { site } from '@/lib/site'

/** X / Twitter glyph (not in the lucide set we use elsewhere). */
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  )
}

export function ShareRow({ slug, title }: { slug: string; title: string }) {
  const [copied, setCopied] = useState(false)
  const url = `${site.url.replace(/\/$/, '')}/blog/${slug}`
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const links = [
    {
      label: 'Share on X',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: XIcon,
    },
    {
      label: 'Share on Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: Facebook,
    },
    {
      label: 'Share on LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: Linkedin,
    },
  ]

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy the link')
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground">Share this article</span>
      <div className="flex items-center gap-2">
        {links.map(({ label, href, icon: IconCmp }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="grid h-10 w-10 place-items-center rounded-full border border-border bg-secondary/30 text-platinum-muted transition-all hover:border-brilliant-cyan/60 hover:text-brilliant-cyan"
          >
            <IconCmp className="h-4 w-4" />
          </a>
        ))}
        <button
          type="button"
          onClick={copyLink}
          aria-label="Copy link"
          className="grid h-10 w-10 place-items-center rounded-full border border-border bg-secondary/30 text-platinum-muted transition-all hover:border-brilliant-cyan/60 hover:text-brilliant-cyan"
        >
          {copied ? <Check className="h-4 w-4 text-brilliant-cyan" /> : <Link2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
