import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Search } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
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
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 gap-2"
          render={<Link href="/admin/seo" />}
        >
          <ArrowLeft />
          Volver a SEO Manager
        </Button>
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
