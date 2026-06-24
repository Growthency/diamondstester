import 'server-only'

const IV_LEN = 12
const SALT = 'caratiq-vault-v1'

const enc = new TextEncoder()
const dec = new TextDecoder()

let cachedKey: CryptoKey | null = null

function getSecret(): string {
  const secret = process.env.VAULT_SECRET || process.env.SESSION_SECRET || ''
  if (!secret || secret.length < 16) {
    throw new Error('VAULT_SECRET (or SESSION_SECRET fallback) must be at least 16 chars.')
  }
  return secret
}

async function getKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey
  const keyBytes = new Uint8Array(
    await crypto.subtle.digest('SHA-256', enc.encode(`${SALT}-v1:` + getSecret())),
  )
  cachedKey = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ])
  return cachedKey
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

/** Returns base64(iv || ciphertext+tag). */
export async function encryptSecret(plain: string): Promise<string> {
  const key = await getKey()
  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN))
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plain)),
  )
  const out = new Uint8Array(iv.length + ct.length)
  out.set(iv, 0)
  out.set(ct, iv.length)
  return bytesToBase64(out)
}

export async function decryptSecret(encoded: string): Promise<string> {
  const key = await getKey()
  const buf = base64ToBytes(encoded)
  if (buf.length <= IV_LEN) throw new Error('ciphertext too short')
  const iv = buf.subarray(0, IV_LEN) as unknown as BufferSource
  const ct = buf.subarray(IV_LEN) as unknown as BufferSource
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct)
  return dec.decode(plain)
}

export async function safeDecrypt(encoded: string | null | undefined): Promise<string> {
  if (!encoded) return ''
  try {
    return await decryptSecret(encoded)
  } catch {
    return ''
  }
}
