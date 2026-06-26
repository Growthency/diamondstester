export const runtime = 'edge'
import { NextResponse } from 'next/server'

// Temporary diagnostic: reports ONLY whether key env vars are visible at runtime
// (booleans, never values) via process.env vs the next-on-pages request context.
export async function GET() {
  const keys = [
    'SESSION_SECRET',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
    'ANTHROPIC_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
  ]

  const procEnv: Record<string, boolean> = {}
  for (const k of keys) procEnv[k] = Boolean(process.env[k])

  const reqCtx: Record<string, boolean> = {}
  let ctxError: string | null = null
  try {
    const mod: any = await import('@cloudflare/next-on-pages')
    const env: any = mod.getRequestContext?.()?.env ?? {}
    for (const k of keys) reqCtx[k] = Boolean(env[k])
  } catch (e) {
    ctxError = e instanceof Error ? e.message : String(e)
  }

  return NextResponse.json({
    procEnv,
    reqCtx,
    ctxError,
    node_env: process.env.NODE_ENV ?? null,
  })
}
