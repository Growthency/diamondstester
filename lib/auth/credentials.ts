import 'server-only'
import crypto from 'node:crypto'

/**
 * Single-admin credentials, configured via environment variables.
 *   ADMIN_EMAIL          — the login email
 *   ADMIN_PASSWORD       — plain password (simplest; fine for a single admin)
 *   ADMIN_PASSWORD_HASH  — OR a sha256 hex hash of the password (preferred)
 *
 * If neither password var is set, a dev default is used so the build never
 * breaks — change it before going live.
 */
const DEV_EMAIL = 'admin@diamondstester.com'
const DEV_PASSWORD = 'diamond1234'

function timingSafeEqualStr(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return crypto.timingSafeEqual(ab, bb)
}

function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex')
}

export function verifyCredentials(email: string, password: string): boolean {
  const expectedEmail = (process.env.ADMIN_EMAIL || DEV_EMAIL).toLowerCase().trim()
  const givenEmail = email.toLowerCase().trim()
  if (!timingSafeEqualStr(givenEmail, expectedEmail)) return false

  const hash = process.env.ADMIN_PASSWORD_HASH
  if (hash) {
    return timingSafeEqualStr(sha256Hex(password), hash.toLowerCase().trim())
  }
  const expectedPassword = process.env.ADMIN_PASSWORD || DEV_PASSWORD
  return timingSafeEqualStr(password, expectedPassword)
}

export function adminEmail(): string {
  return (process.env.ADMIN_EMAIL || DEV_EMAIL).toLowerCase().trim()
}
