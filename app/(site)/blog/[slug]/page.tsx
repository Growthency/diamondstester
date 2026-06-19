import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { getAllPosts, getPostBySlug, getRelatedPosts } from '@/lib/blog'
import { renderMarkdown, extractHeadings } from '@/lib/markdown'
import { site } from '@/lib/site'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/Icon'
import { Reveal } from '@/components/motion/Reveal'
import { ArticleBody } from '@/components/blog/ArticleBody'
import { TableOfContents } from '@/components/blog/TableOfContents'
import { ShareRow } from '@/components/blog/ShareRow'
import { SaveArticleButton } from '@/components/blog/SaveArticleButton'
import { RelatedPosts } from '@/components/blog/RelatedPosts'

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  if (!post) return { title: 'Article not found — CaratIQ Journal' }

  const url = `${site.url.replace(/\/$/, '')}/blog/${post.slug}`
  const title = post.seo_title || post.title
  const description = post.seo_description || post.excerpt

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      publishedTime: post.published_at,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)
  if (!post) notFound()

  const [related] = await Promise.all([
    getRelatedPosts(post.slug, post.category, 3),
  ])

  const headings = extractHeadings(post.content)
  const html = renderMarkdown(post.content)
  const authorInitials = post.author
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')

  return (
    <>
      {/* Header */}
      <section className="section pt-32 pb-0">
        <div className="container-wide">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="transition-colors hover:text-platinum">
                  Home
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <li>
                <Link href="/blog" className="transition-colors hover:text-platinum">
                  Journal
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <li className="truncate text-platinum-muted" aria-current="page">
                {post.category}
              </li>
            </ol>
          </nav>

          <Reveal className="mx-auto max-w-3xl text-center">
            <Link href={`/blog?category=${encodeURIComponent(post.category)}`}>
              <Badge variant="default">{post.category}</Badge>
            </Link>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
              {post.title}
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">{post.excerpt}</p>

            {/* Meta row */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brilliant text-xs font-bold text-white">
                {authorInitials}
              </span>
              <span className="font-medium text-platinum">{post.author}</span>
              {post.author_role && (
                <>
                  <span aria-hidden className="text-border">|</span>
                  <span className="text-muted-foreground">{post.author_role}</span>
                </>
              )}
              <span aria-hidden className="text-border">|</span>
              <span className="text-muted-foreground">{formatDate(post.published_at)}</span>
              <span aria-hidden className="text-border">|</span>
              <span className="text-muted-foreground">{post.read_minutes} min read</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Gradient hero cover band */}
      <section className="pt-10">
        <div className="container-wide">
          <Reveal>
            <div className="relative aspect-[21/9] overflow-hidden rounded-3xl border border-border bg-brilliant-soft sm:aspect-[21/7]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,hsl(var(--brilliant-indigo)/0.55),transparent_55%),radial-gradient(circle_at_80%_75%,hsl(var(--brilliant-violet)/0.45),transparent_55%),radial-gradient(circle_at_55%_50%,hsl(var(--brilliant-cyan)/0.25),transparent_50%)]" />
              <div className="absolute inset-0 grid place-items-center">
                <Icon name="Gem" className="h-16 w-16 text-brilliant-cyan/70 sm:h-20 sm:w-20" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Body */}
      <section className="section pt-14">
        <div className="container-wide">
          <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,42rem)_1fr]">
            {/* Left: sticky TOC (desktop only) */}
            <aside className="order-2 lg:order-1">
              <TableOfContents headings={headings} />
            </aside>

            {/* Center: article */}
            <article className="order-1 min-w-0 lg:order-2">
              <ArticleBody html={html} />

              {/* Mid/end CTA */}
              <div className="card-luxe relative mt-12 overflow-hidden rounded-2xl p-7 sm:p-8">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_0%,hsl(var(--brilliant-indigo)/0.3),transparent_60%)]" />
                <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-brilliant-cyan">
                      <Icon name="ShieldCheck" className="h-5 w-5" />
                      <span className="text-sm font-semibold uppercase tracking-[0.18em]">
                        Verify your diamond
                      </span>
                    </div>
                    <p className="mt-3 max-w-md font-display text-xl font-semibold leading-snug">
                      Stop guessing. Get an expert verdict on your own stone in minutes.
                    </p>
                  </div>
                  <Button asChild size="lg" className="shrink-0 sheen">
                    <Link href="/verify">
                      Verify now <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="mt-10 flex flex-wrap items-center gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-secondary/30 px-3 py-1 text-xs text-platinum-muted"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Share + Save */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
                <ShareRow slug={post.slug} title={post.title} />
                <SaveArticleButton
                  slug={post.slug}
                  title={post.title}
                  category={post.category}
                />
              </div>

              {/* Author bio */}
              <div className="card-luxe mt-8 flex flex-col gap-5 rounded-2xl p-7 sm:flex-row sm:items-center">
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-brilliant text-lg font-bold text-white shadow-glow">
                  {authorInitials}
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brilliant-cyan">
                    Written by
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold">{post.author}</p>
                  {post.author_role && (
                    <p className="text-sm text-muted-foreground">{post.author_role}</p>
                  )}
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Part of the CaratIQ gemology team — combining lab-grade instruments with
                    decades of grading experience to give every stone a straight, honest verdict.
                  </p>
                </div>
              </div>
            </article>

            {/* Right spacer keeps the article centred between the two outer columns. */}
            <div className="hidden lg:block lg:order-3" aria-hidden />
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="section pt-0">
          <div className="container-wide">
            <RelatedPosts posts={related} />
          </div>
        </section>
      )}
    </>
  )
}
