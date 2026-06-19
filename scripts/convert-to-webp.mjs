/**
 * Convert every raster image in  assets-src/  to optimized WebP in  public/.
 * Usage:  npm run images:webp
 *
 * Drop your .jpg/.png/.jpeg/.tiff/.heic files into  assets-src/  (any subfolders
 * are preserved) and run this. The site only ships .webp images.
 */
import { readdir, mkdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const SRC = path.resolve('assets-src')
const OUT = path.resolve('public')
const IMG_RE = /\.(jpe?g|png|tiff?|gif|bmp|heic|avif|webp)$/i

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) files.push(...(await walk(full)))
    else if (IMG_RE.test(e.name)) files.push(full)
  }
  return files
}

async function main() {
  if (!existsSync(SRC)) {
    console.log(`No assets-src/ folder found. Create it and drop images in, then re-run.`)
    return
  }
  const files = await walk(SRC)
  if (!files.length) {
    console.log('assets-src/ is empty — nothing to convert.')
    return
  }
  let saved = 0
  for (const file of files) {
    const rel = path.relative(SRC, file).replace(IMG_RE, '.webp')
    const outPath = path.join(OUT, rel)
    await mkdir(path.dirname(outPath), { recursive: true })
    const before = (await stat(file)).size
    await sharp(file)
      .rotate()
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(outPath)
    const after = (await stat(outPath)).size
    saved += before - after
    console.log(`✓ ${rel}  (${(before / 1024).toFixed(0)}kB → ${(after / 1024).toFixed(0)}kB)`)
  }
  console.log(`\nDone. ${files.length} image(s) converted. Saved ~${(saved / 1024 / 1024).toFixed(2)}MB.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
