import { NextResponse } from 'next/server'
import { readSession } from '@/lib/auth/session'
import { createAdminClient, hasSupabaseConfig } from '@/lib/supabase/server'
import { isImageMime, toWebpName } from '@/lib/image/webp'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function GET() {
  if (!(await readSession())) return unauthorized()
  if (!hasSupabaseConfig()) return NextResponse.json([])

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      console.error('[admin/media] list failed:', error.message)
      return NextResponse.json([])
    }
    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error('[admin/media] unexpected error:', err)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  if (!(await readSession())) return unauthorized()
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ error: 'Supabase not configured' })
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  if (!isImageMime(file.type)) {
    return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
  }

  try {
    // The client already sends optimized WebP — store the received bytes as-is.
    const input = new Uint8Array(await file.arrayBuffer())

    const supabase = createAdminClient()
    const objectPath = `library/${crypto.randomUUID()}.webp`

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(objectPath, input, {
        contentType: 'image/webp',
        upsert: false,
      })
    if (uploadError) {
      console.error('[admin/media] upload failed:', uploadError.message)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('media').getPublicUrl(objectPath)

    const filename = toWebpName(file.name || 'image')
    const { data: row, error: insertError } = await supabase
      .from('media')
      .insert({
        filename,
        url: publicUrl,
        alt: '',
        width: null,
        height: null,
        bytes: input.length,
      })
      .select()
      .single()

    if (insertError) {
      console.error('[admin/media] insert failed:', insertError.message)
      // best-effort cleanup of orphaned storage object
      await supabase.storage.from('media').remove([objectPath])
      return NextResponse.json({ error: 'Save failed' }, { status: 500 })
    }

    return NextResponse.json({
      id: row?.id,
      url: publicUrl,
      filename,
      width: null,
      height: null,
      bytes: input.length,
    })
  } catch (err) {
    console.error('[admin/media] unexpected error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!(await readSession())) return unauthorized()
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ error: 'Supabase not configured' })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  try {
    const supabase = createAdminClient()

    // fetch the row so we can best-effort remove the storage object
    const { data: row } = await supabase
      .from('media')
      .select('url')
      .eq('id', id)
      .maybeSingle()

    const { error } = await supabase.from('media').delete().eq('id', id)
    if (error) {
      console.error('[admin/media] delete failed:', error.message)
      return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
    }

    // best-effort: strip the storage object based on the public url
    if (row?.url) {
      const marker = '/media/'
      const idx = (row.url as string).indexOf(marker)
      if (idx !== -1) {
        const objectPath = (row.url as string).slice(idx + marker.length)
        await supabase.storage.from('media').remove([objectPath])
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin/media] unexpected error:', err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
