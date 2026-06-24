import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient, hasSupabaseConfig } from '@/lib/supabase/server'
import { isImageMime } from '@/lib/image/webp'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

const schema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().optional(),
  method: z.enum(['photo', 'lab', 'mail-in']),
  carat: z.string().trim().optional(),
  details: z.string().trim().optional(),
})

export async function POST(request: Request) {
  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Expected multipart/form-data.' },
      { status: 400 },
    )
  }

  const str = (key: string) => {
    const v = form.get(key)
    return typeof v === 'string' ? v : undefined
  }

  const parsed = schema.safeParse({
    name: str('name'),
    email: str('email'),
    phone: str('phone'),
    method: str('method'),
    carat: str('carat'),
    details: str('details'),
  })

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Name, a valid email, and a valid method are required.' },
      { status: 400 },
    )
  }

  const { name, email, phone, method, carat, details } = parsed.data

  let imageUrl: string | undefined

  try {
    const file = form.get('image')
    const hasImage =
      file &&
      typeof file === 'object' &&
      'arrayBuffer' in file &&
      isImageMime((file as File).type) &&
      (file as File).size > 0

    if (hasImage && hasSupabaseConfig()) {
      // The client already sends optimized WebP — store the received bytes as-is.
      const arrayBuffer = await (file as File).arrayBuffer()
      const input = Buffer.from(arrayBuffer)

      const supabase = createAdminClient()
      const path = `tests/${Date.now()}-${crypto.randomUUID()}.webp`
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(path, input, {
          contentType: 'image/webp',
          upsert: true,
        })

      if (uploadError) {
        console.error('[test-request] upload failed:', uploadError.message)
      } else {
        const { data } = supabase.storage.from('media').getPublicUrl(path)
        imageUrl = data.publicUrl
      }
    }
  } catch (err) {
    console.error('[test-request] image processing error:', err)
  }

  if (!hasSupabaseConfig()) {
    return NextResponse.json({ ok: true })
  }

  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('test_requests').insert({
      name,
      email: email.toLowerCase(),
      phone: phone || null,
      method,
      carat: carat || null,
      details: details || null,
      image_url: imageUrl || null,
      status: 'new',
    })
    if (error) {
      console.error('[test-request] insert failed:', error.message)
    }
  } catch (err) {
    console.error('[test-request] unexpected error:', err)
  }

  return NextResponse.json({ ok: true, image_url: imageUrl })
}
