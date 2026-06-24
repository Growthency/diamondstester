import { NextResponse } from 'next/server'
import { readSession } from '@/lib/auth/session'
import { getAllPosts } from '@/lib/blog'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

/* ── Static routes audited on every scan (plus every published blog slug) ── */
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

type Severity = 'critical' | 'warning' | 'info'

interface Issue {
  check: string
  severity: Severity
  message: string
  fix: string
  category: string
}

interface PageResult {
  path: string
  url: string
  status: number
  title: string
  htmlSize: number
  loadTime: number
  score: number
  issues: Issue[]
}

/* The five audit categories and how many checks each contributes per page.
 * Used both to weight per-page scoring and to build the category aggregates. */
const CATEGORY_CHECKS: Record<string, number> = {
  'Meta Tags': 4, // title present, title length, description present, description length
  'Open Graph': 2, // og:title, og:image
  'Twitter Cards': 1, // twitter:card
  Headings: 1, // exactly one h1
  Technical: 2, // canonical, viewport
}
const CHECKS_PER_PAGE = Object.values(CATEGORY_CHECKS).reduce((a, b) => a + b, 0)
const WEIGHT: Record<Severity, number> = { critical: 3, warning: 2, info: 1 }

/* ── Regex-only HTML inspection (no cheerio) ── */
function extractTag(html: string, regex: RegExp): string | null {
  const m = html.match(regex)
  return m ? (m[1] ?? '').trim() : null
}

function hasMeta(html: string, attr: 'name' | 'property', value: string): string | null {
  // matches <meta name="x" content="y"> in either attribute order
  const r1 = new RegExp(
    `<meta[^>]+${attr}=["']${value}["'][^>]*content=["']([^"']*)["']`,
    'i',
  )
  const r2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]*${attr}=["']${value}["']`,
    'i',
  )
  const m = html.match(r1) || html.match(r2)
  return m ? (m[1] ?? '').trim() : null
}

function auditHtml(html: string): { title: string; issues: Issue[] } {
  const issues: Issue[] = []

  /* ── Meta Tags ── */
  const title = extractTag(html, /<title[^>]*>([\s\S]*?)<\/title>/i) ?? ''
  if (!title) {
    issues.push({
      check: 'title-missing',
      severity: 'critical',
      category: 'Meta Tags',
      message: 'Missing <title> tag',
      fix: 'Add a unique, descriptive <title> via the page metadata export.',
    })
  } else if (title.length < 30 || title.length > 60) {
    issues.push({
      check: 'title-length',
      severity: 'warning',
      category: 'Meta Tags',
      message: `Title length is ${title.length} characters`,
      fix: 'Keep the title between 30 and 60 characters for clean SERP display.',
    })
  }

  const description = hasMeta(html, 'name', 'description')
  if (!description) {
    issues.push({
      check: 'description-missing',
      severity: 'critical',
      category: 'Meta Tags',
      message: 'Missing meta description',
      fix: 'Add a meta description (70–160 chars) to the page metadata.',
    })
  } else if (description.length < 70 || description.length > 160) {
    issues.push({
      check: 'description-length',
      severity: 'warning',
      category: 'Meta Tags',
      message: `Meta description is ${description.length} characters`,
      fix: 'Aim for 70–160 characters so Google rarely truncates the snippet.',
    })
  }

  /* ── Open Graph ── */
  if (!hasMeta(html, 'property', 'og:title')) {
    issues.push({
      check: 'og-title-missing',
      severity: 'warning',
      category: 'Open Graph',
      message: 'Missing og:title',
      fix: 'Set openGraph.title in metadata for rich social previews.',
    })
  }
  if (!hasMeta(html, 'property', 'og:image')) {
    issues.push({
      check: 'og-image-missing',
      severity: 'warning',
      category: 'Open Graph',
      message: 'Missing og:image',
      fix: 'Add a WebP openGraph.images entry so shared links show a thumbnail.',
    })
  }

  /* ── Twitter Cards ── */
  if (!hasMeta(html, 'name', 'twitter:card')) {
    issues.push({
      check: 'twitter-card-missing',
      severity: 'info',
      category: 'Twitter Cards',
      message: 'Missing twitter:card',
      fix: 'Set twitter.card to "summary_large_image" in metadata.',
    })
  }

  /* ── Headings ── */
  const h1Count = (html.match(/<h1[\s>]/gi) || []).length
  if (h1Count === 0) {
    issues.push({
      check: 'h1-missing',
      severity: 'critical',
      category: 'Headings',
      message: 'No <h1> heading found',
      fix: 'Add exactly one <h1> describing the page’s primary topic.',
    })
  } else if (h1Count > 1) {
    issues.push({
      check: 'h1-multiple',
      severity: 'warning',
      category: 'Headings',
      message: `Found ${h1Count} <h1> headings`,
      fix: 'Use a single <h1> per page; demote the rest to <h2>/<h3>.',
    })
  }

  /* ── Technical ── */
  const hasCanonical = /<link[^>]+rel=["']canonical["']/i.test(html)
  if (!hasCanonical) {
    issues.push({
      check: 'canonical-missing',
      severity: 'warning',
      category: 'Technical',
      message: 'Missing rel="canonical" link',
      fix: 'Set metadata.alternates.canonical to avoid duplicate-content risk.',
    })
  }
  const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html)
  if (!hasViewport) {
    issues.push({
      check: 'viewport-missing',
      severity: 'critical',
      category: 'Technical',
      message: 'Missing viewport meta tag',
      fix: 'Add a responsive viewport meta tag (Next.js adds this by default).',
    })
  }

  return { title, issues }
}

