import { createServerClient } from '@/lib/supabase/server'
import { BreadcrumbSetter } from '@/components/admin/leads/BreadcrumbSetter'
import { LeadsPageClient } from '@/components/admin/leads/LeadsPageClient'

// ─────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────

export const metadata = { title: 'Leads — Admin' }

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default async function LeadsPage() {
  const supabase = await createServerClient()

  const [leadsResult, unreadResult, sourcesResult] = await Promise.all([
    supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(0, 19),
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('is_read', false),
    supabase.from('leads').select('source_module').order('source_module'),
  ])

  // Deduplicate source modules
  const allSources = (sourcesResult.data ?? []).map((r) => r.source_module)
  const sources = [...new Set(allSources.filter((s): s is string => Boolean(s)))]

  const initialData = {
    data: (leadsResult.data ?? []) as Parameters<typeof LeadsPageClient>[0]['initialData']['data'],
    total: leadsResult.count ?? 0,
  }

  return (
    <>
      <BreadcrumbSetter />

      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Total: <span className="text-foreground font-medium">{leadsResult.count ?? 0}</span>{' '}
            leads · Sin leer:{' '}
            <span className="font-medium text-blue-500">{unreadResult.count ?? 0}</span>
          </p>
        </div>
      </div>

      <LeadsPageClient
        initialData={initialData}
        unreadCount={unreadResult.count ?? 0}
        sources={sources}
      />
    </>
  )
}
