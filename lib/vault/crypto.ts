import 'server-only'
import crypto from 'node:crypto'

const ALGO = 'aes-256-gcm'
const IV_LEN = 12
const TAG_LEN = 16
const SALT = 'caratiq-vault-v1'

let cachedKey: Buffer | null = null

function getKey(): Buffer {
  if (cachedKey) return cachedKey
  const secret = process.env.VAULT_SECRET || process.env.SESSION_SECRET || ''
  if (!secret || secret.length < 16) {
    throw new Error('VAULT_SECRET (or SESSION_SECRET fallback) must be at least 16 chars.')
  }
  cachedKey = crypto.scryptSync(secret, SALT, 32)
  return cachedKey
}

/** Returns base64(iv || authTag || ciphertext). */
export function encryptSecret(plain: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(IV_LEN)
  const cipher = crypto.createCipheriv(ALGO, key, iv)
  const ct = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, ct]).toString('base64')
}

export function decryptSecret(encoded: string): string {
  const key = getKey()
  const buf = Buffer.from(encoded, 'base64')
  if (buf.length < IV_LEN + TAG_LEN) throw new Error('ciphertext too short')
  const iv = buf.subarray(0, IV_LEN)
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN)
  const ct = buf.subarray(IV_LEN + TAG_LEN)
  const decipher = crypto.createDecipheriv(ALGO, key, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8')
}

export function safeDecrypt(encoded: string | null | undefined): string {
  if (!encoded) return ''
  try {
    return decryptSecret(encoded)
  } catch {
    return ''
  }
}
