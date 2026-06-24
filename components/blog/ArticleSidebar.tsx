import Link from 'next/link'
import type { BlogPost } from '@/lib/types'
import { Icon } from '@/components/ui/Icon'
import { formatDate } from '@/lib/utils'

/**
 * Compact "more in this category" rail shown beside with-sidebar articles.
 * Server component — receives already-resolved related posts (max 4) from the
 * page. Renders nothing when there's nothing to show.
 */
export function ArticleSidebar({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) return null

  return (
    <div className="sticky top-28">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brilliant-cyan">
        More in this topic
      </p>
      <ul className="mt-5 space-y-5">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="group flex gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brilliant-soft">
                <Icon
                  name="Gem"
                  className="h-5 w-5 text-brilliant-cyan/70 transition-transform duration-500 group-hover:scale-110"
                />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium leading-snug text-platinum transition-colors group-hover:text-brilliant-cyan">
                  {post.title}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {formatDate(post.published_at)} · {post.read_minutes} min read
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
