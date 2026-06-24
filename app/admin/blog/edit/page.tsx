export const runtime = 'edge'

import type { Metadata } from 'next'
import { createAdminClient, hasSupabaseConfig } from '@/lib/supabase/server'
import type { AdminPost } from '../types'
import { BlogEditor } from '../BlogEditor'

export const metadata: Metadata = {
  title: 'Edit post',
  robots: { index: false },
}

export default async function EditBlogPostPage({
  searchParams,
}: {
  searchParams: { id?: string }
}) {
  let post: AdminPost | null = null

  const id = searchParams.id
  if (id && hasSupabaseConfig()) {
    try {
      const supabase = createAdminClient()
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single()
      post = (data as AdminPost | null) ?? null
    } catch {
      post = null
    }
  }

  return <BlogEditor mode="edit" initialPost={post} />
}
