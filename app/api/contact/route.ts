export const runtime = 'edge'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient, hasSupabaseConfig } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const schema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().optional(),
  subject: z.string().trim().optional(),
  message: z.string().trim().min(1),
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
      { ok: false, error: 'Name, a valid email, and a message are required.' },
      { status: 400 },
    )
  }

  const { name, email, phone, subject, message } = parsed.data

  if (!hasSupabaseConfig()) {
    return NextResponse.json({ ok: true })
  }

  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('contact_submissions').insert({
      name,
      email: email.toLowerCase(),
      phone: phone || null,
      subject: subject || null,
      message,
      status: 'new',
    })
    if (error) {
      console.error('[contact] insert failed:', error.message)
    }
  } catch (err) {
    console.error('[contact] unexpected error:', err)
  }

  return NextResponse.json({ ok: true })
}
