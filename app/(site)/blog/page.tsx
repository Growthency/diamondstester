import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { getAllPosts, getCategories, getFeaturedPost } from '@/lib/blog'
import { coverFor } from '@/lib/content/covers'
import { formatDate, cn } from '@/lib/utils'
import { pageMeta, breadcrumbLd } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Reveal, Stagger } from '@/components/motion/Reveal'

export const metadata = pageMeta({
  title: 'The Diamonds Tester Journal — Diamond Guides & Expert Insight',
  description:
    'Plain-English guides to diamond authenticity, the 4Cs, lab-grown vs natural and certification — written by Diamonds Tester gemologists.',
  path: '/blog',
})

const FIRST_PAGE = 6 // page 1: 2 rows of 3 (alongside the featured banner)
const PER_PAGE = 9 // page 2+: 3 rows of 3

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string }
}) {
  const [allPosts, categories, featured] = await Promise.all([
    getAllPosts(),
    getCategories(),
    getFeaturedPost(),
  ])

  const activeCategory = searchParams.category
  const isActive = (cat?: string) => (!activeCategory && !cat) || activeCategory === cat

  const gridAll = allPosts
    .filter((p) => p.slug !== featured?.slug)
    .filter((p) => !activeCategory || p.category === activeCategory)

  const totalPages = gridAll.length <= FIRST_PAGE ? 1 : 1 + Math.ceil((gridAll.length - FIRST_PAGE) / PER_PAGE)
  const requested = parseInt(searchParams.page ?? '1', 10) || 1
  const page = Math.min(Math.max(1, requested), totalPages)
  const start = page === 1 ? 0 : FIRST_PAGE + (page - 2) * PER_PAGE
  const count = page === 1 ? FIRST_PAGE : PER_PAGE
  const gridPosts = gridAll.slice(start, start + count)

  const showFeatured = page === 1 && featured && (!activeCategory || featured.category === activeCategory)

  const hrefFor = (p: number) => {
    const params = new URLSearchParams()
    if (activeCategory) params.set('category', activeCategory)
    if (p > 1) params.set('page', String(p))
    const q = params.toString()
    return q ? `/blog?${q}` : '/blog'
  }

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
        ])}
      />

      {/* Hero */}
      <section className="section pt-32">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">The Diamonds Tester Journal</span>
            <h1 className="mt-5 font-display text-4xl font-bold sm:text-5xl lg:text-6xl">
              <span className="text-shimmer">Learn before you buy</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Straight-talking guides on diamond authenticity, value and the tests that actually
              work — written by the gemologists behind every verdict.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Featured banner (page 1 only) */}
      {showFeatured && featured && (
        <section className="pb-4">
          <div className="container-wide">
            <Reveal>
              <Link
                href={`/blog/${featured.slug}`}
                className="card-luxe group grid overflow-hidden rounded-3xl lg:grid-cols-2"
              >
                <div className="relative min-h-[15rem] overflow-hidden">
                  <img
                    src={coverFor(featured)}
                    alt={featured.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
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
                  <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
              <CategoryChip key={cat} href={`/blog?category=${encodeURIComponent(cat)}`} label={cat} active={isActive(cat)} />
            ))}
          </Reveal>

          {gridPosts.length === 0 ? (
            <Reveal className="mt-16 text-center">
              <p className="text-muted-foreground">
                No articles in this category yet.{' '}
                <Link href="/blog" className="text-brilliant-cyan hover:underline">View all articles →</Link>
              </p>
            </Reveal>
          ) : (
            <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {gridPosts.map((post) => (
                <Reveal key={post.slug}>
                  <Link href={`/blog/${post.slug}`} className="card-luxe group block h-full overflow-hidden rounded-2xl">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={coverFor(post)}
                        alt={post.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
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

          {/* Pagination — prev · 1 · 2 · 3 · next */}
          {totalPages > 1 && (
            <Reveal className="mt-14 flex flex-wrap items-center justify-center gap-2">
              <PageLink href={hrefFor(page - 1)} disabled={page === 1} aria-label="Previous page">
                <ChevronLeft className="h-4 w-4" /> Prev
              </PageLink>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={hrefFor(p)}
                  aria-current={p === page ? 'page' : undefined}
                  className={cn(
                    'grid h-10 min-w-[2.5rem] place-items-center rounded-xl border px-3 text-sm font-medium transition-colors',
                    p === page
                      ? 'border-transparent bg-brilliant text-white shadow-glow'
                      : 'border-border bg-secondary/30 text-platinum-muted hover:border-brilliant-cyan/60 hover:text-platinum',
                  )}
                >
                  {p}
                </Link>
              ))}
              <PageLink href={hrefFor(page + 1)} disabled={page === totalPages} aria-label="Next page">
                Next <ChevronRight className="h-4 w-4" />
              </PageLink>
            </Reveal>
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
                  <Link href="/verify">Verify my diamond <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}

function PageLink({
  href,
  disabled,
  children,
  ...props
}: {
  href: string
  disabled?: boolean
  children: React.ReactNode
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const cls =
    'inline-flex h-10 items-center gap-1 rounded-xl border border-border bg-secondary/30 px-4 text-sm font-medium text-platinum-muted transition-colors hover:border-brilliant-cyan/60 hover:text-platinum'
  if (disabled) {
    return (
      <span className={cn(cls, 'pointer-events-none opacity-40')} {...props}>
        {children}
      </span>
    )
  }
  return (
    <Link href={href} className={cls} {...props}>
      {children}
    </Link>
  )
}

function CategoryChip({ href, label, active }: { href: string; label: string; active: boolean }) {
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
