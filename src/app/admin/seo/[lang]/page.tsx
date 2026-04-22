import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Search } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { BreadcrumbSetter } from '@/components/admin/seo/BreadcrumbSetter'
import { SeoEditor } from '@/components/admin/seo/SeoEditor'
import type { SeoConfigRow } from '@/components/admin/seo/SeoEditor'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface PageProps {
  params: Promise<{ lang: string }>
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default async function SeoLangPage({ params }: PageProps) {
  const { lang } = await params

  const supabase = await createServerClient()

  const [langResult, seoResult] = await Promise.all([
    supabase
      .from('languages')
      .select('code, name, native_name')
      .eq('code', lang)
      .eq('is_active', true)
      .maybeSingle(),
    supabase.from('seo_config').select('*').eq('page_key', 'home').maybeSingle(),
  ])

  // Redirect if language doesn't exist or is inactive
  if (langResult.error || !langResult.data) {
    redirect('/admin/seo')
  }

  const language = langResult.data
  const seoConfig = seoResult.data as SeoConfigRow | null

  return (
    <>
      <BreadcrumbSetter
        items={[
          { label: 'SEO', href: '/admin/seo' },
          { label: language.name, href: `/admin/seo/${lang}` },
        ]}
      />

      {/* Back navigation */}
      <div className="mb-6">
        <Link
          href="/admin/seo"
          className={cn(
            // base
            "group/button focus-visible:border-ring focus-visible:ring-ring/50 inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            // variant: ghost
            'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
            // size: sm
            "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
            // extra
            '-ml-2 gap-2',
          )}
        >
          <ArrowLeft />
          Volver a SEO Manager
        </Link>
      </div>

      {/* Page header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <Search className="text-muted-foreground size-6" />
          <h1 className="text-2xl font-semibold tracking-tight">
            SEO — {language.native_name} ({lang.toUpperCase()})
          </h1>
        </div>
        <p className="text-muted-foreground max-w-xl text-sm">
          Configura los metadatos de posicionamiento para el idioma{' '}
          <strong>{language.native_name}</strong>
        </p>
      </div>

      {/* Editor */}
      <SeoEditor seoConfig={seoConfig} languageCode={lang} languageName={language.native_name} />
    </>
  )
}
