import Link from 'next/link'
import type { Metadata } from 'next'
import {
  Bookmark,
  BookOpen,
  CalendarDays,
  ArrowUpRight,
  PlugZap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient, hasSupabaseConfig } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { RemoveSavedButton } from './RemoveSavedButton'

export const metadata: Metadata = {
  title: 'Saved guides — CaratIQ',
  robots: { index: false, follow: false },
}

interface SavedArticle {
  id: string
  slug: string
  title: string
  category: string | null
  created_at: string
}

export default async function SavedPage() {
  const configured = hasSupabaseConfig()
  let articles: SavedArticle[] = []

  if (configured) {
    try {
      const supabase = await createClient()
      const { data } = await supabase
        .from('saved_articles')
        .select('*')
        .order('created_at', { ascending: false })
      articles = (data as SavedArticle[] | null) ?? []
    } catch {
      articles = []
    }
  }

  const hasSaved = articles.length > 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <p className="eyebrow">
          <Bookmark className="h-3.5 w-3.5 text-brilliant-cyan" />
          Your vault
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
          Saved <span className="text-gradient">guides</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          The gemologist-written articles you’ve bookmarked, kept in one place to read whenever
          you’re ready.
        </p>
      </header>

      {!configured && (
        <div className="card-luxe flex items-start gap-4 rounded-2xl p-6">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brilliant-soft text-brilliant-cyan">
            <PlugZap className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display font-semibold text-platinum">
              Connect your database to see saved guides
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Bookmark any article from our library and it will be waiting for you here.
            </p>
          </div>
        </div>
      )}

      {hasSaved ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {articles.map((a) => (
            <li
              key={a.id}
              className="card-luxe group relative flex flex-col rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-0.5"
            >
              <RemoveSavedButton id={a.id} title={a.title} />

              <Link href={`/blog/${a.slug}`} className="flex flex-1 flex-col">
                {a.category && (
                  <Badge variant="default" className="self-start">
                    {a.category}
                  </Badge>
                )}

                <h2 className="mt-4 font-display text-lg font-semibold leading-snug text-platinum transition-colors group-hover:text-brilliant-cyan">
                  {a.title}
                </h2>

                <div className="mt-auto flex items-center justify-between pt-6">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Saved {formatDate(a.created_at)}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-brilliant-cyan" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        configured && (
          <div className="card-luxe relative overflow-hidden rounded-2xl px-6 py-12 text-center sm:py-16">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--brilliant-indigo)/0.18),transparent_60%)]" />
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brilliant text-white shadow-glow">
              <Bookmark className="h-6 w-6" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-bold">Nothing saved yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              From the 4Cs to spotting a lab-grown stone, our library is written by gemologists.
              Bookmark anything worth keeping and it lands right here.
            </p>
            <div className="mt-7">
              <Button asChild size="lg" className="sheen">
                <Link href="/blog">
                  <BookOpen className="h-4 w-4" /> Browse the library
                </Link>
              </Button>
            </div>
          </div>
        )
      )}
    </div>
  )
}
