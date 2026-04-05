import type { NextConfig } from 'next'

// Content Security Policy directive list.
// unsafe-inline and unsafe-eval are required for Next.js 15 (inline scripts/styles and hydration).
// When Next.js adds nonce support, these should be replaced with nonces.
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.google-analytics.com *.googletagmanager.com *.facebook.net *.facebook.com",
  "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
  "font-src 'self' fonts.gstatic.com",
  "img-src 'self' data: blob: *.supabase.co *.supabase.in https:",
  "connect-src 'self' *.supabase.co *.supabase.in wss://*.supabase.co https://www.google-analytics.com",
  "frame-src 'self' *.youtube.com *.youtube-nocookie.com *.vimeo.com calendly.com *.google.com",
  "media-src 'self' blob: *.supabase.co",
]
const cspValue = cspDirectives.join('; ')

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: cspValue },
          // HSTS — only in production (HTTP in dev breaks it)
          ...(process.env.NODE_ENV === 'production'
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=63072000; includeSubDomains; preload',
                },
              ]
            : []),
        ],
      },
    ]
  },
}

export default nextConfig
