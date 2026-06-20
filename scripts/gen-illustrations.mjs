/**
 * Generates ORIGINAL, copyright-free illustration tiles (authored here, not
 * sourced from anywhere) and writes them as optimized WebP into public/images/.
 * Run:  node scripts/gen-illustrations.mjs
 *
 * Everything is hand-drawn vector art in the Diamonds Tester palette, so there is zero
 * copyright risk and the site stays 100% WebP.
 */
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const C = {
  bg: '#0B1120',
  bg2: '#0E1626',
  cyan: '#38E1FF',
  indigo: '#6E72F0',
  violet: '#A855F7',
  ink: '#070B14',
  text: '#E6ECF5',
  muted: '#93A1B8',
  line: '#1E2A40',
}

const defs = `
  <defs>
    <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${C.cyan}"/><stop offset="100%" stop-color="${C.indigo}"/>
    </linearGradient>
    <linearGradient id="g2" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${C.indigo}"/><stop offset="100%" stop-color="${C.violet}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="38%" r="60%">
      <stop offset="0%" stop-color="${C.indigo}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${C.bg}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${C.bg2}"/><stop offset="100%" stop-color="${C.bg}"/>
    </linearGradient>
  </defs>`

/** A faceted brilliant-cut diamond centred at (cx,cy), half-width w. */
function diamond(cx, cy, w, opacity = 1) {
  const top = cy - w * 0.8
  const mid = cy - w * 0.2
  const bot = cy + w * 1.25
  const l = cx - w, r = cx + w
  const tl = cx - w * 0.45, tr = cx + w * 0.45
  return `
  <g opacity="${opacity}">
    <polygon points="${tl},${top} ${tr},${top} ${cx},${mid}" fill="url(#g1)"/>
    <polygon points="${l},${mid} ${tl},${top} ${cx},${mid}" fill="url(#g2)" opacity="0.85"/>
    <polygon points="${r},${mid} ${tr},${top} ${cx},${mid}" fill="url(#g1)" opacity="0.9"/>
    <polygon points="${l},${mid} ${cx},${mid} ${cx},${bot}" fill="url(#g1)"/>
    <polygon points="${r},${mid} ${cx},${mid} ${cx},${bot}" fill="url(#g2)"/>
    <g stroke="${C.ink}" stroke-width="2" fill="none" opacity="0.4">
      <path d="M${l} ${mid} L${cx} ${bot} L${r} ${mid}"/>
      <path d="M${tl} ${top} L${cx} ${mid} L${tr} ${top}"/>
      <path d="M${tl} ${mid - (mid - top) * 0} ${tl} ${mid}"/>
    </g>
  </g>`
}

