'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  Copy,
  ImageIcon,
  Loader2,
  Trash2,
  UploadCloud,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { fileToWebp } from '@/lib/image/client-webp'

interface MediaItem {
  id: number | string
  filename: string
  url: string
  width: number | null
  height: number | null
  bytes: number | null
  created_at?: string
}

function formatBytes(bytes: number | null): string {
  if (!bytes || bytes <= 0) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let i = 0
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i++
  }
  return `${value.toFixed(value < 10 && i > 0 ? 1 : 0)} ${units[i]}`
}

export function MediaManager() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/media', { cache: 'no-store' })
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => f.type.startsWith('image/'))
      if (list.length === 0) {
        toast.error('Only image files are supported.')
        return
      }
      setUploading(true)
      let ok = 0
      for (const file of list) {
        try {
          const webp = await fileToWebp(file)
          const form = new FormData()
          form.append('file', webp)
          const res = await fetch('/api/admin/media', {
            method: 'POST',
            body: form,
          })
          const data = await res.json()
          if (!res.ok || data?.error) {
            toast.error(data?.error || `Failed to upload ${file.name}`)
          } else {
            ok++
          }
        } catch {
          toast.error(`Failed to upload ${file.name}`)
        }
      }
      if (ok > 0) {
        toast.success(`Uploaded ${ok} image${ok > 1 ? 's' : ''}.`)
        await load()
      }
      setUploading(false)
    },
    [load],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files)
    },
    [uploadFiles],
  )

  const copyUrl = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('URL copied to clipboard.')
    } catch {
      toast.error('Could not copy URL.')
    }
  }, [])

  const remove = useCallback(async (id: MediaItem['id']) => {
    try {
      const res = await fetch(`/api/admin/media?id=${encodeURIComponent(String(id))}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok || data?.error) {
        toast.error(data?.error || 'Delete failed.')
        return
      }
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast.success('Image deleted.')
    } catch {
      toast.error('Delete failed.')
    }
  }, [])

  return (
    <div className="space-y-6">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files?.length) uploadFiles(e.target.files)
          e.target.value = ''
        }}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card/50 px-6 py-12 text-center transition-colors',
          dragOver && 'border-brilliant-cyan bg-brilliant-soft/30',
        )}
      >
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-brilliant-cyan" />
        ) : (
          <UploadCloud className="h-8 w-8 text-brilliant-cyan" />
        )}
        <div>
          <p className="font-medium text-platinum">
            {uploading ? 'Uploading…' : 'Drag & drop images here'}
          </p>
          <p className="text-sm text-muted-foreground">
            or click to browse — converted to WebP on upload
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            inputRef.current?.click()
          }}
          disabled={uploading}
        >
          Choose files
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading library…
        </div>
      ) : items.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <ImageIcon className="h-10 w-10 text-muted-foreground" />
          <p className="font-medium text-platinum">No media yet</p>
          <p className="text-sm text-muted-foreground">
            Upload your first image to get started.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <Card
              key={item.id}
              className="group overflow-hidden border-border bg-card"
            >
              <button
                type="button"
                onClick={() => copyUrl(item.url)}
                className="block aspect-square w-full overflow-hidden bg-secondary/40"
                title="Click to copy URL"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.filename}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </button>
              <div className="space-y-2 p-3">
                <p
                  className="truncate text-sm font-medium text-platinum"
                  title={item.filename}
                >
                  {item.filename}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.width && item.height
                    ? `${item.width}×${item.height}`
                    : '—'}{' '}
                  · {formatBytes(item.bytes)}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => copyUrl(item.url)}
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
                    onClick={() => remove(item.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
