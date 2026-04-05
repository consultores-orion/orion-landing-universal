import { NextResponse } from 'next/server'

import { adminSchema } from '@/lib/setup/validation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSetupState } from '@/lib/setup/state'
import { rateLimit, getClientIp, rateLimitHeaders } from '@/lib/security/rate-limit'

export async function POST(request: Request) {
  // Rate limiting: 10 requests/minute per IP
  const ip = getClientIp(request)
  const rl = rateLimit(`setup-create-admin:${ip}`, { windowMs: 60_000, max: 10 })
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: rateLimitHeaders(rl) },
    )
  }

  // Security: block if setup already complete
  try {
    const setupState = await getSetupState()
    if (setupState.isComplete) {
      return NextResponse.json({ error: 'Setup already completed' }, { status: 403 })
    }
  } catch {
    return NextResponse.json(
      { error: 'Supabase environment variables not configured.' },
      { status: 500 },
    )
  }

  // Parse body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Validate input (adminSchema includes confirmPassword match via .refine())
  const parsed = adminSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const { email, password } = parsed.data
  const supabase = createAdminClient()

  // Check if users already exist — only allow first admin creation
  try {
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) {
      return NextResponse.json({ error: 'Failed to verify existing users.' }, { status: 500 })
    }

    if (usersData?.users && usersData.users.length > 0) {
      return NextResponse.json(
        { error: 'An admin user already exists. Setup cannot create additional users.' },
        { status: 403 },
      )
    }
  } catch {
    return NextResponse.json(
      { error: 'Failed to connect to authentication service.' },
      { status: 500 },
    )
  }

  // Create admin user
  const { data: userData, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: 'admin',
      created_by: 'setup_wizard',
    },
  })

  if (createError) {
    return NextResponse.json(
      { error: `Failed to create admin account: ${createError.message}` },
      { status: 500 },
    )
  }

  // Mark setup as complete in site_config
  const { error: updateError } = await supabase
    .from('site_config')
    .update({ setup_completed: true })
    .eq('id', 'main')

  if (updateError) {
    // User was created but site_config update failed — non-fatal, log and continue
    console.error('Failed to update site_config.setup_completed:', updateError.message)
  }

  return NextResponse.json({
    success: true,
    message: 'Admin account created. Setup is complete.',
    user: {
      email: userData.user.email,
      id: userData.user.id,
    },
  })
}
