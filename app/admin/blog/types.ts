export interface AdminPost {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  cover_image: string | null
  author: string
  author_role: string
  category: string
  tags: string[]
  status: 'draft' | 'published'
  featured: boolean
  seo_title: string | null
  seo_description: string | null
  read_minutes: number
  views: number
  published_at: string | null
  created_at: string
}

/** The shape the editor sends to the API (id present only when updating). */
export interface PostInput {
  id?: number
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string | null
  author: string
  author_role: string
  category: string
  tags: string[]
  status: 'draft' | 'published'
  featured: boolean
  seo_title: string | null
  seo_description: string | null
}
