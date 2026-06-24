export interface WebpResult {
  buffer: Buffer
  width: number
  height: number
  bytes: number
}

/**
 * The project mandates webp everywhere. WebP conversion now happens in the
 * browser before upload (see lib/image/client-webp.ts), so on the server this
 * is a pass-through that does NO conversion — the bytes that arrive are already
 * optimized WebP.
 */
export async function toWebp(
  input: Buffer,
  _opts: { maxWidth?: number; quality?: number } = {},
): Promise<WebpResult> {
  return { buffer: input, width: 0, height: 0, bytes: input.length }
}

export function isImageMime(mime: string | null | undefined): boolean {
  return Boolean(mime && /^image\//i.test(mime))
}

/** Swap any extension for .webp. */
export function toWebpName(name: string): string {
  return name.replace(/\.[a-z0-9]+$/i, '') + '.webp'
}
