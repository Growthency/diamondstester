export const runtime = 'edge'
import type { Metadata } from 'next'
import { MediaManager } from './MediaManager'

export const metadata: Metadata = {
  title: 'Media Library · Diamonds Tester Admin',
  description: 'Upload and manage WebP media assets.',
}

export default function MediaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-platinum">
          Media Library
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload images — every asset is optimized to WebP automatically.
        </p>
      </div>
      <MediaManager />
    </div>
  )
}
