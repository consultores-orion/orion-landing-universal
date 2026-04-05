import Link from 'next/link'
import { FileText, Edit } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { getModuleDefinition } from '@/lib/modules/registry'
import type { ModuleCategory } from '@/lib/modules/types'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { BreadcrumbSetter } from '@/components/admin/BreadcrumbSetter'

// Map registry category keys to Spanish labels
const CATEGORY_LABELS: Record<ModuleCategory, string> = {
  header: 'Encabezado',
  content: 'Contenido',
  social: 'Social',
  conversion: 'Conversión',
  info: 'Información',
  footer: 'Pie de página',
}

// Map categories to badge variants for visual distinction
const CATEGORY_VARIANTS: Record<ModuleCategory, 'default' | 'secondary' | 'outline'> = {
  header: 'default',
  content: 'secondary',
  social: 'secondary',
  conversion: 'default',
  info: 'outline',
  footer: 'outline',
}

export default async function ContentPage() {
  const supabase = await createServerClient()

  const modulesResult = await supabase
    .from('page_modules')
    .select('id, section_key, is_visible, display_order')
    .order('display_order', { ascending: true })

  const modules = modulesResult.data ?? []

  // Enrich each module row with registry metadata
  const enriched = modules.map((mod) => {
    const definition = getModuleDefinition(mod.section_key)
    return {
      ...mod,
      displayName: definition?.displayName ?? mod.section_key,
      description: definition?.description ?? '',
      category: (definition?.category ?? 'content') as ModuleCategory,
    }
  })

  return (
    <>
      <BreadcrumbSetter items={[{ label: 'Contenido', href: '/admin/content' }]} />

      {/* Page header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <FileText className="text-muted-foreground size-6" />
          <h1 className="text-2xl font-semibold tracking-tight">Editor de Contenido</h1>
        </div>
        <p className="text-muted-foreground max-w-xl text-sm">
          Selecciona un módulo para editar su contenido. Los cambios se aplican inmediatamente en la
          landing page pública.
        </p>
      </div>

      {/* Module grid */}
      {enriched.length === 0 ? (
        <div className="border-border flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
          <FileText className="text-muted-foreground mb-4 size-10" />
          <p className="text-muted-foreground text-sm">
            No hay módulos configurados aún. Completa el wizard de setup primero.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {enriched.map((mod) => (
            <Card key={mod.section_key}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{mod.displayName}</CardTitle>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Badge variant={CATEGORY_VARIANTS[mod.category]}>
                      {CATEGORY_LABELS[mod.category]}
                    </Badge>
                    <Badge variant={mod.is_visible ? 'default' : 'outline'}>
                      {mod.is_visible ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
                {mod.description && (
                  <CardDescription className="mt-1 text-xs">{mod.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-mono text-xs">{mod.section_key}</p>
              </CardContent>
              <CardFooter>
                <Link
                  href={`/admin/content/${mod.section_key}`}
                  className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex w-full items-center justify-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors"
                >
                  <Edit className="size-4" />
                  Editar contenido
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
