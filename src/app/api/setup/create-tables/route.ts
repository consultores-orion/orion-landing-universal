import { NextResponse } from 'next/server'
import postgres from 'postgres'

import { createAdminClient } from '@/lib/supabase/admin'
import { getSetupState } from '@/lib/setup/state'
import {
  SHARED_FUNCTIONS_SQL,
  MIGRATION_TABLES,
  TRIGGERS_SQL,
  RLS_POLICIES_SQL,
  INDICES_SQL,
  getFullMigrationSQL,
} from '@/lib/setup/migration-sql'
import { rateLimit, getClientIp, rateLimitHeaders } from '@/lib/security/rate-limit'

interface TableResult {
  table: string
  status: 'success' | 'error'
  error?: string
}

function extractProjectRef(supabaseUrl: string): string {
  // Supabase URL format: https://<project-ref>.supabase.co
  try {
    const url = new URL(supabaseUrl)
    const host = url.hostname // e.g. "abcdefgh.supabase.co"
    return host.split('.')[0] ?? ''
  } catch {
    return ''
  }
}

export async function POST(request: Request) {
  // Rate limiting: 10 requests/minute per IP
  const ip = getClientIp(request)
  const rl = rateLimit(`setup-create-tables:${ip}`, { windowMs: 60_000, max: 10 })
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
    // getSetupState may fail if env vars aren't loaded yet — proceed with caution
  }

  // Level 0: Auto-detection — check if tables already exist
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('site_config').select('id').limit(1)
    if (!error) {
      return NextResponse.json({
        success: true,
        method: 'skipped',
        message: 'Tables already exist.',
      })
    }
  } catch {
    // Tables don't exist or Supabase client couldn't connect — proceed to create
  }

  // Level 1: Direct PostgreSQL connection
  const databaseUrl = process.env.DATABASE_URL
  if (databaseUrl) {
    let sql: postgres.Sql | null = null
    const results: TableResult[] = []
    let useSsl = true

    try {
      // Try with SSL first
      sql = postgres(databaseUrl, { ssl: 'require', connect_timeout: 15 })
      await sql`SELECT 1 as test`
    } catch {
      // Retry without SSL
      try {
        if (sql) await sql.end()
      } catch {
        /* ignore */
      }

      try {
        useSsl = false
        sql = postgres(databaseUrl, { connect_timeout: 15 })
        await sql`SELECT 1 as test`
      } catch (connErr) {
        // Connection failed entirely — fall through to Level 2
        sql = null
        const message = connErr instanceof Error ? connErr.message : 'Unknown error'
        return buildManualFallback(
          `Direct database connection failed: ${message}. Use the SQL script below in the Supabase SQL Editor.`,
        )
      }
    }

    if (sql) {
      try {
        // 1. Shared functions
        try {
          await sql.unsafe(SHARED_FUNCTIONS_SQL)
          results.push({ table: 'shared_functions', status: 'success' })
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error'
          results.push({ table: 'shared_functions', status: 'error', error: message })
        }

        // 2. Tables (one by one)
        for (const migration of MIGRATION_TABLES) {
          try {
            await sql.unsafe(migration.sql)
            results.push({ table: migration.name, status: 'success' })
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error'
            results.push({ table: migration.name, status: 'error', error: message })
          }
        }

        // 3. Triggers
        try {
          await sql.unsafe(TRIGGERS_SQL)
          results.push({ table: 'triggers', status: 'success' })
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error'
          results.push({ table: 'triggers', status: 'error', error: message })
        }

        // 4. RLS Policies
        try {
          await sql.unsafe(RLS_POLICIES_SQL)
          results.push({ table: 'rls_policies', status: 'success' })
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error'
          results.push({ table: 'rls_policies', status: 'error', error: message })
        }

        // 5. Indices
        try {
          await sql.unsafe(INDICES_SQL)
          results.push({ table: 'indices', status: 'success' })
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error'
          results.push({ table: 'indices', status: 'error', error: message })
        }
      } finally {
        try {
          await sql.end()
        } catch {
          /* ignore */
        }
      }

      const hasErrors = results.some((r) => r.status === 'error')
      const successCount = results.filter((r) => r.status === 'success').length
      const errorCount = results.filter((r) => r.status === 'error').length

      return NextResponse.json({
        success: !hasErrors,
        method: `direct_connection${useSsl ? '_ssl' : ''}`,
        results,
        message: hasErrors
          ? `Completed with errors: ${successCount} succeeded, ${errorCount} failed.`
          : `All ${successCount} migration steps completed successfully.`,
      })
    }
  }

  // Level 2: Manual fallback (no DATABASE_URL)
  return buildManualFallback(
    'No DATABASE_URL configured. Use the SQL script below in the Supabase SQL Editor to create the tables manually.',
  )
}

function buildManualFallback(message: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const projectRef = extractProjectRef(supabaseUrl)
  const sqlScript = getFullMigrationSQL()

  return NextResponse.json({
    success: false,
    method: 'manual_fallback',
    message,
    sqlScript,
    supabaseSqlEditorUrl: projectRef
      ? `https://supabase.com/dashboard/project/${projectRef}/sql/new`
      : 'https://supabase.com/dashboard',
  })
}
