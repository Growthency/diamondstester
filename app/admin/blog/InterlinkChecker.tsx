'use client'

import { useMemo, useState } from 'react'
import { Link2, Copy, Check, ChevronDown, Plus, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { site } from '@/lib/site'
import type { InterlinkCheckerProps } from './types'

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Words this short are too generic to anchor a suggestion on. */
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'your', 'you', 'are', 'how', 'what', 'why',
  'from', 'that', 'this', 'into', 'guide', 'best', 'when', 'where', 'have',
  'has', 'can', 'all', 'about', 'vs', 'a', 'an', 'of', 'to', 'in', 'on',
])

// Tags whose text we never touch — avoids nested anchors, rewriting headings
// and breaking code blocks.
const SKIP_TAGS = new Set(['A', 'H1', 'H2', 'H3', 'H4', 'CODE', 'PRE'])

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** The keywords we will look for in the content for a given post title. */
function keywordsForTitle(title: string): string[] {
  const trimmed = title.trim()
  if (!trimmed) return []
  const keywords = [trimmed]
  // Significant single words (4+ chars, not stop-words) as secondary anchors.
  for (const word of trimmed.split(/\s+/)) {
    const clean = word.replace(/[^\p{L}\p{N}-]/gu, '')
    if (clean.length >= 4 && !STOP_WORDS.has(clean.toLowerCase())) {
      keywords.push(clean)
    }
  }
  // De-dup, longest first so the more specific phrase wins.
  return Array.from(new Set(keywords)).sort((a, b) => b.length - a.length)
}

function getExistingHrefs(html: string): string[] {
  if (typeof document === 'undefined') return []
  const div = document.createElement('div')
  div.innerHTML = html
  return Array.from(div.querySelectorAll('a[href]')).map(
    (a) => a.getAttribute('href') || '',
  )
}

function plainText(html: string): string {
  if (typeof document === 'undefined') return ''
  const div = document.createElement('div')
  div.innerHTML = html
  return (div.textContent || '').toLowerCase()
}

/**
 * Walk the text nodes of `root`, skipping anything inside SKIP_TAGS, and wrap
 * the first occurrence of `regex` in an anchor to `/blog/{slug}`. Returns true
 * if a match was wrapped.
 */
function wrapFirstMatch(root: Node, regex: RegExp, slug: string): boolean {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      let el: Element | null = node.parentElement
      while (el) {
        if (SKIP_TAGS.has(el.tagName)) return NodeFilter.FILTER_REJECT
        el = el.parentElement
      }
      return NodeFilter.FILTER_ACCEPT
    },
  })

  let textNode = walker.nextNode() as Text | null
  while (textNode) {
    const text = textNode.nodeValue || ''
    const m = text.match(regex)
    if (m && m.index !== undefined) {
      const before = text.slice(0, m.index)
      const matched = m[0] // keep the content's original casing
      const after = text.slice(m.index + matched.length)

      const frag = document.createDocumentFragment()
      if (before) frag.appendChild(document.createTextNode(before))
      const a = document.createElement('a')
      a.setAttribute('href', `/blog/${slug}`)
      a.textContent = matched
      frag.appendChild(a)
      if (after) frag.appendChild(document.createTextNode(after))

      textNode.parentNode?.replaceChild(frag, textNode)
      return true
    }
    textNode = walker.nextNode() as Text | null
  }
  return false
}

interface Suggestion {
  keyword: string
  title: string
  slug: string
}

/** Apply a set of suggestions to an HTML string and return the new HTML. */
function applySuggestions(html: string, suggestions: Suggestion[]): string {
  if (typeof document === 'undefined' || !html || suggestions.length === 0) {
    return html
  }
  const container = document.createElement('div')
  container.innerHTML = html
  for (const s of suggestions) {
    const regex = new RegExp(`\\b(${escapeRegex(s.keyword)})\\b`, 'i')
    wrapFirstMatch(container, regex, s.slug)
  }
  return container.innerHTML
}

// ── Component ───────────────────────────────────────────────────────────────

