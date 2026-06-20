import { ImageResponse } from 'next/og'
import { site } from '@/lib/site'

export const runtime = 'edge'
export const alt = `${site.name} — ${site.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background:
            'radial-gradient(1200px 600px at 80% -10%, #1b2a6b 0%, transparent 60%), radial-gradient(900px 600px at 0% 110%, #6e1f8f 0%, transparent 55%), #070B14',
          color: '#E6ECF5',
          fontFamily: 'sans-serif',
        }}
      >
        {/* diamond mark */}
        <svg width="92" height="92" viewBox="0 0 48 48">
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

        <div style={{ marginTop: 40, fontSize: 30, letterSpacing: 6, textTransform: 'uppercase', color: '#38E1FF', display: 'flex' }}>
          {site.name}
        </div>
        <div style={{ marginTop: 12, fontSize: 76, fontWeight: 800, lineHeight: 1.05, maxWidth: 920, display: 'flex' }}>
          {site.tagline}
        </div>
        <div style={{ marginTop: 28, fontSize: 30, color: '#93A1B8', maxWidth: 900, display: 'flex' }}>
          Instant AI photo verification · expert lab certification · zero subscriptions.
        </div>
      </div>
    ),
    { ...size },
  )
}
