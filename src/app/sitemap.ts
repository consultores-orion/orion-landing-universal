import type { MetadataRoute } from 'next'
import { createServerClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createServerClient()

  const baseUrl = process.env['NEXT_PUBLIC_SITE_URL']?.replace(/\/$/, '') ?? 'https://example.com'

  const { data: modules } = await supabase
    .from('page_modules')
    .select('section_key, updated_at')
    .eq('is_visible', true)
    .order('display_order')

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]

  for (const mod of modules ?? []) {
    routes.push({
      url: `${baseUrl}#${mod.section_key}`,
      lastModified: mod.updated_at ? new Date(mod.updated_at) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  return routes
}
