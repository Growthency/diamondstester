export interface AdminPage {
  id: number
  slug: string
  title: string
  content: string
  status: 'draft' | 'published'
  seo_title: string | null
  seo_description: string | null
  updated_at: string
}

export interface PageInput {
  id?: number
  title: string
  slug: string
  content: string
  status: 'draft' | 'published'
  seo_title: string | null
  seo_description: string | null
}
