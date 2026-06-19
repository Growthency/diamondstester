'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { ArrowLeft, CheckCircle2, Loader2, Sparkles, UserPlus } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [pending, startTransition] = useTransition()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (pending) return
    setError(null)

    const name = fullName.trim()
    if (name.length < 2) {
      setError('Please enter your full name.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    startTransition(async () => {
      const supabase = createClient()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      // If Supabase returns an active session, email confirmation is off — go straight in.
      if (data?.session) {
        router.push('/dashboard')
        router.refresh()
        return
      }

      // Otherwise, confirmation email was dispatched.
      setEmailSent(true)
    })
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-4 py-10">
      {/* Aurora backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--brilliant-violet)/0.32),transparent_62%)] blur-2xl" />
        <div className="absolute left-[-8%] top-1/4 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,hsl(var(--brilliant-cyan)/0.22),transparent_60%)] blur-2xl" />
        <div className="absolute bottom-[-12%] right-[-6%] h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,hsl(var(--brilliant-indigo)/0.28),transparent_60%)] blur-2xl" />
        <div className="absolute inset-0 bg-grid opacity-[0.25] mask-fade-b" />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo className="scale-110" />
          {!emailSent && (
            <>
              <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-platinum">
                Create your account
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Save every analysis and build a private vault of your stones.
              </p>
            </>
          )}
        </div>

        {emailSent ? (
          <div className="card-luxe rounded-2xl p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-brilliant-cyan/30 bg-brilliant-soft">
              <CheckCircle2 className="h-7 w-7 text-brilliant-cyan" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-platinum">
              Check your email
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              We sent a confirmation link to{' '}
              <span className="font-medium text-platinum">{email.trim()}</span>. Click it to
              activate your account, then sign in.
            </p>
            <Button asChild variant="outline" size="lg" className="mt-7 w-full">
              <Link href="/login">Go to sign in</Link>
            </Button>
          </div>
        ) : (
          <div className="card-luxe rounded-2xl p-7 sm:p-8">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  placeholder="Ava Sterling"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
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
                    <Loader2 className="h-4 w-4 animate-spin" /> Creating account…
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" /> Create account
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-platinum transition-colors hover:text-brilliant-cyan"
              >
                Sign in
              </Link>
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-brilliant-cyan/70" />
            Independent, expert-grade diamond verification.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-platinum"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to caratiq.com
          </Link>
        </div>
      </div>
    </main>
  )
}
