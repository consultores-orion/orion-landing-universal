import type { MetadataRoute } from 'next'
import { createServerClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createServerClient()

  const baseUrl = process.env['NEXT_PUBLIC_SITE_URL']?.replace(/\/$/, '') ?? 'https://example.com'

  // All modules are sections (#) on a single page — fragment URLs are ignored
  // by search engine crawlers per RFC 3986, so we only emit the base URL.
  // Use the most recent module update as lastModified for freshness signaling.
  const { data: modules } = await supabase
    .from('page_modules')
    .select('updated_at')
    .eq('is_visible', true)
    .order('updated_at', { ascending: false })
    .limit(1)

  const lastModified = modules?.[0]?.updated_at ? new Date(modules[0].updated_at) : new Date()

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]
}
