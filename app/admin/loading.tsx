import { Loader2 } from 'lucide-react'

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-brilliant-cyan" />
        Loading…
      </div>

      {/* Stat card skeletons */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card-luxe h-28 animate-pulse rounded-2xl bg-card/60" />
        ))}
      </div>

      {/* List skeletons */}
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card-luxe h-64 animate-pulse rounded-2xl bg-card/60" />
        ))}
      </div>
    </div>
  )
}
