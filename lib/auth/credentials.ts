import 'server-only'

/**
 * Single-admin credentials, configured via environment variables.
 *   ADMIN_EMAIL          — the login email
 *   ADMIN_PASSWORD       — plain password (simplest; fine for a single admin)
 *   ADMIN_PASSWORD_HASH  — OR a sha256 hex hash of the password (preferred)
 *
 * If neither password var is set, a dev default is used so the build never
 * breaks — change it before going live.
 */
const DEV_EMAIL = 'hellocatscanner@gmail.com'
const DEV_PASSWORD = 'Hellocatscanner@786#'

const enc = new TextEncoder()

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(input))
  const bytes = new Uint8Array(digest)
  let hex = ''
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0')
  }
  return hex
}

export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  const expectedEmail = (process.env.ADMIN_EMAIL || DEV_EMAIL).toLowerCase().trim()
  const givenEmail = email.toLowerCase().trim()
  if (!timingSafeEqualStr(givenEmail, expectedEmail)) return false

  const hash = process.env.ADMIN_PASSWORD_HASH
  if (hash) {
    return timingSafeEqualStr(await sha256Hex(password), hash.toLowerCase().trim())
  }
  const expectedPassword = process.env.ADMIN_PASSWORD || DEV_PASSWORD
  return timingSafeEqualStr(password, expectedPassword)
}

export function adminEmail(): string {
  return (process.env.ADMIN_EMAIL || DEV_EMAIL).toLowerCase().trim()
}
