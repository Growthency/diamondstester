// ── Shared contract for the full-page blog editor ──────────────────────────
// Every part of the editor (RichEditor, InterlinkChecker, BlogEditor, the API
// route and the public renderer) builds against these types.

export type PostStatus = 'draft' | 'published'
export type PostLayout = 'with-sidebar' | 'full-page'
export type PostDifficulty = 'Beginner' | 'Intermediate' | 'Expert'
export type PostTopic = 'Natural' | 'Lab-grown' | 'Buying' | 'Care' | '4Cs'
export type ContentFormat = 'html' | 'markdown'

export interface AdminPost {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  content_format: ContentFormat
  cover_image: string | null
  author: string
  author_role: string
  category: string
  tags: string[]
  status: PostStatus
  featured: boolean
  seo_title: string | null
  seo_description: string | null
  layout: PostLayout
  difficulty: PostDifficulty
  topic_focus: PostTopic
  custom_css: string | null
  custom_schema: string | null
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
  content_format: ContentFormat
  cover_image: string | null
  author: string
  author_role: string
  category: string
  tags: string[]
  status: PostStatus
  featured: boolean
  seo_title: string | null
  seo_description: string | null
  layout: PostLayout
  difficulty: PostDifficulty
  topic_focus: PostTopic
  custom_css: string | null
  custom_schema: string | null
}

// ── Dropdown option lists (diamond-relevant) ───────────────────────────────
export const CATEGORIES = [
  'Authenticity',
  'Lab-Grown',
  '4Cs',
  'Buying',
  'Certification',
  'Care',
  'Pricing',
  'Guides',
] as const

export const DIFFICULTIES: PostDifficulty[] = ['Beginner', 'Intermediate', 'Expert']
export const TOPICS: PostTopic[] = ['Natural', 'Lab-grown', 'Buying', 'Care', '4Cs']
export const LAYOUTS: PostLayout[] = ['with-sidebar', 'full-page']

export const META_TITLE_MAX = 60
export const META_DESC_MAX = 155

// ── Component prop contracts ────────────────────────────────────────────────
export interface RichEditorProps {
  value: string // HTML string
  onChange: (html: string) => void
  /** Bump to force the editor to re-sync its DOM from `value` (e.g. after Interlink apply). */
  resetKey?: number
  onUploadImage?: (file: File) => Promise<string | null>
  className?: string
}

export interface InterlinkPost {
  slug: string
  title: string
}

export interface InterlinkCheckerProps {
  content: string // current HTML
  posts: InterlinkPost[] // published posts to link to
  onApply: (newHtml: string) => void
}
