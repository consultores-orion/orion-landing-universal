import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env['NEXT_PUBLIC_SITE_URL']?.replace(/\/$/, '') ?? 'https://example.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/setup', '/setup'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
