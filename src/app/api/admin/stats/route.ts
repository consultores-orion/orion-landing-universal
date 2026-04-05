import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServerClient()

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError !== null || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const startOfThisWeek = new Date(now)
  startOfThisWeek.setDate(now.getDate() - now.getDay())
  startOfThisWeek.setHours(0, 0, 0, 0)

  const startOfPrevWeek = new Date(startOfThisWeek)
  startOfPrevWeek.setDate(startOfThisWeek.getDate() - 7)

  const endOfPrevWeek = new Date(startOfThisWeek)

  // Run all queries in parallel
  const [
    leadsThisWeekResult,
    leadsPrevWeekResult,
    activeModulesResult,
    languagesResult,
    lastEditResult,
    recentLeadsResult,
  ] = await Promise.all([
    // Leads this week
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfThisWeek.toISOString()),

    // Leads previous week
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfPrevWeek.toISOString())
      .lt('created_at', endOfPrevWeek.toISOString()),

    // Active modules
    supabase
      .from('page_modules')
      .select('id', { count: 'exact', head: true })
      .eq('is_visible', true),

    // Active languages
    supabase
      .from('languages')
      .select('code, name, native_name, flag_emoji')
      .eq('is_active', true)
      .order('sort_order'),

    // Last module update
    supabase
      .from('page_modules')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single(),

    // Recent leads
    supabase
      .from('leads')
      .select('id, name, email, created_at, is_read')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return NextResponse.json({
    leadsThisWeek: leadsThisWeekResult.count ?? 0,
    leadsPrevWeek: leadsPrevWeekResult.count ?? 0,
    activeModules: activeModulesResult.count ?? 0,
    languages: languagesResult.data ?? [],
    lastEdit: lastEditResult.data?.updated_at ?? null,
    recentLeads: recentLeadsResult.data ?? [],
  })
}
