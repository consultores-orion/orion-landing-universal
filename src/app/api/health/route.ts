import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)

  return NextResponse.json({
    status: 'ok',
    version: process.env.npm_package_version ?? '0.1.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    supabase: supabaseConfigured ? 'connected' : 'not_configured',
  })
}
