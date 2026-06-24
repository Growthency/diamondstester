import { createClient, hasSupabaseConfig } from '@/lib/supabase/server'
import { seedPosts, type SeedPost } from '@/lib/content/posts'
import { extraPosts } from '@/lib/content/posts-extra'
import type { BlogPost } from '@/lib/types'
import { readingTime } from '@/lib/utils'

// Bundled seed posts are authored as markdown with the standard sidebar layout;
// fill in the rendering fields the public page now reads so they match DB rows.
function fromSeed(p: SeedPost): BlogPost {
  return {
    ...p,
    content_format: 'markdown',
    layout: 'with-sidebar',
    custom_css: null,
    custom_schema: null,
    difficulty: 'Beginner',
    topic_focus: 'Natural',
  }
}

const allSeed: BlogPost[] = [...seedPosts, ...extraPosts].map(fromSeed)

function normalize(row: any): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? '',
    content: row.content ?? '',
    content_format: row.content_format === 'html' ? 'html' : 'markdown',
    cover_image: row.cover_image ?? null,
    author: row.author ?? 'Diamonds Tester Team',
    author_role: row.author_role ?? 'Gemologist',
    category: row.category ?? 'Guides',
    tags: row.tags ?? [],
    status: row.status ?? 'published',
    featured: !!row.featured,
    seo_title: row.seo_title ?? null,
    seo_description: row.seo_description ?? null,
    layout: row.layout === 'full-page' ? 'full-page' : 'with-sidebar',
    difficulty: row.difficulty ?? 'Beginner',
    topic_focus: row.topic_focus ?? 'Natural',
    custom_css: row.custom_css ?? null,
    custom_schema: row.custom_schema ?? null,
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
  return allSeed
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
  return allSeed.find((p) => p.slug === slug) ?? null
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
