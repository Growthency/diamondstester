import Link from 'next/link'
import type { BlogPost } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/Icon'
import { Reveal, Stagger } from '@/components/motion/Reveal'
import { formatDate } from '@/lib/utils'

/**
 * Grid of up to three related articles. Server component — receives the posts
 * already resolved (via getRelatedPosts) from the page.
 */
export function RelatedPosts({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) return null

  return (
    <section aria-labelledby="related-heading">
      <Reveal>
        <span className="eyebrow">Keep reading</span>
        <h2 id="related-heading" className="mt-4 font-display text-3xl font-bold sm:text-4xl">
          Related articles
        </h2>
      </Reveal>

      <Stagger className="mt-10 grid gap-6 md:grid-cols-3">
        {posts.map((post) => (
          <Reveal key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="card-luxe group block h-full overflow-hidden rounded-2xl"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-brilliant-soft">
                <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,hsl(var(--brilliant-indigo)/0.5),transparent_60%)]">
                  <Icon
                    name="Gem"
                    className="h-12 w-12 text-brilliant-cyan/70 transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              </div>
              <div className="p-6">
                <Badge variant="muted">{post.category}</Badge>
                <h3 className="mt-3 font-display text-lg font-semibold leading-snug transition-colors group-hover:text-brilliant-cyan">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
                <p className="mt-4 text-xs text-muted-foreground">
                  {formatDate(post.published_at)} · {post.read_minutes} min read
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </Stagger>
    </section>
  )
}
