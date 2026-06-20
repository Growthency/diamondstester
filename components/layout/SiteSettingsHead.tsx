import { getSetting } from '@/lib/settings'
import { HeaderScripts } from './HeaderScripts'

/** Convert "#RRGGBB" to an "H S% L%" triple for the brand CSS variables. */
function hexToHslTriple(hex?: string): string | null {
  if (!hex) return null
  const m = hex.replace('#', '').match(/^([0-9a-fA-F]{6})$/)
  if (!m) return null
  const n = parseInt(m[1], 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  const d = max - min
  if (d) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      default:
        h = (r - g) / d + 4
    }
    h *= 60
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

/** Applies admin-managed Theme Colors, Custom CSS and Header Scripts to the public site. */
export async function SiteSettingsHead() {
  const [theme, customCss, headerScripts] = await Promise.all([
    getSetting<{ cyan?: string; indigo?: string; violet?: string }>('theme', {}),
    getSetting<{ css?: string }>('custom_css', { css: '' }),
    getSetting<{ scripts?: string }>('header_scripts', { scripts: '' }),
  ])

  const vars: string[] = []
  const c = hexToHslTriple(theme?.cyan)
  const i = hexToHslTriple(theme?.indigo)
  const v = hexToHslTriple(theme?.violet)
  if (c) vars.push(`--brilliant-cyan:${c};`)
  if (i) vars.push(`--brilliant-indigo:${i};`)
  if (v) vars.push(`--brilliant-violet:${v};`)

  const css = (vars.length ? `:root{${vars.join('')}}` : '') + (customCss?.css || '')

  return (
    <>
      {css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}
      {headerScripts?.scripts ? <HeaderScripts html={headerScripts.scripts} /> : null}
    </>
  )
}
