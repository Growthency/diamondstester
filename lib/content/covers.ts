import type { BlogPost } from '@/lib/types'

/**
 * Maps each article to one of the original (self-authored, copyright-free)
 * WebP illustrations in /public/images. Keeps every blog/guide card visual
 * without hand-setting a cover on each post.
 */
const bySlug: Record<string, string> = {
  'how-to-tell-if-a-diamond-is-real': '/images/real-vs-fake.webp',
  'moissanite-vs-diamond': '/images/real-vs-fake.webp',
  'understanding-the-4cs': '/images/four-cs.webp',
  'lab-grown-vs-natural-diamonds': '/images/lab-grown.webp',
  'getting-a-diamond-appraised-vs-certified': '/images/certificate.webp',
  'diamond-shapes-and-cuts-explained': '/images/cuts.webp',
  'diamond-certificates-gia-igi-ags': '/images/certificate.webp',
  'how-diamond-prices-are-set': '/images/pricing.webp',
  'ethical-and-lab-grown-diamonds': '/images/lab-grown.webp',
  'how-to-clean-and-care-for-your-diamond': '/images/care.webp',
  'engagement-ring-buying-guide': '/images/ring.webp',
}

const byCategory: Record<string, string> = {
  Guides: '/images/certificate.webp',
  Comparisons: '/images/real-vs-fake.webp',
  Education: '/images/four-cs.webp',
  Care: '/images/care.webp',
}

export function coverFor(post: Pick<BlogPost, 'slug' | 'category' | 'cover_image'>): string {
  return post.cover_image || bySlug[post.slug] || byCategory[post.category] || '/images/cuts.webp'
}
