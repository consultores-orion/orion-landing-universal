import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { getModuleDefinition } from '@/lib/modules/registry'
import { BreadcrumbSetter } from '@/components/admin/BreadcrumbSetter'
import { ModuleEditor } from '@/components/admin/content/ModuleEditor'
import type { FieldDefinition } from '@/components/admin/content/types'

interface PageProps {
  params: Promise<{ section_key: string }>
}

export default async function ContentEditorPage({ params }: PageProps) {
  const { section_key } = await params

  const supabase = await createServerClient()

  const [moduleResult, schemaResult, langsResult] = await Promise.all([
    supabase.from('page_modules').select('*').eq('section_key', section_key).single(),
    supabase.from('module_schemas').select('*').eq('section_key', section_key).single(),
    supabase
      .from('languages')
      .select('code, name, native_name, is_default')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ])

  // Redirect if module doesn't exist in DB
  if (moduleResult.error || !moduleResult.data) {
    redirect('/admin/content')
  }

  const mod = moduleResult.data
  const schemaData = schemaResult.data
  const languages = langsResult.data ?? []

  // Resolve display name from registry (fallback to section_key)
  const definition = getModuleDefinition(section_key)
  const moduleName = definition?.displayName ?? section_key

  // Build schema.fields — the DB stores fields as unknown[] for flexibility.
  // We cast each field to FieldDefinition after the component validates shapes.
  const schemaFields = (schemaData?.fields ?? []) as FieldDefinition[]

  // Ensure content is a plain object (it's typed as Record<string, unknown> in DB types)
  const content = (mod.content ?? {}) as Record<string, unknown>

  // Ensure at least one fallback language so the editor is always usable
  const activeLanguages =
    languages.length > 0
      ? languages
      : [{ code: 'es', name: 'Spanish', native_name: 'Español', is_default: true }]

  return (
    <>
      <BreadcrumbSetter
        items={[
          { label: 'Contenido', href: '/admin/content' },
          { label: moduleName, href: `/admin/content/${section_key}` },
        ]}
      />

      {/* Back navigation */}
      <div className="mb-6">
        <Link
          href="/admin/content"
          className="text-muted-foreground hover:bg-accent hover:text-accent-foreground -ml-2 inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="size-4" />
          Volver a Módulos
        </Link>
      </div>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">{moduleName}</h1>
        {definition?.description && (
          <p className="text-muted-foreground mt-1 max-w-xl text-sm">{definition.description}</p>
        )}
      </div>

      {/* Editor */}
      <ModuleEditor
        module={{
          id: mod.id,
          section_key: mod.section_key,
          content,
          is_visible: mod.is_visible,
        }}
        schema={{ fields: schemaFields }}
        languages={activeLanguages}
        sectionKey={section_key}
      />
    </>
  )
}
