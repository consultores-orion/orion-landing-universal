import { Suspense } from 'react'
import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { getModuleDefinition } from '@/lib/modules/registry'
import { ModuleErrorBoundary } from '@/components/shared/ModuleErrorBoundary'
import { SortablePageWrapper } from '@/components/live-edit/SortablePageWrapper'
import { SortableModuleItem } from '@/components/live-edit/SortableModuleItem'
import { ScrollToTop } from '@/components/shared/ScrollToTop'
import type { SortableModule } from '@/components/live-edit/SortablePageWrapper'
import type { PageModule } from '@/lib/modules/types'

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createServerClient()

  const [{ data: seo }, { data: config }] = await Promise.all([
    supabase.from('seo_config').select('*').eq('page_key', 'home').single(),
    supabase.from('site_config').select('site_name, favicon_url').single(),
  ])

  // meta_title / meta_description are JSONB: { es: '...', en: '...' }
  const rawTitle = seo?.meta_title
  const title =
    rawTitle && typeof rawTitle === 'object'
      ? ((rawTitle as Record<string, string>)['es'] ??
        Object.values(rawTitle as Record<string, string>)[0] ??
        config?.site_name ??
        'Landing')
      : (config?.site_name ?? 'Landing')

  const rawDesc = seo?.meta_description
  const description =
    rawDesc && typeof rawDesc === 'object'
      ? ((rawDesc as Record<string, string>)['es'] ??
        Object.values(rawDesc as Record<string, string>)[0] ??
        '')
      : ''

  // metadataBase para URLs absolutas en OG
  const siteUrl =
    process.env['NEXT_PUBLIC_SITE_URL'] ??
    (process.env['VERCEL_URL'] ? `https://${process.env['VERCEL_URL']}` : null)

  const meta: Metadata = {
    title,
    description: description || null,
    robots: seo?.robots ?? 'index, follow',
    openGraph: {
      type: 'website',
      title,
      description: description || undefined,
      siteName: config?.site_name ?? undefined,
      images: seo?.og_image_url
        ? [{ url: seo.og_image_url, width: 1200, height: 630, alt: title }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description || undefined,
      images: seo?.og_image_url ? [seo.og_image_url] : [],
    },
  }

  if (siteUrl) {
    meta.metadataBase = new URL(siteUrl)
  }

  return meta
}

function ModuleSkeleton() {
  return <div className="bg-surface/30 min-h-[200px] animate-pulse" />
}

export default async function HomePage() {
  const supabase = await createServerClient()

  const [
    { data: modules },
    { data: languages },
    {
      data: { user },
    },
  ] = await Promise.all([
    supabase.from('page_modules').select('*').order('display_order', { ascending: true }),
    supabase.from('languages').select('code, is_default').eq('is_active', true),
    supabase.auth.getUser(),
  ])

  const isAdmin = !!user
  const defaultLang = languages?.find((l) => l.is_default)?.code ?? 'es'
  const allModules: PageModule[] = modules ?? []

  // Visible modules sorted by display_order (for rendering)
  const visibleModules = allModules
    .filter((m) => m.is_visible)
    .sort((a, b) => a.display_order - b.display_order)

  // SortableModule shape required by SortablePageWrapper.
  // display_name in DB is JSONB Record<string,string> — extract a plain string.
  const resolveDisplayName = (
    raw: Record<string, string> | null | undefined,
    fallback: string,
  ): string => {
    if (!raw) return fallback
    return raw[defaultLang] ?? raw['es'] ?? Object.values(raw)[0] ?? fallback
  }

  const sortableModules: SortableModule[] = allModules
    .sort((a, b) => a.display_order - b.display_order)
    .map((m) => ({
      id: m.id,
      section_key: m.section_key,
      display_order: m.display_order,
      display_name: resolveDisplayName(m.display_name, m.section_key),
      is_visible: m.is_visible,
    }))

  return (
    <main>
      <SortablePageWrapper modules={sortableModules} isAdmin={isAdmin}>
        {visibleModules.map((module, index) => {
          const definition = getModuleDefinition(module.section_key)

          if (!definition) {
            console.warn(`[HomePage] Module not found in registry: "${module.section_key}"`)
            return null
          }

          const Component = definition.component
          const styles = (module.styles as Record<string, unknown>) ?? {}
          const content = (module.content as Record<string, unknown>) ?? {}

          return (
            <SortableModuleItem
              key={module.id}
              moduleId={module.id}
              sectionKey={module.section_key}
              isVisible={module.is_visible}
              displayOrder={module.display_order}
              displayName={resolveDisplayName(module.display_name, module.section_key)}
              totalModules={visibleModules.length}
            >
              <ModuleErrorBoundary moduleKey={module.section_key}>
                <Suspense fallback={<ModuleSkeleton />}>
                  <Component
                    content={content}
                    styles={styles}
                    moduleId={module.id}
                    isEditing={false}
                    language={defaultLang}
                    defaultLanguage={defaultLang}
                  />
                </Suspense>
              </ModuleErrorBoundary>
            </SortableModuleItem>
          )
        })}
      </SortablePageWrapper>
      <ScrollToTop />
    </main>
  )
}