export function InterlinkChecker({ content, posts, onApply }: InterlinkCheckerProps) {
  const [expanded, setExpanded] = useState(false)
  const [appliedSlugs, setAppliedSlugs] = useState<Set<string>>(new Set())
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  const suggestions = useMemo<Suggestion[]>(() => {
    if (typeof document === 'undefined') return []
    if (!content || content.trim().length < 10) return []

    const text = plainText(content)
    const hrefs = getExistingHrefs(content)
    const found: Suggestion[] = []
    const usedSlugs = new Set<string>()

    for (const post of posts) {
      const slug = post.slug.replace(/^\//, '')
      if (!slug || usedSlugs.has(slug)) continue
      // Already linked somewhere in the content.
      if (hrefs.some((href) => href.includes(`/blog/${slug}`))) continue

      for (const keyword of keywordsForTitle(post.title)) {
        if (keyword.length < 3) continue
        const regex = new RegExp(`\\b${escapeRegex(keyword)}\\b`, 'i')
        if (regex.test(text)) {
          found.push({ keyword, title: post.title, slug })
          usedSlugs.add(slug)
          break // one suggestion per post is enough
        }
      }
    }

    return found
  }, [content, posts])

  const pending = suggestions.filter((s) => !appliedSlugs.has(s.slug))

  function handleApply(suggestion: Suggestion) {
    const newHtml = applySuggestions(content, [suggestion])
    if (newHtml !== content) {
      onApply(newHtml)
      setAppliedSlugs((prev) => new Set(prev).add(suggestion.slug))
    }
  }

  function handleApplyAll() {
    if (pending.length === 0) return
    const newHtml = applySuggestions(content, pending)
    if (newHtml !== content) {
      onApply(newHtml)
      setAppliedSlugs((prev) => {
        const next = new Set(prev)
        for (const s of pending) next.add(s.slug)
        return next
      })
    }
  }

  async function handleCopy(slug: string) {
    const url = `${site.url}/blog/${slug}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug((cur) => (cur === slug ? null : cur)), 2000)
  }

  return (
    <div className="rounded-2xl border border-border bg-card">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-brilliant-cyan" />
          <span className="text-sm font-semibold text-platinum">Interlink Checker</span>
          {suggestions.length > 0 && (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-brilliant-soft px-1.5 py-0.5 text-[10px] font-bold text-brilliant-cyan">
              {suggestions.length}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            expanded && 'rotate-180',
          )}
        />
      </button>

      {expanded && (
        <div className="border-t border-border px-4 py-3">
          {suggestions.length === 0 ? (
            <p className="py-2 text-xs text-muted-foreground">
              {content.trim().length < 10
                ? 'Start writing to see interlink suggestions.'
                : 'No interlink opportunities found. Relevant posts are already linked, or no keyword matches were detected.'}
            </p>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  {suggestions.length} interlink{' '}
                  {suggestions.length === 1 ? 'opportunity' : 'opportunities'} found
                </p>
                <button
                  type="button"
                  onClick={handleApplyAll}
                  disabled={pending.length === 0}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-brilliant px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-glow transition hover:bg-brilliant/90 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Insert every suggested interlink into the content"
                >
                  <Sparkles className="h-3 w-3" />
                  Approve all{pending.length > 0 ? ` (${pending.length})` : ''}
                </button>
              </div>

              <div className="max-h-64 space-y-2 overflow-y-auto">
                {suggestions.map((s) => {
                  const applied = appliedSlugs.has(s.slug)
                  const copied = copiedSlug === s.slug
                  return (
                    <div
                      key={s.slug}
                      className="rounded-lg border border-border bg-secondary/40 p-2.5 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-muted-foreground">
                            Mentions{' '}
                            <span className="font-semibold text-brilliant-cyan">
                              &ldquo;{s.keyword}&rdquo;
                            </span>
                          </p>
                          <p className="mt-1 truncate font-medium text-platinum">{s.title}</p>
                          <p className="mt-0.5 truncate text-brilliant-cyan/70">/blog/{s.slug}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleApply(s)}
                            disabled={applied}
                            className={cn(
                              'rounded-md p-1.5 transition-colors',
                              applied
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-brilliant-soft text-brilliant-cyan hover:bg-brilliant-soft/70',
                            )}
                            title={applied ? 'Interlink applied' : 'Insert this interlink'}
                          >
                            {applied ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <Plus className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(s.slug)}
                            className={cn(
                              'inline-flex items-center gap-1 rounded-md p-1.5 transition-colors',
                              copied
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-secondary/60 text-muted-foreground hover:text-platinum',
                            )}
                            title="Copy full URL"
                          >
                            {copied ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-medium">Copied</span>
                              </>
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