function frame(inner, { grid = true } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
    ${defs}
    <rect width="800" height="600" fill="url(#bg)"/>
    <rect width="800" height="600" fill="url(#glow)"/>
    ${grid ? `<g stroke="${C.line}" stroke-width="1" opacity="0.5">
      ${Array.from({ length: 9 }, (_, i) => `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="600"/>`).join('')}
      ${Array.from({ length: 7 }, (_, i) => `<line x1="0" y1="${i * 100}" x2="800" y2="${i * 100}"/>`).join('')}
    </g>` : ''}
    ${inner}
  </svg>`
}

const sparkle = (x, y, s) => `<path d="M${x} ${y - s} L${x + s * 0.3} ${y - s * 0.3} L${x + s} ${y} L${x + s * 0.3} ${y + s * 0.3} L${x} ${y + s} L${x - s * 0.3} ${y + s * 0.3} L${x - s} ${y} L${x - s * 0.3} ${y - s * 0.3} Z" fill="${C.cyan}"/>`

const illustrations = {
  // Diamond shapes & cuts
  'cuts': frame(`
    ${diamond(400, 250, 110)}
    <g transform="translate(0,30)">
      <circle cx="170" cy="430" r="48" fill="none" stroke="url(#g1)" stroke-width="6"/>
      <rect x="320" y="384" width="92" height="92" rx="6" fill="none" stroke="url(#g2)" stroke-width="6"/>
      <ellipse cx="540" cy="430" rx="34" ry="50" fill="none" stroke="url(#g1)" stroke-width="6"/>
      <polygon points="660,388 700,430 660,472 620,430" fill="none" stroke="url(#g2)" stroke-width="6"/>
    </g>
    ${sparkle(250, 150, 16)}${sparkle(600, 180, 12)}`),

  // Real vs fake
  'real-vs-fake': frame(`
    ${diamond(250, 250, 95, 1)}
    ${diamond(560, 250, 95, 0.6)}
    <circle cx="250" cy="470" r="34" fill="#10241c" stroke="#34d399" stroke-width="4"/>
    <path d="M236 470 l10 11 l20 -22" stroke="#34d399" stroke-width="5" fill="none" stroke-linecap="round"/>
    <circle cx="560" cy="470" r="34" fill="#2a1212" stroke="#fb7185" stroke-width="4"/>
    <path d="M560 454 v22 M560 486 v0.5" stroke="#fb7185" stroke-width="5" stroke-linecap="round"/>
    ${sparkle(180, 150, 14)}${sparkle(640, 170, 10)}`),

  // The 4Cs
  'four-cs': frame(`
    ${diamond(400, 250, 120)}
    <g font-family="Arial, sans-serif" font-weight="700" fill="${C.text}">
      <text x="150" y="470" font-size="44" fill="url(#g1)">Cut</text>
      <text x="300" y="470" font-size="44" fill="url(#g1)">Colour</text>
      <text x="470" y="470" font-size="44" fill="url(#g2)">Clarity</text>
      <text x="630" y="470" font-size="44" fill="url(#g2)">Carat</text>
    </g>
    ${sparkle(240, 160, 14)}${sparkle(580, 150, 12)}`),

  // Lab grown
  'lab-grown': frame(`
    ${diamond(400, 240, 100)}
    <g stroke="url(#g1)" stroke-width="6" fill="none" stroke-linecap="round" transform="translate(0,20)">
      <path d="M340 430 v-50 h120 v50"/>
      <path d="M300 470 q100 -40 200 0" />
    </g>
    <circle cx="360" cy="455" r="6" fill="${C.cyan}"/><circle cx="430" cy="448" r="5" fill="${C.violet}"/>
    ${sparkle(250, 150, 14)}${sparkle(560, 170, 12)}`),

  // Certificate
  'certificate': frame(`
    <rect x="250" y="120" width="300" height="360" rx="14" fill="${C.bg2}" stroke="${C.line}" stroke-width="3"/>
    ${diamond(400, 215, 55)}
    <g stroke="${C.line}" stroke-width="10" stroke-linecap="round">
      <line x1="300" y1="320" x2="500" y2="320"/><line x1="300" y1="350" x2="500" y2="350"/>
      <line x1="300" y1="380" x2="440" y2="380"/>
    </g>
    <circle cx="470" cy="430" r="34" fill="none" stroke="url(#g1)" stroke-width="5"/>
    <path d="M456 430 l9 10 l19 -20" stroke="${C.cyan}" stroke-width="5" fill="none" stroke-linecap="round"/>
    ${sparkle(210, 160, 12)}${sparkle(600, 200, 12)}`),

  // Care & cleaning
  'care': frame(`
    ${diamond(400, 240, 100)}
    <g fill="none" stroke="url(#g1)" stroke-width="5">
      <circle cx="250" cy="430" r="14"/><circle cx="300" cy="460" r="10"/>
      <circle cx="540" cy="440" r="16"/><circle cx="500" cy="470" r="9"/>
    </g>
    ${sparkle(330, 170, 16)}${sparkle(470, 160, 14)}${sparkle(400, 360, 12)}`),

  // Pricing
  'pricing': frame(`
    ${diamond(300, 250, 95)}
    <g transform="translate(430,150)">
      <rect x="0" y="180" width="50" height="120" rx="6" fill="url(#g1)" opacity="0.7"/>
      <rect x="70" y="120" width="50" height="180" rx="6" fill="url(#g1)" opacity="0.85"/>
      <rect x="140" y="60" width="50" height="240" rx="6" fill="url(#g2)"/>
      <path d="M10 200 L95 140 L165 80" stroke="${C.cyan}" stroke-width="4" fill="none"/>
    </g>
    ${sparkle(220, 160, 12)}`),

  // Engagement ring
  'ring': frame(`
    <circle cx="400" cy="370" r="120" fill="none" stroke="url(#g1)" stroke-width="22"/>
    ${diamond(400, 200, 70)}
    ${sparkle(300, 150, 14)}${sparkle(520, 170, 12)}${sparkle(400, 300, 10)}`),
}

async function main() {
  const outDir = path.resolve('public/images')
  await mkdir(outDir, { recursive: true })
  for (const [name, svg] of Object.entries(illustrations)) {
    const out = path.join(outDir, `${name}.webp`)
    await sharp(Buffer.from(svg)).webp({ quality: 86, effort: 5 }).toFile(out)
    console.log(`✓ public/images/${name}.webp`)
  }
  console.log(`\nDone — ${Object.keys(illustrations).length} original illustrations generated.`)
}

main().catch((e) => { console.error(e); process.exit(1) })
