'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader2,
  Save,
  LogOut,
  Mail,
  User as UserIcon,
  ImageIcon,
  ShieldAlert,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  full_name: string
  email: string
  avatar_url: string
}

function initialsFrom(name: string, email: string) {
  const source = name.trim() || email.trim()
  if (!source) return 'CA'
  const parts = source.replace(/@.*/, '').split(/[\s._-]+/).filter(Boolean)
  const letters = parts.slice(0, 2).map((p) => p[0])
  return (letters.join('') || source.slice(0, 2)).toUpperCase()
}

export function SettingsForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saving, startSaving] = useTransition()
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    let active = true

    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        if (active) setLoading(false)
        return
      }

      let profile: Partial<Profile> = {}
      const { data } = await supabase
        .from('profiles')
        .select('full_name, email, avatar_url')
        .eq('id', user.id)
        .maybeSingle()
      if (data) profile = data as Partial<Profile>

      if (!active) return
      setUserId(user.id)
      setEmail(profile.email || user.email || '')
      setFullName(profile.full_name || '')
      setAvatarUrl(profile.avatar_url || '')
      setLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [])

  function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (saving || !userId) return

    startSaving(async () => {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim() || null,
          avatar_url: avatarUrl.trim() || null,
        })
        .eq('id', userId)

      if (error) {
        toast.error('Could not save your changes. Please try again.')
        return
      }
      toast.success('Profile updated')
      router.refresh()
    })
  }

  async function onSignOut() {
    if (signingOut) return
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="card-luxe grid place-items-center rounded-2xl p-16">
        <Loader2 className="h-6 w-6 animate-spin text-brilliant-cyan" />
      </div>
    )
  }

  const initials = initialsFrom(fullName, email)

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <form onSubmit={onSave} className="card-luxe rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-brilliant text-lg font-bold text-white shadow-glow">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                className="h-full w-full object-cover"
                onError={(ev) => {
                  ;(ev.currentTarget as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold text-platinum">
              {fullName || 'Your profile'}
            </p>
            <p className="truncate text-sm text-muted-foreground">{email}</p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {/* Full name */}
          <div className="space-y-2">
            <Label htmlFor="full_name" className="flex items-center gap-2">
              <UserIcon className="h-3.5 w-3.5 text-brilliant-cyan/70" />
              Full name
            </Label>
            <Input
              id="full_name"
              name="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              autoComplete="name"
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-brilliant-cyan/70" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              readOnly
              disabled
              className="cursor-not-allowed opacity-70"
            />
            <p className="text-xs text-muted-foreground">
              Your email is tied to your account and can’t be changed here.
            </p>
          </div>

          {/* Avatar URL */}
          <div className="space-y-2">
            <Label htmlFor="avatar_url" className="flex items-center gap-2">
              <ImageIcon className="h-3.5 w-3.5 text-brilliant-cyan/70" />
              Avatar URL
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="avatar_url"
              name="avatar_url"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://…/photo.webp"
              inputMode="url"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end border-t border-border pt-6">
          <Button type="submit" size="lg" disabled={saving || !userId} className="sheen">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save changes
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Session / danger card */}
      <div className="card-luxe rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display font-semibold text-platinum">Sign out</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                End your session on this device. You’ll need to sign in again to reach your vault.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={onSignOut}
            disabled={signingOut}
            className="shrink-0"
          >
            {signingOut ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Signing out…
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" /> Sign out
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
