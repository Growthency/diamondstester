import 'server-only'
import { site } from '@/lib/site'

/**
 * Google Analytics 4 (Data API) + Search Console integration for the admin
 * dashboard. Everything degrades gracefully: if the service-account env vars
 * aren't set, helpers return empty data and `isGoogleConfigured()` is false,
 * so the dashboard falls back to our own page_views data.
 *
 * Edge-safe: no SDK. Auth is a service-account JWT (RS256) signed with Web
 * Crypto, exchanged for an OAuth2 access token; all API calls are plain fetch.
 *
 * Required env (service account with GA + Search Console read access):
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL
 *   GOOGLE_PRIVATE_KEY            (with literal \n escapes)
 *   GA4_PROPERTY_ID              (numeric, e.g. 123456789)
 *   GSC_SITE_URL                 (e.g. https://diamondstester.com  — defaults to site.url)
 */

export function isGoogleConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY &&
      process.env.GA4_PROPERTY_ID,
  )
}

const propertyId = () => `properties/${process.env.GA4_PROPERTY_ID}`
const gscSiteUrl = () => process.env.GSC_SITE_URL || site.url

export interface DashboardMetrics {
  activeUsers: number
  sessions: number
  pageViews: number
  newUsers: number
  users7d: number
  usersToday: number
  daily: { date: string; users: number }[]
  dailyClicks: { date: string; clicks: number }[]
  topPages: { path: string; title: string; views: number }[]
  topCountries: { country: string; users: number }[]
  searchKeywords: { query: string; clicks: number; impressions: number; ctr: number; position: number }[]
  searchPages: { page: string; clicks: number; impressions: number; ctr: number; position: number }[]
  searchConsoleConnected: boolean
}

const num = (v: any) => Number(v ?? 0) || 0

// ---------------------------------------------------------------------------
// Web Crypto auth: service-account JWT (RS256) -> OAuth2 access token
// ---------------------------------------------------------------------------

const enc = new TextEncoder()

/** base64url-encode a string or byte array (no padding). */
function base64url(input: string | Uint8Array): string {
  let bin = ''
  if (typeof input === 'string') {
    const bytes = enc.encode(input)
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  } else {
    for (let i = 0; i < input.length; i++) bin += String.fromCharCode(input[i])
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Decode a base64 string to a byte array. */
function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

/** Turn a PEM PKCS#8 private key into a CryptoKey for RS256 signing. */
async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const der = base64ToBytes(
    pem
      .replace(/\\n/g, '\n')
      .replace(/-----BEGIN PRIVATE KEY-----/, '')
      .replace(/-----END PRIVATE KEY-----/, '')
      .replace(/\s+/g, ''),
  )
  return globalThis.crypto.subtle.importKey(
    'pkcs8',
    der as unknown as BufferSource,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )
}

// Module-level token cache, valid until just before its expiry.
let cachedToken: { token: string; exp: number } | null = null

const GOOGLE_SCOPES =
  'https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/webmasters.readonly'

/** Mint (or reuse) an OAuth2 access token for the service account. */
async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  if (cachedToken && cachedToken.exp - 60 > now) return cachedToken.token

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL as string
  const privateKey = process.env.GOOGLE_PRIVATE_KEY as string

  const header = { alg: 'RS256', typ: 'JWT' }
  const claims = {
    iss: email,
    scope: GOOGLE_SCOPES,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }

  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`
  const key = await importPrivateKey(privateKey)
  const sig = new Uint8Array(
    await globalThis.crypto.subtle.sign({ name: 'RSASSA-PKCS1-v1_5' }, key, enc.encode(signingInput)),
  )
  const jwt = `${signingInput}.${base64url(sig)}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }).toString(),
  })

  if (!res.ok) {
    throw new Error(`token exchange failed: ${res.status} ${await res.text()}`)
  }

  const data = (await res.json()) as { access_token?: string; expires_in?: number }
  if (!data.access_token) throw new Error('token exchange: no access_token')

  cachedToken = { token: data.access_token, exp: now + (data.expires_in ?? 3600) }
  return cachedToken.token
}

// ---------------------------------------------------------------------------
// GA4 Data API
// ---------------------------------------------------------------------------

interface Ga4Row {
  dimensionValues?: { value?: string }[]
  metricValues?: { value?: string }[]
}
interface Ga4Report {
  rows?: Ga4Row[]
}

