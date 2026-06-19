export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  content: string // markdown
  cover_image?: string | null
  author: string
  author_role?: string
  category: string
  tags: string[]
  status: 'draft' | 'published'
  featured: boolean
  seo_title?: string | null
  seo_description?: string | null
  read_minutes: number
  views?: number
  published_at: string // ISO
}

export interface Page {
  slug: string
  title: string
  content: string
  status: 'draft' | 'published'
  seo_title?: string | null
  seo_description?: string | null
}
