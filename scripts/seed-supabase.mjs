/**
 * Seed Supabase with the bundled starter blog posts + default site settings.
 * Usage:  node scripts/seed-supabase.mjs
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local.
 *
 * Safe to re-run — posts are upserted on their unique `slug`.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

// ── tiny .env.local loader (no dotenv dependency) ───────────────────────────
async function loadEnv() {
  try {
    const raw = await readFile(path.resolve('.env.local'), 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !line.trim().startsWith('#')) {
        const key = m[1]
        let val = m[2].trim()
        if (!(key in process.env) || !process.env[key]) process.env[key] = val
      }
    }
  } catch {
    /* no .env.local — rely on real env */
  }
}

// ── read the seed posts straight out of the TS source ───────────────────────
async function loadSeedPosts() {
  const src = await readFile(path.resolve('lib/content/posts.ts'), 'utf8')
  const start = src.indexOf('[', src.indexOf('seedPosts'))
  const end = src.lastIndexOf(']')
  const literal = src.slice(start, end + 1)
  // The array body is plain JS object literals (with template strings) — eval it.
  // eslint-disable-next-line no-new-func
  const arr = Function(`"use strict"; return (${literal});`)()
  return arr
}

const DEFAULT_SETTINGS = [
  { key: 'theme', value: { cyan: '#38E1FF', indigo: '#6E72F0', violet: '#A855F7' } },
  { key: 'general', value: { tagline: 'Know if your diamond is real.' } },
]

async function main() {
  await loadEnv()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } })

  const posts = await loadSeedPosts()
  console.log(`Seeding ${posts.length} blog posts…`)
  for (const p of posts) {
    const row = {
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      cover_image: p.cover_image ?? null,
      author: p.author,
      author_role: p.author_role ?? 'Gemologist',
      category: p.category,
      tags: p.tags ?? [],
      status: p.status ?? 'published',
      featured: !!p.featured,
      seo_title: p.seo_title ?? null,
      seo_description: p.seo_description ?? null,
      read_minutes: p.read_minutes ?? 5,
      published_at: p.published_at,
    }
    const { error } = await supabase.from('blog_posts').upsert(row, { onConflict: 'slug' })
    console.log(error ? `  ✗ ${p.slug}: ${error.message}` : `  ✓ ${p.slug}`)
  }

  console.log('Seeding default settings…')
  for (const s of DEFAULT_SETTINGS) {
    const { error } = await supabase.from('site_settings').upsert(s, { onConflict: 'key' })
    console.log(error ? `  ✗ ${s.key}: ${error.message}` : `  ✓ ${s.key}`)
  }

  console.log('\nDone. Open /admin → Blog Posts to manage them.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
