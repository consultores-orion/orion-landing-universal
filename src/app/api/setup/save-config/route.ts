import { NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'

import { connectSchema } from '@/lib/setup/validation'
import { getSetupState } from '@/lib/setup/state'

export async function POST(request: Request) {
  // Security: block if setup already complete
  try {
    const setupState = await getSetupState()
    if (setupState.isComplete) {
      return NextResponse.json({ error: 'Setup already completed' }, { status: 403 })
    }
  } catch {
    // If getSetupState fails (no env vars yet), that's expected — we're saving them now
  }

  // Parse body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Validate input
  const parsed = connectSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const { supabaseUrl, anonKey, serviceRoleKey, databaseUrl } = parsed.data

  // Detect PaaS environment
  const isPaaS = !!(process.env.VERCEL || process.env.NETLIFY || process.env.RAILWAY)

  if (isPaaS) {
    return NextResponse.json({
      success: true,
      method: 'paas',
      message:
        'PaaS environment detected. Environment variables should be configured in your platform dashboard (Vercel, Netlify, or Railway). The app will use them automatically on next deploy.',
    })
  }

  // Local environment: write to .env.local
  try {
    const envPath = path.join(process.cwd(), '.env.local')

    // Read existing .env.local if it exists
    let existingContent = ''
    try {
      existingContent = fs.readFileSync(envPath, 'utf-8')
    } catch {
      // File doesn't exist yet — that's fine
    }

    // Remove existing Supabase-related lines
    const keysToReplace = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'DATABASE_URL',
    ]

    const filteredLines = existingContent.split('\n').filter((line) => {
      const trimmed = line.trim()
      // Keep empty lines and comments that aren't our header
      if (trimmed === '' || (trimmed.startsWith('#') && trimmed !== '# Supabase Configuration')) {
        return true
      }
      // Remove lines that start with any of our keys
      return !keysToReplace.some((key) => trimmed.startsWith(`${key}=`))
    })

    // Remove trailing empty lines, then add our block
    const cleanedContent = filteredLines.join('\n').replace(/\n+$/, '')

    const supabaseBlock = [
      '',
      '# Supabase Configuration',
      `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}`,
      `NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}`,
      `SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}`,
      `DATABASE_URL=${databaseUrl}`,
      '',
    ].join('\n')

    const finalContent = cleanedContent
      ? `${cleanedContent}\n${supabaseBlock}`
      : supabaseBlock.trimStart()

    fs.writeFileSync(envPath, finalContent, 'utf-8')

    return NextResponse.json({
      success: true,
      method: 'local',
      message:
        'Credentials saved to .env.local. Restart the dev server for changes to take effect.',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Failed to write .env.local: ${message}` }, { status: 500 })
  }
}
