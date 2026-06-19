'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export function RemoveSavedButton({ id, title }: { id: string; title: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [removed, setRemoved] = useState(false)

  function onRemove(e: React.MouseEvent) {
    // Sits inside a Link card — don't navigate when removing.
    e.preventDefault()
    e.stopPropagation()
    if (pending || removed) return

    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.from('saved_articles').delete().eq('id', id)
      if (error) {
        toast.error('Could not remove this guide. Please try again.')
        return
      }
      setRemoved(true)
      toast.success('Removed from your saved guides', {
        description: title,
      })
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={onRemove}
      disabled={pending || removed}
      aria-label={`Remove ${title} from saved guides`}
      className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full border border-border bg-ink-soft/80 text-muted-foreground opacity-0 backdrop-blur-md transition-all hover:border-destructive/40 hover:bg-destructive/10 hover:text-red-300 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <X className="h-4 w-4" />
      )}
    </button>
  )
}
