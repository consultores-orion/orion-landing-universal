import { createServerClient } from '@/lib/supabase/server'
import { BreadcrumbSetter } from '@/components/admin/content-history/BreadcrumbSetter'
import { ContentChangesClient } from '@/components/admin/content-history/ContentChangesClient'
import type { ContentChange } from '@/components/admin/content-history/types'

// ─────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────

export const metadata = { title: 'Historial de Cambios — Admin' }

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default async function ContentHistoryPage() {
  const supabase = await createServerClient()

  const [changesResult, sectionsResult] = await Promise.all([
    supabase
      .from('content_changes')
      .select('*', { count: 'exact' })
      .order('changed_at', { ascending: false })
      .range(0, 19),
    supabase.from('content_changes').select('section_key').order('section_key'),
  ])

  // Deduplicate section keys
  const allSections = (sectionsResult.data ?? []).map((r) => r.section_key)
  const sections = [...new Set(allSections.filter((s): s is string => Boolean(s)))]

  const initialData = {
    data: (changesResult.data ?? []) as ContentChange[],
    total: changesResult.count ?? 0,
  }

  return (
    <>
      <BreadcrumbSetter />

      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Historial de Cambios
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Total: <span className="text-foreground font-medium">{changesResult.count ?? 0}</span>{' '}
            registro{(changesResult.count ?? 0) !== 1 ? 's' : ''} de edición inline
          </p>
        </div>
      </div>

      <ContentChangesClient initialData={initialData} sections={sections} />
    </>
  )
}
