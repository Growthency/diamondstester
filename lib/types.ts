export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  content: string // markdown or sanitized HTML (see content_format)
  content_format: 'html' | 'markdown'
  cover_image?: string | null
  author: string
  author_role?: string
  category: string
  tags: string[]
  status: 'draft' | 'published'
  featured: boolean
  seo_title?: string | null
  seo_description?: string | null
  layout: 'with-sidebar' | 'full-page'
  difficulty: 'Beginner' | 'Intermediate' | 'Expert'
  topic_focus: 'Natural' | 'Lab-grown' | 'Buying' | 'Care' | '4Cs'
  custom_css?: string | null
  custom_schema?: string | null
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
