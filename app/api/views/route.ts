export const runtime = 'edge'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient, hasSupabaseConfig } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const schema = z.object({
  path: z.string().trim().min(1),
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
    return NextResponse.json({ ok: false, error: 'A path is required.' }, { status: 400 })
  }

  if (!hasSupabaseConfig()) {
    return NextResponse.json({ ok: true })
  }

  try {
    const referrer = request.headers.get('referer') || request.headers.get('referrer') || null
    const supabase = createAdminClient()
    const { error } = await supabase.from('page_views').insert({
      path: parsed.data.path,
      referrer,
    })
    if (error) {
      console.error('[views] insert failed:', error.message)
    }
  } catch (err) {
    console.error('[views] unexpected error:', err)
  }

  return NextResponse.json({ ok: true })
}
