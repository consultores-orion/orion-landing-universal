import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

/**
 * Requires an authenticated user. Redirects to /login if not authenticated.
 * Use in Server Components and Server Actions.
 */
export async function requireAuth() {
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return user
}

/**
 * Gets the current session without redirecting.
 * Returns null if not authenticated.
 */
export async function getSession() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}