function scorePage(issues: Issue[]): number {
  const lost = issues.reduce((s, i) => s + (WEIGHT[i.severity] || 0), 0)
  const max = CHECKS_PER_PAGE * WEIGHT.critical // worst-case lost points ceiling
  const earned = Math.max(0, max - lost)
  return Math.round((earned / max) * 100)
}

/* ── Bounded-concurrency fetch with timeout ── */
async function fetchWithTimeout(url: string, ms: number): Promise<Response | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { 'user-agent': 'DiamondsTester-SEO-Audit/1.0' },
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

function buildBaseUrl(request: Request): string {
  const h = request.headers
  const proto = h.get('x-forwarded-proto') || 'https'
  const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000'
  return `${proto}://${host}`
}

export async function GET(request: Request) {
  return runScan(request)
}

// The view may POST { offset, limit } for batched scanning; we honour it but
// the route also works as a single full GET scan.
export async function POST(request: Request) {
  return runScan(request)
}

async function runScan(request: Request) {
  if (!(await readSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const base = buildBaseUrl(request)
  const scannedAt = new Date().toISOString()

  // Collect routes: static + every published blog slug.
  let routes = [...STATIC_ROUTES]
  try {
    const posts = await getAllPosts()
    routes.push(...posts.map((p) => `/blog/${p.slug}`))
  } catch {
    /* blog read failed — audit static routes only */
  }
  // de-dup
  routes = Array.from(new Set(routes))

  const pages = await mapWithConcurrency(routes, 6, async (path): Promise<PageResult> => {
    const url = base + path
    const started = Date.now()
    const res = await fetchWithTimeout(url, 8000)
    const loadTime = Date.now() - started

    if (!res) {
      return {
        path,
        url,
        status: 0,
        title: '',
        htmlSize: 0,
        loadTime,
        score: 0,
        issues: [
          {
            check: 'fetch-failed',
            severity: 'critical',
            category: 'Technical',
            message: 'Page could not be fetched (timeout or network error)',
            fix: 'Verify the route renders and responds within 8s.',
          },
        ],
      }
    }

    if (res.status >= 400) {
      return {
        path,
        url,
        status: res.status,
        title: '',
        htmlSize: 0,
        loadTime,
        score: 0,
        issues: [
          {
            check: 'http-error',
            severity: 'critical',
            category: 'Technical',
            message: `Returned HTTP ${res.status}`,
            fix: 'Fix the route so it returns a 200 response.',
          },
        ],
      }
    }

    const html = await res.text()
    const { title, issues } = auditHtml(html)
    return {
      path,
      url,
      status: res.status,
      title,
      htmlSize: new TextEncoder().encode(html).length,
      loadTime,
      score: scorePage(issues),
      issues,
    }
  })

  /* ── Category aggregates (only over successfully-fetched pages) ── */
  const live = pages.filter((p) => p.status === 200)
  const categories: Record<string, { passed: number; total: number }> = {}
  for (const cat of Object.keys(CATEGORY_CHECKS)) {
    categories[cat] = { passed: 0, total: 0 }
  }
  for (const page of live) {
    for (const cat of Object.keys(CATEGORY_CHECKS)) {
      const per = CATEGORY_CHECKS[cat]
      const failed = page.issues.filter((i) => i.category === cat).length
      categories[cat].total += per
      categories[cat].passed += Math.max(0, per - failed)
    }
  }

  /* ── Overall score ── */
  let maxPts = 0
  let earnedPts = 0
  for (const page of live) {
    const lost = page.issues.reduce((s, i) => s + (WEIGHT[i.severity] || 0), 0)
    maxPts += CHECKS_PER_PAGE * WEIGHT.critical
    earnedPts += Math.max(0, CHECKS_PER_PAGE * WEIGHT.critical - lost)
  }
  const score = maxPts > 0 ? Math.round((earnedPts / maxPts) * 100) : 100

  /* ── Summary counts ── */
  const critical = pages.reduce(
    (s, p) => s + p.issues.filter((i) => i.severity === 'critical').length,
    0,
  )
  const warnings = pages.reduce(
    (s, p) => s + p.issues.filter((i) => i.severity === 'warning').length,
    0,
  )
  const info = pages.reduce(
    (s, p) => s + p.issues.filter((i) => i.severity === 'info').length,
    0,
  )
  const passed = pages.filter(
    (p) => p.status === 200 && p.issues.filter((i) => i.severity === 'critical').length === 0,
  ).length

  return NextResponse.json({
    score,
    scanned: pages.length,
    categories,
    pages,
    summary: { critical, warnings, info, passed },
    scannedAt,
  })
}
