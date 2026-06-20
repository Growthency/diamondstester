import 'server-only'
import { google } from 'googleapis'
import { site } from '@/lib/site'

/**
 * Google Analytics 4 (Data API) + Search Console integration for the admin
 * dashboard. Everything degrades gracefully: if the service-account env vars
 * aren't set, helpers return empty data and `isGoogleConfigured()` is false,
 * so the dashboard falls back to our own page_views data.
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

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: [
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/webmasters.readonly',
    ],
  })
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
  topPages: { path: string; title: string; views: number }[]
  topCountries: { country: string; users: number }[]
  searchKeywords: { query: string; clicks: number; impressions: number; ctr: number; position: number }[]
  searchPages: { page: string; clicks: number; impressions: number; ctr: number; position: number }[]
  searchConsoleConnected: boolean
}

const num = (v: any) => Number(v ?? 0) || 0

/** Pull the full GA4 + Search Console picture for a date range. Returns null if GA isn't configured. */
export async function getGoogleDashboard(startDate: string, endDate: string): Promise<DashboardMetrics | null> {
  if (!isGoogleConfigured()) return null

  try {
    const auth = getAuth()
    const analytics = google.analyticsdata({ version: 'v1beta', auth })
    const property = propertyId()

    const todayStr = new Date().toISOString().slice(0, 10)

    const [overview, daily, pages, countries, users7dRes, todayRes] = await Promise.all([
      analytics.properties.runReport({
        property,
        requestBody: {
          dateRanges: [{ startDate, endDate }],
          metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }, { name: 'newUsers' }],
        },
      }),
      analytics.properties.runReport({
        property,
        requestBody: {
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'date' }],
          metrics: [{ name: 'activeUsers' }],
          orderBys: [{ dimension: { dimensionName: 'date' } }],
        },
      }),
      analytics.properties.runReport({
        property,
        requestBody: {
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
          metrics: [{ name: 'screenPageViews' }],
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
          limit: '25',
        },
      }),
      analytics.properties.runReport({
        property,
        requestBody: {
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'country' }],
          metrics: [{ name: 'activeUsers' }],
          orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
          limit: '25',
        },
      }),
      analytics.properties.runReport({
        property,
        requestBody: {
          dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
          metrics: [{ name: 'activeUsers' }],
        },
      }),
      analytics.properties.runReport({
        property,
        requestBody: {
          dateRanges: [{ startDate: 'today', endDate: 'today' }],
          metrics: [{ name: 'activeUsers' }],
        },
      }),
    ])

    const ov = overview.data.rows?.[0]?.metricValues ?? []
    const search = await getSearchConsole(startDate, endDate)

    return {
      activeUsers: num(ov[0]?.value),
      sessions: num(ov[1]?.value),
      pageViews: num(ov[2]?.value),
      newUsers: num(ov[3]?.value),
      users7d: num(users7dRes.data.rows?.[0]?.metricValues?.[0]?.value),
      usersToday: num(todayRes.data.rows?.[0]?.metricValues?.[0]?.value),
      daily: (daily.data.rows ?? []).map((r) => ({
        date: String(r.dimensionValues?.[0]?.value ?? ''),
        users: num(r.metricValues?.[0]?.value),
      })),
      topPages: (pages.data.rows ?? []).map((r) => ({
        path: String(r.dimensionValues?.[0]?.value ?? ''),
        title: String(r.dimensionValues?.[1]?.value ?? ''),
        views: num(r.metricValues?.[0]?.value),
      })),
      topCountries: (countries.data.rows ?? []).map((r) => ({
        country: String(r.dimensionValues?.[0]?.value ?? ''),
        users: num(r.metricValues?.[0]?.value),
      })),
      searchKeywords: search.keywords,
      searchPages: search.pages,
      searchConsoleConnected: search.connected,
      // unused field placeholder for the date stamp; the API stamps it
    } as DashboardMetrics & { _todayStr?: string }
  } catch (err: any) {
    console.error('[google] dashboard error:', err?.message || err)
    return null
  }
}

async function getSearchConsole(startDate: string, endDate: string) {
  const empty = { keywords: [], pages: [], connected: false }
  try {
    const auth = getAuth()
    const searchConsole = google.searchconsole({ version: 'v1', auth })
    const siteUrl = gscSiteUrl()

    const [byQuery, byPage] = await Promise.all([
      searchConsole.searchanalytics.query({
        siteUrl,
        requestBody: { startDate, endDate, dimensions: ['query'], rowLimit: 25 },
      }),
      searchConsole.searchanalytics.query({
        siteUrl,
        requestBody: { startDate, endDate, dimensions: ['page'], rowLimit: 25 },
      }),
    ])

    return {
      connected: true,
      keywords: (byQuery.data.rows ?? []).map((r) => ({
        query: String(r.keys?.[0] ?? ''),
        clicks: num(r.clicks),
        impressions: num(r.impressions),
        ctr: Number(((r.ctr ?? 0) * 100).toFixed(1)),
        position: Number((r.position ?? 0).toFixed(1)),
      })),
      pages: (byPage.data.rows ?? []).map((r) => ({
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
