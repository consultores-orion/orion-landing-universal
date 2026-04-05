export const siteConfig = {
  name: 'Orion Landing Universal',
  description: 'Open-source landing page template with full CMS admin panel',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  author: 'Luis Enrique Gutiérrez Campos — Orion AI Society',
  links: {
    github: 'https://github.com/orion-ai-society/landing-universal',
  },
} as const
