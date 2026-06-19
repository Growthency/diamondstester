import { createClient, hasSupabaseConfig } from '@/lib/supabase/server'
import { seedPosts } from '@/lib/content/posts'
import type { BlogPost } from '@/lib/types'
import { readingTime } from '@/lib/utils'

function normalize(row: any): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? '',
    content: row.content ?? '',
    cover_image: row.cover_image ?? null,
    author: row.author ?? 'CaratIQ Team',
    author_role: row.author_role ?? 'Gemologist',
    category: row.category ?? 'Guides',
    tags: row.tags ?? [],
    status: row.status ?? 'published',
    featured: !!row.featured,
    seo_title: row.seo_title ?? null,
    seo_description: row.seo_description ?? null,
    read_minutes: row.read_minutes ?? readingTime(row.content ?? ''),
    views: row.views ?? 0,
    published_at: row.published_at ?? new Date().toISOString(),
  }
}

/**
 * Public reads work with OR without Supabase configured. With keys present we
 * read live published posts; otherwise we serve the bundled seed content so the
 * site always looks complete.
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  if (hasSupabaseConfig()) {
    try {
      const supabase = await createClient()
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
      if (data && data.length) return data.map(normalize)
    } catch {
      /* fall through to seed */
    }
  }
  return seedPosts
    .filter((p) => p.status === 'published')
    .sort((a, b) => +new Date(b.published_at) - +new Date(a.published_at))
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (hasSupabaseConfig()) {
    try {
      const supabase = await createClient()
      const { data } = await supabase.from('blog_posts').select('*').eq('slug', slug).single()
      if (data) return normalize(data)
    } catch {
      /* fall through */
    }
  }
  return seedPosts.find((p) => p.slug === slug) ?? null
}

export async function getFeaturedPost(): Promise<BlogPost | null> {
  const all = await getAllPosts()
  return all.find((p) => p.featured) ?? all[0] ?? null
}

export async function getRelatedPosts(slug: string, category: string, limit = 3): Promise<BlogPost[]> {
  const all = await getAllPosts()
  const sameCat = all.filter((p) => p.slug !== slug && p.category === category)
  const rest = all.filter((p) => p.slug !== slug && p.category !== category)
  return [...sameCat, ...rest].slice(0, limit)
}

export async function getCategories(): Promise<string[]> {
  const all = await getAllPosts()
  return Array.from(new Set(all.map((p) => p.category)))
}
