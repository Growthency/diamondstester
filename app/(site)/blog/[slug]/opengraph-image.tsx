import { ImageResponse } from 'next/og'
import { site } from '@/lib/site'
import { seedPosts } from '@/lib/content/posts'
import { extraPosts } from '@/lib/content/posts-extra'

export const runtime = 'edge'
export const alt = 'Diamonds Tester article'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const all = [...seedPosts, ...extraPosts]

export default async function BlogOgImage({ params }: { params: { slug: string } }) {
  const post = all.find((p) => p.slug === params.slug)
  const title = post?.title ?? 'Diamonds Tester Journal'
  const category = post?.category ?? 'Guides'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          background:
            'radial-gradient(1100px 600px at 85% -10%, #1b2a6b 0%, transparent 60%), radial-gradient(900px 600px at -5% 110%, #6e1f8f 0%, transparent 55%), #070B14',
          color: '#E6ECF5',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <svg width="56" height="56" viewBox="0 0 48 48">
            <defs>
              <linearGradient id="a" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38E1FF" />
                <stop offset="100%" stopColor="#6E72F0" />
              </linearGradient>
              <linearGradient id="b" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6E72F0" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
            </defs>
            <polygon points="24,4 40,16 24,16" fill="url(#a)" />
            <polygon points="24,4 8,16 24,16" fill="url(#b)" />
            <polygon points="8,16 24,16 24,44" fill="url(#a)" />
            <polygon points="40,16 24,16 24,44" fill="url(#b)" />
          </svg>
          <div style={{ fontSize: 30, fontWeight: 700, display: 'flex' }}>{site.name}</div>
          <div style={{ marginLeft: 'auto', fontSize: 24, color: '#38E1FF', textTransform: 'uppercase', letterSpacing: 3, display: 'flex' }}>
            {category}
          </div>
        </div>

        <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1, maxWidth: 1040, display: 'flex' }}>
          {title}
        </div>

        <div style={{ fontSize: 28, color: '#93A1B8', display: 'flex' }}>
          {site.url.replace(/^https?:\/\//, '')} · The Diamonds Tester Journal
        </div>
      </div>
    ),
    { ...size },
  )
}
