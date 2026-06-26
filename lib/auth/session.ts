import 'server-only'
import { cookies } from 'next/headers'

export const SESSION_COOKIE = 'ciq_session'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

// Stable last-resort signing key. Used only when neither SESSION_SECRET nor the
// service-role key is exposed to the runtime — some hosts don't surface env vars
// to edge functions, which would otherwise break admin sessions across
// instances. A real SESSION_SECRET env var always takes precedence.
const STABLE_FALLBACK_SECRET = 'dtester-session-7f3a9c2e8b14d05f6a9c1e7b3d8f02a4c6e1b9d7a'

const enc = new TextEncoder()

function base64urlFromBytes(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64url(input: string | Uint8Array): string {
  const bytes = typeof input === 'string' ? enc.encode(input) : input
  return base64urlFromBytes(bytes)
}

function base64urlToBytes(input: string): Uint8Array {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function base64urlToString(input: string): string {
  return new TextDecoder().decode(base64urlToBytes(input))
}

function getSecret(): string {
  const s = process.env.SESSION_SECRET
  if (s && s.length >= 16) return s

  // Stable serverless fallback: when SESSION_SECRET isn't set (common on a first
  // deploy), use the Supabase service-role key. It's a secret env var that's
  // identical across every serverless instance, so admin sessions verify
  // correctly in production without an extra variable.
  // (Setting SESSION_SECRET explicitly is still recommended.)
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (svc && svc.length >= 16) {
    return svc
  }

  return STABLE_FALLBACK_SECRET
}

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    enc.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

async function sign(payload: string): Promise<string> {
  const key = await getKey()
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
  return base64urlFromBytes(new Uint8Array(sig))
}

async function verifySignature(payload: string, signature: string): Promise<boolean> {
  const expected = await sign(payload)
  // Constant-time char-by-char compare of the base64url strings.
  if (expected.length !== signature.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i)
  }
  return diff === 0
}

export interface SessionData {
  userId: string
  email: string
  expiresAt: number
}

async function encode(data: SessionData): Promise<string> {
  const payload = base64url(JSON.stringify(data))
  return `${payload}.${await sign(payload)}`
}

export async function decodeSessionValue(
  value: string | undefined | null,
): Promise<SessionData | null> {
  if (!value) return null
  const [payload, signature] = value.split('.')
  if (!payload || !signature) return null
  if (!(await verifySignature(payload, signature))) return null
  try {
    const data = JSON.parse(base64urlToString(payload)) as SessionData
    if (!data.expiresAt || data.expiresAt < Date.now()) return null
    return data
  } catch {
    return null
  }
}

export async function createSession(data: Omit<SessionData, 'expiresAt'>): Promise<void> {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000
  const value = await encode({ ...data, expiresAt })
  const store = await cookies()
  store.set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  })
}

export async function readSession(): Promise<SessionData | null> {
  const store = await cookies()
  return decodeSessionValue(store.get(SESSION_COOKIE)?.value)
}

export async function deleteSession(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}
