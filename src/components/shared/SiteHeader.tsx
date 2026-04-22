import { SiteHeaderClient } from './SiteHeaderClient'

interface SiteHeaderProps {
  siteName: string
  logoUrl?: string | null
  /**
   * Visible page modules ordered by display_order. display_name is a JSONB
   * object keyed by language code, e.g. { es: 'Inicio', en: 'Home' }.
   * Labels are resolved client-side by SiteHeaderClient using useI18n().
   */
  modules: Array<{
    section_key: string
    display_name?: Record<string, string> | null
  }>
}

/** Server Component — filters out footer and delegates rendering + label resolution to the client. */
export function SiteHeader({ siteName, logoUrl, modules }: SiteHeaderProps) {
  const navModules = modules.filter((m) => m.section_key !== 'footer')

  return <SiteHeaderClient siteName={siteName} logoUrl={logoUrl} navItems={navModules} />
}
