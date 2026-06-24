export const runtime = 'edge'
import { createAdminClient, hasSupabaseConfig } from '@/lib/supabase/server'
import { seedPosts } from '@/lib/content/posts'
import type { AdminPost } from './types'
import { BlogManager } from './BlogManager'

async function loadInitialPosts(): Promise<{ posts: AdminPost[]; configured: boolean }> {
  const configured = hasSupabaseConfig()

  if (configured) {
    try {
      const supabase = createAdminClient()
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })
      return { posts: (data as AdminPost[] | null) ?? [], configured }
    } catch {
      return { posts: [], configured }
    }
  }

  // Unconfigured: surface bundled seed content (read-only preview).
  const posts: AdminPost[] = seedPosts.map((p, i) => ({
    id: -(i + 1),
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    cover_image: p.cover_image ?? null,
    author: p.author,
    author_role: p.author_role ?? 'Gemologist',
    category: p.category,
    tags: p.tags,
    status: p.status,
    featured: p.featured,
    seo_title: p.seo_title ?? null,
    seo_description: p.seo_description ?? null,
    read_minutes: p.read_minutes,
    views: p.views ?? 0,
    published_at: p.published_at,
    created_at: p.published_at,
  }))

  return { posts, configured }
}

export default async function AdminBlogPage() {
  const { posts, configured } = await loadInitialPosts()
  return <BlogManager initialPosts={posts} configured={configured} />
}
