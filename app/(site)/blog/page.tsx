import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getAllPosts, getCategories, getFeaturedPost } from '@/lib/blog'
import { site } from '@/lib/site'
import { formatDate, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/Icon'
import { Reveal, Stagger } from '@/components/motion/Reveal'

export const metadata: Metadata = {
  title: 'The CaratIQ Journal — Diamond Guides, Comparisons & Expert Insight',
  description:
    'Plain-English guides to diamond authenticity, the 4Cs, lab-grown vs natural and certification — written by CaratIQ gemologists.',
  alternates: { canonical: `${site.url.replace(/\/$/, '')}/blog` },
  openGraph: {
    title: 'The CaratIQ Journal',
    description:
      'Plain-English guides to diamond authenticity, the 4Cs, lab-grown vs natural and certification.',
    url: `${site.url.replace(/\/$/, '')}/blog`,
    type: 'website',
  },
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const [allPosts, categories, featured] = await Promise.all([
    getAllPosts(),
    getCategories(),
    getFeaturedPost(),
  ])

  const activeCategory = searchParams.category
  const isActive = (cat?: string) =>
    (!activeCategory && !cat) || activeCategory === cat

  // The featured post anchors the hero banner; the grid shows the rest, filtered
  // server-side by the ?category= search param.
  const gridPosts = allPosts
    .filter((p) => p.slug !== featured?.slug)
    .filter((p) => !activeCategory || p.category === activeCategory)

  return (
    <>
      {/* Hero */}
      <section className="section pt-32">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">The CaratIQ Journal</span>
            <h1 className="mt-5 font-display text-4xl font-bold sm:text-5xl lg:text-6xl">
              <span className="text-shimmer">Learn before you buy</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Straight-talking guides on diamond authenticity, value and the tests that actually
              work — written by the gemologists behind every CaratIQ verdict.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Featured banner */}
      {featured && (!activeCategory || featured.category === activeCategory) && (
        <section className="pb-4">
          <div className="container-wide">
            <Reveal>
              <Link
                href={`/blog/${featured.slug}`}
                className="card-luxe group grid overflow-hidden rounded-3xl lg:grid-cols-2"
              >
                <div className="relative min-h-[15rem] overflow-hidden bg-brilliant-soft">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,hsl(var(--brilliant-indigo)/0.55),transparent_60%),radial-gradient(circle_at_75%_80%,hsl(var(--brilliant-violet)/0.4),transparent_55%)]" />
                  <div className="absolute inset-0 grid place-items-center">
                    <Icon
                      name="Gem"
                      className="h-20 w-20 text-brilliant-cyan/70 transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-center p-8 sm:p-10">
                  <div className="flex items-center gap-3">
                    <Badge variant="solid">Featured</Badge>
                    <Badge variant="muted">{featured.category}</Badge>
                  </div>
                  <h2 className="mt-5 font-display text-2xl font-bold leading-tight transition-colors group-hover:text-brilliant-cyan sm:text-3xl">
                    {featured.title}
                  </h2>
                  <p className="mt-4 text-muted-foreground">{featured.excerpt}</p>
                  <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{featured.author}</span>
                    <span aria-hidden>·</span>
                    <span>{formatDate(featured.published_at)}</span>
                    <span aria-hidden>·</span>
                    <span>{featured.read_minutes} min read</span>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brilliant-cyan">
                    Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* Category filter + grid */}
      <section className="section pt-10">
        <div className="container-wide">
          <Reveal className="flex flex-wrap items-center gap-2.5">
            <CategoryChip href="/blog" label="All" active={isActive(undefined)} />
            {categories.map((cat) => (
              <CategoryChip
                key={cat}
                href={`/blog?category=${encodeURIComponent(cat)}`}
                label={cat}
                active={isActive(cat)}
              />
            ))}
          </Reveal>

          {gridPosts.length === 0 ? (
            <Reveal className="mt-16 text-center">
              <p className="text-muted-foreground">
                No articles in this category yet.{' '}
                <Link href="/blog" className="text-brilliant-cyan hover:underline">
                  View all articles →
                </Link>
              </p>
            </Reveal>
          ) : (
            <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {gridPosts.map((post) => (
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
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section pt-0">
        <div className="container-wide">
          <Reveal>
            <div className="card-luxe relative overflow-hidden rounded-3xl px-8 py-14 text-center sm:px-16">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--brilliant-indigo)/0.35),transparent_60%)]" />
              <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold sm:text-4xl">
                Reading is good. <span className="text-gradient">Certainty is better.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Put what you&rsquo;ve learned to work — get a clear verdict on your own stone in minutes.
              </p>
              <div className="mt-8">
                <Button asChild size="lg" className="sheen">
                  <Link href="/verify">
                    Verify my diamond <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}

function CategoryChip({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-transparent bg-brilliant text-white shadow-glow'
          : 'border-border bg-secondary/30 text-platinum-muted hover:border-brilliant-cyan/60 hover:text-platinum',
      )}
    >
      {label}
    </Link>
  )
}
