import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient, hasSupabaseConfig } from '@/lib/supabase/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'
const DAILY_LIMIT = Number(process.env.ANALYZE_DAILY_LIMIT || '15')

const DIAMOND_PROMPT = `You are a master gemologist (GIA Graduate Gemologist) with 25+ years grading diamonds.
You are examining one or more close-up photos of the SAME stone from different angles.
Use every image together to judge whether the stone behaves like a real diamond
(natural or lab-grown) or like a simulant (moissanite, cubic zirconia, white
sapphire/topaz, or glass).

What to look for:
- Brilliance vs. fire: diamond shows crisp grey-white brilliance with controlled
  rainbow fire. Moissanite shows EXCESSIVE rainbow fire ("disco" flashes). CZ looks
  glassy with less life.
- Facet edges & symmetry: diamonds have sharp, crisp facet junctions. Doubled/blurred
  facet edges seen through the table suggest double refraction → moissanite.
- Girdle, culet, inclusions: tiny natural inclusions or feathers point to a real
  diamond; a flawless, "too perfect" look can indicate a simulant or lab-grown.
- Surface wear, scratches (softer simulants scratch), read-through, overall light return.

Be HONEST about the limits of a photo:
- A photo CANNOT definitively separate a NATURAL diamond from a LAB-GROWN one — that
  needs spectroscopy. Say so, and lower confidence accordingly.
- Lighting and image quality limit certainty. Never overstate.

Respond with ONLY a valid JSON object — no markdown, no backticks, no extra text:

{
  "isGemstone": true or false,
  "verdict": "Likely natural diamond" | "Likely lab-grown diamond" | "Likely a real diamond (natural or lab-grown)" | "Likely a simulant" | "Inconclusive",
  "stoneType": "Natural diamond" | "Lab-grown diamond" | "Moissanite" | "Cubic zirconia" | "White sapphire or topaz" | "Glass" | "Uncertain",
  "confidence": "High" | "Medium" | "Low",
  "authenticityScore": 0-100,
  "summary": "1-2 plain-English sentences a non-expert understands",
  "observations": [
    { "feature": "Brilliance & fire", "finding": "string" },
    { "feature": "Facet symmetry & edges", "finding": "string" },
    { "feature": "Inclusions & clarity", "finding": "string" },
    { "feature": "Girdle, culet & surface", "finding": "string" }
  ],
  "estimated4Cs": { "cut": "string", "color": "string", "clarity": "string", "caratHint": "string" },
  "redFlags": ["string"],
  "recommendation": "string — the practical next step",
  "limitations": "string — why a photo can't be the final word"
}

authenticityScore = how likely the stone is a REAL diamond (natural OR lab-grown) vs a
simulant: 80-100 strongly diamond-like, 40-79 mixed/uncertain, 0-39 likely simulant.
If the image is NOT a gemstone, set isGemstone=false, verdict="Inconclusive",
stoneType="Uncertain", and explain in summary.`

function parseDataUrl(input: string): { mediaType: string; base64: string } | null {
  const m = input.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/)
  if (m) return { mediaType: m[1], base64: m[2] }
  // bare base64 fallback
  if (/^[A-Za-z0-9+/=]+$/.test(input) && input.length > 100) {
    return { mediaType: 'image/jpeg', base64: input }
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const images: string[] = Array.isArray(body?.images) ? body.images.slice(0, 3) : []
    const userId: string | null = typeof body?.userId === 'string' && body.userId ? body.userId : null
    if (!images.length) {
      return NextResponse.json({ ok: false, error: 'Please add at least one photo.' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        ok: false,
        unconfigured: true,
        message:
          'The instant AI analyzer is not switched on yet. Book a free expert review and our gemologists will check your stone by hand.',
      })
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // The client already sends optimized WebP — just decode each data URL.
    const webpImages: { base64: string; buffer: Buffer }[] = []
    for (const raw of images) {
      const parsed = parseDataUrl(raw)
      if (!parsed) continue
      const buffer = Buffer.from(parsed.base64, 'base64')
      webpImages.push({ base64: parsed.base64, buffer })
    }
    if (!webpImages.length) {
      return NextResponse.json({ ok: false, error: 'Could not read those images.' }, { status: 400 })
    }

    const imageHash = crypto
      .createHash('sha256')
      .update(webpImages.map((w) => w.base64).join(''))
      .digest('hex')

    const supabase = hasSupabaseConfig() ? createAdminClient() : null

    // Cache + daily abuse guard (only when a DB is available).
    if (supabase) {
      try {
        const { data: cached } = await supabase
          .from('analyses')
          .select('result, image_url')
          .eq('image_hash', imageHash)
          .maybeSingle()
        if (cached?.result) {
          return NextResponse.json({ ok: true, result: cached.result, image_url: cached.image_url, cached: true })
        }
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const { count } = await supabase
          .from('analyses')
          .select('id', { count: 'exact', head: true })
          .eq('ip_address', ip)
          .gte('created_at', since)
        if ((count ?? 0) >= DAILY_LIMIT) {
          return NextResponse.json({
            ok: false,
            limited: true,
            message: `You've reached today's free scan limit. Book a free expert review or mail your stone in for a definitive lab test.`,
          })
        }
      } catch {
        /* cache/limit are best-effort */
      }
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: [
            ...webpImages.map((w) => ({
              type: 'image' as const,
              source: { type: 'base64' as const, media_type: 'image/webp' as const, data: w.base64 },
            })),
            { type: 'text' as const, text: DIAMOND_PROMPT },
          ],
        },
      ],
    })

    const rawText = message.content[0]?.type === 'text' ? message.content[0].text : ''
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
    let result: any
    try {
      result = JSON.parse(cleaned)
    } catch {
      return NextResponse.json(
        { ok: false, error: 'The analyzer returned an unexpected response. Please try again with clearer photos.' },
        { status: 502 },
      )
    }

    // Persist (best-effort): upload first webp + store the analysis row.
    let image_url: string | null = null
    if (supabase) {
      try {
        const path = `analyses/${imageHash.slice(0, 24)}.webp`
        await supabase.storage.from('media').upload(path, webpImages[0].buffer, {
          contentType: 'image/webp',
          upsert: true,
        })
        image_url = supabase.storage.from('media').getPublicUrl(path).data.publicUrl
        await supabase.from('analyses').insert({
          image_url,
          image_hash: imageHash,
          verdict: String(result?.verdict ?? '').slice(0, 80),
          score: Number.isFinite(result?.authenticityScore) ? Math.round(result.authenticityScore) : null,
          result,
          ip_address: ip,
          user_id: userId,
        })
      } catch {
        /* storage/db best-effort — never block the user's result */
      }
    }

    return NextResponse.json({ ok: true, result, image_url })
  } catch (err: any) {
    console.error('analyze error:', err?.message || err)
    return NextResponse.json(
      { ok: false, error: 'Something went wrong analyzing your photos. Please try again.' },
      { status: 500 },
    )
  }
}
