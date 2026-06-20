import type { Metadata } from 'next'
import { site } from '@/lib/site'

const base = site.url.replace(/\/$/, '')

export function absoluteUrl(path = ''): string {
  if (!path) return base
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`
}

/**
 * Build consistent per-page metadata: unique title/description, canonical URL,
 * Open Graph + Twitter cards. The OG image defaults to the route's dynamic
 * opengraph-image (Next auto-resolves /opengraph-image and per-route ones), so
 * shares on Facebook/WhatsApp/X render a branded image with the page title.
 */
export function pageMeta(opts: {
  title: string
  description: string
  path: string
  type?: 'website' | 'article'
  images?: { url: string; width?: number; height?: number; alt?: string }[]
  publishedTime?: string
  authors?: string[]
  keywords?: string[]
  noIndex?: boolean
}): Metadata {
  const url = absoluteUrl(opts.path)
  return {
    title: opts.title,
    description: opts.description,
    keywords: opts.keywords,
    alternates: { canonical: url },
    robots: opts.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: opts.type ?? 'website',
      url,
      siteName: site.name,
      title: opts.title,
      description: opts.description,
      locale: site.locale,
      ...(opts.images ? { images: opts.images } : {}),
      ...(opts.publishedTime ? { publishedTime: opts.publishedTime } : {}),
      ...(opts.authors ? { authors: opts.authors } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: opts.title,
      description: opts.description,
      ...(opts.images ? { images: opts.images.map((i) => i.url) } : {}),
    },
  }
}

/* ── JSON-LD structured data builders ─────────────────────────────────────── */

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.legalName,
    alternateName: site.name,
    url: base,
    logo: absoluteUrl('/icon.svg'),
    description: site.description,
    email: site.contact.email,
    sameAs: [site.social.instagram, site.social.facebook, site.social.x, site.social.linkedin, site.social.youtube],
  }
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: base,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${base}/blog?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function localBusinessLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: site.legalName,
    image: absoluteUrl('/opengraph-image'),
    url: base,
    email: site.contact.email,
    telephone: site.contact.phone,
    address: { '@type': 'PostalAddress', streetAddress: site.contact.address },
    openingHours: site.contact.hours,
    priceRange: '$$',
  }
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  }
}

export function articleLd(post: {
  title: string
  excerpt: string
  slug: string
  author: string
  published_at: string
  category: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: absoluteUrl(`/blog/${post.slug}/opengraph-image`),
    datePublished: post.published_at,
    dateModified: post.published_at,
    author: { '@type': 'Person', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: site.name,
      logo: { '@type': 'ImageObject', url: absoluteUrl('/icon.svg') },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(`/blog/${post.slug}`) },
    articleSection: post.category,
  }
}

export function faqLd(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}
