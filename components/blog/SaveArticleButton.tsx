'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

type Props = {
  slug: string
  title: string
  category: string
}

export function SaveArticleButton({ slug, title, category }: Props) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const [saved, setSaved] = useState(false)
  const [pending, setPending] = useState(false)

  // On mount: check auth, then reflect whether this slug is already saved.
  useEffect(() => {
    let active = true

    async function init() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!active) return

      if (!user) {
        setSignedIn(false)
        setReady(true)
        return
      }

      setSignedIn(true)

      try {
        const res = await fetch('/api/saved-articles', { cache: 'no-store' })
        if (res.ok) {
          const json = await res.json()
          const items: { slug: string }[] = Array.isArray(json?.items) ? json.items : []
          if (active) setSaved(items.some((it) => it.slug === slug))
        }
      } catch {
        /* best-effort — leave as not-saved */
      } finally {
        if (active) setReady(true)
      }
    }

    init()
    return () => {
      active = false
    }
  }, [slug])

  async function toggle() {
    if (pending) return

    if (!signedIn) {
      router.push('/login')
      return
    }

    setPending(true)
    const next = !saved
    // Optimistic flip; revert on failure.
    setSaved(next)

    try {
      const res = next
        ? await fetch('/api/saved-articles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug, title, category }),
          })
        : await fetch(`/api/saved-articles?slug=${encodeURIComponent(slug)}`, {
            method: 'DELETE',
          })

      if (res.status === 401) {
        setSaved(!next)
        router.push('/login')
        return
      }

      if (!res.ok) throw new Error('request failed')

      toast.success(next ? 'Saved to your dashboard' : 'Removed from your saved articles')
    } catch {
      setSaved(!next)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setPending(false)
    }
  }

  const label = saved ? 'Saved' : 'Save article'
  const Glyph = pending ? Loader2 : saved ? BookmarkCheck : Bookmark

  return (
    <Button
      type="button"
      variant="outline"
      onClick={toggle}
      disabled={pending || !ready}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved articles' : 'Save article to your dashboard'}
      className={saved ? 'border-brilliant-cyan/60 text-brilliant-cyan' : undefined}
    >
      <Glyph className={`h-4 w-4 ${pending ? 'animate-spin' : ''}`} />
      {label}
    </Button>
  )
}
