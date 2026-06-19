/**
 * Creates a ready-to-use demo USER account for the dashboard (separate from the
 * admin portal). Run once after Supabase keys are in .env.local:
 *     node scripts/create-demo-user.mjs
 *
 * Default demo login:  demo@caratiq.com  /  demo123456
 * Override with env:    DEMO_EMAIL / DEMO_PASSWORD
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

async function loadEnv() {
  try {
    const raw = await readFile(path.resolve('.env.local'), 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !line.trim().startsWith('#') && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
    }
  } catch {}
}

async function main() {
  await loadEnv()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }
  const email = process.env.DEMO_EMAIL || 'demo@caratiq.com'
  const password = process.env.DEMO_PASSWORD || 'demo123456'
  const supabase = createClient(url, key, { auth: { persistSession: false } })

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'Demo User' },
  })

  if (error) {
    if (/already.*registered|exists/i.test(error.message)) {
      console.log(`• Demo user already exists: ${email}`)
    } else {
      console.error('✗', error.message)
      process.exit(1)
    }
  } else {
    console.log(`✓ Demo user created: ${email}  (id ${data.user?.id})`)
  }
  console.log(`\nDashboard login →  ${email}  /  ${password}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
