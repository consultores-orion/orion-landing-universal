import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Users, Puzzle, Languages, Clock } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { BreadcrumbSetter } from '@/components/admin/dashboard/BreadcrumbSetter'
import { StatsCard } from '@/components/admin/dashboard/StatsCard'
import { RecentLeadsTable } from '@/components/admin/dashboard/RecentLeadsTable'
import { QuickActions } from '@/components/admin/dashboard/QuickActions'

// ─────────────────────────────────────────────
// Types for fetched data
// ─────────────────────────────────────────────

interface DashboardLead {
  id: string
  name: string
  email: string
  created_at: string
  is_read: boolean
}

interface ActiveLanguage {
  code: string
  name: string
}

interface DashboardData {
  leadsThisWeek: number
  leadsPrevWeek: number
  activeModules: number
  languages: ActiveLanguage[]
  lastEdit: string | null
  recentLeads: DashboardLead[]
}

// ─────────────────────────────────────────────
// Data fetching
// ─────────────────────────────────────────────

async function fetchDashboardData(): Promise<DashboardData> {
  const supabase = await createServerClient()

  const now = new Date()
  const startOfThisWeek = new Date(now)
  startOfThisWeek.setDate(now.getDate() - now.getDay())
  startOfThisWeek.setHours(0, 0, 0, 0)

  const startOfPrevWeek = new Date(startOfThisWeek)
  startOfPrevWeek.setDate(startOfThisWeek.getDate() - 7)

  const endOfPrevWeek = new Date(startOfThisWeek)

  const [
    leadsThisWeekResult,
    leadsPrevWeekResult,
    activeModulesResult,
    languagesResult,
    lastEditResult,
    recentLeadsResult,
  ] = await Promise.all([
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfThisWeek.toISOString()),

    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfPrevWeek.toISOString())
      .lt('created_at', endOfPrevWeek.toISOString()),

    supabase
      .from('page_modules')
      .select('id', { count: 'exact', head: true })
      .eq('is_visible', true),

    supabase.from('languages').select('code, name').eq('is_active', true).order('sort_order'),

    supabase
      .from('page_modules')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .from('leads')
      .select('id, name, email, created_at, is_read')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return {
    leadsThisWeek: leadsThisWeekResult.count ?? 0,
    leadsPrevWeek: leadsPrevWeekResult.count ?? 0,
    activeModules: activeModulesResult.count ?? 0,
    languages: (languagesResult.data ?? []) as ActiveLanguage[],
    lastEdit: lastEditResult.data?.updated_at ?? null,
    recentLeads: (recentLeadsResult.data ?? []) as DashboardLead[],
  }
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getTrend(
  current: number,
  previous: number,
): { trend: 'up' | 'down' | 'neutral'; trendValue: string } {
  if (previous === 0 && current === 0) {
    return { trend: 'neutral', trendValue: '0' }
  }
  const delta = current - previous
  if (delta > 0) return { trend: 'up', trendValue: `+${delta}` }
  if (delta < 0) return { trend: 'down', trendValue: `${delta}` }
  return { trend: 'neutral', trendValue: '0' }
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default async function DashboardPage() {
  const data = await fetchDashboardData()

  const { trend, trendValue } = getTrend(data.leadsThisWeek, data.leadsPrevWeek)

  const languageCodes =
    data.languages.length > 0
      ? data.languages.map((l) => l.code.toUpperCase()).join(', ')
      : 'Ninguno'

  const lastEditFormatted = data.lastEdit
    ? formatDistanceToNow(new Date(data.lastEdit), {
        addSuffix: true,
        locale: es,
      })
    : 'Sin datos'

  const prevWeekSubtitle =
    data.leadsPrevWeek === 0
      ? 'Sin leads la semana pasada'
      : `+${data.leadsPrevWeek} semana anterior`

  return (
    <>
      {/* Breadcrumb setter (Client Component, no render) */}
      <BreadcrumbSetter />

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-foreground text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">Bienvenido al panel de administración</p>
      </div>

      {/* Stats grid — 2 cols on mobile, 4 on lg */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          title="Leads esta Semana"
          value={data.leadsThisWeek}
          subtitle={prevWeekSubtitle}
          icon={Users}
          trend={trend}
          trendValue={trendValue}
        />
        <StatsCard
          title="Módulos Activos"
          value={data.activeModules}
          subtitle="de 19 totales"
          icon={Puzzle}
        />
        <StatsCard
          title="Idiomas Activos"
          value={data.languages.length}
          subtitle={languageCodes}
          icon={Languages}
        />
        <StatsCard
          title="Última Edición"
          value={lastEditFormatted}
          subtitle="Última modificación"
          icon={Clock}
        />
      </div>

      {/* Content section — Recent Leads (2/3) + Quick Actions (1/3) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent leads — takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentLeadsTable leads={data.recentLeads} />
        </div>

        {/* Quick actions — takes 1 column */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>
    </>
  )
}
