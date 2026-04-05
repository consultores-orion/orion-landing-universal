import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { ModuleRenderer } from '@/lib/modules/renderer'
import { ScrollToTop } from '@/components/shared/ScrollToTop'

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

export default async function HomePage() {
  const supabase = await createServerClient()

  const [{ data: modules }, { data: languages }] = await Promise.all([
    supabase
      .from('page_modules')
      .select('*')
      .eq('is_visible', true)
      .order('display_order', { ascending: true }),
    supabase.from('languages').select('code, is_default').eq('is_active', true),
  ])

  const defaultLang = languages?.find((l) => l.is_default)?.code ?? 'es'

  return (
    <main>
      <ModuleRenderer
        modules={modules ?? []}
        language={defaultLang}
        defaultLanguage={defaultLang}
        isEditing={false}
      />
      <ScrollToTop />
    </main>
  )
}
