import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import postgres from 'postgres'

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
    // If getSetupState fails (no env vars yet), that's fine — we're testing credentials
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

  const tests = {
    anon: false,
    serviceRole: false,
    database: false,
  }
  const errors: string[] = []

  // Test 1: Anon key connection
  try {
    const anonClient = createClient(supabaseUrl, anonKey)
    await anonClient.auth.getSession()
    tests.anon = true
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    errors.push(`Anon key test failed: ${message}`)
  }

  // Test 2: Service role key connection
  try {
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { error } = await adminClient.auth.admin.listUsers()
    if (error) {
      errors.push(`Service role key test failed: ${error.message}`)
    } else {
      tests.serviceRole = true
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    errors.push(`Service role key test failed: ${message}`)
  }

  // Test 3: Database URL (direct PostgreSQL connection)
  if (databaseUrl) {
    let sql: postgres.Sql | null = null
    try {
      sql = postgres(databaseUrl, { ssl: 'require', connect_timeout: 10 })
      await sql`SELECT 1 as test`
      tests.database = true
    } catch {
      // Retry without SSL — some local/self-hosted setups don't support it
      try {
        if (sql) await sql.end()
        sql = postgres(databaseUrl, { connect_timeout: 10 })
        await sql`SELECT 1 as test`
        tests.database = true
      } catch (retryErr) {
        const message = retryErr instanceof Error ? retryErr.message : 'Unknown error'
        errors.push(`Database connection test failed: ${message}`)
      }
    } finally {
      if (sql) {
        try {
          await sql.end()
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  }

  const allPassed = tests.anon && tests.serviceRole && (databaseUrl ? tests.database : true)

  if (allPassed) {
    return NextResponse.json({
      success: true,
      tests,
      message: 'All connection tests passed.',
    })
  }

  return NextResponse.json(
    {
      success: false,
      error: errors.join(' | '),
      tests,
    },
    { status: 200 }, // 200 even on partial failure — the client reads `success` and `tests`
  )
}
