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
 * Extract the h2/h3 headings from article content (in document order) so the
 * page can render a table of contents. Slugs here MUST match the ids injected
 * by `renderPostContent` below. Markdown is parsed line-by-line; HTML posts
 * (rich-editor content) are parsed from their heading tags instead.
 */
export function extractHeadings(content: string, format?: 'html' | 'markdown'): Heading[] {
  const isHtml = format === 'html' || (format === undefined && looksLikeHtml(content ?? ''))
  return isHtml ? extractHtmlHeadings(content ?? '') : extractMarkdownHeadings(content ?? '')
}

function extractMarkdownHeadings(md: string): Heading[] {
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

// Pull h2/h3 headings out of rich HTML. The slug sequence here mirrors
// `injectHeadingIds` exactly, so TOC anchors line up with the body's ids.
function extractHtmlHeadings(html: string): Heading[] {
  const headings: Heading[] = []
  const used = new Map<string, number>()
  const re = /<(h2|h3)\b[^>]*>([\s\S]*?)<\/\1>/gi

  let match: RegExpExecArray | null
  while ((match = re.exec(html)) !== null) {
    const level = (match[1].toLowerCase() === 'h2' ? 2 : 3) as 2 | 3
    const text = match[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
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
      a: externalLinkTransform,
    },
  })

  return injectHeadingIds(clean)
}

// Open a link in a new tab (without leaking the referrer) when it points off-site.
function externalLinkTransform(tagName: string, attribs: Record<string, string>) {
  const href = attribs.href ?? ''
  const isExternal = /^https?:\/\//i.test(href)
  return {
    tagName,
    attribs: {
      ...attribs,
      ...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
    },
  }
}

// Style validators mirror the rich-editor sanitizer in the blog API route, so a
// post saved there renders byte-for-byte the same on the public page.
const STYLE_LENGTH = /^\d+(?:\.\d+)?(?:px|em|rem|%)$/
const STYLE_COLOR = /^(#[0-9a-fA-F]{3,8}|rgba?\([\d.,\s]+\)|[a-zA-Z]+)$/

/**
 * Sanitize author-supplied HTML (rich-editor posts) with the SAME allowlist the
 * blog API route applies on save. We re-sanitize at render time too so stored
 * rows, seed content and any legacy data are always safe to inject.
 */
function sanitizeRichHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4',
      'p', 'br', 'hr',
      'strong', 'b', 'em', 'i', 'u', 's', 'strike',
      'ul', 'ol', 'li',
      'a', 'blockquote', 'pre', 'code',
      'img', 'figure', 'figcaption',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
      'span', 'div',
    ],
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height', 'style'],
      table: ['style', 'colspan', 'rowspan'],
      td: ['style', 'colspan', 'rowspan'],
      th: ['style', 'colspan', 'rowspan'],
      '*': ['style'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedStyles: {
      '*': {
        'text-align': [/^(left|right|center|justify)$/],
        color: [STYLE_COLOR],
        'background-color': [STYLE_COLOR],
        'max-width': [STYLE_LENGTH],
        width: [STYLE_LENGTH],
        height: [STYLE_LENGTH],
        'border-radius': [STYLE_LENGTH],
        margin: [/^[\d.\s a-z%]+$/],
        padding: [/^[\d.\s a-z%]+$/],
      },
    },
    transformTags: {
      // External-safe: open off-site links in a new tab, and harden any link the
      // author already set to target=_blank against reverse-tabnabbing.
      a: externalLinkTransform,
    },
  })
}

/**
 * Heuristic: does this string already look like HTML rather than markdown? Used
 * only when an explicit `format` isn't supplied (e.g. legacy rows).
 */
function looksLikeHtml(content: string): boolean {
  const trimmed = content.trimStart()
  return trimmed.startsWith('<') || /<(p|h2|ul|table)\b/i.test(content)
}

/**
 * Hybrid renderer for the public article body. Rich-editor posts arrive as HTML
 * and are sanitized with the rich allowlist; legacy/seed posts arrive as
 * markdown and go through the marked path. Either way we inject h2/h3 ids so the
 * table of contents deep-links line up.
 *
 * Server-only helper (no DOM, no client state).
 */
export function renderPostContent(content: string, format?: 'html' | 'markdown'): string {
  const body = content ?? ''
  const isHtml = format === 'html' || (format === undefined && looksLikeHtml(body))
  if (isHtml) {
    return injectHeadingIds(sanitizeRichHtml(body))
  }
  return renderMarkdown(body)
}

/**
 * Add `id="slug"` to each h2/h3 in the sanitized HTML, matching the slugs
 * produced by `extractHeadings` so anchor links line up exactly. Existing
 * attributes (e.g. style on rich-editor headings) are preserved; an id that's
 * already present is left untouched.
 */
function injectHeadingIds(html: string): string {
  const used = new Map<string, number>()
  return html.replace(
    /<(h2|h3)((?:\s[^>]*)?)>([\s\S]*?)<\/\1>/gi,
    (full, tag: string, attrs: string, inner: string) => {
      const text = inner.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
      const id = uniqueSlug(text, used)
      // Don't overwrite an id the author already set.
      if (/\sid\s*=/i.test(attrs)) return full
      return `<${tag}${attrs} id="${id}">${inner}</${tag}>`
    },
  )
}