/** Run a single GA4 runReport against the configured property. */
async function runReport(token: string, requestBody: Record<string, any>): Promise<Ga4Report> {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/${propertyId()}:runReport`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    },
  )
  if (!res.ok) {
    throw new Error(`runReport failed: ${res.status} ${await res.text()}`)
  }
  return (await res.json()) as Ga4Report
}

/** Pull the full GA4 + Search Console picture for a date range. Returns null if GA isn't configured. */
export async function getGoogleDashboard(startDate: string, endDate: string): Promise<DashboardMetrics | null> {
  if (!isGoogleConfigured()) return null

  try {
    const token = await getAccessToken()

    const [overview, daily, pages, countries, users7dRes, todayRes] = await Promise.all([
      runReport(token, {
        dateRanges: [{ startDate, endDate }],
        metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }, { name: 'newUsers' }],
      }),
      runReport(token, {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      }),
      runReport(token, {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 25,
      }),
      runReport(token, {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 25,
      }),
      runReport(token, {
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        metrics: [{ name: 'activeUsers' }],
      }),
      runReport(token, {
        dateRanges: [{ startDate: 'today', endDate: 'today' }],
        metrics: [{ name: 'activeUsers' }],
      }),
    ])

    const ov = overview.rows?.[0]?.metricValues ?? []
    const search = await getSearchConsole(token, startDate, endDate)

    return {
      activeUsers: num(ov[0]?.value),
      sessions: num(ov[1]?.value),
      pageViews: num(ov[2]?.value),
      newUsers: num(ov[3]?.value),
      users7d: num(users7dRes.rows?.[0]?.metricValues?.[0]?.value),
      usersToday: num(todayRes.rows?.[0]?.metricValues?.[0]?.value),
      daily: (daily.rows ?? []).map((r) => ({
        date: String(r.dimensionValues?.[0]?.value ?? ''),
        users: num(r.metricValues?.[0]?.value),
      })),
      topPages: (pages.rows ?? []).map((r) => ({
        path: String(r.dimensionValues?.[0]?.value ?? ''),
        title: String(r.dimensionValues?.[1]?.value ?? ''),
        views: num(r.metricValues?.[0]?.value),
      })),
      topCountries: (countries.rows ?? []).map((r) => ({
        country: String(r.dimensionValues?.[0]?.value ?? ''),
        users: num(r.metricValues?.[0]?.value),
      })),
      dailyClicks: search.dailyClicks,
      searchKeywords: search.keywords,
      searchPages: search.pages,
      searchConsoleConnected: search.connected,
    }
  } catch (err: any) {
    console.error('[google] dashboard error:', err?.message || err)
    return null
  }
}

// ---------------------------------------------------------------------------
// Search Console
// ---------------------------------------------------------------------------

interface GscRow {
  keys?: string[]
  clicks?: number
  impressions?: number
  ctr?: number
  position?: number
}

/** Run a single Search Console searchAnalytics query. */
async function searchAnalyticsQuery(
  token: string,
  siteUrl: string,
  dimensions: string[],
  rowLimit: number,
  startDate: string,
  endDate: string,
): Promise<GscRow[]> {
  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ startDate, endDate, dimensions, rowLimit }),
    },
  )
  if (!res.ok) {
    throw new Error(`searchAnalytics failed: ${res.status} ${await res.text()}`)
  }
  const data = (await res.json()) as { rows?: GscRow[] }
  return data.rows ?? []
}

async function getSearchConsole(token: string, startDate: string, endDate: string) {
  const empty = { keywords: [], pages: [], dailyClicks: [], connected: false }
  try {
    const siteUrl = gscSiteUrl()

    const [byQuery, byPage, byDate] = await Promise.all([
      searchAnalyticsQuery(token, siteUrl, ['query'], 25, startDate, endDate),
      searchAnalyticsQuery(token, siteUrl, ['page'], 25, startDate, endDate),
      searchAnalyticsQuery(token, siteUrl, ['date'], 400, startDate, endDate),
    ])

    return {
      connected: true,
      dailyClicks: byDate.map((r) => ({
        date: String(r.keys?.[0] ?? ''),
        clicks: num(r.clicks),
      })),
      keywords: byQuery.map((r) => ({
        query: String(r.keys?.[0] ?? ''),
        clicks: num(r.clicks),
        impressions: num(r.impressions),
        ctr: Number(((r.ctr ?? 0) * 100).toFixed(1)),
        position: Number((r.position ?? 0).toFixed(1)),
      })),
      pages: byPage.map((r) => ({
        page: String(r.keys?.[0] ?? ''),
        clicks: num(r.clicks),
        impressions: num(r.impressions),
        ctr: Number(((r.ctr ?? 0) * 100).toFixed(1)),
        position: Number((r.position ?? 0).toFixed(1)),
      })),
    }
  } catch (err: any) {
    console.error('[google] search console error:', err?.message || err)
    return empty
  }
}
