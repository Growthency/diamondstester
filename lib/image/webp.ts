import 'server-only'
import sharp from 'sharp'

export interface WebpResult {
  buffer: Buffer
  width: number
  height: number
  bytes: number
}

/**
 * Convert ANY uploaded raster image (jpeg/png/gif/avif/heic/tiff/…) to an
 * optimized WebP. The project mandates webp everywhere — this is the single
 * choke point every admin upload passes through.
 */
export async function toWebp(
  input: Buffer,
  opts: { maxWidth?: number; quality?: number } = {},
): Promise<WebpResult> {
  const { maxWidth = 1920, quality = 82 } = opts

  let pipeline = sharp(input, { failOn: 'none' }).rotate() // respect EXIF orientation
  const meta = await pipeline.metadata()

  if (meta.width && meta.width > maxWidth) {
    pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true })
  }

  const buffer = await pipeline
    .webp({ quality, effort: 5, smartSubsample: true })
    .toBuffer()

  const out = await sharp(buffer).metadata()
  return {
    buffer,
    width: out.width ?? meta.width ?? 0,
    height: out.height ?? meta.height ?? 0,
    bytes: buffer.length,
  }
}

export function isImageMime(mime: string | null | undefined): boolean {
  return Boolean(mime && /^image\//i.test(mime))
}

/** Swap any extension for .webp. */
export function toWebpName(name: string): string {
  return name.replace(/\.[a-z0-9]+$/i, '') + '.webp'
}
