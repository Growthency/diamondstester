import type { Metadata, Viewport } from 'next'
import { Inter, Sora } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers/Providers'
import { site } from '@/lib/site'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const sora = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  keywords: [
    'diamond tester',
    'is my diamond real',
    'diamond verification',
    'diamond authenticity',
    'lab grown vs natural diamond',
    'diamond certification',
  ],
  openGraph: {
    type: 'website',
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: { card: 'summary_large_image', title: site.name, description: site.description },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // verification: { google: 'YOUR_GSC_TOKEN' },  // add your Search Console token
  icons: { icon: '/favicon.svg', apple: '/icon.svg' },
}

export const viewport: Viewport = {
  themeColor: '#070B14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`} suppressHydrationWarning>
      <body className="grain min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
