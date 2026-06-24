import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'

export const runtime = 'edge'

const base = site.url.replace(/\/$/, '')

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/dashboard', '/login', '/signup', '/result', '/_next/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
