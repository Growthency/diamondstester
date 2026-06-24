import { NextResponse } from 'next/server'
import { readSession } from '@/lib/auth/session'
import { getAllPosts } from '@/lib/blog'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

const STATIC_ROUTES = [
  '/',
  '/about',
  '/services',
  '/how-it-works',
  '/faq',
  '/verify',
  '/contact',
  '/tools',
  '/tools/carat-calculator',
  '/tools/price-estimator',
  '/tools/quiz',
  '/blog',
  '/privacy',
  '/terms',
  '/identify',
]

type IndexStatus = 'indexable' | 'blocked' | 'error'

interface IndexRow {
  path: string
  url: string
  status: IndexStatus
  httpStatus: number
  reason: string
  hasNoindex: boolean
  canonical: string | null
  inSitemap: boolean
}

function buildBaseUrl(request: Request): string {
  const h = request.headers
  const proto = h.get('x-forwarded-proto') || 'https'
  const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000'
  return `${proto}://${host}`
}

async function fetchWithTimeout(url: string, ms: number): Promise<Response | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { 'user-agent': 'DiamondsTester-Indexing/1.0' },
      cache: 'no-store',
    })
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let cursor = 0
  async function run() {
    while (cursor < items.length) {
      const i = cursor++
      results[i] = await worker(items[i])
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run))
  return results
}

function detectNoindex(html: string, headers: Headers): boolean {
  // X-Robots-Tag header
  const xRobots = headers.get('x-robots-tag')?.toLowerCase() || ''
  if (xRobots.includes('noindex')) return true
  // <meta name="robots" content="...noindex...">
  const meta =
    html.match(/<meta[^>]+name=["']robots["'][^>]*content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]*name=["']robots["']/i)
  if (meta && /noindex/i.test(meta[1] || '')) return true
  return false
}

function extractCanonical(html: string): string | null {
  const m =
    html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']*)["']/i) ||
    html.match(/<link[^>]+href=["']([^"']*)["'][^>]*rel=["']canonical["']/i)
  return m ? (m[1] || '').trim() : null
}

export async function GET(request: Request) {
  return runReport(request)
}

export async function POST(request: Request) {
  return runReport(request)
}

async function runReport(request: Request) {
  if (!(await readSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const base = buildBaseUrl(request)
  const scannedAt = new Date().toISOString()

  let routes = [...STATIC_ROUTES]
  try {
    const posts = await getAllPosts()
    routes.push(...posts.map((p) => `/blog/${p.slug}`))
  } catch {
    /* static routes only */
  }
  routes = Array.from(new Set(routes))
  const routeSet = new Set(routes)

  const rows = await mapWithConcurrency(routes, 6, async (path): Promise<IndexRow> => {
    const url = base + path
    const res = await fetchWithTimeout(url, 8000)

    if (!res) {
      return {
        path,
        url,
        status: 'error',
        httpStatus: 0,
        reason: 'Fetch failed (timeout or network error)',
        hasNoindex: false,
        canonical: null,
        inSitemap: routeSet.has(path),
      }
    }
    if (res.status >= 400) {
      return {
        path,
        url,
        status: 'error',
        httpStatus: res.status,
        reason: `Returned HTTP ${res.status}`,
        hasNoindex: false,
        canonical: null,
        inSitemap: routeSet.has(path),
      }
    }

    const html = await res.text()
    const hasNoindex = detectNoindex(html, res.headers)
    const canonical = extractCanonical(html)

    // Self-referential canonical: same path (host-agnostic to survive
    // preview/prod domain differences).
    let canonicalSelf = false
    if (canonical) {
      try {
        const cPath = new URL(canonical, base).pathname.replace(/\/$/, '') || '/'
        const ownPath = path.replace(/\/$/, '') || '/'
        canonicalSelf = cPath === ownPath
      } catch {
        canonicalSelf = false
      }
    }

    let status: IndexStatus = 'indexable'
    let reason = 'No noindex and a self-referential canonical'
    if (hasNoindex) {
      status = 'blocked'
      reason = 'Excluded by a noindex directive'
    } else if (!canonical) {
      status = 'blocked'
      reason = 'No canonical link found'
    } else if (!canonicalSelf) {
      status = 'blocked'
      reason = 'Canonical points to a different URL'
    }

    return {
      path,
      url,
      status,
      httpStatus: res.status,
      reason,
      hasNoindex,
      canonical,
      inSitemap: routeSet.has(path),
    }
  })

  const summary = {
    total: rows.length,
    indexable: rows.filter((r) => r.status === 'indexable').length,
    blocked: rows.filter((r) => r.status === 'blocked').length,
    errors: rows.filter((r) => r.status === 'error').length,
    inSitemap: rows.filter((r) => r.inSitemap).length,
  }

  return NextResponse.json({ rows, summary, scannedAt })
}
