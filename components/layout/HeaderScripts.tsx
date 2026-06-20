'use client'
import { useEffect } from 'react'

/** Injects admin-managed <head> snippets (analytics, meta, etc.) so they execute. */
export function HeaderScripts({ html }: { html: string }) {
  useEffect(() => {
    if (!html) return
    const container = document.createElement('div')
    container.innerHTML = html
    const added: HTMLElement[] = []
    container.querySelectorAll('script').forEach((old) => {
      const s = document.createElement('script')
      Array.from(old.attributes).forEach((a) => s.setAttribute(a.name, a.value))
      s.text = old.textContent || ''
      document.head.appendChild(s)
      added.push(s)
    })
    container.childNodes.forEach((node) => {
      if (node.nodeType === 1 && node.nodeName !== 'SCRIPT') {
        const clone = node.cloneNode(true) as HTMLElement
        document.head.appendChild(clone)
        added.push(clone)
      }
    })
    return () => added.forEach((n) => n.remove())
  }, [html])
  return null
}
