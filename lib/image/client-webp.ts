/**
 * Browser-side WebP conversion. The server no longer transcodes images (native
 * encoders aren't available on the edge runtime), so every upload is converted
 * to optimized WebP here, in the user's browser, via a canvas before it leaves
 * the page.
 */

/** Swap any extension for .webp. */
function toWebpName(name: string): string {
  return name.replace(/\.[a-z0-9]+$/i, '') + '.webp'
}

/**
 * Draw an image File to a canvas (respecting maxWidth, keeping aspect ratio)
 * and re-encode it as WebP. On any failure the original file is returned
 * unchanged so an upload is never blocked by conversion.
 */
export async function fileToWebp(
  file: File,
  opts: { maxWidth?: number; quality?: number } = {},
): Promise<File> {
  const { maxWidth = 1600, quality = 0.82 } = opts

  try {
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })

    const img: HTMLImageElement = await new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error('decode failed'))
      image.src = dataUrl
    })

    let w = img.width
    let h = img.height
    if (!w || !h) return file
    if (w > maxWidth) {
      h = Math.round((h / w) * maxWidth)
      w = maxWidth
    }

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(img, 0, 0, w, h)

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/webp', quality),
    )
    if (!blob) return file

    return new File([blob], toWebpName(file.name || 'image'), {
      type: 'image/webp',
      lastModified: Date.now(),
    })
  } catch {
    return file
  }
}
