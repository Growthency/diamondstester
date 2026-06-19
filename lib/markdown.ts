import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'
import { slugify } from '@/lib/utils'

/** A heading parsed from an article, used to build the table of contents. */
export interface Heading {
  id: string
  text: string
  level: 2 | 3
}

/**
 * Extract the h2/h3 headings from a markdown string (in document order) so the
 * page can render a table of contents. Slugs here MUST match the ids injected
 * by `renderMarkdown` below.
 */
export function extractHeadings(md: string): Heading[] {
  const headings: Heading[] = []
  const used = new Map<string, number>()
  const lines = md.split('\n')
  let inFence = false

  for (const line of lines) {
    // Skip fenced code blocks so a "## comment" inside code isn't treated as a heading.
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    const match = /^(#{2,3})\s+(.*)$/.exec(line.trim())
    if (!match) continue

    const level = match[1].length as 2 | 3
    // Strip inline markdown (emphasis, code, links) from the visible text.
    const text = match[2]
      .replace(/[*_`]/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .trim()
    if (!text) continue

    const id = uniqueSlug(text, used)
    headings.push({ id, text, level })
  }

  return headings
}

function uniqueSlug(text: string, used: Map<string, number>): string {
  const base = slugify(text) || 'section'
  const seen = used.get(base) ?? 0
  used.set(base, seen + 1)
  return seen === 0 ? base : `${base}-${seen}`
}

/**
 * Convert article markdown to safe HTML.
 *  1. `marked` renders markdown → HTML.
 *  2. `sanitize-html` strips anything we don't explicitly allow.
 *  3. We inject slug ids onto h2/h3 so the table of contents can deep-link.
 *
 * Server-only helper (no DOM, no client state).
 */
export function renderMarkdown(md: string): string {
  const rawHtml = marked(md ?? '', { async: false }) as string

  const clean = sanitizeHtml(rawHtml, {
    allowedTags: [
      'h2', 'h3', 'h4',
      'p', 'ul', 'ol', 'li',
      'a', 'strong', 'em',
      'blockquote', 'code', 'pre',
      'hr', 'br',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      // External-safe: open links in a new tab without leaking the referrer.
      a: (tagName, attribs) => {
        const href = attribs.href ?? ''
        const isExternal = /^https?:\/\//i.test(href)
        return {
          tagName,
          attribs: {
            ...attribs,
            ...(isExternal
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {}),
          },
        }
      },
    },
  })

  return injectHeadingIds(clean)
}

/**
 * Add `id="slug"` to each h2/h3 in the sanitized HTML, matching the slugs
 * produced by `extractHeadings` so anchor links line up exactly.
 */
function injectHeadingIds(html: string): string {
  const used = new Map<string, number>()
  return html.replace(
    /<(h2|h3)>([\s\S]*?)<\/\1>/g,
    (_full, tag: string, inner: string) => {
      const text = inner.replace(/<[^>]+>/g, '').trim()
      const id = uniqueSlug(text, used)
      return `<${tag} id="${id}">${inner}</${tag}>`
    },
  )
}
