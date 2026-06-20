'use client'

import { useState, useTransition } from 'react'
import { Loader2, Lock, ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginAction } from './actions'

export function LoginScreen() {
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [pending, startTransition] = useTransition()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (pending) return
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      // On success the action redirects (throws internally) and never returns.
      const result = await loginAction(undefined, formData)
      if (result?.error) {
        setError(result.error)
        if (typeof result.email === 'string') setEmail(result.email)
      }
    })
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-4 py-10">
      {/* Aurora backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--brilliant-indigo)/0.35),transparent_62%)] blur-2xl" />
        <div className="absolute right-[-8%] top-1/3 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,hsl(var(--brilliant-cyan)/0.22),transparent_60%)] blur-2xl" />
        <div className="absolute bottom-[-12%] left-[-6%] h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,hsl(var(--brilliant-violet)/0.25),transparent_60%)] blur-2xl" />
        <div className="absolute inset-0 bg-grid opacity-[0.25] mask-fade-b" />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo className="scale-110" />
          <p className="mt-5 font-display text-2xl font-bold tracking-tight text-platinum">
            Admin Console
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">Sign in to manage Diamonds Tester.</p>
        </div>

        <div className="card-luxe rounded-2xl p-7 sm:p-8">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@diamondstester.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••••"
                required
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm text-red-300"
              >
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" /> Sign in
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-brilliant-cyan/70" />
          Authorized access only.
        </p>
      </div>
    </main>
  )
}
