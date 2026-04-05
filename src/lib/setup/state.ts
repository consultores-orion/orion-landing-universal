import type { SupabaseClient } from '@supabase/supabase-js'

import { createAdminClient } from '@/lib/supabase/admin'
import type { SetupState } from '@/types/setup'

export function hasRequiredEnvVars(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function getSetupState(supabaseClient?: SupabaseClient): Promise<SetupState> {
  // Check env vars first (no network needed)
  const hasEnvVars = hasRequiredEnvVars()
  if (!hasEnvVars) {
    return {
      hasEnvVars: false,
      hasDatabase: false,
      hasSeedData: false,
      hasAdminUser: false,
      isComplete: false,
    }
  }

  const supabase = supabaseClient ?? createAdminClient()

  // Check if tables exist by querying site_config
  let hasDatabase = false
  try {
    const { error } = await supabase.from('site_config').select('id').limit(1)
    hasDatabase = !error
  } catch {
    hasDatabase = false
  }

  if (!hasDatabase) {
    return {
      hasEnvVars,
      hasDatabase: false,
      hasSeedData: false,
      hasAdminUser: false,
      isComplete: false,
    }
  }

  // Check seed data (site_config row exists with data)
  let hasSeedData = false
  try {
    const { data } = await supabase
      .from('site_config')
      .select('id, site_name')
      .eq('id', 'main')
      .single()
    hasSeedData = !!data
  } catch {
    hasSeedData = false
  }

  if (!hasSeedData) {
    return { hasEnvVars, hasDatabase, hasSeedData: false, hasAdminUser: false, isComplete: false }
  }

  // Check for admin user
  let hasAdminUser = false
  try {
    const { data } = await supabase.auth.admin.listUsers()
    hasAdminUser = !!data?.users && data.users.length > 0
  } catch {
    hasAdminUser = false
  }

  const isComplete = hasEnvVars && hasDatabase && hasSeedData && hasAdminUser
  return { hasEnvVars, hasDatabase, hasSeedData, hasAdminUser, isComplete }
}

export function getRedirectStep(state: SetupState): string {
  if (!state.hasEnvVars) return '/setup/connect'
  if (!state.hasDatabase) return '/setup/tables'
  if (!state.hasSeedData) return '/setup/seed'
  if (!state.hasAdminUser) return '/setup/admin'
  return '/'
}
