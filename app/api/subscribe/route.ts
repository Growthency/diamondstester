import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient, hasSupabaseConfig } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const schema = z.object({
  email: z.string().trim().email(),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Please provide a valid email address.' },
      { status: 400 },
    )
  }

  const email = parsed.data.email.toLowerCase()

  if (!hasSupabaseConfig()) {
    return NextResponse.json({ ok: true })
  }

  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('subscribers').insert({ email })
    // 23505 = unique_violation → already subscribed, treat as success.
    if (error && error.code !== '23505') {
      console.error('[subscribe] insert failed:', error.message)
    }
  } catch (err) {
    console.error('[subscribe] unexpected error:', err)
  }

  return NextResponse.json({ ok: true })
}
