export const runtime = 'edge'

import type { Metadata } from 'next'
import { BlogEditor } from '../BlogEditor'

export const metadata: Metadata = {
  title: 'New post',
  robots: { index: false },
}

export default function NewBlogPostPage() {
  return <BlogEditor mode="new" initialPost={null} />
}
