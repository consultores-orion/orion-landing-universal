import { Languages } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { BreadcrumbSetter } from '@/components/admin/languages/BreadcrumbSetter'
import { LanguageList, type Language } from '@/components/admin/languages/LanguageList'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface SchemaField {
  key: string
  isMultilingual?: boolean
}

interface ModuleWithContent {
  id: string
  section_key: string
  content: Record<string, unknown>
}

interface ModuleSchema {
  section_key: string
  fields: SchemaField[]
}

// ─────────────────────────────────────────────────────────────
// Translation progress calculator
// ─────────────────────────────────────────────────────────────

function calculateTranslationProgress(
  modules: ModuleWithContent[],
  schemas: ModuleSchema[],
  langCode: string,
): number {
  let totalFields = 0
  let translatedFields = 0

  for (const mod of modules) {
    const schema = schemas.find((s) => s.section_key === mod.section_key)
    if (!schema || !Array.isArray(schema.fields)) continue

    for (const field of schema.fields) {
      if (!field.isMultilingual) continue
      totalFields++

      const content = mod.content
      if (!content) continue

      const langContent = content[langCode]
      if (typeof langContent === 'object' && langContent !== null) {
        const fieldValue = (langContent as Record<string, unknown>)[field.key]
        if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
          translatedFields++
        }
      }
    }
  }

  return totalFields === 0 ? 100 : Math.round((translatedFields / totalFields) * 100)
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default async function LanguagesPage() {
  const supabase = await createServerClient()

  const [languagesResult, modulesResult, schemasResult] = await Promise.all([
    supabase.from('languages').select('*').order('sort_order', { ascending: true }),
    supabase.from('page_modules').select('id, section_key, content'),
    supabase.from('module_schemas').select('section_key, fields'),
  ])

  const languages = (languagesResult.data ?? []) as Language[]

  // Cast modules — content is Record<string, unknown> per database types
  const modules = (modulesResult.data ?? []) as ModuleWithContent[]

  // Cast schemas — fields is unknown[] in database types, we assert SchemaField[]
  const schemas: ModuleSchema[] = (schemasResult.data ?? []).map((s) => ({
    section_key: s.section_key,
    fields: Array.isArray(s.fields) ? (s.fields as SchemaField[]) : [],
  }))

  // Build translation progress map for all languages
  const translationProgress: Record<string, number> = {}
  for (const lang of languages) {
    translationProgress[lang.code] = calculateTranslationProgress(modules, schemas, lang.code)
  }

  const breadcrumbs = [{ label: 'Idiomas', href: '/admin/languages' }]

  return (
    <>
      <BreadcrumbSetter items={breadcrumbs} />

      {/* Page header */}
      <div className="mb-8 flex items-start gap-3">
        <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          <Languages className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">Gestor de Idiomas</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Administra los idiomas disponibles en tu landing page
          </p>
        </div>
      </div>

      {/* Language list */}
      <div className="max-w-2xl">
        <LanguageList languages={languages} translationProgress={translationProgress} />
      </div>
    </>
  )
}
