import { Info } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { getModuleDefinition } from '@/lib/modules/registry'
import { BreadcrumbSetter } from '@/components/admin/modules/BreadcrumbSetter'
import { ModuleSortableList, type ModuleData } from '@/components/admin/modules/ModuleSortableList'
import { LayoutExportImport } from '@/components/admin/modules/LayoutExportImport'

// ─────────────────────────────────────────────────────────────
// Breadcrumb config
// ─────────────────────────────────────────────────────────────

const BREADCRUMBS = [{ label: 'Módulos', href: '/admin/modules' }]

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default async function ModulesPage() {
  const supabase = await createServerClient()

  const { data: rows, error } = await supabase
    .from('page_modules')
    .select('id, section_key, display_name, is_visible, is_system, display_order')
    .order('display_order', { ascending: true })

  // Merge registry display names — registry takes precedence for localization;
  // fall back to the first value in display_name JSONB, then section_key.
  const modules: ModuleData[] = (rows ?? []).map((row) => {
    const registryEntry = getModuleDefinition(row.section_key)

    let displayName: string
    if (registryEntry) {
      displayName = registryEntry.displayName
    } else if (row.display_name && typeof row.display_name === 'object') {
      const values = Object.values(row.display_name as Record<string, string>)
      displayName = values[0] ?? row.section_key
    } else {
      displayName = row.section_key
    }

    return {
      id: row.id,
      section_key: row.section_key,
      is_visible: row.is_visible,
      is_system: row.is_system,
      display_order: row.display_order,
      displayName,
    }
  })

  if (error) {
    console.error('[ModulesPage] Failed to fetch modules:', error)
  }

  return (
    <>
      <BreadcrumbSetter items={BREADCRUMBS} />

      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">Gestionar Módulos</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Activa, desactiva y reordena los módulos de tu landing page
          </p>
        </div>
        <LayoutExportImport />
      </div>

      {/* Tip banner */}
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <span>Arrastra los módulos para reordenarlos. Los cambios se guardan automáticamente.</span>
      </div>

      {/* Sortable list */}
      {modules.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No se encontraron módulos. Asegúrate de haber completado la configuración inicial.
        </p>
      ) : (
        <ModuleSortableList initialModules={modules} />
      )}
    </>
  )
}
