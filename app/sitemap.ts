export const runtime = 'edge'
import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'
import { getAllPosts } from '@/lib/blog'

const base = site.url.replace(/\/$/, '')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '/', priority: 1.0, changeFrequency: 'daily' },
    { path: '/identify', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/how-it-works', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/services', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/verify', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/tools', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/tools/carat-calculator', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/tools/price-estimator', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/tools/quiz', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/blog', priority: 0.8, changeFrequency: 'daily' },
    { path: '/about', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/faq', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  ]

  const posts = await getAllPosts().catch(() => [])
  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.published_at),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const now = new Date()
  return [
    ...staticRoutes.map((r) => ({
      url: `${base}${r.path}`,
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...postRoutes,
  ]
}
